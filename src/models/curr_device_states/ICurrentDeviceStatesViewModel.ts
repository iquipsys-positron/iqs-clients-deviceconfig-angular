export interface ICurrentDeviceStatesViewModel {
    read(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    get(): iqs.shell.CurrentDeviceState[];
    getTransaction(): pip.services.Transaction;
    reload(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void): void;
    clean(): void;
    getDeviceStateById(id: string): iqs.shell.CurrentDeviceState;
    readOne(id: string, successCallback?: (data: iqs.shell.CurrentDeviceState) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    state: string;
}
