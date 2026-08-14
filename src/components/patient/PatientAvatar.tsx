import { resolveGender } from "@/utils/gender";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Image, View } from "react-native";

type PatientAvatarProps = {
  photo?: string | null;
  gender?: string | null;
  size?: number;
  rounded?: "full" | "lg";
};

function resolvePhotoUrl(photo?: string | null): string | null {
  if (!photo?.trim()) return null;
  if (/^https?:\/\//i.test(photo)) return photo;
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${photo.replace(/^\//, "")}`;
}

export function PatientAvatar({
  photo,
  gender,
  size = 48,
  rounded = "full",
}: PatientAvatarProps) {
  const [failed, setFailed] = useState(false);
  const uri = resolvePhotoUrl(photo);
  const kind = resolveGender(gender);
  const showPhoto = Boolean(uri) && !failed;

  const bgClass =
    kind === "female"
      ? "bg-pink-50"
      : kind === "male"
        ? "bg-blue-50"
        : "bg-brand-50";
  const tint =
    kind === "female" ? "#fb4ed5" : kind === "male" ? "#4f96d9" : "#5d4081";
  const radiusClass = rounded === "lg" ? "rounded-[12px]" : "rounded-full";

  return (
    <View
      className={`items-center justify-center overflow-hidden ${radiusClass} ${bgClass}`}
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <Image
          source={{ uri: uri! }}
          className="h-full w-full"
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <SymbolView
          name={{
            ios: "person.fill",
            android: kind === "female" ? "woman" : "man",
            web: kind === "female" ? "woman" : "man",
          }}
          size={Math.round(size * 0.55)}
          tintColor={tint}
          fallback={
            <View
              className="rounded-full"
              style={{
                width: size * 0.35,
                height: size * 0.35,
                backgroundColor: tint,
              }}
            />
          }
        />
      )}
    </View>
  );
}
