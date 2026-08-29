import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { firstAllowedAppHref } from "@/helpers/permissions";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, permissions, user } = useAuth();

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href={firstAllowedAppHref(permissions, user) as never} />;
  }

  return <Redirect href="/sign-in" />;
}
