import axios, { AxiosInstance } from 'axios';

class Auth0ManagementAPI {
    private static instances: Auth0ManagementAPI[] = [];
    private domain: string;
    private clientID: string;
    private clientSecret: string;
    private audience: string;
    private accessToken: string | null = null;
    private tokenEndpoint: string;
    public axiosInstance: AxiosInstance | null = null;

    constructor(domain: string) {
        this.domain = domain;

        // Get information from .env with names AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_AUDIENCE
        this.clientID = process.env[`AUTH0_${domain}_CLIENT_ID`] as string;
        this.clientSecret = process.env[`AUTH0_${domain}_CLIENT_SECRET`] as string;
        this.audience = process.env[`AUTH0_${domain}_AUDIENCE`] as string;
        this.tokenEndpoint = `https://${domain}/oauth/token`;
    }

    private async obtainAccessToken() {
        try {
            const formData = new URLSearchParams();
            formData.append("grant_type", "client_credentials");
            formData.append("client_id", this.clientID);
            formData.append("client_secret", this.clientSecret);
            formData.append("audience", this.audience);

            const response = await axios.post(this.tokenEndpoint, formData);

            if (response.status === 200) {
                console.log('Access token received');
                this.accessToken = response.data.access_token;
                return response.data.access_token;
            } else {
                throw new Error('Unable to obtain access token');
            }
        } catch (error) {
            console.error(error);
            throw new Error('Unable to obtain access token');
        }
    }

    public static getInstance(domain: string) {
        const existingInstance = Auth0ManagementAPI.instances.find((instance: any) => instance.domain === domain);
        if (existingInstance) {
            return existingInstance;
        }

        const instance = new Auth0ManagementAPI(domain);
        Auth0ManagementAPI.instances.push(instance);

        const axiosInstance = axios.create({
            baseURL: `https://${domain}/api/v2/`,
            headers: {
                'Content-Type': 'application/json',
            },
            validateStatus: (status: number) => {
                return (status >= 200 && status < 300) || status === 401;
            }
        });

        axiosInstance.interceptors.request.use(
            async (config) => {
                if (!instance.accessToken) {
                    await instance.obtainAccessToken();
                }
                if (instance.accessToken && config && config.headers) {
                    config.headers.Authorization = `Bearer ${instance.accessToken}`;
                }
                return config;
            }
        );

        axiosInstance.interceptors.response.use(
            async (response: any) => {
                if (response.status === 401 && !response.config._retry) {
                    console.log('Unauthorized - Try to obtain a new access token');
                    const newAccessToken = await instance.obtainAccessToken();

                    let newConfig = response.config;
                    newConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    newConfig._retry = true;
                    return axios(newConfig);
                }
                return response;
            },
            async (error: { config: any; response: { status: number; }; }) => {
                return Promise.reject(error);
            },
        );

        instance.axiosInstance = axiosInstance;

        return instance;
    }
}

export default Auth0ManagementAPI;
