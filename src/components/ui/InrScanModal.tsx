import { Button } from "@/components/ui/Button";
import { HY } from "@/constants/hy";
import { type InrScanFields, parseInrScan } from "@/helpers/parseInrScan";
import type { InrFileInput } from "@/services/inr-norm";
import dayjs from "dayjs";
import { CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system";
import { recognizeText } from "expo-mlkit-ocr";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const FRAME_PAUSE_MS = 400;

export type InrScanResult = { fields: InrScanFields; file: InrFileInput };

type InrScanModalProps = {
  visible: boolean;
  onClose: () => void;
  onDetected: (result: InrScanResult) => void;
};

function deleteQuietly(uri?: string) {
  if (!uri) return;

  try {
    new File(uri).delete();
  } catch {
    // The frame stays in the cache and the system clears it later.
  }
}

/** Live camera window that keeps reading frames until it finds the INR value and date. */
export function InrScanModal({
  visible,
  onClose,
  onDetected,
}: InrScanModalProps) {
  const { width, height } = useWindowDimensions();
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [found, setFound] = useState<InrScanFields>({});

  const foundRef = useRef<InrScanFields>({});
  const fileRef = useRef<InrFileInput | null>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  });

  useEffect(() => {
    if (visible) return;

    foundRef.current = {};
    fileRef.current = null;
    setFound({});
    setIsReady(false);
    setIsTorchOn(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || !permission) return;
    if (permission.granted || !permission.canAskAgain) return;

    void requestPermission();
  }, [visible, permission, requestPermission]);

  useEffect(() => {
    if (!visible || !isReady || !permission?.granted) return;

    let cancelled = false;

    const readFrame = async () => {
      const picture = await camera.current?.takePictureAsync({
        quality: 0.7,
        shutterSound: false,
        exif: false,
      });

      if (!picture) return;

      if (cancelled) {
        deleteQuietly(picture.uri);
        return;
      }

      const { text } = await recognizeText(picture.uri);
      const fields = parseInrScan(text);
      const merged: InrScanFields = {
        value: foundRef.current.value ?? fields.value,
        date: foundRef.current.date ?? fields.date,
      };

      // Only frames that carried data are worth attaching to the form.
      if (fields.value || fields.date) {
        deleteQuietly(fileRef.current?.uri);
        fileRef.current = {
          uri: picture.uri,
          name: `inr-scan-${dayjs().format("YYYYMMDD-HHmmss")}.jpg`,
          mimeType: "image/jpeg",
        };
      } else {
        deleteQuietly(picture.uri);
      }

      foundRef.current = merged;
      setFound(merged);

      if (merged.value && merged.date && fileRef.current) {
        onDetectedRef.current({ fields: merged, file: fileRef.current });
      }
    };

    const loop = async () => {
      while (!cancelled) {
        try {
          await readFrame();
        } catch {
          // A dropped frame is fine, the next tick tries again.
        }

        await new Promise((resolve) => setTimeout(resolve, FRAME_PAUSE_MS));
      }
    };

    void loop();

    return () => {
      cancelled = true;
    };
  }, [visible, isReady, permission?.granted]);

  const handleUse = () => {
    if (!fileRef.current) return;

    onDetectedRef.current({ fields: foundRef.current, file: fileRef.current });
  };

  const hasResult = Boolean(found.value || found.date);
  const status = hasResult
    ? [
        found.value ? `INR: ${found.value}` : null,
        found.date ? `${HY.date}: ${dayjs(found.date).format("DD.MM.YYYY")}` : null,
      ]
        .filter(Boolean)
        .join("   ")
    : HY.scanAiming;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60">
        <View
          className="overflow-hidden rounded-2xl bg-brand-100"
          style={{ width: width * 0.8, height: height * 0.6 }}
        >
          <View className="flex-row items-center justify-between gap-2 px-4 py-3">
            <Text
              className="min-w-0 flex-1 font-semibold text-[16px] leading-6 text-brand-700"
              numberOfLines={1}
            >
              {HY.scanDocument}
            </Text>
            <Pressable
              onPress={() => setIsTorchOn((current) => !current)}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-10 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={HY.torch}
            >
              <SymbolView
                name={{
                  ios: isTorchOn ? "flashlight.on.fill" : "flashlight.off.fill",
                  android: isTorchOn ? "flashlight_on" : "flashlight_off",
                  web: "flashlight_on",
                }}
                size={18}
                tintColor="#502E7F"
              />
            </Pressable>
          </View>

          <View className="flex-1 overflow-hidden bg-black">
            {permission?.granted ? (
              <>
                <CameraView
                  ref={camera}
                  style={{ flex: 1 }}
                  facing="back"
                  active={visible}
                  animateShutter={false}
                  enableTorch={isTorchOn}
                  onCameraReady={() => setIsReady(true)}
                />
                <View
                  pointerEvents="none"
                  className="absolute inset-0 m-6 rounded-xl border-2 border-dashed border-white/70"
                />
                <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-2 bg-black/50 px-3 py-2">
                  {hasResult ? null : <ActivityIndicator size="small" color="#ffffff" />}
                  <Text
                    className="min-w-0 flex-1 text-[12px] leading-[18px] text-white"
                    numberOfLines={2}
                  >
                    {status}
                  </Text>
                </View>
              </>
            ) : (
              <View className="flex-1 items-center justify-center px-5">
                <Text className="text-center text-[13px] leading-5 text-white">
                  {permission?.canAskAgain === false
                    ? HY.cameraPermissionDenied
                    : HY.scanPermissionNeeded}
                </Text>
              </View>
            )}
          </View>

          <View className="gap-2 px-4 py-3">
            <Button
              title={HY.scanUseResult}
              onPress={handleUse}
              disabled={!hasResult}
            />
            <Button title={HY.cancel} variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
