import { BeaconsModel } from './BeaconModel';
import { IBeaconsViewModel } from './IBeaconsViewModel';

class BeaconViewModel implements IBeaconsViewModel {
    private _filter: any;    
    private beaconModel: BeaconsModel;

    constructor(
        $log: ng.ILogService,
        $location: ng.ILocationService,
        $timeout: ng.ITimeoutService,
        pipTransaction: pip.services.ITransactionService,
        iqsOrganization: iqs.shell.IOrganizationService,
        iqsBeaconsData: iqs.shell.IBeaconsDataService
    ) {
        "ngInject";

        this._filter = null;
        this.beaconModel = new BeaconsModel($log, $location, $timeout, pipTransaction, iqsOrganization, iqsBeaconsData);
    }

    public read(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void) {
                this.beaconModel.filter = this._filter;
        this.beaconModel.read(successCallback, errorCallback);
    }

    public reload(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.filter = this._filter;
        this.beaconModel.reload(successCallback, errorCallback);
    }

    public getCollection(localSearch?: string): iqs.shell.Beacon[] {
        return this.beaconModel.get(localSearch);
    }

    public getTransaction(): pip.services.Transaction {
        return this.beaconModel.getTransaction();
    }

    public get isSort(): boolean {
        return this.beaconModel.isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this.beaconModel.isSort = value;
        }
    }

    public get selectAllow(): boolean {
        return this.beaconModel.selectAllow;
    }

    public set selectAllow(value: boolean) {
        if (!!value) {
            this.beaconModel.selectAllow = value;
        }
    }

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    public get state(): string {
        return this.beaconModel.state;
    }

    public set state(value: string) {
        this.beaconModel.state = value;
    }

    public selectItem(index?: number) {
        this.beaconModel.selectItem(index);
    }

    public getSelectedItem(): iqs.shell.Beacon {
        return this.beaconModel.getSelectedItem();
    }

    public get searchedCollection(): string[] {
        return this.beaconModel.getSearchedCollection();
    }

    public get selectedIndex(): number {
        return this.beaconModel.getSelectedIndex();
    }

    public set selectedIndex(index: number) {
        this.beaconModel.selectItem(index);
    }

    public removeItem(id: string) {
        this.beaconModel.remove(id);
    }

    public create(beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.create(beacon, successCallback, errorCallback);
    }

    public deleteBeaconById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.delete(id, successCallback, errorCallback);
    }

    public verifyBeaconUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.verifyBeaconUdi(udi, successCallback, errorCallback);
    }

    public calculatePosition(ids: string[], successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.calculatePosition(ids, successCallback, errorCallback);
    }

    public updateBeaconById(id: string, beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void {
        this.beaconModel.update(id, beacon, successCallback, errorCallback);
    }   

    public readOne(id: string, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
       return this.beaconModel.readOne(id, successCallback, errorCallback);
    }   

    public clean(): void {
        this.beaconModel.clean();
    }      
}

angular.module('iqsBeacons.ViewModel', ['iqsBeacons.Data'])
    .service('iqsBeaconsViewModel', BeaconViewModel);

