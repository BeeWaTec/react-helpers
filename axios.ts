// Generate a default axios instance and export it

import axios from 'axios';

const instance = axios.create({
    baseURL: "/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

interface FetcherProps {
    url: string;
    filter?: [
        string,
        string | number | boolean | null | undefined | string[] | number[] | boolean[] | null[] | undefined[]
    ]
    orderBy?: [
        string,
        'asc' | 'desc'
    ]
    limit?: number;
    offset?: number;
    additionalParams?: {
        [key: string]: string | number | boolean | null | undefined | string[] | number[] | boolean[] | null[] | undefined[]
    }
}
const Fetcher = async ({ url, filter, orderBy, limit, offset, additionalParams }: FetcherProps) => {
    let params = {};
    if (filter) {
        params = {
            ...params,
            filter: JSON.stringify(filter),
        };
    }
    if (orderBy) {
        params = {
            ...params,
            orderBy: JSON.stringify(orderBy),
        };
    }
    if (limit) {
        params = {
            ...params,
            limit,
        };
    }
    if (offset) {
        params = {
            ...params,
            offset,
        };
    }
    if (additionalParams) {
        params = {
            ...params,
            ...additionalParams,
        };
    }
    if (Object.keys(params).length > 0) {
        const res = await instance.get(url, { params });
        return res.data;
    }
    const res_1 = await instance.get(url);
    return res_1.data;
};

export default instance;
export { Fetcher };