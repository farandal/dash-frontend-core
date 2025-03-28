import React from "react";
import { Omit } from "../util/omit";
import { splitItems, computeOriginalIndex, computeOriginalIndexAfterDrop } from "./compute";

interface Location {
  id: string;
  index: number;
}

export interface DragAndDropResult {
  source: Location;
  destination: Location;
}

export interface Chunk {
  id: string;
  items: any[];
}

export interface Props {
  chunks: Chunk[];
  onDragEnd(result: DragAndDropResult): void;
}

export interface WithMaxItemsProps {
  items: any[];
  maxItems?: number;
  onDragEnd(sourceIndex: number, destinationIndex: number): void;
}

interface WithMaxItemsState {
  maxItems: number;
  items: any[];
  chunks: Chunk[];
}

export const withMaxItems = <T, P extends Props>(
  Component: React.FC<P>,
  createId: () => string
): React.FC<Omit<P, Props> & WithMaxItemsProps> => {
  const ComponentWithMaxItems: React.FC<Omit<P, Props> & WithMaxItemsProps> = (props) => {
    const [state, setState] = React.useState<WithMaxItemsState>(() => {
      const maxItems: number = props.maxItems && props.maxItems > 0 ? props.maxItems : props.items.length;
      return {
        maxItems,
        items: props.items,
        chunks: splitItems(maxItems, props.items, createId)
      };
    });

    const findChunkIndex = (id: string): number => {
      return state.chunks.findIndex((chunk: Chunk) => chunk.id === id);
    };

    const onDragEnd = ({ source, destination }: DragAndDropResult): void => {
      if (destination) {
        const { index: indexInSourceChunk, id: sourceChunkId } = source;
        const { index: indexInDestinationChunk, id: destinationChunkId } = destination;
        const sourceChunkIndex: number = findChunkIndex(sourceChunkId);
        const destinationChunkIndex: number = findChunkIndex(destinationChunkId);
        const sourceIndex: number = computeOriginalIndex(state.maxItems, sourceChunkIndex, indexInSourceChunk);
        const destinationIndex: number = computeOriginalIndexAfterDrop(
          state.maxItems,
          sourceChunkIndex,
          destinationChunkIndex,
          indexInDestinationChunk
        );
        props.onDragEnd(sourceIndex, destinationIndex);
      }
    };

    const { items, maxItems, onDragEnd: _, ...rest } = props;
    return <Component {...{ chunks: state.chunks, onDragEnd }} {...((rest as unknown) as P)} />;
  };
  return ComponentWithMaxItems;
};
