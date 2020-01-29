import { IBeaconsSaveService } from './IBeaconsSaveService';

class BeaconsSaveService implements IBeaconsSaveService {
    private _beaconId: string;
    private _currState: string;
    private _search: string;
    private _beacon: iqs.shell.Beacon;
    private _zoom: number;

    constructor(
 
    ) {
        "ngInject";
         
         // set zoom default value
         this._zoom = 14;
    }

    public set beacon(beacon: iqs.shell.Beacon) {
        this._beacon = beacon;
    }

    public get beacon(): iqs.shell.Beacon {
        return this._beacon;
    }

    public set beaconId(beaconId: string) {
        this._beaconId = beaconId;
    }

    public get beaconId(): string {
        return this._beaconId;
    }

    public set zoom(zoom: number) {
        this._zoom = zoom;
    }

    public get zoom(): number {
        return this._zoom;
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
    angular.module('iqsBeacons.SaveService', [])
        .service('iqsBeaconsSaveService', BeaconsSaveService);

}