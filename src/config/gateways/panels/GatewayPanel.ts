import { IPingDialogService, PingDialogParams, PingDialogResult } from '../../../common';

class GatewayParams {
    public successCallback: (result: boolean) => void;
    public errorCallback: (result: boolean) => void;
}

class GatewaysTabs {
    title: string;
    id: number;
}

interface IGatewayPanelBindings {
    [key: string]: any;

    onGatewayPing: any;
    onGatewayStatistics: any;
    onGatewayEdit: any;
    onGatewayDelete: any;
    item: any;
    ngDisabled: any;
}

const GatewayPanelBindings: IGatewayPanelBindings = {
    // change gateway
    onGatewayEdit: '&iqsEdit',
    // ping gateway
    onGatewayPing: '&iqsPing',
    onGatewayStatistics: '&iqsStatistics',
    // add gateway
    onGatewayDelete: '&iqsDelete',
    // event template for edit
    item: '<?iqsGatewayItem',
    ngDisabled: '&?'
}

class GatewayPanelChanges implements ng.IOnChangesObject, IGatewayPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onGatewayEdit: ng.IChangesObject<() => ng.IPromise<void>>;
    onGatewayPing: ng.IChangesObject<() => ng.IPromise<void>>;
    onGatewayStatistics: ng.IChangesObject<() => ng.IPromise<void>>;
    onGatewayDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    item: ng.IChangesObject<iqs.shell.Gateway>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class GatewayPanelController implements ng.IController {
    public $onInit() { }
    public item: iqs.shell.Gateway;
    public onGatewayEdit: () => void;
    public onGatewayPing: (param: GatewayParams) => void;
    public onGatewayStatistics: () => void;
    public onGatewayDelete: () => void;
    public ngDisabled: () => boolean;

    public gatewayModelCollection: iqs.shell.TypeCollection;
    public typeCollection: iqs.shell.TypeCollection;
    public section: number;
    public sections: GatewaysTabs[] = [
        { title: 'GATEWAY_TAB_INFORMATION', id: 0 },
        { title: 'GATEWAY_TAB_STATISTIC', id: 1 }
    ];
    public gatewayStatistics: iqs.shell.CommStatistics = <iqs.shell.CommStatistics>{};
    public isLoadedStatistics: boolean = false;
    public accessConfig: any;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsPingDialog: IPingDialogService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-gateways-panel');
        this.accessConfig = iqsAccessConfig.getStateConfigure().access;
        const runWhenReady = () => {
            this.typeCollection = iqsTypeCollectionsService.getDeviceType();
            this.section = this.sections[0].id;
            this.gatewayModelCollection = this.iqsTypeCollectionsService.getGatewayModels();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: GatewayPanelChanges): void {
        this.isLoadedStatistics = false;

        if (this.item && changes.item && changes.item.previousValue) {
            if (this.item.id != changes.item.previousValue.id) {
                this.section = this.sections[0].id;
                this.selectSection();
            }
        } else {
            this.section = this.sections[0].id;
            this.selectSection();
        }

        this.gatewayStatistics = {};
        let index: number;
        if (this.item) {
            index = _.findIndex(this.item.stats, (s: iqs.shell.CommStatistics) => {
                return !s.device_udi
            });
        }
        if (index > -1) {
            this.gatewayStatistics = _.cloneDeep(this.item.stats[index]);
        }
    }

    public onEdit(item: iqs.shell.Gateway): void {
        if (this.onGatewayEdit) {
            this.onGatewayEdit();
        }
    }

    public onDelete(item: iqs.shell.Gateway): void {
        if (this.onGatewayDelete) {
            this.onGatewayDelete();
        }
    }

    public selectSection() {
        this.isLoadedStatistics = false;
        if (this.section == 1 && this.accessConfig.statGateway) {
            if (this.onGatewayStatistics) {
                this.isLoadedStatistics = true;
                this.onGatewayStatistics();
            }
        }
    }

    public onPing() {
        let pingParams: PingDialogParams = {
            dialogTitle: '',
            pingString: '',
            pingSuccess: '',
            pingFailed: '',
            ping: (successCallback: (result: boolean) => void, errorCallback?: (error?: any) => void) => {
                this.onGatewayPing({
                    successCallback: (result: boolean) => {
                        if (successCallback) {
                            successCallback(result);
                        }
                    },
                    errorCallback: (error: any) => {
                        if (errorCallback) {
                            errorCallback(error);
                        }
                    }
                });
            }
        };

        this.iqsPingDialog.show(
            pingParams,
            (result: PingDialogResult) => {

            },
            () => {

            }
        );
    }
}

(() => {
    angular
        .module('iqsGatewayPanel', [])
        .component('iqsGatewayPanel', {
            bindings: GatewayPanelBindings,
            templateUrl: 'config/gateways/panels/GatewayPanel.html',
            controller: GatewayPanelController,
            controllerAs: '$ctrl'
        })
})();
