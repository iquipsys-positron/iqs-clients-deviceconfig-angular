interface IBeaconEmptyPanelBindings {
    [key: string]: any;

    onBeaconAdd: any;
    state: any,
    isPreLoading: any;
}

const BeaconEmptyPanelBindings: IBeaconEmptyPanelBindings = {
    // change operational event
    onBeaconAdd: '&iqsAdd',
    state: '<?iqsState',
    isPreLoading: '<?iqsPreLoading'
}

class BeaconEmptyPanelChanges implements ng.IOnChangesObject, IBeaconEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onBeaconAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class BeaconEmptyPanelController implements ng.IController {
    public $onInit() { }
    public onBeaconAdd: () => void;
    public state: string;
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
        "ngInject";

        $element.addClass('iqs-beacon-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onAdd(): void {
        if (this.onBeaconAdd) {
            this.onBeaconAdd();
        }
    }
}

(() => {
    angular
        .module('iqsBeaconEmptyPanel', [])
        .component('iqsBeaconEmptyPanel', {
            bindings: BeaconEmptyPanelBindings,
            templateUrl: 'config/beacons/panels/BeaconEmptyPanel.html',
            controller: BeaconEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
