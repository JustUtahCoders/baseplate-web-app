import { useEffect, useReducer } from "react";
import { RouteComponentProps } from "react-router";
import { Field } from "../../backend/DB/models/Field";
import { useQuery } from "react-query";
import { Card } from "../Styleguide/Card";
import { Loader } from "../Styleguide/Loader";
import { Button, ButtonKind } from "../Styleguide/Button";
import { CreateIntakeItem } from "./CreateIntakeItem";
import { foundryFetch } from "../Utils/foundryFetch";
import { ViewEditIntakeItem } from "./EditIntakeItem/ViewEditIntakeItem";
import { useIntakeFormKeyboardShortcuts } from "./useIntakeFormKeyboardShortcuts";

export function CreateEditIntakeForm(
  props: RouteComponentProps<{ nounId: string }>
) {
  const [state, dispatch] = useReducer<Reducer, State>(
    reducer,
    initialState,
    () => initialState
  );

  const nounId = props.match.params.nounId;

  const {
    data: fields,
    isLoading: isLoadingFields,
    isError: isErrorFields,
    error: errorFields,
  } = useQuery<Field[]>(`fields-${nounId}`, async () => {
    const r = await foundryFetch<{ fields: Field[] }>(
      `/api/nouns/${nounId}/fields`
    );
    return r.fields;
  });

  const {
    data: intakeItems,
    isLoading: isLoadingIntakeItems,
    isError: isErrorIntakeItems,
    error: errorIntakeItems,
  } = useQuery<IntakeItem[]>(`intake-form-${nounId}`, async () => {
    const r: GetIntakeItemsResponse = {
      intakeItems: [
        {
          type: IntakeItemType.Page,
          id: 3,
          intakeItems: [
            {
              type: IntakeItemType.Field,
              field: {
                createdAt: Date.now().toString(),
                id: 1,
                activeStatus: true,
                columnName: "givenName",
                friendlyName: "First Name",
                nounId: 10,
                type: "text",
                updatedAt: Date.now().toString(),
              },
              id: 1,
              pageId: 3,
              question: {
                label: "First Name",
                placeholderText: "Jane",
                required: true,
              },
            },
            {
              type: IntakeItemType.Field,
              field: {
                createdAt: Date.now().toString(),
                id: 2,
                activeStatus: true,
                columnName: "surname",
                friendlyName: "Last Name",
                nounId: 10,
                type: "text",
                updatedAt: Date.now().toString(),
              },
              id: 2,
              pageId: 3,
              question: {
                label: "Last Name",
                placeholderText: "Doe",
                required: true,
              },
            },
          ],
        },
      ],
    };
    return r.intakeItems;
  });

  useEffect(() => {
    dispatch({
      type: CreateEditIntakeFormActionTypes.NounFieldsLoaded,
      nounFields: fields || [],
    });
  }, [fields]);

  useEffect(() => {
    dispatch({
      type: CreateEditIntakeFormActionTypes.IntakeItemsLoaded,
      intakeItems: intakeItems || [],
    });
  }, [intakeItems]);

  useEffect(() => {
    window.addEventListener("click", clearEdit);
    function clearEdit() {
      dispatch({
        type: CreateEditIntakeFormActionTypes.CancelEdit,
      });
    }

    return () => {
      window.removeEventListener("click", clearEdit);
    };
  });

  useIntakeFormKeyboardShortcuts({ dispatch });

  if (isLoadingIntakeItems || isLoadingFields) {
    return (
      <Card>
        <Loader description="Loading intake form" />
      </Card>
    );
  }

  if (isErrorIntakeItems || isErrorFields) {
    return (
      <Card>
        <h1>Error loading intake form</h1>
      </Card>
    );
  }

  return (
    <div className="container p-20">
      <div className="flex justify-between">
        <h1>Intake form for Noun</h1>
        <Button
          kind={ButtonKind.primary}
          onClick={() =>
            dispatch({
              type: CreateEditIntakeFormActionTypes.CreateItem,
            })
          }
        >
          Add Field
        </Button>
      </div>
      {state.intakeForm.intakeItems.map((item, i) => {
        return (
          <ViewEditIntakeItem
            key={item.id}
            intakeItem={item}
            nestingLevel={0}
            dispatch={dispatch}
            selectedItem={state.itemToEdit}
          />
        );
      })}
      {state.creatingItem && (
        <CreateIntakeItem
          fields={state.nounFields}
          addNewItem={(intakeItem: IntakeItem) => {
            dispatch({
              type: CreateEditIntakeFormActionTypes.AddNewItem,
              intakeItem,
            });
          }}
          close={() => {
            dispatch({
              type: CreateEditIntakeFormActionTypes.CancelCreate,
            });
          }}
        />
      )}
    </div>
  );
}

