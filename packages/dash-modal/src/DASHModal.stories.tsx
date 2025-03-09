import { StoryFn, Meta, ArgTypes } from '@storybook/react';
import { useState } from 'react';
import DASHModal from './DASHModal';
import IAppDialogProps from 'dash-dialog/src/IAppDialogProps';

const SBComponent = {
	title: '@app/atom/Dialog',
	component: DASHModal,
} as Meta<typeof DASHModal>;

const Template: StoryFn<typeof DASHModal> = (args) => {
	const [open, setOpen] = useState<boolean>(!!args?.open);
	const toggleModal = () => {
		setOpen(!open);
	};
	return (
		<>
			<DASHModal
				{...args}
				open={open}
				onCancel={() => toggleModal()}
				onConfirm={() => toggleModal()}
			/>
		</>
	);
};

const argTypes: Partial<ArgTypes<IAppDialogProps>> = {
	title: { control: false },
	confirmText: { type: 'string' },
	cancelText: { type: 'string' },
	children: { type: 'string' },
	onConfirm: { control: false },
	onCancel: { control: false },
	//open: { control: true } // @deprectaded
};

export const DASHModalBasic = Template.bind({});

DASHModalBasic.argTypes = argTypes;
DASHModalBasic.args = {
	title: 'Título',
	open: true,
};

export default SBComponent;
