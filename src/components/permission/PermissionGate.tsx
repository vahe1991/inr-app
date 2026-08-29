import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { Button } from "@/components/ui/Button";
import { HY } from "@/constants/hy";
import { useCan } from "@/hooks/usePermission.hook";
import type { HttpMethod } from "@/types/auth-user-type";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

type PermissionGateProps = {
  method: HttpMethod;
  path: string;
  children: ReactNode;
};

export function PermissionGate({ method, path, children }: PermissionGateProps) {
  const allowed = useCan(method, path);
  const router = useRouter();

  if (!allowed) {
    return (
      <AuthenticatedScreen contentClassName="flex-1 px-4">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-center text-base font-semibold text-grey-900">
            {HY.accessDenied}
          </Text>
          <Button title={HY.back} variant="outline" onPress={() => router.back()} />
        </View>
      </AuthenticatedScreen>
    );
  }

  return <>{children}</>;
}
