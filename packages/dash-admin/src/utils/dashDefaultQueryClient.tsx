import { QueryClient } from "react-query";
/*
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
*/

const dashDefaultQueryClient = new QueryClient({
  defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
});

export default dashDefaultQueryClient;