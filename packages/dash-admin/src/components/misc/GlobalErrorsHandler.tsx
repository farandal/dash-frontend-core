import { PropsWithChildren, useContext, useEffect } from 'react';

import { toast } from 'react-toastify';

import { ConstantsContext } from '../../config/ConstantsService';
import useGlobalErrorMediator from '../../hooks/useGlobalErrorMediator';

import MUISimpleJsonTable from './MuiSimpleJsonTable';
import { useDialog } from 'dash-dialog';

const GlobalErrorsHandler: React.FC<PropsWithChildren> = (props) => {
	const dialog = useDialog();
	const constants = useContext(ConstantsContext);

	const showError = (error: any,originalGlobalError:any) => {

		(constants.systemConstants.system.SHOW_GLOBAL_TOAST_ERROR || !!(originalGlobalError?.toast)) &&
			toast.error(<>{error}</>, {
				position: 'bottom-center',
				autoClose: 4000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		(constants.systemConstants.system.SHOW_GLOBAL_DIALOG_ERROR || !!(originalGlobalError?.dialog)) &&
			dialog({
				variant: 'danger',
				title: 'Ha ocurrido un error',
				content: error,
			});
	};

	const { error: globalError, sendError: sendGlobalError } = useGlobalErrorMediator();
	useEffect(() => {
		if (!!globalError?.error) {
			
			try {
				if (
					globalError.error.response &&
					globalError.error.response.data &&
					typeof globalError.error.response.data === 'object'
				) {
					showError(
						<>
							<h6>{globalError?.error.message}</h6>
							<MUISimpleJsonTable
								ignore={['trace', 'request', 'response', 'config','dialog','toast']}
								vertical
								tableData={globalError.error.response.data}
								showKey={false}
							/>
						</>
					,globalError);
					return;
				}

				if (!!globalError.error?.message) {
					showError(globalError.error.message,globalError);
					return;
				}
			} catch (e) {
				console.error(e);
			}
		}
	}, [globalError]);

	return <></>;
};

export default GlobalErrorsHandler;
