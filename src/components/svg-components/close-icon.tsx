import Svg, { Path, SvgProps } from "react-native-svg";
export const CloseIcon = ({
  size = 16,
  color = "#6A4A98",
  ...props
}: SvgProps & { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M12 4L4 12"
      stroke={color}
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 4L12 12"
      stroke={color}
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
