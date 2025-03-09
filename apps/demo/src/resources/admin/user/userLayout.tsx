import { Box, Card, Grid } from '@mui/material';

const userLayout = (render) => {
	return (
		<div className='dash-box'>
			<Grid container spacing={3}>
				<Grid item xs={12} md={8} sx={{ p: 1 }}>
					<Card sx={{ mb: 3 }} className='dash-widget'>
						<Box
							sx={{ p: 1 }}
							style={{ display: 'flex', alignItems: 'center' }}
						>
							<span className='card-title'>Datos del usuario</span>
						</Box>
						<Box sx={{ p: 1 }}>{render('Datos del usuario')}</Box>
					</Card>

					<Card sx={{ mb: 3 }} className='dash-widget'>
						<Box
							sx={{ p: 1 }}
							style={{ display: 'flex', alignItems: 'center' }}
						>
							<span className='card-title'>Configuración</span>
						</Box>

						<Box sx={{ p: 1 }}>{render('Configuración')}</Box>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ mb: 3 }} className='dash-widget'>
						<Box
							sx={{ p: 1 }}
							style={{ display: 'flex', alignItems: 'center' }}
						>
							<span className='card-title'>Avatar</span>
						</Box>
						<Box sx={{ p: 1 }}>{render('Avatar')}</Box>
					</Card>

					<Card sx={{ mb: 3 }} className='dash-widget'>
						<Box
							sx={{ p: 1 }}
							style={{ display: 'flex', alignItems: 'center' }}
						>
							<span className='card-title'>Credenciales</span>
						</Box>

						<Box sx={{ p: 1 }}>{render('Credenciales')}</Box>
					</Card>
				</Grid>
			</Grid>
		</div>
	);
};

export default userLayout;
