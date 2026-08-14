import { ActivityIndicator, Text, View } from "react-native";

export function LoadingScreen({ label = "Բեռնվում է..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#5d4081" />
      <Text className="mt-3 text-sm text-calendar-text-secondary">{label}</Text>
    </View>
  );
}
