import { ChatInboxPanel } from "@/components/chat/ChatInboxPanel";
import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";

export default function MessagesScreen() {
  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ChatInboxPanel />
    </AuthenticatedScreen>
  );
}
