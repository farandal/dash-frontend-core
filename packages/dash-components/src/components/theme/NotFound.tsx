import * as React from 'react';
import {
	useAuthenticated,
	useTranslate,
	Title,
	CatchAllComponent,
	TitleComponent,
} from 'react-admin';


import { Button } from '@mui/material';
import  ErrorOutline  from '@mui/icons-material/ErrorOutline'
import { useNavigate } from 'react-router';
import { DASHAuthenticationService } from 'dash-admin';
function goBack() {
	window.history.go(-1);
}

const sanitizeRestProps = ({
	staticContext,
	history,
	location,
	match,
	...rest
}) => rest;
	const NotFound: CatchAllComponent = (props: { title?: TitleComponent } & { time?: number; redirect?: string | null }) => {
	const { title, ...rest } = props;
	const { time = false, redirect = null} = rest;
	
    const [countdown, setCountdown] = React.useState<number>(time || 0);
    const navigate = useNavigate();
    React.useEffect(() => {
        if (typeof time === 'number') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        const currentPath = window.location.pathname;
                        navigate(`${redirect || '/'}?redirect=${encodeURIComponent(currentPath)}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [time, navigate, redirect]);

    React.useEffect(() => {
       //DASHAuthenticationService.setPendingRedirect(window.location.pathname);
    });
	
	return (
		<div
			className={'dash-app-module not-found'}
			{...sanitizeRestProps(rest as any)}
		>
			<div className='dash-app-notfound'>
				<div className='dash-app-notfound-img'>
                    <ErrorOutline sx={{ fontSize: 300 }} />
				</div>
				<div className='dash-app-notfound-content'>
					<h1>Oops!</h1>
					<span>No encontramos este enlace.</span>
                    
                                        {time && (
                                            <p style={{ fontSize: '0.9em', color: '#666' }}>
                                                Serás redirigido en {countdown} segundos...
                                            </p>
                                        )}
                    
                    <Button
						color={'primary'}
						//icon={<HistoryOutlined />}
						onClick={goBack}
					>
						
						Aceptar
					</Button>
				</div>

			</div>
		</div>
	);

};


export default NotFound;