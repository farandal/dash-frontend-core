import React, { lazy, Suspense, useMemo } from 'react';
import { GlobalSmallLoader } from 'dash-boilerplate';
import DASHMallServiceWSMessagesManager from '../dash-extensions/managers/DASHMallServiceWSMessagesManager';

const KitchnTabsPrivateApp = lazy(() => import('./KitchnTabsPrivateApp'));
const MallServiceClientWrapper = lazy(() => import('../components/MallService/MallServiceClientWrapper'));
const MallServiceAppHookComponent = lazy(() => import('../kt-mallservice/contexts/MallServiceAppHookComponent'));
const LaravelEchoProvider = lazy(() => 
  import('dash-admin/src/contexts/com/LaravelEchoContext').then(m => ({ default: m.LaravelEchoProvider }))
);
const MallServiceEchoProvider = lazy(() => 
  import('../kt-mallservice/contexts/MallServiceEchoContext').then(m => ({ default: m.MallServiceEchoProvider }))
);

interface MallServiceAppLoaderProps {
  sessionId: string | null;
  mallSlug?: string | null;
}

/**
 * MallServiceAppLoader
 * 
 * Lazy loads mall service resources and routes only when a mall URL is detected.
 * This reduces initial bundle size by not loading mall service resources 
 * for authenticated admin or public users.
 */
const MallServiceAppLoader: React.FC<MallServiceAppLoaderProps> = ({ sessionId, mallSlug }) => {
  const [resources, setResources] = React.useState<any>(null);
  const [routes, setRoutes] = React.useState<any>(null);
  const [providers, setProviders] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('🔄 MallServiceAppLoader: Loading mall service resources...');
    
    Promise.all([
      import('../MallServiceResources').then(m => m.MallServiceResources),
      import('../MallServiceRoutes').then(m => m.MallServicePrivateRoutes),
      import('../dash-extensions').then(m => ({
        DASHMallServiceClientAuthProvider: m.DASHMallServiceClientAuthProvider,
        DASHMallServiceClientDataProvider: m.DASHMallServiceClientDataProvider,
      }))
    ]).then(([res, rts, prov]) => {
      setResources(res);
      setRoutes(() => rts);
      setProviders(prov);
      setIsLoading(false);
    }).catch(error => {
      console.error('❌ MallServiceAppLoader: Failed to load resources:', error);
      setIsLoading(false);
    });
  }, []);

  const mallServiceAppProps = useMemo(() => ({
    customAuthProvider: providers?.DASHMallServiceClientAuthProvider,
    customDataProvider: providers?.DASHMallServiceClientDataProvider,
    customResources: resources,
    customPrivateRoutes: routes,
    AdminHook: () => <><MallServiceAppHookComponent /></>,
    customWSMessagesManager: DASHMallServiceWSMessagesManager,
    customEchoProvider: ({ manager, children }: any) => (
      <LaravelEchoProvider manager={manager}>
        <MallServiceEchoProvider initialHash={sessionId} key={sessionId}>
          {children}
        </MallServiceEchoProvider>
      </LaravelEchoProvider>
    )
  }), [resources, routes, providers, sessionId]);

  if (isLoading || !resources || !providers || !routes) {
    return <GlobalSmallLoader message="Loading mall service modules..." />;
  }

  return (
    <Suspense fallback={<GlobalSmallLoader message="Loading mall service..." />}>
      <MallServiceClientWrapper>
        <KitchnTabsPrivateApp {...mallServiceAppProps} />
      </MallServiceClientWrapper>
    </Suspense>
  );
};

export default MallServiceAppLoader;

