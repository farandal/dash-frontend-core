
import { RadioGroup, ListItem, ListItemText, Radio, List } from '@mui/material';
import { FC, useState } from 'react';
import { IPackage } from 'dash-interfaces';
export interface IPackagesRadioButtonsGroup {
	packages: IPackage[];
	onChange?: (value: string) => void;
}

const PackagesRadioButtonsGroup: FC<IPackagesRadioButtonsGroup> = (props) => {
	const { packages, onChange } = props;
	const [value, setValue] = useState<string>(null);

	const handleChange = (event:any) => {
		setValue(event.target.value);
		if (onChange) { onChange(event.target.value); }
	};

	return (
        <RadioGroup
			aria-labelledby='package-selection-label'
			name='package-selection'
		>
            <List>
				{packages.map((p, index) => {
					return (
                        <ListItem key={index}>
                            <Radio
								checked={value === p.id.toString()}
								onChange={handleChange}
								value={p.id}
								name='package-selection'
								slotProps={{
                                    input: { 'aria-label': p.id.toString() }
                                }}
							/>
                            <ListItemText
								primary={p.id}
								secondary={`Internal Id: ${p.internal_id}, Dirección: ${p.delivery_address}`}
							/>
                        </ListItem>
                    );
				})}
			</List>
        </RadioGroup>
    );
};

export default PackagesRadioButtonsGroup;