const initialState: State = {
  intakeForm: {
    intakeItems: [],
  },
  nounFields: [],
  creatingItem: false,
  itemToEdit: undefined,
  undoStack: [],
  redoStack: [],
};

function reducer(state: State, action: CreateEditIntakeFormAction): State {
  switch (action.type) {
    case CreateEditIntakeFormActionTypes.IntakeItemsLoaded:
      return modifyIntakeForm(state, {
        intakeItems: action.intakeItems,
      });
    case CreateEditIntakeFormActionTypes.EditItem:
      if (action.item !== state.itemToEdit) {
        return {
          ...state,
          itemToEdit: action.item,
        };
      }
      break;
    case CreateEditIntakeFormActionTypes.SaveItemEdit:
      if (state.itemToEdit) {
        return {
          ...state,
          itemToEdit: action.intakeItem,
          intakeForm: {
            ...state.intakeForm,
            intakeItems: replaceIntakeItem(
              state.intakeForm.intakeItems,
              state.itemToEdit,
              action.intakeItem
            ),
          },
        };
      } else {
        throw Error(`Cannot save intake item when none is selected`);
      }
    case CreateEditIntakeFormActionTypes.CancelEdit:
      if (state.itemToEdit) {
        return {
          ...state,
          itemToEdit: undefined,
        };
      }
    case CreateEditIntakeFormActionTypes.CreateItem:
      return {
        ...state,
        creatingItem: true,
      };
    case CreateEditIntakeFormActionTypes.CancelCreate:
      return {
        ...state,
        creatingItem: false,
      };
    case CreateEditIntakeFormActionTypes.AddNewItem:
      return {
        ...state,
        undoStack: [
          {
            type: CreateEditIntakeFormActionTypes.DeleteItem,
            intakeItem: action.intakeItem,
          },
          ...state.undoStack,
        ],
        intakeForm: {
          ...state.intakeForm,
          intakeItems: [...state.intakeForm.intakeItems, action.intakeItem],
        },
        creatingItem: false,
      };
    case CreateEditIntakeFormActionTypes.NounFieldsLoaded:
      return {
        ...state,
        nounFields: action.nounFields,
      };
    case CreateEditIntakeFormActionTypes.DeleteItem:
      const item = state.itemToEdit || action.intakeItem;
      if (item) {
        return modifyIntakeForm(state, {
          intakeItems: replaceIntakeItem(
            state.intakeForm.intakeItems,
            item,
            null
          ),
        });
      }
    case CreateEditIntakeFormActionTypes.MoveItemUp:
    case CreateEditIntakeFormActionTypes.MoveItemDown:
      if (state.itemToEdit) {
        const { intakeItems, itemMoved } = moveItemOne(
          state.intakeForm.intakeItems,
          state.itemToEdit,
          action.type === CreateEditIntakeFormActionTypes.MoveItemUp
        );
        if (itemMoved) {
          let undoAction;

          if (action.type === CreateEditIntakeFormActionTypes.MoveItemUp) {
            undoAction = {
              type: CreateEditIntakeFormActionTypes.MoveItemDown,
            };
          } else {
            undoAction = {
              type: CreateEditIntakeFormActionTypes.MoveItemUp,
            };
          }

          return modifyIntakeForm(
            state,
            {
              intakeItems,
            },
            undoAction
          );
        }
      }
      break;
    case CreateEditIntakeFormActionTypes.Undo:
      if (state.undoStack.length > 0) {
        const newState = reducer(state, state.undoStack[0]);
        const undoneActions = newState.undoStack.splice(0, 1);
        newState.redoStack.push(...undoneActions);
        return newState;
      }
      break;
    case CreateEditIntakeFormActionTypes.Redo:
      if (state.redoStack.length > 0) {
        const newState = reducer(state, state.redoStack[0]);
        const redoneActions = newState.redoStack.splice(0, 1);
        newState.undoStack.push(...redoneActions);
        return newState;
      }
      break;
    default:
      throw Error();
  }

  return state;
}

