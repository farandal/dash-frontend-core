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


const NotFound: CatchAllComponent = (props) => {
	const { title, ...rest } = props;
	const translate = useTranslate();
	//useAuthenticated();
	return (
		<div
			className={'dash-app-module ' + NotFoundClasses.wrapper}
			{...sanitizeRestProps(rest as any)}
		>
			<div className='dash-app-notfound'>
				<div className='dash-app-notfound-img'>
					
                    <ErrorOutline sx={{ fontSize: 300 }} />
				</div>
				<div className='dash-app-notfound-content'>
					<h1>{translate('ra.page.not_found')}</h1>
					<span>{translate('ra.message.not_found')}.</span>
					<Button
						color={'primary'}
						// icon={<HistoryOutlined />}
						onClick={goBack}
					>
						{/* {translate('ra.action.back')} */}
						Aceptar
					</Button>
				</div>

				{/* <Title defaultTitle={title} />
                <div className={NotFoundClasses.message}>
                    <FrownOutlined className={NotFoundClasses.icon} />
                    <h1>{translate('ra.page.not_found')}</h1>
                    <div>{translate('ra.message.not_found')}.</div>
                </div>
                <div className={NotFoundClasses.toolbar}>
                    <DASHButton
                        icon={<HistoryOutlined />}
                        onClick={goBack}
                    >
                        {translate('ra.action.back')}
                    </DASHButton>
                </div> */}
			</div>
		</div>
	);

	{
		/*<Space direction="vertical" style={{ width: '100%' }}>
        <DASHAlert
        message={translate('ra.page.not_found')}
        description={translate('ra.message.not_found')}
        action={ <DASHButton
            icon={<HistoryOutlined />}
            onClick={goBack}
        >
            {translate('ra.action.back')}
        </DASHButton>}
        type="error"
        />
        </Space>*/
	}

	{
		/*<DASHCard
            //title={title}
            title={translate('ra.page.not_found')}
            actions={[
                <DASHButton
                    icon={<HistoryOutlined />}
                    onClick={goBack}
                >
                    {translate('ra.action.back')}
                </DASHButton>
            ]}
        >
            <Title defaultTitle={title} />
            <div className={NotFoundClasses.message}>
                <FrownOutlined className={NotFoundClasses.icon} />
                {
                //<h1>{translate('ra.page.not_found')}</h1>
                }
                <div>{translate('ra.message.not_found')}.</div>
            </div>
            </DASHCard>*/
	}
};

const PREFIX = 'RaNotFound';

export const NotFoundClasses = {
	wrapper: `${PREFIX}-wrapper`,
	icon: `${PREFIX}-icon`,
	message: `${PREFIX}-message`,
	toolbar: `${PREFIX}-toolbar`,
};


export default NotFound;