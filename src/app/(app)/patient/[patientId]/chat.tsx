import { ChatThread } from "@/components/chat/ChatThread";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PatientChatScreen() {
  const router = useRouter();
  const { patientId, name } = useLocalSearchParams<{
    patientId: string;
    name?: string;
  }>();

  if (!patientId) return null;

  return (
    <ChatThread
      patientId={patientId}
      patientName={typeof name === "string" ? name : undefined}
      onBack={() => router.back()}
    />
  );
}
