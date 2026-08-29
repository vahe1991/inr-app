import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { HY } from "@/constants/hy";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function ProfileScreen() {
  const { email, name, logOut, deleteAccount } = useAuth();
  const [delet, setDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState(false);
  return (
    <AuthenticatedScreen contentClassName="flex-1 px-4 pt-6">
      <Text className="mb-4 text-xl font-semibold text-grey-900">
        {HY.profile}
      </Text>
      <View className="rounded-xl border border-calendar-border bg-brand-100 p-4">
        <Text className="text-base font-semibold text-grey-900">
          {name || HY.user}
        </Text>
        <Text className="mt-1 text-sm text-oxford-blue-400">{email}</Text>
      </View>

      <View className="mt-8">
        <Button title={HY.logout} onPress={() => void logOut()} />
      </View>
      <View className="mt-[auto]">
        <Button
          className="border-0"
          title={HY.deleteAccount}
          onPress={() => setDelete(true)}
          variant="danger"
        />
      </View>
      <ConfirmModal
        visible={delet}
        title={HY.deleteAccount}
        description={HY.deleteAccountConfirm}
        subInfo={HY.deleteAccountHint}
        confirmLabel={HY.delete}
        destructive
        loading={deleting}
        onCancel={() => {
          if (!deleting) setDelete(false);
        }}
        onConfirm={() => {
          void (async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              setDelete(false);
            } catch {
              Alert.alert(HY.error, HY.deleteAccountFailed);
            } finally {
              setDeleting(false);
            }
          })();
        }}
      />
    </AuthenticatedScreen>
  );
}
