import React, { lazy, Suspense, useMemo } from 'react';
import GlobalSmallLoader from '../dash-extensions/components/GlobalSmallLoader';
import DASHSelfServiceWSMessagesManager from '../dash-extensions/managers/DASHSelfServiceWSMessagesManager';

const KitchnTabsPrivateApp = lazy(() => import('./KitchnTabsPrivateApp'));
const SelfServiceClientWrapper = lazy(() => import('../components/selfservice/SelfServiceClientWrapper'));
const SelfServiceAppHookComponent = lazy(() => import('../kt-selfservice/contexts/SelfServiceAppHookComponent'));
const LaravelEchoProvider = lazy(() => 
  import('dash-admin/src/contexts/com/LaravelEchoContext').then(m => ({ default: m.LaravelEchoProvider }))
);
const SelfServiceEchoProvider = lazy(() => 
  import('../kt-selfservice/contexts/SelfServiceEchoContext').then(m => ({ default: m.SelfServiceEchoProvider }))
);

interface SelfServiceAppLoaderProps {
  sessionId: string | null;
}

/**
 * SelfServiceAppLoader
 * 
 * Lazy loads self-service kiosk resources and routes only when a self-service URL is detected.
 * This reduces initial bundle size by ~200KB by not loading self-service resources 
 * for authenticated admin or public users.
 */
const SelfServiceAppLoader: React.FC<SelfServiceAppLoaderProps> = ({ sessionId }) => {
  const [resources, setResources] = React.useState<any>(null);
  const [routes, setRoutes] = React.useState<any>(null);
  const [providers, setProviders] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('🔄 SelfServiceAppLoader: Loading self-service resources...');
    
    Promise.all([
      import('../SelfServiceResources').then(m => m.SelfServiceResources),
      import('../SelfServiceRoutes').then(m => m.selfServicePrivateRoutes),
      import('../dash-extensions').then(m => ({
        DASHSelfServiceClientAuthProvider: m.DASHSelfServiceClientAuthProvider,
        DASHSelfServiceClientDataProvider: m.DASHSelfServiceClientDataProvider,
      }))
    ]).then(([res, rts, prov]) => {
      setResources(res);
      setRoutes(() => rts);
      setProviders(prov);
      setIsLoading(false);
    }).catch(error => {
      console.error('❌ SelfServiceAppLoader: Failed to load resources:', error);
      setIsLoading(false);
    });
  }, []);

  const selfServiceAppProps = useMemo(() => ({
    customAuthProvider: providers?.DASHSelfServiceClientAuthProvider,
    customDataProvider: providers?.DASHSelfServiceClientDataProvider,
    customResources: resources,
    customPrivateRoutes: routes,
    AdminHook: () => <><SelfServiceAppHookComponent /></>,
    customWSMessagesManager: DASHSelfServiceWSMessagesManager,
    customEchoProvider: ({ manager, children }: any) => (
      <LaravelEchoProvider manager={manager}>
        <SelfServiceEchoProvider initialHash={sessionId} key={sessionId}>
          {children}
        </SelfServiceEchoProvider>
      </LaravelEchoProvider>
    )
  }), [resources, routes, providers, sessionId]);

  if (isLoading || !resources || !providers || !routes) {
    return <GlobalSmallLoader message="Loading self-service modules..." />;
  }

  return (
    <Suspense fallback={<GlobalSmallLoader message="Loading self-service..." />}>
      <SelfServiceClientWrapper>
        <KitchnTabsPrivateApp {...selfServiceAppProps} />
      </SelfServiceClientWrapper>
    </Suspense>
  );
};

export default SelfServiceAppLoader;
