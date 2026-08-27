import { ChatThread } from "@/components/chat/ChatThread";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { ApiPaths } from "@/constants/apiPaths";
import { setChatViewing } from "@/services/chat-socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function PatientChatScreen() {
  const router = useRouter();
  const { patientId, name } = useLocalSearchParams<{
    patientId: string;
    name?: string;
  }>();

  useEffect(() => {
    const id = Number(patientId);
    if (!Number.isFinite(id) || id <= 0) return;
    setChatViewing(id);
    return () => setChatViewing(null);
  }, [patientId]);

  if (!patientId) return null;

  return (
    <PermissionGate
      method="GET"
      path={ApiPaths.patientChatMessages(patientId)}
    >
      <ChatThread
        patientId={patientId}
        patientName={typeof name === "string" ? name : undefined}
        onBack={() => router.back()}
      />
    </PermissionGate>
  );
}
