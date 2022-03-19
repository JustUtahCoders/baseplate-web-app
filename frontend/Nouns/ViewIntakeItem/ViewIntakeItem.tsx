import { IntakeItem, IntakeItemType } from "../CreateEditIntakeForm";
import { ViewIntakeField } from "./ViewIntakeField";
import { ViewIntakeParagraph } from "./ViewIntakeParagraph";
import { ViewIntakeHeader } from "./ViewIntakeHeader";
import { ViewIntakePage } from "./ViewIntakePage";
import { FunctionComponent } from "react";

export function ViewIntakeItem(props: ViewIntakeItemProps) {
  const ViewItem = getViewItemComponent(props.intakeItem);

  if (props.WrapperComponent) {
    return (
      <props.WrapperComponent {...props}>
        <ViewItem {...props} />
      </props.WrapperComponent>
    );
  } else {
    return <ViewItem {...props} />;
  }
}

function getViewItemComponent(
  intakeItem: IntakeItem
): React.FunctionComponent<ViewIntakeItemProps> {
  switch (intakeItem.type) {
    case IntakeItemType.Field:
      return ViewIntakeField;
    case IntakeItemType.Paragraph:
      return ViewIntakeParagraph;
    case IntakeItemType.Header:
      return ViewIntakeHeader;
    case IntakeItemType.Page:
      return ViewIntakePage;
    default:
      throw Error(
        `No component implemented for viewing intake items of type '${intakeItem.type}'`
      );
  }
}

export interface ViewIntakeItemProps {
  intakeItem: IntakeItem;
  nestingLevel: number;
  WrapperComponent?: FunctionComponent<any>;
}
