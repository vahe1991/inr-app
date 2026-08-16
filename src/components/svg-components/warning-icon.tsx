import Svg, { Path, SvgProps } from "react-native-svg";
export const WarningIcon = (props: SvgProps) => (
  <Svg width={3} height={14} viewBox="0 0 3 14" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.25 13.5C1.58152 13.5 1.89946 13.3683 2.13388 13.1339C2.3683 12.8995 2.5 12.5815 2.5 12.25C2.5 11.9185 2.3683 11.6005 2.13388 11.3661C1.89946 11.1317 1.58152 11 1.25 11C0.918479 11 0.600537 11.1317 0.366117 11.3661C0.131696 11.6005 0 11.9185 0 12.25C0 12.5815 0.131696 12.8995 0.366117 13.1339C0.600537 13.3683 0.918479 13.5 1.25 13.5Z"
      fill="#FF4D4F"
    />
    <Path
      d="M1.25 1V9"
      stroke="#FF4D4F"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
