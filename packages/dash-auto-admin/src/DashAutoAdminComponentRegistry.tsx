import React, { createContext, useContext, ReactNode } from 'react';


import IDashAutoAdminCustomFieldComponent from './interfaces/IDashAutoAdminCustomFieldComponent';

// Default components that are always available
const defaultComponentMap: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>> = {

};

export interface ComponentRegistryContextType {
  components: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>;
  registerComponent: (type: string, component: React.FC<IDashAutoAdminCustomFieldComponent>) => void;
  registerComponents: (componentMap: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>) => void;
}

const ComponentRegistryContext = createContext<ComponentRegistryContextType>({
  components: defaultComponentMap,
  registerComponent: () => {},
  registerComponents: () => {},
});

export const useComponentRegistry = () => useContext(ComponentRegistryContext);

export interface ComponentRegistryProviderProps {
  children: ReactNode;
  customComponents?: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>;
}

export const ComponentRegistryProvider: React.FC<ComponentRegistryProviderProps> = ({ 
  children, 
  customComponents = {} 
}) => {
  const [components, setComponents] = React.useState<Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>>({
    ...defaultComponentMap,
    ...customComponents,
  });

  // Sync internal state when customComponents prop changes
  // (e.g. after async component loading completes on remount)
  React.useEffect(() => {
    if (customComponents && Object.keys(customComponents).length > 0) {
      setComponents(prev => ({
        ...prev,
        ...customComponents,
      }));
    }
  }, [customComponents]);

  const registerComponent = React.useCallback((type: string, component: React.FC<IDashAutoAdminCustomFieldComponent>) => {
    setComponents(prev => ({
      ...prev,
      [type]: component
    }));
  }, []);

  const registerComponents = React.useCallback((componentMap: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>) => {
    setComponents(prev => ({
      ...prev,
      ...componentMap
    }));
  }, []);

  return (
    <ComponentRegistryContext.Provider 
      value={{ 
        components, 
        registerComponent, 
        registerComponents 
      }}
    >
      {children}
    </ComponentRegistryContext.Provider>
  );
};
