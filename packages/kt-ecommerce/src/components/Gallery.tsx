import React, { useEffect } from 'react'

import { useRecordContext } from "react-admin";
import { GalleryComponent } from './Gallery/GalleryComponent';
import { GalleryComponentView } from './Gallery/GalleryComponentView';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { IGallery } from '../interfaces/Gallery';


const GalleryEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const gallery: IGallery = useRecordContext();
    // console.log(gallery)
    /*useEffect(() => {
        if(gallery)
            dashStorage.setItem('RaStore.product.selectedIds', JSON.stringify((gallery as any).product_ids.map(p => p.id)));
        return () => {
            dashStorage.removeItem('RaStore.product.selectedIds');
        }
    }, [])*/

    return(<GalleryComponent gallery={gallery} view={"gallery_list"} />)
}

const GalleryView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const gallery: IGallery = useRecordContext();

    return (
       <GalleryComponentView gallery={gallery} view={"gallery_list"}  />
    )
}

const Gallery = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <GalleryEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <GalleryView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
}


export default Gallery;
