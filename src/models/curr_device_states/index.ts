import './CurrentDeviceStatesModel';
import './CurrentDeviceStatesViewModel';

let m: any;

try {
    m = angular.module('iqsCurrentDeviceStates');
    m.requires.push(...[
        'iqsCurrentDeviceStates.ViewModel'
    ]);
} catch (err) { }

export * from './ICurrentDeviceStatesViewModel';
