import { IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React, { useEffect } from 'react'
import { useController, useWatch } from 'react-hook-form';
import SearchableSelect from '../SearchableSelect';
import { IGalleryImage } from '../../interfaces';


const GallerySelector: React.FC<any> = ({ props }) => {

    //colocal el resultado del input en el react-hook-form useController('gallery_id')

     // Input para seleccionar el listado de galería, con buscador
    const gallery = useWatch({name: 'gallery'})
    const galleryId = useController({name: 'gallery_id'})

    useEffect(() => {
        if(gallery?.id !== galleryId?.field?.value) {
            galleryId.field.onChange(gallery?.id || undefined)
        }
    }, [gallery])
     // en la lista mostrar el thumbnail de la imagen primaria
    return (
        <>
            <SearchableSelect renderTags={(value, getTagProps, ownerState) => <></>} resource='ecommerce/gallery' selectLabel='Seleccione' title='Seleccione una galeria' renderText={(option) => option.title} name='gallery'/>
            {gallery && <ImageList>
                {gallery?.images.map((item:IGalleryImage, key) => {
                   
                    // const img = URL.createObjectURL(item);
                    return <ImageListItem key={key} >
                        <img src={item.url} alt="imagen" />
                        {gallery?.primary_image_id === item.id && <ImageListItemBar
                            sx={{
                                background:
                                    'linear-gradient(to bottom, rgba(0,0,0,0.3) 100%, ' +
                                    'rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 0%)',
                            }}
                            // title={item.title}
                            position="bottom"
                            actionIcon={
                                <IconButton
                                    sx={{ color: 'white' }}
                                    aria-label={`star `}
                                >
                                    ✓ Principal
                                    {/* <StarBorderIcon /> */}
                                </IconButton>
                            }
                            actionPosition="left"
                        />}
                    </ImageListItem>
                })}
            </ImageList>}
        </>
    )
}

export default GallerySelector;
