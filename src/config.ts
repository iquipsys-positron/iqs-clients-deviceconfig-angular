(() => {
    function iqsPositronConfigConfig(
        pipAuthStateProvider: pip.rest.IAuthStateProvider,
        pipErrorPageConfigServiceProvider: pip.errors.IErrorPageConfigProvider,
    ) {
        pipAuthStateProvider.authorizedState = 'app.beacons';
        pipErrorPageConfigServiceProvider.configs.NoConnection.RedirectSateDefault = pipAuthStateProvider.authorizedState;
    }

    angular
        .module('iqsPositronConfig.Config', [
            'ngCookies',
            'iqsShell',
            'pipSystem',
            'pipSystem.Templates',
        ])
        .config(iqsPositronConfigConfig);
})();