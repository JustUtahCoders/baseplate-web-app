export function ErrorLoading(props: ErrorLoadingProps) {
  return <div>Error loading {props.thingBeingLoaded}</div>;
}

export interface ErrorLoadingProps {
  thingBeingLoaded: string;
}
