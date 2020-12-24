import axios, { AxiosInstance, AxiosResponse } from 'axios';

declare module 'axios' {
    interface AxiosResponse<T = any> extends Promise<T> {}
}

abstract class HttpClient {
    private _handleResponse = ({ data }: AxiosResponse) => data;
    
    protected handleError = (error:any) => Promise.reject(error);
    protected readonly instance: AxiosInstance;
    
    public constructor(baseUrl: string) {
        this.instance = axios.create({ baseURL: baseUrl });
        
        this._initializeResponseInterceptor();
    }
    
    private _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(
            this._handleResponse,
            this.handleError
        );
    }
}