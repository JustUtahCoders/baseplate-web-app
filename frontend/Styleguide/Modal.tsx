import { HTMLProps, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, ButtonKind } from "./Button";
import { Icon, IconVariant } from "./Icon";

export function Modal(props: ModalProps) {
  const [containerEl, setContainerEl] = useState<HTMLElement | void>();

  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    setContainerEl(el);

    return () => {
      el.remove();
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", hotKeys);

    return () => {
      window.removeEventListener("keyup", hotKeys);
    };

    function hotKeys(evt: KeyboardEvent) {
      if (evt.key === "Escape") {
        props.close();
      }
    }
  });

  if (!containerEl) {
    return null;
  }

  return createPortal(
    <>
      {/* modal screen / overlay */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"></div>
      {/* dialog / content */}
      <dialog
        className="fixed top-1/4 mx-auto border w-96 shadow-lg rounded-md bg-white divide-y divide-gray-200 p-0"
        open
      >
        <header className="flex items-center justify-between mb-2 pt-5 px-5 pb-2">
          <h1 className="text-xl">{props.title}</h1>
          <Button kind={ButtonKind.icon} onClick={props.close}>
            <Icon variant={IconVariant.close} alt="Close Modal Icon" />
          </Button>
        </header>
        <div className="p-5">{props.children}</div>
      </dialog>
    </>,
    containerEl
  );
}

export function ModalActions(props: ModalActionsProps) {
  return <div className="flex justify-end gap-3 mt-6">{props.children}</div>;
}

interface ModalActionsProps {
  children?: React.ReactNode;
}

export interface ModalProps extends HTMLProps<HTMLDialogElement> {
  title: string;
  close(): any;
}
