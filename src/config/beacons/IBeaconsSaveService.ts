export interface IBeaconsSaveService {
    beaconId: string;
    currState: string;
    search: string;
    beacon: iqs.shell.Beacon;
    zoom: number;
}
