import { FunctionComponent } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  CogIcon,
  GlobeIcon as _GlobeIcon,
  PuzzleIcon as _PuzzleIcon,
  XIcon,
} from "@heroicons/react/outline";

export function Icon({ variant, size = 16, alt }: IconProps) {
  const IconComponent: React.FunctionComponent<SpecificIconProps> =
    IconComponents[variant];

  if (!IconComponent) {
    throw Error(`Unknown IconVariant '${variant}'`);
  }

  return <IconComponent size={size} alt={alt} />;
}

export interface IconProps {
  variant: IconVariant;
  alt?: string;
  size?: number;
}

type SpecificIconProps = Omit<IconProps, "variant">;

export enum IconVariant {
  close = "close",
  expanded = "expanded",
  collapsed = "collapsed",
  settings = "settings",
  globe = "globe",
  puzzle = "puzzle",
}

const IconComponents: Record<
  IconVariant,
  FunctionComponent<SpecificIconProps>
> = {
  [IconVariant.close]: CloseIcon,
  [IconVariant.expanded]: ExpandedIcon,
  [IconVariant.collapsed]: CollapsedIcon,
  [IconVariant.settings]: GearIcon,
  [IconVariant.globe]: GlobeIcon,
  [IconVariant.puzzle]: PuzzleIcon,
};

function PuzzleIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Puzzle Icon"}</span>
      <XIcon height={px} width={px} />
    </>
  );
}

function GlobeIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Globe Icon"}</span>
      <XIcon height={px} width={px} />
    </>
  );
}

function GearIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Cog Icon"}</span>
      <CogIcon height={px} width={px} />
    </>
  );
}

function CloseIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Close Icon"}</span>
      <XIcon height={px} width={px} />
    </>
  );
}

function ExpandedIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Expanded Icon"}</span>
      <ChevronUpIcon height={px} width={px} />
    </>
  );
}

function CollapsedIcon({ size, alt }: SpecificIconProps) {
  const px = `${size}px`;
  return (
    <>
      <span className="sr-only">{alt ? alt : "Collapsed Icon"}</span>
      <ChevronDownIcon height={px} width={px} />
    </>
  );
}
