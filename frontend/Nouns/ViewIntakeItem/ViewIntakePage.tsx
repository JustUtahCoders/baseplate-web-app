import { IntakePageItem } from "../CreateEditIntakeForm";
import { ViewIntakeItem, ViewIntakeItemProps } from "./ViewIntakeItem";

export function ViewIntakePage(props: ViewIntakeItemProps) {
  const intakeItem = props.intakeItem as IntakePageItem;

  return (
    <>
      {intakeItem.intakeItems.map((intakeItem) => (
        <ViewIntakeItem
          {...props}
          key={intakeItem.id}
          nestingLevel={props.nestingLevel + 1}
          intakeItem={intakeItem}
        />
      ))}
    </>
  );
}
