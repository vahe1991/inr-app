import "react-native-gesture-handler";
import "@/global.css";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, type ReactNode } from "react";
import { Platform, StatusBar } from "react-native";

SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync("#ffffff");

function applyStatusBar() {
  StatusBar.setBarStyle("dark-content", true);
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("#ffffff", true);
    StatusBar.setTranslucent(false);
  }
}

applyStatusBar();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 0 },
  },
});

const AUTH_ROUTES = new Set([
  "sign-in",
  "forgot-password",
  "check-email",
  "reset-password",
  "password-reset-success",
]);

function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;

    const first = String(segments[0] ?? "");
    const onAuthScreen = AUTH_ROUTES.has(first);

    if (!isAuthenticated && !onAuthScreen) {
      router.replace("/sign-in");
    } else if (isAuthenticated && onAuthScreen) {
      router.replace("/(app)/patients");
    }
  }, [isAuthenticated, segments, router]);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyStatusBar();
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#ffffff" },
            }}
          />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
