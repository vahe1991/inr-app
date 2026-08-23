import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { HY } from "@/constants/hy";
import {
  formatChatDay,
  isOutgoingMessage,
  resolveChatMediaUrl,
} from "@/helpers/chatUi";
import { useGetChatMessages } from "@/hooks/chat/useGetChatMessages.hook";
import { useReadChat } from "@/hooks/chat/useReadChat.hook";
import { useSendChatMessage } from "@/hooks/chat/useSendChatMessage.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import type { ChatFileInput, ChatMessageType } from "@/types/chat-type";
import dayjs from "dayjs";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
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

export function ChatThread({
  patientId,
  patientName,
  onBack,
}: ChatThreadProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ThreadRow>>(null);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<ChatFileInput | null>(null);
  const { patient } = usePatientById(patientId);
  const { messages, isLoadingMessages, refetch, isError } =
    useGetChatMessages(patientId);
  const sendMessage = useSendChatMessage(() => {
    setDraft("");
    setFile(null);
  });
  const { mutate: markRead } = useReadChat();

  useFocusEffect(
    useCallback(() => {
      void refetch();
      markRead(patientId);
    }, [markRead, patientId, refetch]),
  );

  const title = patientName || patient?.fullName || HY.patient;
  const rows = useMemo(() => asThreadRows(messages), [messages]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    setFile({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || "application/octet-stream",
    });
  };

  const onSend = () => {
    const content = draft.trim();
    if ((!content && !file) || sendMessage.isPending) return;
    sendMessage.mutate({
      patient_id: patientId,
      content,
      file: file ?? undefined,
    });
  };

  return (
    <View className="flex-1 bg-brand-100" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-3 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          className="h-11 w-11 items-start justify-center"
          accessibilityRole="button"
          accessibilityLabel={HY.back}
        >
          <ArrowLeftIcon />
        </Pressable>
        <Text
          className="flex-1 pr-11 text-center font-bold text-[18px] text-brand-900"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#5d4081" />
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
            data={rows}
            keyExtractor={(row) => row.key}
            className="flex-1"
            contentContainerClassName="px-3 pb-3 pt-1"
            renderItem={({ item }) =>
              item.kind === "date" ? (
                <DateDivider label={item.label} />
              ) : (
                <MessageBubble message={item.item} />
              )
            }
            ListEmptyComponent={
              <Text className="mt-10 text-center text-sm text-calendar-text-secondary">
                {HY.noMessages}
              </Text>
            }
            onContentSizeChange={() => {
              if (rows.length) {
                listRef.current?.scrollToEnd({ animated: false });
              }
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <View
          className="flex-row items-center gap-2 bg-brand-200 px-3 py-2"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <Pressable
            onPress={() => void pickFile()}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            accessibilityRole="button"
            accessibilityLabel={HY.attach}
          >
            <Text className="text-[26px] leading-7 text-brand-900">+</Text>
          </Pressable>
          <View className="min-h-10 min-w-0 flex-1 justify-center rounded-2xl bg-white px-3 py-2">
            {file ? (
              <Pressable onPress={() => setFile(null)} className="mb-1">
                <Text className="text-[11px] text-brand-700" numberOfLines={1}>
                  {file.name} ✕
                </Text>
              </Pressable>
            ) : null}
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={HY.writeMessage}
              placeholderTextColor="#979797"
              multiline
              className="max-h-24 p-0 font-sans text-[14px] text-grey-900"
              onSubmitEditing={onSend}
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={sendMessage.isPending || (!draft.trim() && !file)}
            className="h-10 items-center justify-center rounded-xl bg-brand-900 px-3 disabled:opacity-40"
            accessibilityRole="button"
            accessibilityLabel={HY.save}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="font-semibold text-[13px] text-white">
                {HY.send}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
        label: formatChatDay(item.createdAt),
      });
      lastDay = day;
    }
    rows.push({ kind: "message", key: item.id, item });
  }

  return rows;
}

function DateDivider({ label }: { label: string }) {
  return (
    <View className="my-3 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-brand-300" />
      {label ? (
        <Text className="text-[11px] text-brand-500">{label}</Text>
      ) : null}
      <View className="h-px flex-1 bg-brand-300" />
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessageType }) {
  const outgoing = isOutgoingMessage(message.senderRole);
  const attachments = message.attachments ?? [];
  const hasFiles = attachments.length > 0;

  return (
    <View
      className={`mb-3 max-w-[82%] flex-row items-end gap-2 ${
        outgoing ? "self-end" : "self-start"
      }`}
    >
      {outgoing ? null : (
        <View className="h-8 w-8 rounded-full bg-brand-900" />
      )}
      <View
        className={`rounded-2xl px-3 py-2 ${
          outgoing ? "bg-brand-900" : "bg-brand-50"
        } ${hasFiles ? "min-w-[180px] bg-white" : ""}`}
      >
        {attachments.map((file) => {
          const uri = resolveChatMediaUrl(file.url);
          const image = file.mimeType.startsWith("image/");
          return (
            <Pressable
              key={file.id || file.url}
              onPress={() => {
                if (uri) void Linking.openURL(uri);
              }}
              className="mb-2"
            >
              {image && uri ? (
                <Image
                  source={{ uri }}
                  className="h-36 w-44 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="rounded-xl bg-brand-50 px-3 py-3">
                  <Text
                    className="text-[12px] text-brand-900"
                    numberOfLines={2}
                  >
                    {file.name || HY.attach}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
        {message.content ? (
          <Text
            className={`text-[13px] leading-5 ${
              outgoing && !hasFiles ? "text-white" : "text-grey-800"
            }`}
          >
            {message.content}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
