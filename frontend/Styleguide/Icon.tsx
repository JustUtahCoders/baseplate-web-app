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
  required = "required",
  move = "move",
}

const IconComponents = {
  [IconVariant.close]: CloseIcon,
  [IconVariant.expanded]: ExpandedIcon,
  [IconVariant.collapsed]: CollapsedIcon,
  [IconVariant.required]: RequiredIcon,
  [IconVariant.move]: MoveIcon,
};

function CloseIcon({ size, alt }: SpecificIconProps) {
  return (
    <svg
      height={size + "px"}
      width={size + "px"}
      id="Layer_1"
      version="1.1"
      viewBox={`0 0 512 512`}
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>{alt ?? "Close Icon"}</title>
      <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" />
    </svg>
  );
}

function ExpandedIcon({ size, alt }: SpecificIconProps) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={size + "px"}
      height={size + "px"}
      viewBox="0 0 24 24"
      enableBackground="new 0 0 24"
      xmlSpace="preserve"
    >
      <title>{alt ?? "Expanded Icon"}</title>
      <g id="Icons" style={{ opacity: 0.75 }}>
        <g id="collapse">
          <polygon
            id="arrow_1_"
            style={{ fillRule: "evenodd", clipRule: "evenodd" }}
            points="6.697,15.714 12,10.412 17.303,15.714 18.717,14.3
            12,7.583 5.283,14.3 		"
          />
        </g>
      </g>
      <g id="Guides" style={{ display: "none" }}></g>
    </svg>
  );
}

function CollapsedIcon({ size, alt }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={size + "px"}
      height={size + "px"}
      viewBox="0 0 24 24"
      enableBackground="new 0 0 24 24"
      xmlSpace="preserve"
    >
      <title>{alt ?? "Collapsed Icon"}</title>
      <g id="Icons" style={{ opacity: 0.75 }}>
        <g id="expand">
          <polygon
            id="arrow_2_"
            style={{ fillRule: "evenodd", clipRule: "evenodd" }}
            points="17.303,8.283 12,13.586 6.697,8.283 5.283,9.697
          12,16.414 18.717,9.697 		"
          />
        </g>
      </g>
      <g id="Guides" style={{ display: "none" }}></g>
    </svg>
  );
}

function RequiredIcon({ size, alt }: IconProps) {
  return (
    <svg
      height={`${size}px`}
      width={`${size}px`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 1000 1000"
      enableBackground="new 0 0 1000 1000"
      xmlSpace="preserve"
    >
      <title>{alt ?? "Required Icon"}</title>
      <g>
        <path d="M503.7,990h-7.4c-41.1,0-74.7-33.6-74.7-74.7V84.7c0-41.1,33.6-74.7,74.7-74.7h7.4c41.1,0,74.7,33.6,74.7,74.7v830.6C578.4,956.4,544.8,990,503.7,990z" />
        <path d="M77.5,748.2l-3.7-6.5c-20.5-35.6-8.2-81.5,27.3-102l719.4-415.3c35.6-20.5,81.5-8.2,102,27.3l3.7,6.4c20.5,35.6,8.2,81.5-27.3,102L179.5,775.6C144,796.1,98,783.8,77.5,748.2z" />
        <path d="M73.8,258.2l3.7-6.5c20.5-35.6,66.4-47.9,102-27.3l719.4,415.3c35.6,20.5,47.9,66.4,27.3,102l-3.7,6.5c-20.5,35.6-66.4,47.9-102,27.3L101.1,360.2C65.5,339.7,53.3,293.8,73.8,258.2z" />
      </g>
    </svg>
  );
}

function MoveIcon({ size, alt }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
    >
      <title>{alt ?? "Move Icon"}</title>
      <path d="M19 10l-4-3v2h-4V5h2l-3-4-3 4h2v4H5V7l-4 3 4 3v-2h4v4H7l3 4 3-4h-2v-4h4v2l4-3z" />
    </svg>
  );
}
