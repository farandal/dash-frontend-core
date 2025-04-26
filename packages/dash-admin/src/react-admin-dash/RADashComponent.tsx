import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useGetIdentity } from 'react-admin';
import useAxios from '../hooks/axios';
import { getEnv } from 'dash-admin/src/config/DASHAdminSystemConstants';
import { useAuthContext } from '../contexts/auth';

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
    const { user, authenticated } = useAuthContext();
    const { axios } = useAxios();
    const dispatch = useDispatch();

    const getAuth = async () => {

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
    }

    useEffect(() => {
    

        
            if (!identityLoading && identity && !user) {
              

               
                    console.log('dispatching dash user to redux store:', identity);
                    dispatch(
                        DASH_REDUX_ACTIONS.updateAuth({
                            user: identity,
                            authenticated: true
                        }),
                    );
                    getAuth();
              
               
            } 
     
    }, [user,identity, identityLoading]);

    return null;
};

export default RADashComponent;