function moveItemOne(
  intakeItems: IntakeItem[],
  itemToMove: IntakeItem,
  moveToPrevious: boolean
): MoveResult {
  let performMove = createPerformMove(intakeItems, moveToPrevious),
    resultItems: IntakeItem[] = intakeItems;

  for (let [index, item] of intakeItems.entries()) {
    if (item.id === itemToMove.id) {
      if (performMove) {
        resultItems = performMove(index);
        return {
          intakeItems: resultItems,
          itemMoved: true,
        };
      } else {
        return {
          intakeItems,
          itemMoved: false,
        };
      }
    } else if ((item as IntakePageItem).intakeItems) {
      const { intakeItems: newChildItems, itemMoved } = moveItemOne(
        (item as IntakePageItem).intakeItems,
        itemToMove,
        moveToPrevious
      );

      if (itemMoved) {
        (item as IntakePageItem).intakeItems = newChildItems;
        return {
          intakeItems,
          itemMoved: true,
        };
      }
    }

    performMove = createPerformMove(intakeItems, moveToPrevious);
  }

  return {
    intakeItems: resultItems,
    itemMoved: false,
  };
}

function createPerformMove(
  intakeItems: IntakeItem[],
  moveToPrevious: boolean
): (index: number) => IntakeItem[] {
  return (index: number) => {
    const result = [...intakeItems];
    if (moveToPrevious) {
      if (index !== 0) {
        swapArrayItems(result, index, index - 1);
      }
    } else {
      if (index !== result.length - 1) {
        console.log("moving down", index, result.length - 1, intakeItems);
        swapArrayItems(result, index, index + 1);
      }
    }
    return result;
  };
}

function swapArrayItems(
  arr: any[],
  firstIndex: number,
  secondIndex: number
): void {
  const item = arr[firstIndex];
  arr[firstIndex] = arr[secondIndex];
  arr[secondIndex] = item;
}

interface MoveResult {
  intakeItems: IntakeItem[];
  itemMoved: boolean;
}

function replaceIntakeItem(
  intakeItems: IntakeItem[],
  oldItem: IntakeItem,
  newItem: IntakeItem | null
): IntakeItem[] {
  return intakeItems.reduce<IntakeItem[]>((result, intakeItem) => {
    let thisItem: IntakeItem | null;

    if (intakeItem.id === oldItem.id) {
      thisItem = newItem;
    } else if ((intakeItem as IntakePageItem).intakeItems) {
      const item: IntakePageItem = {
        ...(intakeItem as IntakePageItem),
        intakeItems: replaceIntakeItem(
          (intakeItem as IntakePageItem).intakeItems,
          oldItem,
          newItem
        ),
      };
      thisItem = item;
    } else {
      thisItem = intakeItem;
    }

    if (thisItem) {
      result.push(thisItem);
    }

    return result;
  }, []);
}

function modifyIntakeForm(
  state: State,
  partialIntakeForm: Partial<IntakeForm>,
  undoAction?: CreateEditIntakeFormAction
): State {
  return {
    ...state,
    undoStack: undoAction ? [undoAction, ...state.undoStack] : state.undoStack,
    intakeForm: {
      ...state.intakeForm,
      ...partialIntakeForm,
    },
  };
}

interface State {
  intakeForm: IntakeForm;
  itemToEdit?: IntakeItem;
  creatingItem?: boolean;
  nounFields: Field[];
  undoStack: CreateEditIntakeFormAction[];
  redoStack: CreateEditIntakeFormAction[];
}

