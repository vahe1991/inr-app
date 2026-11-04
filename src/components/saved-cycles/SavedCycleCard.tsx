import { TrashBrandIcon } from "@/components/svg-components/trash-icon";
import { HY } from "@/constants/hy";
import type { InrCycleData } from "@/types/calendar-types";
import dayjs from "dayjs";
import { Pressable, Text, View } from "react-native";
import { EditBrandIcon } from "../svg-components/edit-icon";
type InrCycle = InrCycleData["cycles"][number];

export function SavedCycleCard({
  cycle,
  canApply,
  canEditCycle,
  canDeleteCycle,
  onApply,
  onEdit,
  onDelete,
}: {
  cycle: InrCycle;
  canApply: boolean;
  canEditCycle: boolean;
  canDeleteCycle: boolean;
  onApply: (cycle: InrCycle) => void;
  onEdit: (cycle: InrCycle) => void;
  onDelete: (cycle: InrCycle) => void;
}) {
  return (
    <View className="mb-3">
      <View className="mb-1 flex-row items-center justify-between gap-[16px] px-4">
        <Text className="mr-[auto] font-[600] text-[16px] text-brand-700">
          {cycle.name}
        </Text>
        <Pressable
          hitSlop={8}
          disabled={!canEditCycle}
          onPress={() => onEdit(cycle)}
          className={
            !canEditCycle
              ? "opacity-50 pointer-events-none"
              : "active:opacity-80"
          }
        >
          <EditBrandIcon />
        </Pressable>
        <Pressable
          hitSlop={8}
          disabled={!canDeleteCycle}
          onPress={() => onDelete(cycle)}
          className={
            !canDeleteCycle
              ? "opacity-50 pointer-events-none"
              : "active:opacity-80"
          }
        >
          <TrashBrandIcon />
        </Pressable>
      </View>

      <Pressable
        disabled={!canApply}
        onPress={() => onApply(cycle)}
        className={"gap-1 rounded-[12px] bg-brand-50 p-4 active:opacity-80"}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        }}
      >
        <View className="flex-row justify-between gap-[40px]">
          <Text className="font-[600] text-[14px] text-brand-700">
            {HY.duration}{" "}
          </Text>
          <Text className="text-[14px] text-grey-900">
            {cycle.days.length} {HY.daysUnit}
          </Text>
        </View>
        <View className="flex-row justify-between gap-[60px]">
          <Text className="font-[600] text-[14px] text-brand-700">
            {HY.dosage}{" "}
          </Text>
          <Text className="min-w-0 flex-1 text-[14px] text-grey-900">
            {cycle.days.map((day) => `${day.dosage} ${HY.mg}`).join(" - ")}
          </Text>
        </View>
        <View className="flex-row justify-between gap-[40px]">
          <Text className="font-[600] text-[14px] text-brand-700">
            {HY.createdAt}{" "}
          </Text>
          <Text className="text-[14px] text-grey-900">
            {cycle.createdAt
              ? dayjs(cycle.createdAt).format("DD.MM.YYYY")
              : "-"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
