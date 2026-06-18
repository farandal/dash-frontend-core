import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField
} from '@mui/material';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRecordContext } from 'react-admin';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';


const generateToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
const BasicTokenGeneratorFieldEditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    attribute,
    method
}) => {
    //const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);

    const handleGenerateToken = () => {
     
        const newToken = generateToken();
        setValue(attribute.attribute, newToken, { shouldDirty: true });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
      
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               
                <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Webhook Token"
                    value={getValues(attribute.attribute) || ''}
                    onChange={(e) => setValue(attribute.attribute, e.target.value)}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }} />
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateToken}
                >
                    Generate Token
                </Button>
            </Box>
       
    );
};

const BasicTokenGeneratorFieldViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    attribute
}) => {
    const record = useRecordContext();
    const [showPassword, setShowPassword] = useState(false);
    const token = record?.[attribute.attribute] || '';

    return (
    
            <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={token}
                slotProps={{
                    input: {
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },

                }} />
       
    );
};

const BasicTokenGeneratorField = ({
    method,
    attribute,
    resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case 'edit':
        case 'create':
            return <BasicTokenGeneratorFieldEditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'view':
        case 'list':
            return <BasicTokenGeneratorFieldViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default BasicTokenGeneratorField;