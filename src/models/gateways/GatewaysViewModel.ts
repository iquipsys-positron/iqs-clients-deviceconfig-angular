import { GatewaysModel } from './GatewaysModel';
import { IGatewaysViewModel } from './IGatewaysViewModel';

class GatewaysViewModel implements IGatewaysViewModel {
    private _filter: any;    
    private gatewayModel: GatewaysModel;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsGatewaysData: iqs.shell.IGatewaysDataService
    ) {
        "ngInject";

        this._filter = null;
        this.gatewayModel = new GatewaysModel($log, $location, $timeout, pipTransaction, iqsOrganization, iqsGatewaysData);
    }

    public read(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void) {
                this.gatewayModel.filter = this._filter;
        this.gatewayModel.read(successCallback, errorCallback);
    }

    public reload(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.filter = this._filter;
        this.gatewayModel.reload(successCallback, errorCallback);
    }

    public getCollection(localSearch?: string): iqs.shell.Gateway[] {
        return this.gatewayModel.get(localSearch);
    }

    public getTransaction(): pip.services.Transaction {
        return this.gatewayModel.getTransaction();
    }

    public get isSort(): boolean {
        return this.gatewayModel.isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this.gatewayModel.isSort = value;
        }
    }

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    public get state(): string {
        return this.gatewayModel.state;
    }

    public set state(value: string) {
        this.gatewayModel.state = value;
    }

    public selectItem(index?: number) {
        this.gatewayModel.selectItem(index);
    }

    public getSelectedItem(): iqs.shell.Gateway {
        return this.gatewayModel.getSelectedItem();
    }


    public get searchedCollection(): string[] {
        return this.gatewayModel.getSearchedCollection();
    }

    public get selectedIndex(): number {
        return this.gatewayModel.getSelectedIndex();
    }

    public set selectedIndex(index: number) {
        this.gatewayModel.selectItem(index);
    }

    public removeItem(id: string) {
        this.gatewayModel.remove(id);
    }

    public create(gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.create(gateway, successCallback, errorCallback);
    }

    public deleteGatewayById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.delete(id, successCallback, errorCallback);
    }

    public verifyGatewayUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.verifyGatewayUdi(udi, successCallback, errorCallback);
    }

    public statsGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.statsGateway(id, successCallback, errorCallback);
    }

    public pingGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.pingGateway(id, successCallback, errorCallback);
    }

    public updateGatewayById(id: string, gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void {
        this.gatewayModel.update(id, gateway, successCallback, errorCallback);
    }   

    public readOne(id: string, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
       return this.gatewayModel.readOne(id, successCallback, errorCallback);
    }   

    public clean(): void {
        this.gatewayModel.clean();
    }      
}

angular.module('iqsGateways.ViewModel', ['iqsGateways.Data'])
    .service('iqsGatewaysViewModel', GatewaysViewModel);

