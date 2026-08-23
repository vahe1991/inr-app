import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { NotificationsPanel } from "@/components/notification/NotificationsPanel";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import NotificationIcon from "@/components/svg-components/notification-icon";
import { HY } from "@/constants/hy";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <View className="px-4 pt-3">
        <PatientSubHeader
          title={HY.notifications}
          icon={<NotificationIcon isUnreadNotifications={false} />}
          onBack={() => router.back()}
        />
      </View>
      <NotificationsPanel />
    </AuthenticatedScreen>
  );
}
