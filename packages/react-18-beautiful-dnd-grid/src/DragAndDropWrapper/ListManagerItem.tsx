import React, { ReactElement } from "react";
import { Draggable, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { generateId, hashAny } from "../ListManager";


export interface ListManagerItemProps {
  item: any;
  index: number;
  render(item: any): ReactElement<{}>;
}
{/* @ts-ignore */}
export const ListManagerItem: React.StatelessComponent<ListManagerItemProps> = ({
  item,
  index,
  render
}: ListManagerItemProps) => (
  <Draggable draggableId={hashAny(item)} index={index}>
    {(provided: DraggableProvided, _: DraggableStateSnapshot) => (
      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        {render(item)}
      </div>
    )}
  </Draggable>
);
