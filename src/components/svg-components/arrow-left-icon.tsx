import Svg, { Path, SvgProps } from "react-native-svg";
export function ArrowLeftIcon(props: SvgProps) {
  return (
    <Svg width={21} height={17} viewBox="0 0 21 17" fill="none" {...props}>
      <Path
        d="M8.75 17L9.98375 15.8015L3.35125 9.35H21V7.65H3.35125L9.98375 1.1985L8.75 0L0 8.5L8.75 17Z"
        fill="#6A4A98"
      />
    </Svg>
  );
}
