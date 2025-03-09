import { FC } from "react";
import useCacheInvalidatorListener from "./useCacheInvalidatorListener";
import React from "react";

const CacheInvalidatorListenerComponent:FC<any> = () => {
  const _cacheInvalidatorStore = useCacheInvalidatorListener();
  return <></>
}

export default CacheInvalidatorListenerComponent;