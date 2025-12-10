import { useDashResource } from 'dash-admin/src/contexts/DashResourceContext';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import React, { Fragment, useState } from 'react';
import {
    Button,
    useListContext,
    useRefresh} from 'react-admin';
import DASHModal from 'dash-modal';


const ProductListBulkActions = (props) => {
    //const {resourceConfig} = useDashResource();
     const {resourceConfig} = props;

    const axios = useAxios();
    const dialog = useDialog();
    const { selectedIds } = useListContext();
    const refresh = useRefresh();

    // EnableMany
    const [isEnablingLoading, setIsEnablingLoading] = useState<boolean>(false);
    const [enableConfirmDialogOpen, setEnableConfirmDialogOpen] = useState(false);
    const handleEnableManyClick = () => setEnableConfirmDialogOpen(true);
    const handleEnableManyDialogClose = () => setEnableConfirmDialogOpen(false);
    const handleEnableManyConfirm = async () => {
        //debugger;
        setIsEnablingLoading(true);
     
        try {
            await axios.post(`${resourceConfig.model}/enableMany`, {
                ids: selectedIds,
            });
            setIsEnablingLoading(false);
            refresh();
            dialog({
                variant: 'info',
                title: 'Activación realizada',
                content: 'Se han activado los elementos seleccionados',
                onConfirm: () => { },
                onClose: () => { },
            });
        } catch (error) {
            setIsEnablingLoading(false);
        }
        setEnableConfirmDialogOpen(false);
    };

    // DisableMany
    const [isDisablingLoading, setIsDisablingLoading] = useState<boolean>(false);
    const [disableConfirmDialogOpen, setDisableConfirmDialogOpen] = useState(false);
    const handleDisableManyClick = () => setDisableConfirmDialogOpen(true);
    const handleDisableManyDialogClose = () => setDisableConfirmDialogOpen(false);
    const handleDisableManyConfirm = async () => {
        setIsDisablingLoading(true);
        try {
            await axios.post(`${resourceConfig.model}/disableMany`, {
                ids: selectedIds,
            });
            setIsDisablingLoading(false);
            refresh();
            dialog({
                variant: 'info',
                title: 'Desactivación realizada',
                content: 'Se han desactivado los elementos seleccionados',
                onConfirm: () => { },
                onClose: () => { },
            });
        } catch (error) {
            setIsDisablingLoading(false);
        }
        setDisableConfirmDialogOpen(false);
    };

    // DuplicateMany
    const [isDuplicatingLoading, setIsDuplicatingLoading] = useState<boolean>(false);
    const [duplicateConfirmDialogOpen, setDuplicateConfirmDialogOpen] = useState(false);
    const handleDuplicateManyClick = () => setDuplicateConfirmDialogOpen(true);
    const handleDuplicateManyDialogClose = () => setDuplicateConfirmDialogOpen(false);
    const handleDuplicateManyConfirm = async () => {
        setIsDuplicatingLoading(true);
        try {
            const response = await axios.post(`${resourceConfig.model}/duplicateMany`, {
                ids: selectedIds,
            });
            setIsDuplicatingLoading(false);
            refresh();
            dialog({
                variant: 'success',
                title: 'Duplicación realizada',
                content: `Se han duplicado ${response.data.duplicated_count} productos. Los productos duplicados están deshabilitados.`,
                onConfirm: () => { },
                onClose: () => { },
            });
        } catch (error) {
            setIsDuplicatingLoading(false);
            dialog({
                variant: 'danger',
                title: 'Error',
                content: 'Error al duplicar los elementos seleccionados',
                onConfirm: () => { },
                onClose: () => { },
            });
        }
        setDuplicateConfirmDialogOpen(false);
    };

    // DeleteMany
    const [isDeletingLoading, setIsDeletingLoading] = useState<boolean>(false);
    const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
    const handleDeleteManyClick = () => setDeleteConfirmDialogOpen(true);
    const handleDeleteManyDialogClose = () => setDeleteConfirmDialogOpen(false);
    const handleDeleteManyConfirm = async () => {
        setIsDeletingLoading(true);
        try {
            await axios.post(`${resourceConfig.model}/deleteMany`, {
                ids: selectedIds,
            });
            setIsDeletingLoading(false);
            refresh();
            dialog({
                variant: 'success',
                title: 'Eliminación realizada',
                content: 'Se han eliminado los elementos seleccionados',
                onConfirm: () => { },
                onClose: () => { },
            });
        } catch (error) {
            setIsDeletingLoading(false);
            dialog({
                variant: 'danger',
                title: 'Error',
                content: 'Error al eliminar los elementos seleccionados',
                onConfirm: () => { },
                onClose: () => { },
            });
        }
        setDeleteConfirmDialogOpen(false);
    };

    return <Fragment>
        <Button label='Activar' onClick={handleEnableManyClick} />
        <DASHModal
            open={enableConfirmDialogOpen}
            variant='info'
            title='Activar'
            content='¿Está seguro de activar los elementos seleccionados?'
            onConfirm={handleEnableManyConfirm}
            onClose={handleEnableManyDialogClose}
            showCancelButton={true}
        />
        
        <Button label='Desactivar' onClick={handleDisableManyClick} />
        <DASHModal
            open={disableConfirmDialogOpen}
            variant='info'
            title='Desactivar'
            content='¿Está seguro de desactivar permanentemente los elementos seleccionados?'
            onConfirm={handleDisableManyConfirm}
            onClose={handleDisableManyDialogClose}
            showCancelButton={true}
        />

        <Button 
            label='Duplicar' 
            onClick={handleDuplicateManyClick}
            sx={{ color: 'primary.main' }}
        />
        <DASHModal
            open={duplicateConfirmDialogOpen}
            variant='info'
            title='Duplicar Productos'
            content='¿Está seguro de duplicar los elementos seleccionados? Los productos duplicados se crearán deshabilitados con SKU modificado.'
            onConfirm={handleDuplicateManyConfirm}
            onClose={handleDuplicateManyDialogClose}
            showCancelButton={true}
        />
        
        <Button 
            label='Eliminar' 
            onClick={handleDeleteManyClick}
            sx={{ color: 'error.main' }}
        />
        <DASHModal
            open={deleteConfirmDialogOpen}
            variant='danger'
            title='Eliminar'
            content='¿Está seguro de eliminar permanentemente los elementos seleccionados? Esta acción no se puede deshacer.'
            onConfirm={handleDeleteManyConfirm}
            onClose={handleDeleteManyDialogClose}
            showCancelButton={true}
        />
    </Fragment>
};

export default ProductListBulkActions;