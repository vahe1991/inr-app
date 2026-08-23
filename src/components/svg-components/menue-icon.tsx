import Svg, { Path, SvgProps } from "react-native-svg";
export default function MenueIcon(props: SvgProps) {
  return (
    <Svg width={38} height={38} viewBox="0 0 38 38" fill="none" {...props}>
      <Path
        d="M4.75 9.5H33.25M4.75 19H33.25M4.75 28.5H33.25"
        stroke="#6A4A98"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
