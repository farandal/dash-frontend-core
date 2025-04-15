import { QueryClient } from "react-query";

const dashDefaultQueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false, // default: true
            },
        },
        // @ts-ignore: required to avoid error during development.
        logger: {
            log: (...args) => {
                console.log(args);
            },
            warn: (...args) => {
                console.warn(args);
            },
            error: (...args) => {
                console.error(args);
            },
        },
    });

export default dashDefaultQueryClient;