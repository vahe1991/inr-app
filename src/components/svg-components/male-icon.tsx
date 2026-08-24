import Svg, { Circle, Path } from "react-native-svg";

export function MaleAvatar({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="10" r="5" stroke="#555" strokeWidth="1" />
      <Path
        d="M7 29C7.8 22.5 11 19 16 19C21 19 24.2 22.5 25 29"
        stroke="#555"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
}
