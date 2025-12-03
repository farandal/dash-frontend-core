import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from 'react-admin';
import { Box } from '@mui/material';

import { IAppLayout } from '../layout/AppLayout';
import { DASH_REDUX_ACTIONS, IDASHAppState, IBreadcrumbItem } from 'dash-admin-state';

import DomainTheme from './DomainTheme';
import DomainHeader from './DomainHeader';
import { BreadcrumbsManager } from '../components/navigation';

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { DASHAdminSystemConstants } from 'dash-constants';

export interface IDomainAppLayout<U = any, A = any> extends IAppLayout {
  themeComponent?: React.JSX.Element;
  /** Whether to show breadcrumb navigation */
  showBreadcrumbs?: boolean;
  /** Custom label map for breadcrumb segments */
  breadcrumbLabelMap?: Record<string, string>;
  /** Whether to include home in breadcrumbs */
  breadcrumbIncludeHome?: boolean;
}

const DomainAppLayout = <U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
  const { 
    themeComponent, 
    children,
    showBreadcrumbs = true,
    breadcrumbLabelMap,
    breadcrumbIncludeHome = false,
  } = props;

  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [resourceConfig] = useStore<IDashAutoAdminResourceConfig>('resourceConfig');
  
  // Simple selectors - don't over-optimize
  const authenticated = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => state.auth.authenticated
  );
  
  const groupIcons = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => state.settings.groupIcons
  );

  // Generate breadcrumbs based on current resource
  const generateBreadcrumbs = React.useCallback((
    pathname: string,
    config?: IDashAutoAdminResourceConfig | null
  ): IBreadcrumbItem[] => {
    const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX || '';
    const breadcrumbs: IBreadcrumbItem[] = [];
    
    // Clean the pathname
    let cleanPath = pathname;
    if (URL_PREFIX && cleanPath.startsWith(URL_PREFIX)) {
      cleanPath = cleanPath.slice(URL_PREFIX.length);
    }
    
    const segments = cleanPath.split('/').filter(Boolean);
    
    if (segments.length === 0) return breadcrumbs;
    
    // If we have a resource config, use it for better labeling
    if (config) {
      // Add group as first breadcrumb if available
      if (config.group) {
        breadcrumbs.push({
          label: config.group,
          path: undefined, // Groups are typically not navigable
          icon: groupIcons?.[config.group],
        });
      }
      
      // Add resource label
      breadcrumbs.push({
        label: config.label || segments[segments.length - 1],
        path: `${URL_PREFIX}/${config.model}`,
      });
      
      // Check for action segments (create, edit, show, etc.)
      const lastSegment = segments[segments.length - 1];
      const actionLabels: Record<string, string> = {
        'create': 'Crear',
        'edit': 'Editar',
        'show': 'Ver',
        'inline': 'Detalle',
        ...breadcrumbLabelMap,
      };
      
      if (actionLabels[lastSegment]) {
        breadcrumbs.push({
          label: actionLabels[lastSegment],
          isActive: true,
        });
      } else if (/^\d+$/.test(lastSegment)) {
        // If last segment is an ID, mark as active
        const prevSegment = segments[segments.length - 2];
        if (prevSegment && actionLabels[prevSegment]) {
          breadcrumbs.push({
            label: actionLabels[prevSegment],
            isActive: true,
          });
        }
      }
    }
    
    return breadcrumbs;
  }, [groupIcons, breadcrumbLabelMap]);

  // Update page info when resource changes
  useEffect(() => {
    if (resourceConfig && groupIcons) {
      
      dispatch(
        DASH_REDUX_ACTIONS.updatePage({
          title: resourceConfig.label,
          icon: resourceConfig.group && groupIcons[resourceConfig.group],
          subTitle: resourceConfig.group,
        }),
      );
    }
  }, [resourceConfig, groupIcons, dispatch]);

  if (themeComponent) {
    return <>{themeComponent}</>;
  }

    return (
      <BreadcrumbsManager 
        labelMap={breadcrumbLabelMap}
        includeHome={breadcrumbIncludeHome}
      >
        <DomainTheme headerToolBar={<DomainHeader showBreadcrumbs={showBreadcrumbs} />}>
            {children}
            <Box sx={{ mb: 3 }}>
                <div className='dash-layout-footer-content'></div>
            </Box>
        </DomainTheme>
      </BreadcrumbsManager>
    );
};

// Simple memo comparison
/*export default React.memo(DomainAppLayout, (prevProps, nextProps) => {
  return (
    prevProps.children === nextProps.children &&
    prevProps.themeComponent === nextProps.themeComponent
  );
});*/
export default DomainAppLayout;
