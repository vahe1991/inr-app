import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { MicrophoneIcon } from "@/components/svg-components/micropone-icon";
import { PaperclipIcon } from "@/components/svg-components/paperclip-icon";
import { SendIcon } from "@/components/svg-components/send-icon";
import { HY } from "@/constants/hy";
import { useAuth } from "@/contexts/AuthContext";
import {
  CHAT_MAX_FILE_BYTES,
  chatPickerTypes,
  formatChatDay,
  formatRecordingTime,
  isAllowedChatFile,
  isOwnChatMessage,
  resolveChatMediaUrl,
  senderInitial,
} from "@/helpers/chatUi";
import { useChatPresence } from "@/hooks/chat/useChatSocket.hook";
import { useGetChatMessages } from "@/hooks/chat/useGetChatMessages.hook";
import { useReadChat } from "@/hooks/chat/useReadChat.hook";
import { useSendChatMessage } from "@/hooks/chat/useSendChatMessage.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import { sendChatTyping } from "@/services/chat-socket";
import type { ChatFileInput, ChatMessageType } from "@/types/chat-type";
import dayjs from "dayjs";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
  type KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ThreadRow =
  | { kind: "date"; key: string; label: string }
  | { kind: "message"; key: string; item: ChatMessageType };

type ChatThreadProps = {
  patientId: string;
  patientName?: string;
  onBack: () => void;
};

function keyboardInset(event: KeyboardEvent) {
  const { height, screenY } = event.endCoordinates;
  const overlap = Dimensions.get("window").height - screenY;
  return Math.max(overlap, height, 0);
}

