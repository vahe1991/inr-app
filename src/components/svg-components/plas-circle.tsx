import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  type SvgProps,
} from "react-native-svg";
type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  props?: SvgProps;
};
export function PlasCircle({
  width = 16,
  height = 16,
  color = "white",
  ...props
}: IconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <G clipPath="url(#clip0_1224_3769)">
        <Path
          d="M8 0C3.58214 0 0 3.58214 0 8C0 12.4179 3.58214 16 8 16C12.4179 16 16 12.4179 16 8C16 3.58214 12.4179 0 8 0ZM8 14.6429C4.33214 14.6429 1.35714 11.6679 1.35714 8C1.35714 4.33214 4.33214 1.35714 8 1.35714C11.6679 1.35714 14.6429 4.33214 14.6429 8C14.6429 11.6679 11.6679 14.6429 8 14.6429Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 8.57143H8.57143V12H7.42857V8.57143H4V7.42857H7.42857V4H8.57143V7.42857H12V8.57143Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1224_3769">
          <Rect width={16} height={16} fill={color} />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
