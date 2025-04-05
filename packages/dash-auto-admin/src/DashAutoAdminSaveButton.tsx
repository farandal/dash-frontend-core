/**
 * A customized SaveButton component for DashAutoAdmin that supports additional configuration options.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {IDashAutoAdminResourceConfig} props.resourceConfig - Configuration for the resource
 * @param {Function} [props.onSubmit] - Optional callback function triggered on successful form submission
 * @param {Function} [props.onError] - Optional callback function triggered on form submission error
 * @param {SaveButtonProps} props - Inherited SaveButton props from react-admin
 * 
 * @returns {React.ReactElement} A configured SaveButton component
 * 
 * @description
 * Extends the standard SaveButton with additional features:
 * - Optional form reset after submission
 * - Always enabled option
 * - Custom success and error handling
 * - Debug logging
 */
import { SaveButton, SaveButtonProps } from 'react-admin/src';
import { useFormContext } from 'react-hook-form';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC } from 'react';
import { IDashAutoAdminBackendError,IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook';

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

  return resourceConfig?.resetFormAfterSubmit === true ? (
    <SaveButton
      {...rest}
      
      mutationOptions={{
        onSuccess: (data) => {
          if (debug) console.log('onSuccess called with data:', data);
          if (onSubmit) {
            onSubmit(data);
          }
          reset();
        },
        onError: (error:unknown, _variables, _context) => {
          const _error = (error as IDashAutoAdminBackendError).originalError.response?.data as IDashAutoAdminDefaultBackendStructure;
          
          if (debug) console.log('onError called with error:', _error);
          //if(!!Object.keys(error).length) {
            if (Object.keys(_error?.errors || {}).length) {
                Object.keys(_error?.errors || {}).forEach((key: any) => {
                  //setError(key, { message: _error?.errors?.[key][0] || _error?.message }, { shouldFocus: false });
                  console.log("Set error",key,{ message: _error?.errors?.[key].join(", ") || _error?.message }, { shouldFocus: false })
                });
              }

          if (onError) {
            onError(error);
          }

        },
      }}
      alwaysEnable={
        alwaysEnabled
      }
      type='button'
    />
  ) : (
    <SaveButton
      {...rest}
      {...({
        mutationOptions: {
          onSuccess: (data) => {
            debugger;
            if (debug) console.log('onSuccess called with data:', data);
            if (onSubmit) {
              onSubmit(data);
            }
          },
          onError: (error, _variables, _context) => {
            const _error = (error as IDashAutoAdminBackendError).originalError.response?.data as IDashAutoAdminDefaultBackendStructure;
          
            if (debug) console.log('onError called with error:', _error);
            //if(!!Object.keys(error).length) {
            if (Object.keys(_error?.errors || {}).length) {
              Object.keys(_error?.errors || {}).forEach((key: any) => {
                //setError(key, { message: _error?.errors?.[key][0] || _error?.message }, { shouldFocus: false });
                console.log("Set error",key,{ message: _error?.errors?.[key].join(", ") || _error?.message }, { shouldFocus: false })
              });
            }
  
            if (onError) {
              onError(error);
            }
          
          },
        },
      })}
      type='button'
      alwaysEnable={
        alwaysEnabled
      }
     
    />
  );
};

export default DashAutoAdminSaveButton;
