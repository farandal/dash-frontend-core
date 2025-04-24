
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useEffect } from 'react';
import { useGetIdentity } from 'react-admin';
import { useDispatch } from 'react-redux';
/*
React Admin integration hook components 
For now it waits for the identity to be loaded and then updates the store auth state.
To be used in the rest of DashAdmin Components.
*/
const RADashComponent = () => {

  const { identity, isLoading: identityLoading } = useGetIdentity();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!identityLoading && identity) {
      //console.log("W.I.P !! identity updated", identity)
      // TODO: compare values before dispatch! 
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth({
          user: identity,
          authenticated: true,
          auth: identity
        }),
      );
    } else if (!identity) {
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth({
          user: null,
          authenticated: false,
          auth: null
        }),
      );
    }

  }, [identity, identityLoading]);

  return null;
};
export default RADashComponent;