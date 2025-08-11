import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useEffect } from "react";
import { useRedirect, Loading } from "react-admin";
import { useParams } from "react-router";
import {DASHAdminSystemConstants} from 'dash-constants';

interface IRedirect {
  method: 'edit' | 'list' | 'create' | 'show';
  drawerMethod: 'edit' | 'list' | 'create' | 'show';
  resourceConfig: IDashAutoAdminResourceConfig;
  stateHashPattern?: string;
}

const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
const Redirect: React.FC<IRedirect> = ({
  method,
  resourceConfig,
  stateHashPattern = URL_PREFIX,
  drawerMethod = 'edit',
  ..._props
}) => {
  const params = useParams();
  const redirect = useRedirect();

  const idParamName = resourceConfig?.idParamName || 'id';

  useEffect(() => {
    let _stateHash = stateHashPattern.replace(
      `:${idParamName}`,
      params[idParamName],
    );
    _stateHash = _stateHash.replace(':method', drawerMethod);

    redirect(
      method,
      resourceConfig.model,
      method === 'edit' ? params.id : null,
      null,
      { hash: _stateHash },
    );
  }, []);

  return <Loading />;
};

export default Redirect;