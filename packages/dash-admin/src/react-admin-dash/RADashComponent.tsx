import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch } from 'react-redux';
import { useContext, useEffect, useState } from 'react';
import { useGetIdentity } from 'react-admin';
import useAxios from '../hooks/axios';
import { getEnv } from 'dash-admin/src/config/DASHAdminSystemConstants';
import { useAuthContext } from '../contexts/auth';
import { useDialog } from 'dash-dialog';
import { IDashAutoAdminBackendError } from 'dash-axios-hook';
import LaravelEchoContext, { ILaravelEchoContext } from '../contexts/com/LaravelEchoContext';


declare global {
    interface Window {
        DashIPCService: any;
    }
}

const { DashIPCService } = window;

/*
React Admin integration hook components 
For now it waits for the identity to be loaded and then updates the store auth state.
To be used in the rest of DashAdmin Components.
*/
const RADashComponent = () => {
    // react admin integration entry point. 
    // waits the user is logged in to set the Auth Redux Store. 
    // makes the request to the GET_AUTH_ENDPOINT
    const { identity, isLoading: identityLoading } = useGetIdentity();
    const authContext = useAuthContext();
    const { axios } = useAxios();
    const dispatch = useDispatch();

    const dialog = useDialog();

    /*const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);

    useEffect(()=> {
     
        console.log(lastEvent);

    },[lastEvent])*/

    useEffect(() => {
            const handleGlobalAxiosError = (event) => {
              
                
                dialog({
                    variant: 'danger',
                    title: event.data?.name || "Error",
                    content: event.data?.message || "Error desconocido",
                    confirmText: 'Volver',
                    closeText: 'Cerrar',
                    onConfirm: () => {
                        window.history.back()
                    },
                    onClose: () => { 

                    },
                });
            };
    
            window.addEventListener('global-axios-error', handleGlobalAxiosError);
    
            return () => {
                window.removeEventListener('global-axios-error', handleGlobalAxiosError);
            };
    }, [dialog]);    

  // Only collect these values when authenticated
  //const [userId, setUserId] = useState(null);
  //const [tenantId, setTenantId] = useState(null);
  //const [token, setToken] = useState(null);
  const [storageAuthenticated,setStorageAuthenticated] = useState(JSON.parse(localStorage.getItem('authenticated')));

  useEffect(() => {
    
    /*if(!authContext?.auth) {
      //console.log("Not authenticated")
      DashIPCService && DashIPCService.action('stop-background-service', {});
      return;
    } */
   
   if(storageAuthenticated && authContext.authenticated) {
        //setUserId(authContext.auth.id);
        //setTenantId(authContext.auth.tenant_id);
        //setToken(localStorage.getItem('token'));
    
        DashIPCService && DashIPCService.action('start-background-service', {token:localStorage.getItem('token'),channel:`private-tenant.${authContext.auth.tenant_id}.system`});
   }

   

  },[authContext.authenticated])



    /*const getAuth = async () => {

        console.log('Making GET request to:', getEnv('APP_GETAUTH_ENDPOINT'));
        try {
            const { data: auth } = await axios.get(getEnv('APP_GETAUTH_ENDPOINT'));
            console.log('Received auth data:', auth);

            console.log('Dispatching auth update:', auth);
            dispatch(
                DASH_REDUX_ACTIONS.updateAuth({
                    auth: auth
                }),
            );

            // Store the current user ID
            //localStorage.setItem('user_id', identity.id);
        } catch (error) {
            console.error('Error fetching auth data:', error);
        }
    }*/

    useEffect(() => {
    

        
            if (!identityLoading && identity) {
              if(!authContext.user || !authContext.authenticated) {
                    //console.log('dispatching dash user to redux store:', identity);
                    dispatch(
                        DASH_REDUX_ACTIONS.updateAuth({
                            user: identity,
                            authenticated: true,
                            auth: identity
                        }),
                    );
                    //getAuth();
                }
               
            } 
     
    }, [identity, identityLoading,authContext]);

    return null;
};

export default RADashComponent;