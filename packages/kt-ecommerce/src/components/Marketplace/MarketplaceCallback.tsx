import { useEffect } from 'react'

import { useSearchParams } from 'react-router-dom';
import { useRedirect } from 'react-admin';
import { useNotify } from 'react-admin';
import { Loading } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { DASHAdminSystemConstants } from 'dash-constants';

const getUrlParamsObject = (searchParams: any) => {
    let params: Record<string, any> = {};
    for (const entry of searchParams) {
        const [param, value] = entry;
        params = { ...params, [param]: value }
    }
    return Object.keys(params).length > 0 ? params : null
}

const MarketplaceCallback = () => {

    let [searchParams] = useSearchParams();
    const redirect = useRedirect();
    const notify = useNotify();
    const axios = useAxios();
    const urlQuery: any = getUrlParamsObject(searchParams.entries());

    const verify = async (query) => {

        const internal_oauth_callback_url = DASHAdminSystemConstants.system.API_URL +  + `/api/marketplace/${query?.state}/oauth/callback`
        
        try {
            const res = await axios.post(internal_oauth_callback_url, query);
            notify("Marketplace asociado correctamente");
            redirect(`/ecommerce/marketplace/${query?.state}`)
        } catch (error) {
            notify('No se pudo establecer la conexión')
            redirect('/marketplace')
        }

    }

    useEffect(() => {
        if (urlQuery?.state) {
            verify(urlQuery);
        } else {
            notify('No se pudo establecer la conexión')
            redirect('/ecommerce/marketplace')
        }
    }, [])

    return (
        <Loading/>
    )
}

export default MarketplaceCallback
