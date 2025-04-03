import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import AutoCreate from './DashAutoCreate';
import AutoEdit from './DashAutoEdit';

import { Toolbar, SaveButton, Button } from 'react-admin';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';

import { match } from 'node-match-path';
import { useLocation } from 'react-router';
import AutoShow from './DashAutoShow';
import React from 'react';
import { Drawer, SwipeableDrawer, DrawerProps } from '@mui/material';

export interface IDashAutoDrawerPublicProps extends DrawerProps {
    beforeSubmit?: (data: any) => any;
    onSubmit?: (data: any) => any;
    onError?: (error: any) => any;
    type?: 'normal' | 'swipeable';
    placement?: 'top' | 'bottom' | 'left' | 'right';
    width?: number | string;
    height?: number;
}
export interface IDashAutoDrawer extends IDashAutoDrawerPublicProps, PropsWithChildren {
    recordId?: React.Key;
    resourceConfig: IDashAutoAdminResourceConfig;
}

const DashAutoDrawer: React.FC<IDashAutoDrawer> = ({
    resourceConfig,
    recordId,
    type = 'normal',
    placement = 'right',
    width = '100%', // TODO: This is the default value for the drawer width, to be deprecated; must be set at a HoC.
    height,
    beforeSubmit,
    onSubmit,
    onError,
    children,
    ...props
}) => {
    const location = useLocation();

    const DrawerComponent = type === 'swipeable' ? SwipeableDrawer : Drawer;

    const [open, setOpen] = useState<boolean>(
        location.state?.hash ? true : false,
    );

    const handleCloseDrawer = () => {
        setOpen(false);
    };

    const handleOpenDrawer = () => {
        setOpen(true);
    };

    const _onSubmit = (values: any) => {
        if (resourceConfig.closeDrawerAfterSave) handleCloseDrawer();
        if (onSubmit) onSubmit(values);
    };

    const [localHash, setLocalHash] = useState<string>(
        location.state?.hash ? location.state.hash : window.location.hash,
    );

    //if(!localHash.includes("inline/")) return <></> // TODO unecessary ???

    const hashChangeHandler = useCallback((e) => {

        setLocalHash(e.data);
        setOpen(true);
    }, []);

    useEffect(() => {
        //let _match = localHash.includes("inline/");
        //if(_match.matches)
        window.addEventListener('virtualhash', hashChangeHandler);
        return () => {

            //if(_match.matches)
            window.removeEventListener('virtualhash', hashChangeHandler);
        };
    }, []);

    let mode = 'edit';
    const _createMatch = match(
        `/${resourceConfig.model}/inline/create`,
        String(localHash).substring(1),
    );
    if (_createMatch.matches) {
        mode = 'create';
    }
    const _editMatch = match(
        `/${resourceConfig.model}/inline/:id/:mode`,
        String(localHash).substring(1),
    );
    mode =
        _editMatch.matches && _editMatch.params?.mode
            ? _editMatch.params.mode
            : mode;
    const resource_id = ['edit', 'show'].includes(mode)
        ? _editMatch.params?.id
        : null;

    //const [placement, setPlacement] = useState<DrawerProps['anchor']>('right');
    //const [open, setOpen] = useState<boolean>(location.state?.hash ? true : false);

    useEffect(() => {
        if (location.state?.hash) {
            history.replaceState(null, '', location.state.hash);
        }

        return () => {
            history.replaceState(null, '', null);
        };
    }, []);

    /*
  useEffect(() => {
    setOpen(mode === "edit" || mode === "create" ? true : false)
    console.log("has updated in autolist, hash,mode,open",hash,mode,open)
  }, [hash]);*/

    const DrawerToolbar = () => {
        if (resourceConfig?.bottomToolbar === false) return <></>;
        return (
            <Toolbar>
                {mode === 'edit' && resourceConfig?.saveButton !== false && (
                    <SaveButton
                        alwaysEnable={
                            resourceConfig?.saveButtonAlwaysEnabled === true ? true : false
                        }
                        label='Guardar'
                    />
                )}
                {mode === 'create' && resourceConfig?.saveButton !== false && (
                    <SaveButton
                        alwaysEnable={
                            resourceConfig?.saveButtonAlwaysEnabled === true ? true : false
                        }
                        label='Crear'
                    />
                )}
                {/*resourceConfig?.listDeleteButton?.enabled && (
          <DeleteButton label="Eliminar" />
        )*/}
                <Button onClick={() => handleCloseDrawer()}>
                    <>Cerrar</>
                </Button>
            </Toolbar>
        );
    };

    if (mode !== 'list' && mode === 'create')
        return (
            <DrawerComponent
                anchor={placement}
                //onClose={(_event: React.ChangeEvent<HTMLInputElement>) =>  {  handleCloseDrawer(); }}
                /* @ts-ignore : Mismatch with the DrawerProps Event */
                onClose={() => handleCloseDrawer()}
                {...(type === 'swipeable' && { onOpen: handleOpenDrawer })}
                open={open}
                key={placement}
                sx={{
                    width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" },
                    '& .MuiDrawer-paper': {
                        width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" }
                    }
                }}
                slotProps={{

                }}
                size={"large"}
                {...props}
            >
                <div
                    style={{
                        ...(height && { height: height }),
                        ...(width && { width: width }),
                    }}
                >
                    <AutoCreate
                        toolbar={<DrawerToolbar />}
                        isDrawer={true}
                        //id={Number(edit_mode.params.id)}
                        resourceConfig={{ ...resourceConfig, formGroupMode: (resourceConfig.formGroupMode === 'tabs' || !resourceConfig.formGroupMode ? 'groups' : resourceConfig.formGroupMode) }}
                        //schema={resourceConfig.schema}
                        beforeSubmit={beforeSubmit}
                        onSubmit={_onSubmit}
                        onError={onError}
                        onCancel={() => handleCloseDrawer()}
                    />
                </div>
            </DrawerComponent>
        );

    if (mode !== 'list' && mode === 'edit' && resource_id)
        return (
            <DrawerComponent
                anchor={placement}
                /* @ts-ignore : Mismatch with the DrawerProps Event */
                onClose={() => handleCloseDrawer()}
                {...(type === 'swipeable' && { onOpen: handleOpenDrawer })}
                open={open}
                key={placement}
                sx={{
                    width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" },
                    '& .MuiDrawer-paper': {
                        width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" }
                    }
                }}
                slotProps={{

                }}
                size={"large"}
                {...props}

            >
                <div
                    style={{
                        ...(height && { height: height }),
                        ...(width && { width: width }),
                    }}
                >
                    <AutoEdit
                        isDrawer={true}
                        toolbar={<DrawerToolbar />}
                        id={Number(resource_id)}
                        resourceConfig={{ ...resourceConfig, formGroupMode: (resourceConfig.formGroupMode === 'tabs' || !resourceConfig.formGroupMode ? 'groups' : resourceConfig.formGroupMode) }}
                        //schema={resourceConfig.schema}
                        beforeSubmit={beforeSubmit}
                        onSubmit={_onSubmit}
                        onError={onError}
                        onCancel={() => handleCloseDrawer()}
                    />
                </div>
            </DrawerComponent>
        );

    if (mode === 'show' && resource_id) {
        return (
            <DrawerComponent
                anchor={placement}
                /* @ts-ignore : Mismatch with the DrawerProps Event */
                onClose={() => handleCloseDrawer()}
                {...(type === 'swipeable' && { onOpen: handleOpenDrawer })}
                open={open}
                key={placement}
                sx={{
                    width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" },
                    '& .MuiDrawer-paper': {
                        width: { xs: "90%", sm: "90%", md: "50%", lg: "40%" }
                    }
                }}
                slotProps={{

                }}
                size={"large"}
                {...props}

            >
                <div
                    style={{
                        ...(height && { height: height }),
                        ...(width && { width: width }),
                    }}
                >
                    <AutoShow
                        isDrawer={true}
                        id={resource_id}
                        resourceConfig={{ ...resourceConfig, formGroupMode: (resourceConfig.formGroupMode === 'tabs' || !resourceConfig.formGroupMode ? 'groups' : resourceConfig.formGroupMode) }}
                    />
                </div>
            </DrawerComponent>
        );
    }

    return <></>;
};

export default DashAutoDrawer;
