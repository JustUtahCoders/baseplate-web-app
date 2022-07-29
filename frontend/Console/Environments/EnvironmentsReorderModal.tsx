import { EnvironmentWithLastDeployed } from "../../../backend/RestAPI/Environments/GetEnvironments";
import { Modal, ModalActions, ModalProps } from "../../Styleguide/Modal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MouseEventHandler, useEffect, useState } from "react";
import { always } from "kremling";
import { Button, ButtonKind } from "../../Styleguide/Button";
import { cloneDeep } from "lodash-es";

const reorderEnvironments = (
  list: EnvironmentWithLastDeployed[],
  startIndex: number,
  endIndex: number
): EnvironmentWithLastDeployed[] => {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
  return list.map((environment, index) => ({
    ...environment,
    pipelineOrder: index,
  }));
};

export function EnvironmentsReorderModal(props: EnvironmentsReorderModalProps) {
  const [tempEnvironments, setTempEnvironments] = useState(
    cloneDeep(props.environments)
  );
  const { environments, ...modalProps } = props;
  const orderIsChanged =
    tempEnvironments.map(({ id }) => id).join("") !==
    environments.map(({ id }) => id).join("");

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newEnvironments = reorderEnvironments(
      tempEnvironments,
      result.source.index,
      result.destination.index
    );
    setTempEnvironments(newEnvironments);
  };

  return (
    <Modal {...modalProps}>
      <p className="mb-5">
        Change the pipeline order of your environments below using drag &amp;
        drop.
      </p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="bg-gray-100 p-4"
            >
              {tempEnvironments.map((environment, index) => (
                <Draggable
                  key={environment.id}
                  draggableId={environment.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={always(
                        "border border-gray-300 bg-white rounded py-1 px-2 flex items-center"
                      )
                        .maybe("mb-2", index !== tempEnvironments.length - 1)
                        .maybe("bg-gray-100", snapshot.isDragging)}
                    >
                      {environment.name}
                      {environment.isProd && (
                        <div
                          style={{ maxHeight: "26px" }}
                          className="ml-3 uppercase text-xs tracking-widest rounded bg-gray-200 text-gray-700 py-1 px-2"
                        >
                          Prod
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ModalActions>
        <Button type="button" kind={ButtonKind.secondary} onClick={props.close}>
          Cancel
        </Button>
        <Button
          type="button"
          kind={ButtonKind.primary}
          disabled={!orderIsChanged || props.isSaving}
          onClick={async () => {
            props.save(tempEnvironments);
            props.close();
          }}
        >
          Save
        </Button>
      </ModalActions>
    </Modal>
  );
}

interface EnvironmentsReorderModalProps extends ModalProps {
  environments: EnvironmentWithLastDeployed[];
  save: Function;
  isSaving: boolean;
}
