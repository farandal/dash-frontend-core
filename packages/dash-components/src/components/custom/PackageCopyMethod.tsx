import {
	RadioGroup,
	ListItem,
	ListItemText,
	Button,
	List,
} from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { IPackagePayload } from 'dash-interfaces';
import { AppDialogOptions } from 'dash-dialog/src/IAppDialogProps';

export interface IPackageCopyMethod {
	defaultCopyMethod: number;
	dialog: (options: AppDialogOptions) => void;
	sendPackage: (data: any) => Promise<void>;
	resetExtraPayloadFlagsAfterSubmit: () => void;
	getValues: UseFormGetValues<IPackagePayload>;
	setValue: UseFormSetValue<IPackagePayload>;
	onChange?: (copy_method: number) => void;
}

const PackageCopyMethod: FC<IPackageCopyMethod> = (props) => {
	const {
		onChange,
		defaultCopyMethod,
		dialog,
		sendPackage,
		resetExtraPayloadFlagsAfterSubmit,
		getValues,
		setValue,
	} = props;

	const [selectedCopyMethod, setSelectedCopyMethod] = useState<number>();

	/**
	 * "copy_method" = 1: solo botón que indique "Ingresar Nuevamente" ya que este paquete fue antes duplicado
	 * "copy_method" = 2: debe haber un boton que indique "Ingresar Nuevamente"  y otro que indique "Duplicado"
	 * Ambos botones deben enviar de nuevo el formulario pero con el nuevo input "copy_method" segun el boton presionado
	 */

	useEffect(() => {
		if (onChange) { onChange(selectedCopyMethod); }
	}, [selectedCopyMethod]);

	const selectCopyMethod = (copy_method: number) => {
		setValue('copy_method', copy_method);
		setSelectedCopyMethod(copy_method);
	};

	return (
		<RadioGroup
			aria-labelledby='copy-method-selection-label'
			defaultValue={defaultCopyMethod}
			name='copy-method-selection'
		>
			<List>
				<ListItem key={'copy_method_1'}>
					<ListItemText
						primary={
							<Button
								onClick={() => {
									selectCopyMethod(1);
									/** sendPackage with current react hook form values, instead of default formSubmit event */
									sendPackage(getValues());
									/** resets copy_method & high_value possible updated form state props in dialog */
									resetExtraPayloadFlagsAfterSubmit();
									dialog(null);
								}}
							>
								Ingresar Nuevamente
							</Button>
						}
					/>
				</ListItem>

				<ListItem key={'copy_method_2'}>
					{/*<Radio
              onChange={(e) =>
                selectCopyMethod(e.target.value as unknown as number)
              }
              value={2}
              name="copy-method-selection"
              inputProps={{ "aria-label": "2" }}
            />*/}

					<ListItemText
						primary={
							<Button
								onClick={() => {
									selectCopyMethod(2);
									/** sendPackage with current react hook form values, instead of default formSubmit event */
									sendPackage(getValues());
									/** resets copy_method & high_value possible updated form state props in dialog */
									resetExtraPayloadFlagsAfterSubmit();
									dialog(null);
								}}
							>
								Duplicado
							</Button>
						}
					/>
				</ListItem>
			</List>
		</RadioGroup>
	);
};

export default PackageCopyMethod;
