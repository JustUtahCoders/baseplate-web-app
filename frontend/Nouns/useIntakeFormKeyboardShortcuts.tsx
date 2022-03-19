import { Dispatch, useEffect } from "react";
import {
  CreateEditIntakeFormAction,
  CreateEditIntakeFormActionTypes,
} from "./CreateEditIntakeForm";

export function useIntakeFormKeyboardShortcuts({ dispatch }: Options) {
  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };

    function handleKeyUp(evt: KeyboardEvent) {
      console.log(evt.key);
      switch (evt.key) {
        case "ArrowUp":
          dispatch({
            type: CreateEditIntakeFormActionTypes.MoveItemUp,
          });
          break;
        case "ArrowDown":
          dispatch({
            type: CreateEditIntakeFormActionTypes.MoveItemDown,
          });
          break;
        case "Backspace":
          dispatch({
            type: CreateEditIntakeFormActionTypes.DeleteItem,
          });
          break;
        case "z":
          // Ctrl + Z or Cmd + Z
          if (evt.ctrlKey || evt.metaKey) {
            dispatch({
              type: CreateEditIntakeFormActionTypes.Undo,
            });
          }
          break;
        case "r":
          // Ctrl + R or Cmd + R
          if (evt.ctrlKey || evt.metaKey) {
            dispatch({
              type: CreateEditIntakeFormActionTypes.Redo,
            });
          }
          break;
      }
    }
  });
}

interface Options {
  dispatch: Dispatch<CreateEditIntakeFormAction>;
}
