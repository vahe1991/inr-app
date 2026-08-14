import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/patients" />;
  }

  return <Redirect href="/sign-in" />;
}
