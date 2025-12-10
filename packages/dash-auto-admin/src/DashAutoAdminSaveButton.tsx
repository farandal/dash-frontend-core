import { SaveButton } from 'react-admin';
import { SaveButtonProps } from 'react-admin/src';
import { useFormContext } from 'react-hook-form';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, useState } from 'react'; // Add useState


export interface IDashAutoAdminSaveButton extends SaveButtonProps {
  resourceConfig: IDashAutoAdminResourceConfig;
}

const DashAutoAdminSaveButton: FC<IDashAutoAdminSaveButton> = (props) => {
  const { resourceConfig, ...rest } = props;

  const alwaysEnabled = resourceConfig?.saveButtonAlwaysEnabled === true ? true : false;

  return (<>
 
    <SaveButton
      {...rest}
      alwaysEnable={alwaysEnabled}
    /></>
  );
};

export default DashAutoAdminSaveButton;
