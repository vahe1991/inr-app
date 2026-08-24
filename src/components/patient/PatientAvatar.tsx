import { FemaleAvatar } from "@/components/svg-components/female-icon";
import { MaleAvatar } from "@/components/svg-components/male-icon";
import { resolveGender } from "@/utils/gender";
import { useState } from "react";
import { Image, View } from "react-native";

type PatientAvatarProps = {
  photo?: string | null;
  gender?: string | null;
  size?: number;
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
  const iconSize = Math.round(size * 0.72);
  const avatar =
    kind === "female" ? (
      <FemaleAvatar size={iconSize} />
    ) : (
      <MaleAvatar size={iconSize} />
    );

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-[8px] ${bgClass}`}
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
        avatar
      )}
    </View>
  );
}
