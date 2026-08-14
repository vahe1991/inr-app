import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { HeartIcon } from "@/components/svg-components/heart-icon";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { usePatientAllInr, usePatientInrNorm } from "@/hooks/usePatientInr";
import { useCreatePatientInr } from "@/hooks/usePatientInrMutations";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function formatDisplayDate(iso: string) {
  const parsed = dayjs(iso);
  return parsed.isValid() ? parsed.format("DD.MM.YY") : iso;
}

function parseDisplayDate(display: string) {
  const compact = display.trim();
  const match = compact.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    let year = Number(match[3]);
    if (year < 100) year += 2000;
    const parsed = dayjs(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
    if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
  }
  const iso = dayjs(compact);
  if (iso.isValid() && /^\d{4}-\d{2}-\d{2}/.test(compact)) {
    return iso.format("YYYY-MM-DD");
  }
  return null;
}

export default function NewInrScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { norm } = usePatientInrNorm(patientId);
  const { items: previousItems } = usePatientAllInr(patientId);

  const [dateDisplay, setDateDisplay] = useState(dayjs().format("DD.MM.YY"));
  const [value, setValue] = useState("");
  const [location, setLocation] = useState("");

  const { mutate, isPending } = useCreatePatientInr(() => {
    Alert.alert(HY.saved, HY.newInrResult);
    router.back();
  });

  const canSave =
    Boolean(value) && !Number.isNaN(Number(value)) && Number(value) > 0;

  const previousPreview = useMemo(() => {
    return [...previousItems]
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 3);
  }, [previousItems]);

  const isInRange = (n: number) => {
    if (!norm) return null;
    return n > norm.normStart && n < norm.normEnd;
  };

  const onSave = () => {
    const date = parseDisplayDate(dateDisplay);
    const numeric = Number(value);
    if (
      !patientId ||
      !date ||
      !value ||
      Number.isNaN(numeric) ||
      numeric <= 0
    ) {
      Alert.alert(HY.brand, HY.invalidInr);
      return;
    }
    mutate({
      id: patientId,
      date,
      value: numeric,
      address: location.trim() || undefined,
      spravochnikId: "1889",
    });
  };

  const onPickFile = () => {
    Alert.alert(HY.attachDocuments, HY.comingSoon);
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="mb-1 h-12 w-12 items-start justify-center"
            accessibilityRole="button"
            accessibilityLabel={HY.back}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={22}
              tintColor="#6A4A98"
            />
          </Pressable>

          <View className="mb-6 flex-row items-center gap-3 border-b border-brand-600 pb-3 pt-1">
            <View
              className="h-10 w-10 items-center justify-center rounded-lg bg-[#ede7f6]"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 1.5,
                elevation: 2,
              }}
            >
              <HeartIcon size={20} />
              <View className="absolute -bottom-0.5 -right-0.5">
                <SymbolView
                  name={{
                    ios: "checkmark.circle.fill",
                    android: "check_circle",
                    web: "check_circle",
                  }}
                  size={14}
                  tintColor="#52C41A"
                />
              </View>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-semibold text-[20px] leading-7 text-[#262626]">
                {HY.newInrResult}
              </Text>
              <Text className="mt-0.5 text-[12px] leading-5 text-grey-900">
                {HY.enterInrResults}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <TextField
              label={HY.selectExamDate}
              value={dateDisplay}
              onChangeText={setDateDisplay}
              placeholder="DD.MM.YY"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              rightAccessory={
                <SymbolView
                  name={{
                    ios: "calendar",
                    android: "calendar_today",
                    web: "calendar_today",
                  }}
                  size={19}
                  tintColor="#6A4A98"
                />
              }
            />

            <TextField
              label={HY.enterInrValue}
              value={value}
              onChangeText={setValue}
              placeholder="0.0"
              keyboardType="decimal-pad"
            />

            <TextField
              label={HY.placeOfSubmission}
              value={location}
              onChangeText={setLocation}
              placeholder={HY.placePlaceholder}
            />

            <View className="mb-1">
              <Text className="mb-2 px-2 font-medium text-[14px] leading-5 text-grey-500">
                {HY.attachDocuments}
              </Text>
              <Pressable
                onPress={onPickFile}
                className="h-[102px] items-center justify-center rounded-lg border-[1.6px] border-dashed border-brand-20 bg-brand-10 px-4 active:opacity-80"
              >
                <SymbolView
                  name={{
                    ios: "arrow.up.doc",
                    android: "upload_file",
                    web: "upload_file",
                  }}
                  size={24}
                  tintColor="#6A4A98"
                />
                <Text className="mt-1 text-[14px] leading-[22px] text-[#262626]">
                  {HY.uploadFile}
                </Text>
                <Text className="mt-0.5 text-center font-medium text-[12px] leading-[18px] text-grey-400">
                  {HY.uploadHint}
                </Text>
              </Pressable>
            </View>

            <Button
              title={HY.save}
              onPress={onSave}
              loading={isPending}
              disabled={!canSave}
            />
          </View>

          <View className="mt-8 gap-4">
            <Text className="text-center font-semibold text-[20px] leading-7 text-grey-500">
              {HY.previousResults}
            </Text>

            {previousPreview.length === 0 ? (
              <Text className="text-center text-sm text-grey-400">
                {HY.noInrResults}
              </Text>
            ) : (
              <View className="gap-2">
                {previousPreview.map((item) => {
                  const inRange = isInRange(Number(item.value));
                  return (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between rounded-lg border border-brand-700 bg-white px-4 py-3"
                    >
                      <Text className="text-[16px] leading-6 text-grey-900">
                        {formatDisplayDate(item.date)}
                      </Text>
                      <View
                        className="flex-row items-center gap-2 rounded bg-brand-100 px-3 py-1"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 1.5,
                          elevation: 2,
                        }}
                      >
                        <Text className="text-[16px] text-brand-700">
                          {item.value}
                        </Text>
                        <SymbolView
                          name={{
                            ios: inRange === false ? "xmark" : "checkmark",
                            android: inRange === false ? "close" : "check",
                            web: inRange === false ? "close" : "check",
                          }}
                          size={18}
                          tintColor={inRange === false ? "#CA0B00" : "#52C41A"}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable
              onPress={() =>
                patientId && router.push(INRAppRoutes.patientHistory(patientId))
              }
              className="h-12 w-[182px] flex-row items-center justify-center gap-2 self-center rounded-lg active:opacity-70"
            >
              <Text className="font-semibold text-[12px] leading-5 text-brand-700">
                {HY.seeMore}
              </Text>
              <SymbolView
                name={{
                  ios: "arrow.up.right",
                  android: "north_east",
                  web: "north_east",
                }}
                size={14}
                tintColor="#6A4A98"
              />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthenticatedScreen>
  );
}