interface IntakeForm {
  intakeItems: IntakeItem[];
}

export enum CreateEditIntakeFormActionTypes {
  IntakeItemsLoaded = "IntakeItemsLoaded",
  EditItem = "EditItem",
  SaveItemEdit = "SaveItemEdit",
  CancelEdit = "CancelEdit",
  CreateItem = "CreateItem",
  CancelCreate = "CancelCreate",
  AddNewItem = "AddNewItem",
  NounFieldsLoaded = "NounFieldsLoaded",
  DeleteItem = "DeleteItem",
  MoveItemUp = "MoveItemUp",
  MoveItemDown = "MoveItemDown",
  Undo = "Undo",
  Redo = "Redo",
}

export enum IntakeItemType {
  Field = "Field",
  Section = "Section",
  Page = "Page",
  Header = "Header",
  Paragraph = "Paragraph",
}

interface AnyIntakeItem {
  type: IntakeItemType;
  id: number;
  pageId?: number;
}

export type IntakeFieldItem = AnyIntakeItem & {
  type: IntakeItemType.Field;
  id: number;
  field: Field;
  question: FieldQuestion;
};

export type IntakeSectionItem = AnyIntakeItem & {
  type: IntakeItemType.Section;
  intakeItems: IntakeItem[];
};

export type IntakeParagraphItem = AnyIntakeItem & {
  type: IntakeItemType.Paragraph;
  textContent: string;
};

export type IntakeHeaderItem = AnyIntakeItem & {
  textContent: string;
};

export type IntakePageItem = AnyIntakeItem & {
  type: IntakeItemType.Page;
  intakeItems: IntakeItem[];
};
interface FieldQuestion {
  label: string;
  required: boolean;
  placeholderText: string;
}

export type IntakeItem =
  | IntakeFieldItem
  | IntakeSectionItem
  | IntakeParagraphItem
  | IntakeHeaderItem
  | IntakePageItem;

interface IntakeItemsLoadedAction {
  type: CreateEditIntakeFormActionTypes.IntakeItemsLoaded;
  intakeItems: IntakeItem[];
}

interface EditItemAction {
  type: CreateEditIntakeFormActionTypes.EditItem;
  item: IntakeItem;
}

interface CancelEditAction {
  type: CreateEditIntakeFormActionTypes.CancelEdit;
}

interface CreateAction {
  type: CreateEditIntakeFormActionTypes.CreateItem;
}

interface CancelCreateAction {
  type: CreateEditIntakeFormActionTypes.CancelCreate;
}

interface AddNewItem {
  type: CreateEditIntakeFormActionTypes.AddNewItem;
  intakeItem: IntakeItem;
}

interface NounFieldsLoaded {
  type: CreateEditIntakeFormActionTypes.NounFieldsLoaded;
  nounFields: Field[];
}

interface SaveItemEditAction {
  type: CreateEditIntakeFormActionTypes.SaveItemEdit;
  intakeItem: IntakeItem;
}

interface DeleteItemAction {
  type: CreateEditIntakeFormActionTypes.DeleteItem;
  intakeItem?: IntakeItem;
}

interface MoveItemUpAction {
  type: CreateEditIntakeFormActionTypes.MoveItemUp;
}
interface MoveItemDownAction {
  type: CreateEditIntakeFormActionTypes.MoveItemDown;
}

interface Undo {
  type: CreateEditIntakeFormActionTypes.Undo;
}

interface Redo {
  type: CreateEditIntakeFormActionTypes.Redo;
}

export type CreateEditIntakeFormAction =
  | IntakeItemsLoadedAction
  | EditItemAction
  | CancelEditAction
  | CreateAction
  | CancelCreateAction
  | AddNewItem
  | NounFieldsLoaded
  | SaveItemEditAction
  | DeleteItemAction
  | MoveItemUpAction
  | MoveItemDownAction
  | Undo
  | Redo;

type Reducer = (state: State, action: CreateEditIntakeFormAction) => State;

interface GetIntakeItemsResponse {
  intakeItems: IntakeItem[];
}
