export class PingDialogParams {
    public dialogTitle?: string;
    public pingString: string;
    public pingSuccess: string;
    public pingFailed: string;
    public ping: (successCallback: (result: boolean) => void, errorCallback?: (error?: any) => void) => void;
    public okButtonLabel?: string;
    public pingTimeout?: number;// duration ping result on mill sec. default 30000
    public pingFrequency?: number;//  mill sec. default 3000
}

export class PingDialogResult {
    isPing: boolean;
    isAbort?: boolean;
    error?: any;
}

export interface IPingDialogService {
    show(params: PingDialogParams, successCallback?: (data?: any) => void, cancelCallback?: () => void): any;
}