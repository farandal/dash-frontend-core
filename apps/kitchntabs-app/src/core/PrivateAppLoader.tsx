import React, { lazy, Suspense, useMemo } from 'react';
import { GlobalSmallLoader } from 'dash-boilerplate';

const KitchnTabsPrivateApp = lazy(() => import('./KitchnTabsPrivateApp'));
const MainAppHookComponent = lazy(() => import('../contexts/MainAppHookComponent'));
const LaravelEchoProvider = lazy(() => 
  import('dash-admin/contexts/com/LaravelEchoContext').then(m => ({ default: m.LaravelEchoProvider }))
);
const SelfServiceEchoProvider = lazy(() => 
  import('../kt-selfservice/contexts/SelfServiceEchoContext').then(m => ({ default: m.SelfServiceEchoProvider }))
);

/**
 * PrivateAppLoader
 * 
 * Lazy loads admin resources and routes only when authenticated user is detected.
 * This reduces initial bundle size by ~300KB by not loading admin resources 
 * for public or self-service users.
 */
const PrivateAppLoader: React.FC = () => {
  const [resources, setResources] = React.useState<any>(null);
  const [routes, setRoutes] = React.useState<{ private: any; public: any }>({ private: null, public: null });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('🔄 PrivateAppLoader: Loading admin resources...');
    
    Promise.all([
      import('../KitchnTabsResources').then(m => m.KitchnTabsResources),
      import('../KitchnTabsRoutes').then(m => ({
        private: m.dashPrivateRoutes,
        public: m.dashPublicRoutes
      }))
    ]).then(([res, rts]) => {
      console.log('✅ PrivateAppLoader: Admin resources loaded');
      setResources(res);
      setRoutes(rts);
      setIsLoading(false);
    }).catch(error => {
      console.error('❌ PrivateAppLoader: Failed to load resources:', error);
      setIsLoading(false);
    });
  }, []);

  const privateAppProps = useMemo(() => ({
    customResources: resources,
    customPublicRoutes: routes.public,
    customPrivateRoutes: routes.private,
    AdminHook: () => <><MainAppHookComponent /></>,
    customEchoProvider: ({ manager, children }: any) => (
      <LaravelEchoProvider manager={manager}>
        <SelfServiceEchoProvider>
          {children}
        </SelfServiceEchoProvider>
      </LaravelEchoProvider>
    )
  }), [resources, routes]);

  if (isLoading || !resources || !routes.private || !routes.public) {
    return <GlobalSmallLoader message="Loading admin resources..." />;
  }

  return (
    <Suspense fallback={<GlobalSmallLoader message="Loading admin panel..." />}>
      <KitchnTabsPrivateApp {...privateAppProps} />
    </Suspense>
  );
};

export default PrivateAppLoader;
