import * as React from 'react';
import {
	TitleComponent,
} from 'react-admin';

import { Button } from '@mui/material';
import  ErrorOutline  from '@mui/icons-material/ErrorOutlined'
import { useNavigate } from 'react-router';


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

// 🆕 Enhanced interface with new optional props
interface NotFoundProps {
	title?: TitleComponent;
	time?: number;
	redirect?: string | null;
	disableCountdown?: boolean; // 🆕 Disable countdown functionality
	disableGoBack?: boolean;    // 🆕 Disable go back button
	customMessage?: string;     // 🆕 Optional custom message
	customButtonText?: string;  // 🆕 Optional custom button text
}

const NotFound /* :CatchAllComponent */ = (props: NotFoundProps) => {
	const { 
		title, 
		time = false, 
		redirect = null,
		disableCountdown = false,  // 🆕 Default to false (countdown enabled)
		disableGoBack = false,     // 🆕 Default to false (go back enabled)
		customMessage,             // 🆕 Optional custom message
		customButtonText,          // 🆕 Optional custom button text
		...rest 
	} = props;
	
    const [countdown, setCountdown] = React.useState<number>(time || 0);
    const navigate = useNavigate();
    
    // 🆕 Only setup countdown if not disabled and time is provided
    React.useEffect(() => {
        if (!disableCountdown && typeof time === 'number' && time > 0) {
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
    }, [time, navigate, redirect, disableCountdown]);

    React.useEffect(() => {
       //DASHAuthenticationService.setPendingRedirect(window.location.pathname);
    });

    // 🆕 Determine if countdown should be shown
    const shouldShowCountdown = !disableCountdown && time && time > 0;
    
    // 🆕 Determine button text and action
    const getButtonConfig = () => {
        if (disableGoBack) {
            return null; // No button
        }
        
        return {
            text: customButtonText || 'Aceptar',
            action: goBack
        };
    };

    const buttonConfig = getButtonConfig();
	
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
					<span>
						{customMessage || 'No encontramos este enlace.'}
					</span>
                    
                    {/* 🆕 Conditional countdown display */}
                    {shouldShowCountdown && (
                        <p style={{ fontSize: '0.9em', color: '#666' }}>
                            Serás redirigido en {countdown} segundos...
                        </p>
                    )}
                    
                    {/* 🆕 Conditional button display */}
                    {buttonConfig && (
                        <Button
                            color={'primary'}
                            onClick={buttonConfig.action}
                        >
                            {buttonConfig.text}
                        </Button>
                    )}
				</div>
			</div>
		</div>
	);
};

export default NotFound;
