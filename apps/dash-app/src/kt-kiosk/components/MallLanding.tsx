import { FC } from 'react';
import { Box, Portal, Typography } from '@mui/material';
import { AuthPersistenceService } from 'dash-auth';
/* @ts-ignore */
import KtWaiter from '@app/assets/ktwaiter.svg?react';
interface MallClientWelcomeProps {
}

//TODO: Handle the session status, and show a message accordingly instead of the button. 
/*
Request URL
https://pw-api.ngrok.dev/api/public/mall/XXXX/getSessionAuth
Request Method
GET
Status Code
410 Gone
Response:
{
    "message": "Sessi\u00f3n ha expirado. La sesi\u00f3n es v\u00e1lida por 10 horas desde su activaci\u00f3n.",
    "current_status": "active",
    "activated_at": "2025-07-28T05:59:07.011853Z",
    "expired_at": "2025-07-28T11:59:07.011853Z"
}
*/

const MallClientWelcome: FC<MallClientWelcomeProps> = (props) => {


  const tenantImages = AuthPersistenceService.getTenantImages();
    
return (
    <>
        <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="center"
            gap={4}
            sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: 2 }}
        >
            {/* Left side: SVG */}
            <Box
                flex={{ xs: 'none', md: '0 0 300px' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                    width: { xs: '100%', md: 300 },
                    mb: { xs: 2, md: 0 },
                }}
            >
                <KtWaiter
                    style={{
                        width: '100%',
                        maxWidth: 200,
                        height: 'auto',
                    }}
                    aria-label="Waiter"
                />
            </Box>
            {/* Right side: Welcome text */}
            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems={{ xs: 'center', md: 'flex-start' }}
                justifyContent="center"
                sx={{ width: '100%' }}
            >
                <img
                    style={{
                        width: '100%',
                        maxWidth: 200,
                        height: 'auto',
                        marginBottom: 16,
                    }}
                    src={tenantImages?.squared_logo?.original}
                    alt="Logo"
                />
                <Typography variant="h4" align={window.innerWidth < 600 ? 'center' : 'left'}>
                    Bienvenido
                </Typography>
              
            </Box>
        </Box>
         <Portal><Box
        sx={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
        }}
    >
        <Typography
            variant="caption"
            color="textSecondary"
            sx={{
                fontSize: 12,
                
                px: 1.5,
                py: 0.5,
                borderRadius: 8,
            }}
        >
            Powered by{' '}
            <a
                href="https://dash.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontWeight: 600,
                }}
            >
                dashadmin.cl
            </a>
        </Typography>
    </Box></Portal>
    </>
);
   
    
      
};


export default MallClientWelcome;
