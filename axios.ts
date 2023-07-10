// Generate a default axios instance and export it

import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const baseURL = (Capacitor.getPlatform() === 'web' ? process.env.NEXT_PUBLIC_API_URL : Capacitor.getPlatform() === 'android' ? process.env.NEXT_PUBLIC_API_URL_ANDROID : process.env.NEXT_PUBLIC_API_URL_IOS) ?? '/api';
console.log(`Using base url: ${baseURL} for platform ${Capacitor.getPlatform()}`);
const loginURL = process.env.NEXT_PUBLIC_LOGIN_URL ?? `${baseURL}/auth/login`;
const tokenRefreshURL = process.env.NEXT_PUBLIC_TOKEN_REFRESH_URL ?? `${baseURL}/auth/token`;
let ongoingRefreshTokenRequest = false;

async function handleUnauthorized(response: any, originalRequest: any) {

    // Check if URL contains exchange code -> Don't redirect to login page -> Else try to refresh token or redirect to login page
    if (window.location.href.indexOf('code=') > -1) {
        console.log('Unauthorized - URL contains exchange code -> Don\'t redirect to login page');
        return;
    }

    if (response.status === 401 && !originalRequest._retry) {
        console.log('Unauthorized - Try to refresh token or redirect to login page');

        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
            if(ongoingRefreshTokenRequest) {
                console.log('Refresh token request is already ongoing, waiting for it to finish');
                await new Promise(r => setTimeout(r, 1000));
                return axios(originalRequest.responseURL);
            }
            try {
                ongoingRefreshTokenRequest = true;
                console.log(`refresh_token found, try to refresh token`);
                const response = await axios.post(`${tokenRefreshURL}`, {
                    refresh_token: refreshToken,
                });
                console.log(`Status: ${response.status}`);
                if (response.status === 200) {
                    localStorage.setItem("access_token", response.data.access_token);
                    if (response.data.refresh_token) {
                        localStorage.setItem("refresh_token", response.data.refresh_token);
                    }
                    return axios(originalRequest.responseURL);
                }
            } catch (e) {
                console.warn(e);
            }
            finally {
                ongoingRefreshTokenRequest = false;
            }
        }
        else {
            console.log('No refresh token found, redirecting to login');
        }

        // Check if window is defined
        if (typeof window === 'undefined') throw new Error('Window is not defined');

        // Redirect to login page with redirect url
        let redirectUrl = window.location.href;

        // Check if redirect url is not the login page and not the refresh page and not invalid
        if (typeof redirectUrl == "undefined" || redirectUrl === '') {
            redirectUrl = window.location.protocol + '//' + window.location.host;
        }
        redirectUrl = window.location.protocol + '//' + window.location.host;

        // Remove parameters
        redirectUrl = redirectUrl.split('?')[0];
        console.log(`[348947b3-55fd-5e95-850f-054be6eb472b] Redirecting to ${loginURL}?redirect_url=${redirectUrl}`);
        window.location.href = `${loginURL}?redirect_url=${redirectUrl}`;
    }
}

const instance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => {
        return status >= 200 && status < 500;
    }
});

console.log('Set request interceptor for axios instance');
instance.interceptors.request.use(
    (config) => {
        if(typeof localStorage !== 'undefined') {
            const accessToken = localStorage.getItem("access_token");
            if (accessToken && typeof config !== 'undefined' && typeof config.headers !== 'undefined') {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    }
);

console.log('Set response interceptor for axios instance');
instance.interceptors.response.use(
    async (response: any) => {
        const originalRequest = response.request;
        if (response.status === 401 && !originalRequest._retry) {
            await handleUnauthorized(response, originalRequest);
        }
        return response;
    },
    async (error: { config: any; response: { status: number; }; }) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            await handleUnauthorized(error.response, originalRequest);
        }
        return Promise.reject(error);
    },
);

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
    console.log(`[Fetcher] Fetching ${instance.defaults.baseURL}${url} with params: ${JSON.stringify(params)}`);
    if (Object.keys(params).length > 0) {
        const res = await instance.get(url, { params });
        return res.data;
    }
    const res_1 = await instance.get(url);
    return res_1.data;
};

export default instance;
export { Fetcher };