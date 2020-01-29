export interface IGatewaysViewModel {
    state: string;
    isSort: boolean;
    filter: any;
    selectedIndex: number;
    searchedCollection: string[];

    read(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void);
    reload(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void): void;
    getCollection(localSearch?: string): iqs.shell.Gateway[];
    getTransaction(): pip.services.Transaction;
    selectItem(index?: number): void;
    getSelectedItem(): iqs.shell.Gateway;
    statsGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    pingGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    removeItem(id: string): void;
    create(gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void;
    deleteGatewayById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    verifyGatewayUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    updateGatewayById(id: string, gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void;
    clean(): void;
    readOne(id: string, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
}
