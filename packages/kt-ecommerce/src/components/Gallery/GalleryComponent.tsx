import {
    Box,
    Button,
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FileUploader } from "react-drag-drop-files";
import { IGalleryComponent } from "./Interfaces";
import * as Icons from "@mui/icons-material";
import { Loading, SearchInput } from "react-admin";
import { useUpdate } from "react-admin";
import { ListManager } from "react-18-beautiful-dnd-grid";


import { List } from "react-admin";
import { TopToolbar } from "react-admin";
import { Datagrid } from "react-admin";
import { TextField } from "react-admin";
import { useListContext } from "react-admin";
import { useRecordContext } from "react-admin";
import { PaginationComponent } from "dash-components";
import { useRecordSelection } from 'react-admin'
import { IGalleryImage } from "../../interfaces";


const ListAutoSelectIds = ({ resource, selectedIdsFn }) => {
    const { data, isLoading } = useListContext();
    const gallery = useRecordContext();
    const [finalSelectedIds, setFinalSelectedIds] = useState([]);
    const [selectedIds, { select }] = useRecordSelection({ resource });

   

    useEffect(() => {

        if (isLoading) return;

        let _selectedIds = [];

        /*if (data?.length) {
            _selectedIds = [...new Set([..._selectedIds, ...data.map(p => p.id)])];
        }*/

        if (gallery && gallery?.products) {
            _selectedIds = [...new Set([..._selectedIds, ...gallery.products.map(p => p.id)])];
        }

        setFinalSelectedIds(_selectedIds);

    }, [data, gallery, isLoading]);

    useEffect(() => {
        if (!selectedIds || !selectedIds.length) return;

        if (selectedIdsFn) selectedIdsFn(selectedIds);
    }, [selectedIds]);


    useEffect(() => {
        if (!finalSelectedIds) return

        select(finalSelectedIds);
        //if (selectedIdsFn) selectedIdsFn(finalSelectedIds);

    }, [finalSelectedIds])

    return (
        <></>
    );
}

