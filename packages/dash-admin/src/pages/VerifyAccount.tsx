import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { useSearchParams } from 'react-router-dom';
import { useRedirect } from 'react-admin';
import useAxios from '../hooks/axios';

const getUrlParamsObject = (searchParams: any) => {
	let params: Record<string, any> = {};
	for (const entry of searchParams) {
		const [param, value] = entry;
		params = { ...params, [param]: value };
	}
	return Object.keys(params).length > 0 ? params : null;
};

const VerifyAccount = () => {
	let [searchParams] = useSearchParams();
	const redirect = useRedirect();
	const { axios } = useAxios();
	const urlQuery: any = getUrlParamsObject(searchParams.entries());

	const verify = async () => {
		try {
			const res = await axios.get(`${urlQuery.verification_url}`);
			switch (res.status) {
				case 200:
					//alert("Cuenta verificada correctamente");
					redirect('/login');
					break;
				case 204:
					//alert("Cuenta ya verificada");
					redirect('/login');
					break;
				case 401:
					//alert("Cuenta no verificada");
					break;
				case 403:
					//alert("Cuenta no verificada");
					break;
				case 404:
					//alert("Cuenta no verificada");
					break;
				default:
					//alert("Cuenta no verificada");
					break;
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (urlQuery?.verification_url) {
			verify();
		} else {
			redirect('/login');
		}
	}, []);

	return <>Verificando cuenta...</>;
};

export default VerifyAccount;
