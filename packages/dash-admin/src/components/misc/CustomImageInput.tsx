import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react';
import { useRecordContext } from 'react-admin';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ImageInput } from 'react-admin';
import { ImageField } from 'react-admin';

const CustomImageInputView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    method,
    attribute,
}) => {
    const record = useRecordContext();

    return record ? (
        <img src={record[attribute.listAttribute] || ''} alt='imagen' />
    ) : (
        <></>
    );
};
const ImagePlaceholder = ({ record, attribute }) => (
    <div style={{ padding: '30px', border: '4px dashed rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={record?.[attribute.listAttribute] || ''} alt='imagen' />
        <CloudUploadIcon /> 
        Arrástre una imágen o haga click aquí para seleccionar 
    </div>
);

const CustomImageInputEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    method,
    attribute,
}) => {
    const record = useRecordContext();
    return (
        <>
            <ImageInput
                fullWidth
                placeholder={<ImagePlaceholder record={record} attribute={attribute} />}
                source={attribute.attribute}
                label={attribute.label}
                /* @ts-ignore */
                accept='image/*'
            >
                <ImageField source={/*attribute.listAttribute ||*/ `src`} title='title' />
            </ImageInput>
        </>
    );
};
const CustomImageInput = ({
    method,
    attribute,
    resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case 'edit':
        case 'create':
            return <CustomImageInputEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'view':
            return <CustomImageInputView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    }
};

export default CustomImageInput;
