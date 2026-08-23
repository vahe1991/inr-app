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
import { Image, Platform, StatusBar, View } from "react-native";

SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync("#000000");

function applyStatusBar() {
  StatusBar.setBarStyle("dark-content", true);
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("#ffffff", true);
    StatusBar.setTranslucent(false);
  }
}

function BrandSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image
        source={require("../../assets/images/splash-logo.png")}
        className="h-[280px] w-[230px]"
        resizeMode="contain"
        accessibilityLabel="Նորք-Մարաշ բժշկական կենտրոն"
        onLoad={() => {
          void SplashScreen.hideAsync();
        }}
      />
    </View>
  );
}

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
      void SystemUI.setBackgroundColorAsync("#ffffff");
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <BrandSplash />;
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
