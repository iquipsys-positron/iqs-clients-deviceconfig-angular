function initPopulating(
    iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
    iqsStatesViewModel: iqs.shell.IStatesViewModel,
    iqsMapConfig: iqs.shell.IMapService,
    pipIdentity: pip.services.IIdentityService,
    iqsLoading: iqs.shell.ILoadingService,
    iqsOrganization: iqs.shell.IOrganizationService
) {
    iqsLoading.push('data', [
        iqsCurrentObjectStatesViewModel.clean.bind(iqsCurrentObjectStatesViewModel),
        iqsStatesViewModel.clean.bind(iqsStatesViewModel),
        iqsMapConfig.clean.bind(iqsMapConfig)
    ], async.parallel, [
            (callback) => {
                iqsStatesViewModel.cleanUpAllStates();
                iqsStatesViewModel.initStates(new Date().toISOString(), 'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsMapConfig.orgId = iqsOrganization.orgId;
                iqsMapConfig.getConfigsFromOrganization();
                callback();
            }
        ]);
    if (pipIdentity.identity && pipIdentity.identity.id) {
        iqsLoading.start();
    }
}


let m: any;
const requires = [
    'iqsCurrentObjectStates.ViewModel',
    'iqsStates.ViewModel',
    'iqsMapConfig',
    'iqsOrganizations.Service',
];

try {
    m = angular.module('iqsLoading');
    m.requires.push(...requires);
    m.run(initPopulating);
} catch (err) { }