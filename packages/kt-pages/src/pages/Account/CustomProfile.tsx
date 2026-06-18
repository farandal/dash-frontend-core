import { FC, useContext, useEffect, useState } from 'react';
import { Loading, useGetIdentity, UserIdentity } from 'react-admin';
import AdminForm from './AdminForm';
import GenericForm from './GenericForm';
import ClientForm from './ClientForm';
import React from 'react';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import { IGetAuthUser } from 'dash-admin/src/interfaces/user/IUser';


const CustomProfile: FC = () => {
	//const { identity, isLoading } = useGetIdentity();
	const { user } = useAuthContext();
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

	useEffect(() => {
		if (user && user?.role_ids?.length === 1) {
			setSelectedRoleId(user?.role_ids[0]);
		}
	}, [user]);

    if ( !user ) return <Loading />;

	const effectiveRoleId = selectedRoleId || user?.role_ids?.[0];
   
	return (
		<div className='dash-profile'>
          
        {"<!-- D -->"}
			{user.role_ids.length > 1 && (
				<div>
					<div>
						{user?.role_ids.map((roleId) => (
							<button
								key={roleId}
								onClick={() => setSelectedRoleId(roleId)}
								style={{ margin: '5px' }}
							>
								{roleId === 1 ? 'Admin Profile' : roleId === 2 ? 'Client Profile' : 'Generic Profile'}
							</button>
						))}
					</div>
				</div>
			)}
    
			{effectiveRoleId === 1 && <AdminForm />}
			{effectiveRoleId === 2 && <ClientForm />}
			{effectiveRoleId !== 1 && effectiveRoleId !== 2 && <GenericForm  />}
            
		</div>
	);
};

export default CustomProfile;