export const GalleryComponent: React.FC<IGalleryComponent> = ({
    gallery,
    product }) => {

    const [galleryImages, setGalleryImages] = useState([]);
    const { setValue, control } = useFormContext(/*{ shouldUseNativeValidation: true }*/);
    const imagen = useController({ name: "images" });
    const primaryImage = useController({ name: "primary_image_id" });
    const currImages = useController({ name: "current_images" });
    const product_ids = useController({ name: "product_ids" });
    /*const { fields, append, remove } = useFieldArray({
        control,
        name: "products"
    });*/
    const THUMB_SIZE = [200,200];

    const [files, setFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(undefined);
    const [selectedProducts, setSelectedProducts] = useState(undefined);
    const [toDeleteProduct, setToDeleteProduct] = useState([]);
    const fileTypes = ["JPG", "PNG", "JPEG"];
    const [update] = useUpdate();


    useEffect(() => {
        //setSelectedProducts(gallery?.product_ids ? gallery.product_ids.map(p => p.id) : []);
        setValue("product_ids", gallery?.product_ids ? gallery.product_ids.map(p => p.id) : []);
        setGalleryImages(gallery?.images ? gallery.images : []);
      
        setSelectedImage(gallery?.primary_image_id ? gallery.primary_image_id : null);
        setFiles([])

    }, [gallery]);

    useEffect(() => {
        if (files.length > 0)
            imagen.field.onChange(files);
        else if (files.length === 0)
            imagen.field.onChange([]);
    }, [files]);

    useEffect(() => {
        primaryImage.field.onChange(selectedImage);
    }, [selectedImage]);

    useEffect(() => {
        if (gallery?.images) {
            // Send both image IDs and their order
            currImages.field.onChange(galleryImages.map((item) => item.id));
            
            // Also send the images with their display order
            setValue("images_order", galleryImages.map((item, index) => ({
                id: item.id,
                display_order: index
            })));
        }
    }, [galleryImages]);

    const handleChange = (fileUploaded) => {
        const fileListArray = [...fileUploaded];
        setFiles((prevState) => [...prevState, ...fileListArray]);
    };

    const removeItem = (index) => {
        setFiles((prevState) => prevState.filter((_, i) => i !== index));
    };

    const removeItemDataGallery = (index) => {
        setGalleryImages((prevState) => prevState.filter((item) => item.id !== index));
    };

    const onDragEnd = (source, destination) => {
        if (destination === null || destination === undefined || destination === false)
            return;
        const original = galleryImages[source];
        const moved = galleryImages[destination];
        setGalleryImages((prevState) => {
            let aux = [...prevState];
            aux[destination] = original;
            aux[source] = moved;
            return aux
        })
    }

    return (<>

        <div

        >
            <Box sx={{ 
                border: '2px dashed var(--component-border)', 
                borderRadius: 'var(--border-radius-base)', 
                p: 4, 
                minHeight: 180,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: 'var(--component-bg)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'var(--component-hover-bg)',
                    borderColor: 'var(--primary-color)',
                }
            }}>
                <FileUploader
                    handleChange={handleChange}
                    name="file"
                    types={fileTypes}
                    multiple={true}
                    children={
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Icons.CloudUpload sx={{ fontSize: 48, color: 'var(--primary-color)' }} />
                            <Button 
                                variant="outlined"
                                sx={{
                                    borderColor: 'var(--component-border)',
                                    color: 'var(--component-text)',
                                    '&:hover': {
                                        borderColor: 'var(--primary-color)',
                                        backgroundColor: 'var(--component-hover-bg)',
                                    }
                                }}
                            >
                                <Icons.Image sx={{ mr: 1 }} /> Arrastra imágenes aquí o haz clic para subir
                            </Button>
                            <Box sx={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                                JPG, PNG, JPEG - Múltiples archivos permitidos
                            </Box>
                        </Box>
                    }
                />
            </Box>
            
            {galleryImages && <>
                {/* @ts-ignore */}
                <ListManager<typeof ImageListItem>
                    items={galleryImages}
                    direction="horizontal"
                    maxItems={4}
                    render={(item:IGalleryImage, index: number) => <ImageListItem
                            key={item.id.toString()}
                            style={{
                                 width: THUMB_SIZE[0],
                                 height: THUMB_SIZE[1]
                            }}
                        >
                            <img
                                src={
                                    item.url
                                }
                                alt="imagen"
                                style={{
                                    width: THUMB_SIZE[0],
                                    height: THUMB_SIZE[1],
                                    objectFit: "cover",
                                }}
                                loading="lazy"
                            />
                            <div className={`imageListItem--back ${selectedImage !== item.id ? "" : "active"}`}></div>
                            <ImageListItemBar
                                sx={{
                                    background: "transparent",
                                }}
                                position="bottom"
                                actionIcon={
                                    <IconButton
                                        sx={{ color: "red" }}
                                        aria-label={`star `}
                                        onClick={() => removeItemDataGallery(item.id)}
                                        size={"small"}
                                    >
                                        <Icons.HighlightOffSharp />
                                    </IconButton>
                                }
                                actionPosition="left"
                            />
                            <ImageListItemBar
                                sx={{
                                    background: "transparent",
                                }}
                                position="top"
                                actionIcon={
                                    <IconButton
                                        sx={{ color: "yellow" }}
                                        aria-label={`star `}
                                        onClick={() => setSelectedImage(item.id)}
                                    >
                                        {selectedImage !== item.id ? <Icons.Circle /> : <Icons.CheckCircle />}
                                    </IconButton>
                                }
                                actionPosition="right"
                            />
                        </ImageListItem>
                    }
                    onDragEnd={onDragEnd}
                />


            </>
            }
            

            <ImageList sx={{ width: '100%', height: 'auto' }} cols={6} rowHeight={172} gap={1}>
                {files.map((item, key) => {
                    const img = URL.createObjectURL(item);
                    const isFirstItem = key === 0;
                    
                    return (
                        <ImageListItem
                            cols={isFirstItem ? 6 : 2}
                            rows={isFirstItem ? 6 : 2}
                            key={key}
                            sx={{
                                maxHeight: THUMB_SIZE[1],
                                position: "relative",
                                overflow: 'hidden',
                                '& img': {
                                    transform: 'scale(1)',
                                    transition: 'transform 0.3s ease-in-out',
                                },
                                '&:hover img': {
                                    transform: 'scale(1.05)',
                                }
                            }}
                        >
                            <img
                                src={img}
                                alt={`Gallery image ${key + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: "cover",
                                }}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                sx={{
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                }}
                                position="top"
                                actionIcon={
                                    <IconButton
                                        sx={{ 
                                            color: "red",
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                            }
                                        }}
                                        aria-label="Remove image"
                                        onClick={() => removeItem(key)}
                                    >
                                        <Icons.HighlightOffSharp />
                                    </IconButton>
                                }
                                actionPosition="right"
                            />
                        </ImageListItem>
                    );
                })}
            </ImageList>        </div>


        {!product && (
            <>
                <h1>Productos asociados a la galería</h1>
                <Box sx={{ width: "100%" }}>
                    <List
                        disableSyncWithLocation
                        resource='ecommerce/product'
                        /* This adds the filter button, but the problem this component is already in a form, cannot contain a nested form */
                        //actions={<TopToolbar><FilterButton /></TopToolbar>}
                        //filters={[<TextInput label="Buscar" source="q" />]}

                        actions={<TopToolbar></TopToolbar>}
                        filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}

                        pagination={<PaginationComponent />}
                        storeKey='ecommerce-gallery-products'
                        //empty={<Loading />}
                        //emptyWhileLoading={true}


                    >
                        <ListAutoSelectIds resource={'ecommerce/product'} selectedIdsFn={(p) => {
                            product_ids.field.onChange(p);
                        }} />
                        <Datagrid

                            bulkActionButtons={<></>}


                        >
                            <TextField source="id" />
                            <TextField source="name" label='Nombre' />
                            <TextField source="sku" label='SKU' />
                        </Datagrid>
                  
                    </List>
                </Box>
            </>
        )}

    </>);
};

