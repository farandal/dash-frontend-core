import { Box, Card, Grid } from '@mui/material';

const userLayout = (render) => {
	return (
      <Grid container spacing={1}>
							<Grid size={{ xs: 12, md: 4 }}>
								<Grid container>
									<Grid size={12}>
										<Card sx={{ mb: 1 }} className='dash-widget'>
											<Box
												sx={{ p: 1 }}
												style={{ display: 'flex', alignItems: 'center' }}
											>
												<span className='card-title'>Avatar</span>
											</Box>
											<Box sx={{ p: 1 }}>{render('Avatar')}</Box>
										</Card>
									</Grid>
									<Grid size={12}>
										<Card sx={{ mb: 1 }} className='dash-widget'>
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
							</Grid>
							<Grid size={{ xs: 12, md: 8 }}>
								<Grid container >
									<Grid size={12}>
										<Card sx={{ mb: 1 }} className='dash-widget'>
											<Box
												sx={{ p: 1 }}
												style={{ display: 'flex', alignItems: 'center' }}
											>
												<span className='card-title'>Datos del usuario</span>
											</Box>
											<Box sx={{ p: 1 }}>{render('Datos del usuario')}</Box>
										</Card>
									</Grid>
									<Grid size={12}>
										<Card sx={{ mb: 1 }} className='dash-widget'>
											<Box
												sx={{ p: 1 }}
												style={{ display: 'flex', alignItems: 'center' }}
											>
												<span className='card-title'>Configuración</span>
											</Box>
											<Box sx={{ p: 1 }}>{render('Configuración')}</Box>
										</Card>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
       
	);};

export default userLayout;
