import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientCard } from "@/components/patient/PatientCard";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { TextField } from "@/components/ui/TextField";
import { ApiPaths } from "@/constants/apiPaths";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { useAuth } from "@/contexts/AuthContext";
import { shouldOpenOwnPatient } from "@/helpers/permissions";
import { usePatientsList } from "@/hooks/patient/useGetPatientList.hook";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function PatientsScreen() {
  const router = useRouter();
  const { user, permissions } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1500);

    return () => clearTimeout(timer);
  }, [search]);

  const filters = useMemo(
    () => ({
      name: debouncedSearch.trim() || null,
      pageSize: 20,
    }),
    [debouncedSearch],
  );

  const {
    patientsList,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = usePatientsList(filters);

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  if (shouldOpenOwnPatient(permissions, user) && user?.patientId != null) {
    return <Redirect href={INRAppRoutes.patient(user.patientId) as never} />;
  }

  return (
    <PermissionGate method="GET" path={ApiPaths.patients}>
      <AuthenticatedScreen contentClassName="flex-1 px-4 pt-4">
        <TextField
          placeholder={HY.searchPatient}
          value={search}
          onChangeText={setSearch}
          containerClassName="mb-2"
          autoCapitalize="none"
          returnKeyType="search"
          showSearchIcon
        />

        {isLoading ? (
          <LoadingScreen />
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-calendar-danger">
              {HY.loadFailed}
            </Text>
          </View>
        ) : (
          <FlatList
            data={patientsList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PatientCard
                patient={item}
                onPress={() =>
                  router.push({
                    pathname: "/patient/[patientId]",
                    params: { patientId: String(item.id) },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-sm text-calendar-text-secondary">
                {HY.noPatients}
              </Text>
            }
            ListFooterComponent={
              <View className="mb-6 mt-2 h-10 items-center justify-center">
                {isFetchingNextPage ? (
                  <ActivityIndicator color="#5d4081" />
                ) : null}
              </View>
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </AuthenticatedScreen>
    </PermissionGate>
  );
}
