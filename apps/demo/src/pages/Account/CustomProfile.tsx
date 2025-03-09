import { FC, useContext, useEffect, useState } from 'react';
import { Loading, useGetIdentity, UserIdentity } from 'react-admin';
import AdminForm from './AdminForm';
import GenericForm from './GenericForm';
import ClientForm from './ClientForm';
import React from 'react';

export interface IProfileForm {
	identity: UserIdentity;
}

const CustomProfile: FC = (_props) => {
	const { identity } = useGetIdentity();
	
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

	useEffect(() => {
		if (identity?.role_ids?.length === 1) {
			setSelectedRoleId(identity.role_ids[0]);
		}
	}, [identity]);

    if (!identity) return <Loading />;

	const effectiveRoleId = selectedRoleId || identity?.role_ids?.[0];

	return (
		<div>
           
			{identity.role_ids.length > 1 && (
				<div>
					<div>
						{identity.role_ids.map((roleId) => (
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

			{effectiveRoleId === 1 && <AdminForm identity={identity} />}
			{effectiveRoleId === 2 && <ClientForm identity={identity} />}
			{effectiveRoleId !== 1 && effectiveRoleId !== 2 && <GenericForm identity={identity} />}
            
		</div>
	);
};

export default CustomProfile;