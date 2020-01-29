interface IGatewayEmptyPanelBindings {
    [key: string]: any;

    onGatewaylAdd: any;
    state: any;
    isPreLoading: any;
}

const GatewayEmptyPanelBindings: IGatewayEmptyPanelBindings = {
    // change operational event
    onGatewaylAdd: '&iqsAdd',
    state: '<?iqsState',
    isPreLoading: '<?iqsPreLoading',
}

class GatewayEmptyPanelChanges implements ng.IOnChangesObject, IGatewayEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onGatewaylAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class GatewayEmptyPanelController implements ng.IController {
    public $onInit() { }
    public onGatewaylAdd: () => void;
    public accessConfig: any;
    public isPreLoading: boolean;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-gateways-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onAdd(): void {
        if (this.onGatewaylAdd) {
            this.onGatewaylAdd();
        }
    }
}

(() => {
    angular
        .module('iqsGatewayEmptyPanel', [])
        .component('iqsGatewayEmptyPanel', {
            bindings: GatewayEmptyPanelBindings,
            templateUrl: 'config/gateways/panels/GatewayEmptyPanel.html',
            controller: GatewayEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