export function ChatThread({
  patientId,
  patientName,
  onBack,
}: ChatThreadProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ThreadRow>>(null);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<ChatFileInput | null>(null);
  const { name: doctorName, userId } = useAuth();
  const { patient } = usePatientById(patientId);
  const { messages, isLoadingMessages, refetch, isError } =
    useGetChatMessages(patientId);
  const sendMessage = useSendChatMessage();
  const { mutate: markRead } = useReadChat();
  const presence = useChatPresence(patientId);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const pendingLatestRef = useRef(true);
  const patientPhoto = patient?.photo ?? patient?.image ?? patient?.avatar;
  const lastMessageId = useMemo(() => {
    if (!messages.length) return "";
    return [...messages]
      .sort(
        (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      )
      .at(-1)?.id;
  }, [messages]);
  const seenMessageIdRef = useRef(lastMessageId);
  if (lastMessageId && lastMessageId !== seenMessageIdRef.current) {
    seenMessageIdRef.current = lastMessageId;
    pendingLatestRef.current = true;
  }

  const scrollToLatest = useCallback((animated = true) => {
    pendingLatestRef.current = true;
    const run = () => {
      listRef.current?.scrollToOffset({ offset: 0, animated });
    };
    requestAnimationFrame(run);
    setTimeout(run, 80);
  }, []);

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(keyboardInset(event));
      requestAnimationFrame(() => {
        scrollToLatest(true);
      });
    };
    const onHide = () => setKeyboardHeight(0);
    const subs = [
      Keyboard.addListener("keyboardWillShow", onShow),
      Keyboard.addListener("keyboardDidShow", onShow),
      Keyboard.addListener("keyboardWillHide", onHide),
      Keyboard.addListener("keyboardDidHide", onHide),
    ];
    return () => subs.forEach((sub) => sub.remove());
  }, [scrollToLatest]);

  useEffect(() => {
    if (!messages.length) return;
    scrollToLatest(true);
  }, [lastMessageId, messages.length, scrollToLatest]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
      markRead(patientId);
      const pushSub = Notifications.addNotificationReceivedListener(() => {
        void refetch();
      });
      return () => pushSub.remove();
    }, [markRead, patientId, refetch]),
  );

  const title =
    patientName || patient?.givenName || patient?.fullName || HY.patient;
  const rows = useMemo(() => [...asThreadRows(messages)].reverse(), [messages]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: chatPickerTypes(),
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    if ((asset.size ?? 0) > CHAT_MAX_FILE_BYTES) {
      Alert.alert(HY.error, HY.fileTooLarge);
      return;
    }
    if (!isAllowedChatFile(asset.name, asset.mimeType)) {
      Alert.alert(HY.error, HY.fileTypeNotAllowed);
      return;
    }
    setFile({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || "application/octet-stream",
    });
  };

  const onSend = (nextFile?: ChatFileInput | null) => {
    const attached = nextFile === undefined ? file : nextFile;
    const isVoice = attached?.type.startsWith("audio/");
    const content = isVoice ? "" : draft.trim();
    if ((!content && !attached) || sendMessage.isPending) return;
    if (!isVoice) setDraft("");
    setFile(null);
    sendMessage.mutate(
      {
        patient_id: patientId,
        content,
        file: attached ?? undefined,
      },
      {
        onSuccess: () => scrollToLatest(true),
        onError: () => {
          if (!isVoice) setDraft(content);
          setFile(attached ?? null);
        },
      },
    );
  };

  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (!uri) return;
        onSend({
          uri,
          name: `voice-${Date.now()}.m4a`,
          type: "audio/mp4",
        });
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(HY.error, HY.micPermissionDenied);
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      Alert.alert(HY.error, HY.recordingFailed);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F4FB]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
          accessibilityRole="button"
          accessibilityLabel={HY.back}
        >
          <ArrowLeftIcon />
        </Pressable>
        <View className="min-w-0 flex-1 items-start px-2">
          <View className="flex-row items-center gap-1.5">
            <Text
              className="max-w-[220px] font-semibold text-[16px] text-grey-900"
              numberOfLines={1}
            >
              {title}
            </Text>
            {presence.viewing && !presence.typing ? (
              <View className="h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </View>
          {presence.typing ? (
            <TypingDots />
          ) : presence.viewing ? (
            <Text className="mt-0.5 text-[12px] text-grey-500">
              {HY.active}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-1">
        {isLoadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <PatientAvatar size={32} />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-sm text-calendar-danger">
              {HY.chatLoadFailed}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            inverted
            data={rows}
            keyExtractor={(row) => row.key}
            className="flex-1"
            contentContainerClassName="px-4 pb-1 pt-3"
            renderItem={({ item }) =>
              item.kind === "date" ? (
                <DateDivider label={item.label} />
              ) : (
                <MessageBubble
                  message={item.item}
                  mine={isOwnChatMessage(item.item, userId, doctorName)}
                  selfName={doctorName || HY.doctor}
                  patientName={title}
                  patientPhoto={patientPhoto}
                />
              )
            }
            ListEmptyComponent={
              <Text className="mt-10 text-center text-sm text-calendar-text-secondary">
                {HY.noMessages}
              </Text>
            }
            onContentSizeChange={() => {
              if (!pendingLatestRef.current) return;
              listRef.current?.scrollToOffset({ offset: 0, animated: false });
              pendingLatestRef.current = false;
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        )}

        <View className="bg-white">
          <View className="flex-row items-end gap-2 px-3 pt-2 pb-2">
            <View className="min-h-12 min-w-0 flex-1 flex-row items-center rounded-full border border-grey-50 bg-white px-3">
              <Pressable
                onPress={() => void pickFile()}
                hitSlop={8}
                className="mr-2 h-8 w-8 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={HY.attach}
              >
                <PaperclipIcon size={16} />
              </Pressable>
              <View className="min-w-0 flex-1 py-2">
                {file ? (
                  <Pressable onPress={() => setFile(null)} className="mb-1">
                    <Text
                      className="text-[11px] text-brand-700"
                      numberOfLines={1}
                    >
                      {file.name} ✕
                    </Text>
                  </Pressable>
                ) : null}
                <TextInput
                  value={
                    recorderState.isRecording
                      ? `${HY.recording} ${formatRecordingTime(recorderState.durationMillis)}`
                      : draft
                  }
                  onChangeText={(value) => {
                    setDraft(value);
                    const id = Number(patientId);
                    if (value.trim() && Number.isFinite(id) && id > 0) {
                      sendChatTyping(id);
                    }
                  }}
                  placeholder={HY.writeMessage}
                  placeholderTextColor="#979797"
                  editable={!recorderState.isRecording}
                  multiline
                  className="max-h-24 p-0 font-sans text-[14px] text-grey-900"
                />
              </View>
            </View>
            <Pressable
              onPress={() => onSend()}
              disabled={
                sendMessage.isPending ||
                recorderState.isRecording ||
                (!draft.trim() && !file)
              }
              className="h-12 w-12 items-center justify-center rounded-full bg-brand-900 disabled:opacity-40"
              accessibilityRole="button"
              accessibilityLabel={HY.send}
            >
              <SendIcon size={18} />
            </Pressable>
            <Pressable
              onPress={() => void toggleRecording()}
              className={`h-12 w-11 items-center justify-center rounded-xl ${
                recorderState.isRecording ? "bg-red-50" : "bg-grey-10"
              }`}
              accessibilityRole="button"
              accessibilityLabel={HY.recordVoice}
            >
              <MicrophoneIcon size={18} />
            </Pressable>
          </View>
          <View
            style={{
              height:
                keyboardHeight > 0
                  ? keyboardHeight
                  : Math.max(insets.bottom, 10),
            }}
          />
        </View>
      </View>
    </View>
  );
}

function asThreadRows(messages: ChatMessageType[]): ThreadRow[] {
  const sorted = [...messages].sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
  );
  const rows: ThreadRow[] = [];
  let lastDay = "";

  for (const item of sorted) {
    const day = dayjs(item.createdAt).format("YYYY-MM-DD");
    if (day !== lastDay) {
      rows.push({
        kind: "date",
        key: `date-${day}`,
        label: dayjs(item.createdAt).isSame(dayjs(), "day")
          ? HY.today
          : formatChatDay(item.createdAt),
      });
      lastDay = day;
    }
    rows.push({ kind: "message", key: item.id, item });
  }

  return rows;
}

function DateDivider({ label }: { label: string }) {
  return (
    <View className="my-4 items-center">
      <Text className="text-[11px] tracking-wide text-grey-500">{label}</Text>
    </View>
  );
}

function TypingDots() {
  const first = useRef(new Animated.Value(0.25)).current;
  const second = useRef(new Animated.Value(0.25)).current;
  const third = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const dots = [first, second, third];
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [first, second, third]);

  return (
    <View className="mt-1 flex-row items-center gap-1">
      {[first, second, third].map((dot, index) => (
        <Animated.View
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-grey-500"
          style={{ opacity: dot }}
        />
      ))}
    </View>
  );
}

function ChatFace({
  mine,
  photo,
  name,
  size = 32,
}: {
  photo?: string | null;
  name: string;
  size?: number;
  mine: boolean;
}) {
  const uri = resolveChatMediaUrl(photo);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(uri) && !failed;

  return (
    <View
      className={`shrink-0 items-center justify-center overflow-hidden rounded-2xl ${mine ? "bg-brand-700" : "bg-brand-500"}`}
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          className="font-semibold text-white"
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          {senderInitial(name)}
        </Text>
      )}
    </View>
  );
}

