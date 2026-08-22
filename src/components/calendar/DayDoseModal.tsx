import { CalendarIcon } from "@/components/svg-components/calendar-icon";
import { Button } from "@/components/ui/Button";
import { HY } from "@/constants/hy";
import dayjs from "dayjs";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRESET_DOSES = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
const STEP = 0.25;

type DayDoseModalProps = {
  visible: boolean;
  date: string;
  dose: number;
  isNextTest: boolean;
  loading?: boolean;
  onChangeDose: (value: number) => void;
  onToggleNextTest: () => void;
  onSave: () => void;
  onClose: () => void;
};

function roundDose(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

export function DayDoseModal({
  visible,
  date,
  dose,
  isNextTest,
  loading,
  onChangeDose,
  onToggleNextTest,
  onSave,
  onClose,
}: DayDoseModalProps) {
  const parsed = dayjs(date);
  const canSave = dose > 0 || isNextTest;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
          accessibilityLabel={HY.cancel}
        />
        <View
          className="max-h-[90%] rounded-t-[24px] bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-3 items-center">
            <View className="h-1 w-12 rounded-full bg-brand-200" />
          </View>

          <View className="mb-4 flex-row items-start justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <Text className="font-semibold text-[18px] text-grey-900">
                {HY.weekdaysLong[parsed.day()]}, {parsed.date()}{" "}
                {HY.months[parsed.month()]}
              </Text>
              <Text className="mt-1 text-[12px] text-grey-400">
                {HY.doseAndNextTest}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-lg bg-brand-100"
            >
              <Text className="text-[16px] text-calendar-primary">×</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0, flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-3 rounded-[16px] border border-brand-100 p-3">
              <Text className="mb-3 font-semibold text-[14px] text-calendar-primary">
                {HY.dailyWarfarinDose}
              </Text>

              <View className="mb-3 flex-row items-center overflow-hidden rounded-[12px] border border-brand-200">
                <Pressable
                  onPress={() => onChangeDose(roundDose(dose - STEP))}
                  className="h-12 w-12 items-center justify-center bg-brand-50"
                >
                  <Text className="text-[22px] text-calendar-primary">−</Text>
                </Pressable>
                <Text className="flex-1 text-center font-semibold text-[20px] text-grey-900">
                  {dose} {HY.mg}
                </Text>
                <Pressable
                  onPress={() => onChangeDose(roundDose(dose + STEP))}
                  className="h-12 w-12 items-center justify-center bg-brand-50"
                >
                  <Text className="text-[22px] text-calendar-primary">+</Text>
                </Pressable>
              </View>

              <View className="mb-2 flex-row flex-wrap gap-2">
                {PRESET_DOSES.map((value) => {
                  const active = dose === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => onChangeDose(value)}
                      className={`rounded-lg border px-3 py-2 ${
                        active
                          ? "border-calendar-primary bg-calendar-primary"
                          : "border-brand-200 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-[13px] ${
                          active ? "text-white" : "text-calendar-primary"
                        }`}
                      >
                        {value} {HY.mg}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-[12px] text-grey-400">
                {HY.selectOrEnterDailyDose}
              </Text>
            </View>

            <View className="mb-2 rounded-[16px] border border-brand-100 p-3">
              <Text className="mb-3 font-semibold text-[14px] text-calendar-primary">
                {HY.nextTestDate}
              </Text>
              <Pressable
                onPress={onToggleNextTest}
                className={`mb-2 flex-row items-center justify-center gap-2 rounded-[12px] border px-3 py-4 ${
                  isNextTest
                    ? "border-calendar-primary bg-brand-50"
                    : "border-transparent bg-brand-50"
                }`}
              >
                <CalendarIcon />
                <Text className="font-medium text-[14px] text-calendar-primary">
                  {isNextTest ? HY.setAsNextTestDone : HY.setAsNextTest}
                </Text>
              </Pressable>
              <Text className="text-[12px] text-grey-400">
                {HY.markAsNextInrTest}
              </Text>
            </View>
          </ScrollView>

          <View className="flex-row gap-3 pt-3" style={{ flexShrink: 0 }}>
            <View className="flex-1">
              <Button title={HY.cancel} variant="outline" onPress={onClose} />
            </View>
            <View className="flex-1">
              <Button
                title={HY.save}
                loading={loading}
                disabled={!canSave}
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
