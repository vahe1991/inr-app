import { AppDrawerContent } from "@/components/layout/AppDrawerContent";
import { HY } from "@/constants/hy";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications.hook";
import { Drawer } from "expo-router/drawer";
import { SymbolView } from "expo-symbols";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated === true);

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#5d4081",
        drawerInactiveTintColor: "#717171",
        drawerActiveBackgroundColor: "#f4f0fa",
        drawerLabelStyle: {
          fontFamily: "Montserrat_500Medium",
          fontSize: 15,
        },
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="patients"
        options={{
          title: HY.patients,
          drawerLabel: HY.patients,
          drawerIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: "person.2.fill",
                android: "group",
                web: "group",
              }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="investigations"
        options={{
          title: HY.investigations,
          drawerLabel: HY.investigations,
          drawerIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: "cross.case",
                android: "biotech",
                web: "biotech",
              }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: HY.profile,
          drawerLabel: HY.profile,
          drawerIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: "person.crop.circle.fill",
                android: "account_circle",
                web: "account_circle",
              }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerItemStyle: { display: "none" },
          title: HY.notifications,
        }}
      />
      <Drawer.Screen
        name="patient/[patientId]"
        options={{
          drawerItemStyle: { display: "none" },
          title: HY.patient,
        }}
      />
    </Drawer>
  );
}
