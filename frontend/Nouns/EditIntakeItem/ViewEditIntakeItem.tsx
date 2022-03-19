import {
  Dispatch,
  useEffect,
  useState,
  ReactElement,
  MouseEvent,
  FocusEvent,
} from "react";
import {
  CreateEditIntakeFormAction,
  CreateEditIntakeFormActionTypes,
  IntakeFieldItem,
  IntakeItem,
  IntakeItemType,
  IntakePageItem,
  IntakeSectionItem,
} from "../CreateEditIntakeForm";
import {
  ViewIntakeItem,
  ViewIntakeItemProps,
} from "../ViewIntakeItem/ViewIntakeItem";
import { always } from "kremling";
import { Button, ButtonKind } from "../../Styleguide/Button";
import { Icon, IconVariant } from "../../Styleguide/Icon";
import { Modal, ModalActions } from "../../Styleguide/Modal";
import { Tooltip } from "../../Styleguide/Tooltip";

export function ViewEditIntakeItem(props: ViewEditIntakeItemProps) {
  return (
    <ViewIntakeItem {...props} WrapperComponent={EditIntakeItemControls} />
  );
}

function EditIntakeItemControls(props: ViewEditIntakeItemProps): ReactElement {
  const isSelected = props.selectedItem?.id === props.intakeItem.id;
  const activeColor = getNestingColor();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const collapsibleIntakeItemTypes: IntakeItemType[] = [
    IntakeItemType.Section,
    IntakeItemType.Page,
  ];

  const collapsible = collapsibleIntakeItemTypes.includes(
    props.intakeItem.type
  );

  useEffect(() => {
    if (collapsed && isSelected) {
      props.dispatch({
        type: CreateEditIntakeFormActionTypes.CancelEdit,
      });
    }
  });

  const outerClasses = `hover:border-${activeColor}-300 border border-transparent rounded cursor-pointer flex align-start pr-4`;
  const collapseButton = (
    <Button kind={ButtonKind.icon} onClick={toggleCollapsed}>
      <Icon
        variant={collapsed ? IconVariant.collapsed : IconVariant.expanded}
      />
    </Button>
  );

  if (collapsed) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={always(outerClasses).always(
          "hover:bg-gray-200 items-center"
        )}
        onClick={toggleCollapsed}
      >
        {collapseButton}
        <span className="text-gray-400">{collapsedText()}</span>
      </div>
    );
  } else {
    return (
      <div
        role="button"
        tabIndex={0}
        className={always(outerClasses)
          .always("mb-4")
          .maybe(`bg-${activeColor}-100`, isSelected)}
        onClick={selectItem}
        onFocus={selectItem}
      >
        {collapsible && <div>{collapseButton}</div>}
        <div className="w-full">
          {props.children}
          {isSelected && (
            <div>
              {props.intakeItem.type === IntakeItemType.Field && (
                <Tooltip label="Required">
                  <Button kind={ButtonKind.icon} onClick={toggleRequired}>
                    <Icon variant={IconVariant.required} alt="Required" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip label="Move">
                <Button kind={ButtonKind.icon}>
                  <Icon variant={IconVariant.move} />
                </Button>
              </Tooltip>
              <Tooltip label="Delete">
                <Button
                  kind={ButtonKind.icon}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Icon variant={IconVariant.close} alt="Delete" />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
        {confirmDelete && (
          <Modal title="Confirm Delete" close={() => setConfirmDelete(false)}>
            Are you sure you want to delete this {props.intakeItem.type}?
            <ModalActions>
              <Button
                kind={ButtonKind.primary}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button kind={ButtonKind.secondary} onClick={deleteItem}>
                Delete
              </Button>
            </ModalActions>
          </Modal>
        )}
      </div>
    );
  }

  function deleteItem() {
    props.dispatch({
      type: CreateEditIntakeFormActionTypes.DeleteItem,
    });
  }

  function toggleRequired(evt: MouseEvent) {
    evt.stopPropagation();

    const fieldItem = props.intakeItem as IntakeFieldItem;

    const newItem: IntakeFieldItem = {
      ...fieldItem,
      question: {
        ...fieldItem.question,
        required: !fieldItem.question.required,
      },
    };

    props.dispatch({
      type: CreateEditIntakeFormActionTypes.SaveItemEdit,
      intakeItem: newItem,
    });
  }

  function collapsedText(): string {
    switch (props.intakeItem.type) {
      case IntakeItemType.Page:
        return `Page with ${(
          props.intakeItem as IntakePageItem
        ).intakeItems.length.toLocaleString()} items`;
      case IntakeItemType.Section:
        return `Section with ${(
          props.intakeItem as IntakeSectionItem
        ).intakeItems.length.toLocaleString()} items`;
      default:
        throw Error(
          `No collapsed text implemented for intake items of type '${props.intakeItem.type}'`
        );
    }
  }

  function toggleCollapsed(evt: MouseEvent) {
    setCollapsed(!collapsed);
  }

  function selectItem(evt: MouseEvent | FocusEvent<HTMLDivElement>) {
    evt.stopPropagation();

    props.dispatch({
      type: CreateEditIntakeFormActionTypes.EditItem,
      item: props.intakeItem,
    });
  }

  function getNestingColor(): string {
    switch (props.nestingLevel) {
      case 0:
        return "gray";
      case 1:
        return "blue";
      case 2:
        return "red";
      default:
        return "gray";
    }
  }
}

type ViewEditIntakeItemProps = ViewIntakeItemProps & {
  dispatch: Dispatch<CreateEditIntakeFormAction>;
  selectedItem?: IntakeItem;
  children?: React.ReactElement;
};
