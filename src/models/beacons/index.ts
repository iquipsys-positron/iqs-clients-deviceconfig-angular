import './BeaconModel';
import './BeaconsViewModel';

let m: any;

try {
    m = angular.module('iqsBeacons');
    m.requires.push(...[
        'iqsBeacons.ViewModel'
    ]);
} catch (err) { }

export * from './IBeaconsViewModel';
