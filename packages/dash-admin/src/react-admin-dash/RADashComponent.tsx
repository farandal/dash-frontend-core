
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useEffect } from 'react';
import { useGetIdentity } from 'react-admin';
import { useDispatch } from 'react-redux';

const RADashComponent = () => {
  const { identity, isLoading: identityLoading } = useGetIdentity();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!identityLoading && identity) {
      console.log("UPDATING DASH STATE USER", identity)
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

  return (
    <div>

      <p>{JSON.stringify(identity?.id)}</p>

    </div>
  );
};
export default RADashComponent;