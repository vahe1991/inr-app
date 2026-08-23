import { Stack } from "expo-router";

export default function PatientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 180,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="history" />
      <Stack.Screen name="new-inr" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="daily-notes-calendar" />
      <Stack.Screen name="year-calendar" />
      <Stack.Screen name="saved-cycles" />
      <Stack.Screen name="advice" />
      <Stack.Screen name="advice-form" />
      <Stack.Screen name="complications" />
      <Stack.Screen name="complication-form" />
      <Stack.Screen name="edit-norm" />
    </Stack>
  );
}
