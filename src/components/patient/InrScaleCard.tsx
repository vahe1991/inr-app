import { EditIcon } from "@/components/svg-components/edit-icon";
import { HumanIcon } from "@/components/svg-components/human-icon";
import { HY } from "@/constants/hy";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type InrScaleCardProps = {
  normStart?: number | null;
  normEnd?: number | null;
  currentInr?: number | null;
  ttr?: number | null;
  onEdit?: () => void;
};

function formatInr(value: number) {
  return Number(value.toFixed(2)).toString();
}

function ScaleTickLabel({ label, style }: { label: string; style: object }) {
  return (
    <View
      style={[
        {
          position: "absolute",
          top: 18,
          alignItems: "center",
          zIndex: 10,
        },
        style,
      ]}
    >
      <Text className="text-[12px] text-grey-900">{label}</Text>
      <View
        style={{
          width: 1.6,
          height: 12,
          marginTop: 2,
          backgroundColor: "#292929",
        }}
      />
    </View>
  );
}

export function InrScaleCard({
  normStart,
  normEnd,
  currentInr,
  ttr = 0,
  onEdit,
}: InrScaleCardProps) {
  const start = Number(normStart ?? 0);
  const end = Number(normEnd ?? 0);
  const current = Number(currentInr ?? 0);

  const currentPosition = useMemo(() => {
    const min = start;
    const max = end;
    if (
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      Number.isNaN(current) ||
      min >= max
    ) {
      return 49;
    }
    const progress = (current - min) / (max - min);
    let position = 27 + progress * (73 - 27);
    const offset = 5;
    if (position > 24 && position < 31) {
      position += current >= min ? offset : -offset;
    }
    if (position > 70 && position < 77) {
      position += current <= max ? -offset : offset;
    }
    return Math.max(0, Math.min(100, position));
  }, [current, start, end]);

  return (
    <View className="rounded-[8px] border-[1px] border-brand-600 bg-brand-100 p-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-[16px] text-brand-500">
          {HY.inrNormScale}
        </Text>
        <TouchableOpacity onPress={onEdit} activeOpacity={0.6}>
          <View
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.16,
              shadowRadius: 2.5,
              elevation: 6,
            }}
          >
            <EditIcon />
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={{
          height: 97,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#dbcfec",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        <ScaleTickLabel
          label={start ? formatInr(start) : "0.0"}
          style={{ left: "27%", marginLeft: -16 }}
        />
        <ScaleTickLabel
          label={end ? formatInr(end) : "0.0"}
          style={{ right: "27%", marginRight: -16 }}
        />

        <LinearGradient
          colors={[
            "#CA0B00",
            "#F06A00",
            "#FFFF00",
            "#00B700",
            "#00B700",
            "#FFFF00",
            "#F06A00",
            "#CA0B00",
          ]}
          locations={[0, 0.12, 0.18, 0.35, 0.75, 0.82, 0.88, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 42,
            height: 6,
            borderRadius: 999,
          }}
        />

        <View
          style={{
            position: "absolute",
            left: `${currentPosition}%`,
            marginLeft: -18,
            top: 8,
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <View className="mb-1 h-6 min-w-6 items-center justify-center rounded-full bg-green-600 px-1">
            <Text className="font-bold text-[9px] text-white">
              {formatInr(current || 0)}
            </Text>
          </View>
          <HumanIcon />
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-bold text-[16px] text-grey-900">
          {HY.currentInr}{" "}
          <Text className="font-bold text-[16px] text-brand-500">
            {current || "0.0"}
          </Text>
        </Text>
        <Text className="font-bold text-[16px] text-grey-900">
          {HY.ttr}{" "}
          <Text className="font-bold text-[16px] text-brand-500">
            {ttr ?? 0}
          </Text>
        </Text>
      </View>
    </View>
  );
}
