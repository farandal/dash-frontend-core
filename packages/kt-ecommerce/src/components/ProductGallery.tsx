import React, {  } from 'react'
import { useRecordContext } from "react-admin";
import { GalleryComponent } from './Gallery/GalleryComponent';
import { GalleryComponentView } from './Gallery/GalleryComponentView';
import GallerySelector from './Gallery/GallerySelector';
import { Product } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const ProductGalleryEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const product: Product = useRecordContext();

    return(product?.gallery ? <GalleryComponent view={"gallery_list"} gallery={product.gallery} product={product} /> : <GallerySelector /> )
}

const ProductGalleryView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const product: Product = useRecordContext();

    return (
       <GalleryComponentView gallery={product?.gallery} view={"product"} />
    )
}

const ProductGallery = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <ProductGalleryEdit attribute={attribute}  method={method} />
        case "view":
            return <ProductGalleryView attribute={attribute} method={method} />
    }
}

export default ProductGallery;
