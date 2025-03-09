import { Button } from '@mui/material';

const DialogNotFound = () => {
	return (
		<>
			<p>
				<strong>Lo sentimos</strong>
			</p>
			<p>No se ha encontrado lo solicitado</p>
			<br />
			<Button className='btn-width-md'>
				Aceptar
			</Button>
		</>
	);
};

export default DialogNotFound;
