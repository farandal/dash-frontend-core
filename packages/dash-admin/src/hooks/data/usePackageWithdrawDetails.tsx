import { useAxios } from 'dash-axios-hook';
import { useState } from 'react';
import queryString from 'query-string';

export interface IUsePackageWithdrawDetails {
	action_id?: number;
	driver_id?: string | number;
}

export interface PackageWithdrawDetailOutput {
	countwidthdrawsPackages: number;
	packagesForClients: PackagesForClient[];
}

export interface PackagesForClient {
	contador_without_info: number;
	contador: number;
	name: string;
	packages_without_info?: PackagesWithoutInfo[];
}

export interface PackagesWithoutInfo {
	id: number;
	internal_id: string;
}

const usePackageWithdrawDetails = () => {
	const axios = useAxios();
	const [data, setData] = useState<PackageWithdrawDetailOutput>(null);
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const request = async (o) => {
		const payload = queryString.stringify(
			{
				...(o.action_id && { action_id: o.action_id }),
				...(o.driver_id && { driver_id: o.driver_id }),
			},
			{ arrayFormat: 'bracket' },
		);

		try {
			const response = await axios({
				method: 'GET',
				url: `/admin/package/withdrawn-today?${payload}`,
			});

			if (response.status === 200) {
				setData(response.data[0]);
			}
		} catch (e) {
			setError(e);
		} finally {
			setLoaded(true);
		}
	};

	return { request, data, error, loaded };
};

export default usePackageWithdrawDetails;
