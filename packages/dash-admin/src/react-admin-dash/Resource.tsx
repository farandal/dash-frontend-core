import * as React from 'react';
import { ComponentType, ReactElement, isValidElement, Children } from 'react';
import { Route, Routes } from 'react-router-dom';
import { isValidElementType } from 'react-is';
import { ResourceContextProvider, ResourceProps, RestoreScrollPosition } from 'react-admin';

export const Resource = (props: ResourceProps) => {
    const { create, edit, list, name, show } = props;

    // Note: In React Router v7, we cannot pass arbitrary children to Routes.
    // The trash route and other custom routes should be handled via CustomRoutes
    // at the parent level, not as children of Resource.
 
    return (
        <ResourceContextProvider value={name}>
            <Routes>
                {create ? (
                    <Route path="create/*" element={getElement(create)} />
                ) : null}
                {show ? <Route path=":id/show/*" element={getElement(show)} /> : null}
                {edit ? <Route path=":id/*" element={getElement(edit)} /> : null}
                {list ? (
                    <Route
                        path="/*"
                        element={
                            <RestoreScrollPosition
                                storeKey={`${name}.list.scrollPosition`}
                            >
                                {getElement(list)}
                            </RestoreScrollPosition>
                        }
                    />
                ) : null}
            </Routes>
        </ResourceContextProvider>
    );
};

const getElement = (ElementOrComponent: ComponentType<any> | ReactElement) => {
   
    if (isValidElement(ElementOrComponent)) {
        return ElementOrComponent;
    }

    if (isValidElementType(ElementOrComponent)) {
        const Element = ElementOrComponent as ComponentType<any>;
        return <Element />;
    }

    return null;
};

Resource.raName = 'Resource';

Resource.registerResource = ({
    create,
    edit,
    icon,
    list,
    name,
    options,
    show,
    recordRepresentation,
    hasCreate,
    hasEdit,
    hasShow,
}: ResourceProps) => ({
    name,
    options,
    hasList: !!list,
    hasCreate: !!create || !!hasCreate,
    hasEdit: !!edit || !!hasEdit,
    hasShow: !!show || !!hasShow,
    icon,
    recordRepresentation,
});

