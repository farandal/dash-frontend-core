import React from "react";
import { generateId, hashAny } from "../ListManager";

export interface Props {
  items: any[];
}

export const withReactToItemsChange = <P extends Props>(Component: React.FC<P>): React.FC<P> => (
  props: P
) => <Component key={hashAny(props.items)} {...props} />;
