import { Path, Svg } from "react-native-svg";

type IconProps = {
  size?: number;
};

export function PlasIcon({ size = 15 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 8.57143H8.57143V15H6.42857V8.57143H0V6.42857H6.42857V0H8.57143V6.42857H15V8.57143Z"
        fill="#502E7F"
      />
    </Svg>
  );
}

export const PlasBtnIcon = PlasIcon;
