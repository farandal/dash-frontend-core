import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

import DASHModal from 'dash-modal';
import { TextField } from '@mui/material';
import useQuickSearch from '../../hooks/useQuickSearch';
import setNativeValue from '../../utils/setNativeValue';

export interface IQuickSearch {
	searchUrl?: string;
}
const QuickSearch: React.FC<IQuickSearch> = (props) => {
	const { searchUrl = '/admin/package' } = props;

	const navigateTo = useNavigate();
	const [options, setOptions] = useState<{ q: string }>({ q: '' });
	const [open, setOpen] = React.useState(false);
	const { sendQuickSearchEvent } = useQuickSearch();

	const inputRef = React.useRef<HTMLInputElement>(null);

	const toggleModal = (value?: boolean) => {
		if (value === null || value === undefined) {
			setOpen(true);
			return;
		}

		setOpen(!open);
	};
	// TODO: [bug] somethomes when clicking fast between pages seems to be related to an infinite loop redirection issue because of the timeout;
	const search = () => {
		toggleModal(false);
		//sendQuickSearchEvent(options.q);
		// This timeout sends the event that triggers the filters change in the searchUrl target;
	

		//sendQuickSearchEvent(options.q);
		//setNativeValue(document.getElementById("quickSearch"),options.q);

		navigateTo({
			pathname: searchUrl,
			//search: `filter=${stringify({  quickSearch: options.q}, { arrayFormat: 'bracket', arrayFormatSeparator:":" })}`,
			//search: `quickSearch=${options.q}`
		});

		setTimeout(() => {
			sendQuickSearchEvent(options.q);
			setNativeValue(document.getElementById("quickSearch"),options.q);
		}, 2000);

	};

	useEffect(() => {
		if (open === true) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 10);
		}
	}, [open]);

	return (
		<>
			<Button
				//htmlType="button"
				//variant="default"
				className='dash-header-actions-btn'
				onClick={() => toggleModal(true)}
			>
				Búsqueda rápida
			</Button>

			<DASHModal
				onCancel={() => {
					toggleModal(false);
				}}
				onConfirm={() => search()}
				title='Búsqueda rápida'
				variant={'info'}
				open={open}
				confirmText={'Buscar'}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'stretch',
						textAlign: 'left',
					}}
				>
					<TextField
						inputRef={inputRef}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={true}
						variant='outlined'
						placeholder='Buscar por nombre, apellido, ID dash'
						label='Buscar'
						onChange={({ target: { value } }) =>
							setOptions((prevState) => ({ ...prevState, q: value }))
						}
						onKeyDown={(ev) => {
							//console.log(`Pressed keyCode ${ev.key}`);
							if (ev.key === 'Enter') {
								// Do code here
								search();
							}
						}}
					/>
				</div>
			</DASHModal>
		</>
	);
};
export default QuickSearch;
