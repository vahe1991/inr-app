import { ChatInboxPanel } from "@/components/chat/ChatInboxPanel";
import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { ApiPaths } from "@/constants/apiPaths";

export default function MessagesScreen() {
  return (
    <PermissionGate method="GET" path={ApiPaths.chatNotifications}>
      <AuthenticatedScreen contentClassName="flex-1">
        <ChatInboxPanel />
      </AuthenticatedScreen>
    </PermissionGate>
  );
}