function MessageBubble({
  message,
  mine,
  selfName,
  patientName,
  patientPhoto,
}: {
  message: ChatMessageType;
  mine: boolean;
  selfName: string;
  patientName: string;
  patientPhoto?: string | null;
}) {
  const attachments = message.attachments ?? [];
  const name = mine
    ? message.senderName || selfName
    : message.senderName || patientName || HY.patient;
  const time = dayjs(message.createdAt).isValid()
    ? dayjs(message.createdAt).format("HH:mm")
    : "";
  const face = (
    <ChatFace
      mine={mine}
      photo={mine ? null : message.senderPhoto || patientPhoto}
      name={name}
    />
  );

  return (
    <View
      className="mb-4 w-full"
      style={{
        flexDirection: mine ? "row" : "row-reverse",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {face}
      <View
        className="min-w-0 max-w-[78%]"
        style={{ alignItems: mine ? "flex-start" : "flex-end" }}
      >
        <View
          className="mb-1.5 w-full flex-row items-center gap-2"
          style={{ justifyContent: mine ? "flex-start" : "flex-end" }}
        >
          <Text
            className="min-w-0 font-medium text-[12px] text-grey-500"
            numberOfLines={1}
          >
            {name}
          </Text>
          {time ? (
            <Text className="text-[11px] text-grey-500">{time}</Text>
          ) : null}
        </View>
        <View className="rounded-2xl border border-grey-50 bg-white px-3.5 py-2.5">
          {attachments.map((item) => {
            const uri = resolveChatMediaUrl(item.url);
            const mime = item.mimeType || "";
            return (
              <View key={item.id || item.url} className="mb-2 last:mb-0">
                {mime.startsWith("image/") && uri ? (
                  <Pressable onPress={() => void Linking.openURL(uri)}>
                    <Image
                      source={{ uri }}
                      className="h-36 w-44 rounded-xl"
                      resizeMode="cover"
                    />
                  </Pressable>
                ) : mime.startsWith("audio/") && uri ? (
                  <ChatAudioAttachment uri={uri} />
                ) : (
                  <Pressable
                    onPress={() => {
                      if (uri) void Linking.openURL(uri);
                    }}
                    className="rounded-xl bg-brand-50 px-3 py-2"
                  >
                    <Text
                      className="text-[12px] text-brand-900"
                      numberOfLines={2}
                    >
                      {item.name || HY.attach}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
          {message.content ? (
            <Text className="text-[13px] leading-5 text-grey-800">
              {message.content}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ChatAudioAttachment({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  return (
    <Pressable
      onPress={() => {
        if (status.playing) {
          player.pause();
          return;
        }
        if (status.currentTime > 0 && status.currentTime >= status.duration) {
          player.seekTo(0);
        }
        player.play();
      }}
      className="flex-row items-center gap-2"
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-100">
        <Text className="text-[11px] text-brand-900">
          {status.playing ? "❚❚" : "▶"}
        </Text>
      </View>
      <Text className="text-[12px] text-grey-700">
        {formatRecordingTime((status.currentTime || 0) * 1000)}
      </Text>
    </Pressable>
  );
}
