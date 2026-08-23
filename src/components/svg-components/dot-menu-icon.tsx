import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";
interface DotMenuIconProps extends SvgProps {
  size?: number;
  color?: string;
}
export function DotMenuIcon({
  size = 16,
  color = "#000000",
  ...props
}: DotMenuIconProps) {
  return (
    <Svg fill={color} width={size} height={size} viewBox="0 0 32 32" {...props}>
      <Path
        d="M13,16c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,14.346,13,16z"
        id="XMLID_294_"
      />
      <Path
        d="M13,26c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,24.346,13,26z"
        id="XMLID_295_"
      />
      <Path
        d="M13,6c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,4.346,13,6z"
        id="XMLID_297_"
      />
    </Svg>
  );
}
