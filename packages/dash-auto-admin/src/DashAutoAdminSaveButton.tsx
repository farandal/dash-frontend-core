import { SaveButton, SaveButtonProps } from 'react-admin/src';
import { useFormContext } from 'react-hook-form';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, useState } from 'react'; // Add useState
import { IDashAutoAdminBackendError, IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook';

export interface IDashAutoAdminSaveButton extends SaveButtonProps {
  resourceConfig: IDashAutoAdminResourceConfig;
  onSubmit?: (data: any) => void;
  onError?: (error: any) => void;
}

const DashAutoAdminSaveButton: FC<IDashAutoAdminSaveButton> = (props) => {
  const { resourceConfig, onSubmit, onError, ...rest } = props;
  const { reset, setError } = useFormContext();
  const alwaysEnabled = resourceConfig?.saveButtonAlwaysEnabled === true ? true : false;
  const debug = true;
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state to track submission

  // Common mutation options to prevent double submission
  const mutationOptions = {
    onSuccess: (data) => {
      if (debug) console.log('onSuccess called with data:', data);
      if (onSubmit) {
        onSubmit(data);
      }
      if (resourceConfig?.resetFormAfterSubmit === true) {
        reset();
      }
      setIsSubmitting(false); // Reset submission state
    },
    onError: (error: unknown, _variables, _context) => {
      const _error = (error as IDashAutoAdminBackendError).originalError.response?.data as IDashAutoAdminDefaultBackendStructure;
      
      if (debug) console.log('onError called with error:', _error);
      
      if (Object.keys(_error?.errors || {}).length) {
        Object.keys(_error?.errors || {}).forEach((key: any) => {
          setError(key, { message: _error?.errors?.[key][0] || _error?.message }, { shouldFocus: false });
          console.log("Set error", key, { message: _error?.errors?.[key].join(", ") || _error?.message }, { shouldFocus: false });
        });
      }

      if (onError) {
        onError(error);
      }
      
      setIsSubmitting(false); // Reset submission state on error too
    },
  };

  // Function to handle click and prevent double submission
  const handleClick = (e) => {
    if (isSubmitting) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsSubmitting(true);
    
    // Let the original click handler run
    if (rest.onClick) {
      rest.onClick(e);
    }
  };

  return (
    <SaveButton
      {...rest}
      mutationOptions={mutationOptions}
      //disabled={isSubmitting || rest.disabled}
      //label={isSubmitting ? 'Guardando...' : (rest.label || 'Guardar')}
      //onClick={handleClick}
      type='button'
      //alwaysEnable={alwaysEnabled && !isSubmitting}
      alwaysEnable={alwaysEnabled}
    />
  );
};

export default DashAutoAdminSaveButton;
