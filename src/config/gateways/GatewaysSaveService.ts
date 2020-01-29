import { IGatewaysSaveService } from './IGatewaysSaveService';

class GatewaysSaveService implements IGatewaysSaveService {
    private _gatewayId: string;
    private _currState: string;
    private _search: string;
    private _gateway: iqs.shell.Gateway;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
    ) {
        "ngInject";

    }

    public set gateway(gateway: iqs.shell.Gateway) {
        this._gateway = gateway;
    }

    public get gateway(): iqs.shell.Gateway {
        return this._gateway;
    }

    public set gatewayId(gatewayId: string) {
        this._gatewayId = gatewayId;
    }

    public get gatewayId(): string {
        return this._gatewayId;
    }

    public set currState(currState: string) {
        this._currState = currState;
    }

    public get currState(): string {
        return this._currState;
    }
    
    public set search(search: string) {
        this._search = search;
    }

    public get search(): string {
        return this._search;
    }

}

{
    angular.module('iqsGateways.SaveService', [])
        .service('iqsGatewaysSaveService', GatewaysSaveService);

}