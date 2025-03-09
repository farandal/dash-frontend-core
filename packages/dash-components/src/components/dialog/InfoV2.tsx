import Button from '@mui/material/Button';

const DialogInfoV2 = () => {
	return (
		<>
			<p>
				<strong>Paquete egresado</strong>
			</p>
			<p>
				<strong style={{ color: '#9A65E0' }}>
					Fecha y hora: 12/02/2023 12:23:43
				</strong>
			</p>
			<p>
				<strong style={{ color: '#9A65E0' }}>Estado: En depósito</strong>
			</p>
			<br />
			<Button className='btn-width-lg'>
				Egresar nuevamente
			</Button>
			<br />
			<br />
			<Button className='btn-width-lg'>
				Duplicado
			</Button>
			<br />
			<br />
			<Button className='btn-width-lg'>
				Cerrar
			</Button>
		</>
	);
};

export default DialogInfoV2;
