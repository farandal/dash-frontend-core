import React from 'react'
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext} from "react-admin";
import { IGallery } from '../interfaces';
import { Avatar, CircularProgress } from '@mui/material';
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

const GalleryPrimaryImageSelectorView: React.FC<IDashAutoAdminCustomFieldComponent>= ({method,attribute}) => {

    const gallery: IGallery = useRecordContext();

    const inputType = attribute.listAttribute as string;
    const [reference, source] = inputType.split('.');

    return (<></>)
    /*return  <ReferenceArrayField source={source} reference={reference}>
                <SingleFieldList>
                    <ChipField source={source} />
                </SingleFieldList>
            </ReferenceArrayField>;*/
}

const GalleryPrimaryImageSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent>= ({ method, attribute}) => {

    const gallery: IGallery = useRecordContext();

    return (<></>)

    /*
    const inputType = attribute.listAttribute as string;
    const [reference, source] = inputType.split('.');
    return (
        <ReferenceArrayInput reference={reference} source={source} >
            <SelectArrayInput optionText={source} />
        </ReferenceArrayInput>
    )*/

}

const GalleryPrimaryImageSelectorList: React.FC<IDashAutoAdminCustomFieldComponent>= ({ method, attribute,resourceConfig}) => {

    const gallery: IGallery = useRecordContext();

    return <>   
    <Avatar sx={{ width: 80, height: 80, border: gallery.primary_image_id ? '5px solid black' : '5px solid red' }}>
                                            
                                                <ImagePlaceHolder
                                                    loading={<CircularProgress />}
                                                    placeHolder={placeholder}
                                                    src={gallery.primary_image_id ? 
                                                        gallery.images.find(img => img.custom_properties?.is_primary)?.url || gallery.images[0]?.url :
                                                        gallery.images[0]?.url
                                                    }
                                                />
                                            </Avatar></>
 
}
const GalleryPrimaryImageSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <GalleryPrimaryImageSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <GalleryPrimaryImageSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "list":
            return <GalleryPrimaryImageSelectorList attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
}

export default GalleryPrimaryImageSelector;