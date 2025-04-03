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
      type={'button'}
      /*mutationOptions={{
        onSuccess: (data) => {
          if (debug) console.log('onSuccess called with data:', data);
          if (onSubmit) {
            onSubmit(data);
          }
          reset();
        },
        onError: (error, _variables, _context) => {
          if (debug) console.log('onError called with error:', error);
          //if(!!Object.keys(error).length) {
          if (Object.keys(error).length) {
            Object.keys(error).forEach((key: any) => {
              setError(key, { message: error[key][0] }, { shouldFocus: false });
            });
          }

          if (onError) {
            onError(error);
          }

        },
      }}*/
      alwaysEnable={
        alwaysEnabled
      }
    />
  ) : (
    <SaveButton
      {...rest}
      /*{...(onSubmit && {
        mutationOptions: {
          onSuccess: (data) => {
            if (debug) console.log('onSuccess called with data:', data);
            if (onSubmit) {
              onSubmit(data);
            }
          },
          onError: (error, _variables, _context) => {
            if (debug) console.log('onError called with error:', error);
            if (onError) {
              onError(error);
            }
          	
            if (Object.keys(error).length) {
              Object.keys(error).forEach((key: any) => {
                setError(key, { message: error[key][0] }, { shouldFocus: false });
              });
            }

            if (onError) {
          	
              onError(error);
            }
          },
        },
      })}*/
      alwaysEnable={
        alwaysEnabled
      }
    />
  );
};

export default DashAutoAdminSaveButton;
