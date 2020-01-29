import './GatewaysModel';
import './GatewaysViewModel';

let m: any;

try {
    m = angular.module('iqsGateways');
    m.requires.push(...[
        'iqsGateways.ViewModel'
    ]);
} catch (err) { }

export * from './IGatewaysViewModel';
