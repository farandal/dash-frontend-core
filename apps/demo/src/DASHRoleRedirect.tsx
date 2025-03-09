import { CircularProgress } from "@mui/material";
import React from "react";
import { FC } from "react";
import { useGetIdentity } from "react-admin";

/**
 * Calculates the appropriate redirect path based on the user's identity and role.
 * @returns A React component that redirects the user to the appropriate path based on their role.
 */
/* TODO: load an config file containing role-id => path array */
const CalculateRedirect: FC = () => {
	const { identity, isLoading: identityLoading } = useGetIdentity();
	if (identityLoading) return <CircularProgress />;
    

	//debugger;
    /*if (identity?.role_id === 1)
		return <Redirect path='/admin/dashboard/paquetes-conductores' />;
	if (identity?.role_id === 2) return <Redirect path='/client/dashboard' />;
	return <Redirect path='/admin/package' />;*/
    
    //<Redirect path='/admin' />

};

export default CalculateRedirect;