import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useController } from 'react-hook-form';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Typography, CardContent, Card } from '@mui/material';
import { useRecordContext, useTranslate } from 'react-admin';

const ImportTypeSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const importTypeField = useController({ name: 'import_type', defaultValue: 'normalized' });
  const productTemplateIdField = useController({ name: 'product_template_id' });
  const translate = useTranslate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    importTypeField.field.onChange(value);
    
    // Clear template selection when switching to normalized import
    if (value === 'normalized') {
      productTemplateIdField.field.onChange(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Card sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleChange({ target: { value: 'normalized' } } as React.ChangeEvent<HTMLInputElement>)}>
        <CardContent>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup value={importTypeField.field.value || 'normalized'}>
              <FormControlLabel 
                value="normalized" 
                control={<Radio />} 
                label={
                  <div>
                    <Typography variant="body1">{translate('resource.import.instances.types.normalized.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {translate('resource.import.instances.types.normalized.desc')}
                    </Typography>
                  </div>
                }
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleChange({ target: { value: 'template' } } as React.ChangeEvent<HTMLInputElement>)}>
        <CardContent>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup value={importTypeField.field.value || 'normalized'}>
              <FormControlLabel 
                value="template" 
                control={<Radio />} 
                label={
                  <div>
                    <Typography variant="body1">{translate('resource.import.instances.types.template.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {translate('resource.import.instances.types.template.desc')}
                    </Typography>
                  </div>
                }
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </div>
  );};

const ImportTypeSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const importType = record.import_type || (record.product_template_id ? 'template' : 'normalized');
  
  return (
    <Typography>
      {importType === 'normalized' 
        ? translate('resource.import.instances.types.normalized.title') 
        : translate('resource.import.instances.types.template.title')}
    </Typography>
  );
};

const ImportTypeSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ImportTypeSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "view":
      return <ImportTypeSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "list":
      return <ImportTypeSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
  }
};

export default ImportTypeSelector;
