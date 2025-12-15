import { SaveButton } from 'react-admin';
import { SaveButtonProps } from 'react-admin/src';
import { useFormContext } from 'react-hook-form';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, useCallback, useState } from 'react'; // Add useState


export interface IDashAutoAdminSaveButton extends SaveButtonProps {
  resourceConfig: IDashAutoAdminResourceConfig;
}

const DashAutoAdminSaveButton: FC<IDashAutoAdminSaveButton> = (props) => {
  const { resourceConfig, ...customProps } = props;
  const { formState } = useFormContext();

  const alwaysEnabled = resourceConfig?.saveButtonAlwaysEnabled === true ? true : false;
   

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        
        if (customProps?.onClick) {
            customProps.onClick(e);
        }
       
    }
    
  return (<>
 
    <SaveButton
      alwaysEnable={alwaysEnabled}
      {...customProps}
      onClick={handleClick}
      disabled={formState.isSubmitting}
    /></>
  );
};

export default DashAutoAdminSaveButton;


/*

import { SaveButton } from 'react-admin';
import { SaveButtonProps } from 'react-admin/src';
import { useFormContext } from 'react-hook-form';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, useState, useCallback } from 'react';
import { useDashAutoAdminForm } from './context/DashAutoAdminFormContext';


export interface IDashAutoAdminSaveButton extends SaveButtonProps {
    resourceConfig: IDashAutoAdminResourceConfig;
    //
    //Custom onSave handler that will be called with validated form values.
    //If not provided, will use the onSave from DashAutoAdminFormContext.
    //This allows hooking into DashAutoAdminForm's onSave logic when using type="button"
    //
    onSave?: (values: any) => Promise<void> | void;
}

const DashAutoAdminSaveButton: FC<IDashAutoAdminSaveButton> = (props) => {
    const { resourceConfig, onSave: propOnSave, ...customProps } = props;
    const { handleSubmit, formState } = useFormContext();
    const { onSave: contextOnSave } = useDashAutoAdminForm();
    
    // Use prop onSave if provided, otherwise fall back to context onSave
    const onSave = propOnSave || contextOnSave;

    const alwaysEnabled = resourceConfig?.saveButtonAlwaysEnabled === true ? true : false;
    const [buttonDisabled, setButtonDisabled] = useState(false);

    //
    //When using type="button", we need to manually trigger form validation
    //and submission using react-hook-form's handleSubmit.
    //This wraps the submission to control the button's disabled state.
    //
    const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        if (customProps?.onClick) {
            customProps.onClick(e);
        }

        setButtonDisabled(true);

        try {
            // Use handleSubmit to validate and get form values
            // Then call the onSave from context (DashAutoAdminForm's save handler)
            await handleSubmit(async (values) => {
                if (onSave) {
                    await onSave(values);
                }
            })(e);
        } catch (error) {
            console.error('DashAutoAdminSaveButton submission error:', error);
        } finally {
            setButtonDisabled(false);
        }
    }, [handleSubmit, onSave, customProps]);

    return (
        <SaveButton
            type="button"
            alwaysEnable={alwaysEnabled}
            {...customProps}
            onClick={handleClick}
            disabled={buttonDisabled || formState.isSubmitting}
        />
    );
};

export default DashAutoAdminSaveButton;

*/