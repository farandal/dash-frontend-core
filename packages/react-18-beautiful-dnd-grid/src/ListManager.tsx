import { DragAndDropWrapper } from "./DragAndDropWrapper/DragAndDropWrapper";
import { withMaxItems } from "./withMaxItems/withMaxItems";
import { withReactToItemsChange } from "./withReactToItemsChange/withReactToItemsChange";
//import { nanoid } from 'nanoid/non-secure'

export function hashAny(input: any): string {
    const str = typeof input === 'string' 
      ? input 
      : JSON.stringify(input);
      
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

export const generateId = (() => {
    let counter = 0;
    return (prefix = 'grid-item-') => {
      counter += 1;
      return `${hashAny(prefix.toString() || Date.now())}${counter}`;
    };
  })();

const ComponentWithMaxItems = withMaxItems(DragAndDropWrapper, generateId);
const ComponentWithReactToItemsChange = withReactToItemsChange(ComponentWithMaxItems);

export const ListManager = ComponentWithReactToItemsChange;
