export interface IBeaconsViewModel {
    state: string;
    isSort: boolean;
    filter: any;
    selectedIndex: number;
    searchedCollection: string[];
    selectAllow: boolean;

    read(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void);
    reload(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void): void;
    getCollection(localSearch?: string): iqs.shell.Beacon[];
    getTransaction(): pip.services.Transaction;
    selectItem(index?: number): void;
    getSelectedItem(): iqs.shell.Beacon;
    calculatePosition(ids: string[], successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    removeItem(id: string): void;
    create(beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void;
    deleteBeaconById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    verifyBeaconUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    updateBeaconById(id: string, beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void;
    clean(): void;
    readOne(id: string, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
}
