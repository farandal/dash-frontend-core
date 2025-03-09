
import React, { useContext, useEffect, useState } from 'react';

import CacheInvalidatorContext from './CacheInvalidatorContext';
import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';

const useCacheInvalidatorListener = () => {

  const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
	const {cacheInvalidatorStore,updateEntry} = useContext(CacheInvalidatorContext);

  useEffect(() => {
		const lastNotification = laravelEchoContext?.lastEvent;

		if (lastNotification?.class === 'invalidated-cache') {
      if(lastNotification.notificationPayload?.resource) {
        updateEntry(lastNotification.notificationPayload?.resource)
      }
		}
	}, [laravelEchoContext]);
  
	return {
		cacheInvalidatorStore: cacheInvalidatorStore
	};
};

export default useCacheInvalidatorListener;
