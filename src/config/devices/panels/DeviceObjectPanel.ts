interface IConfigDeviceObjectPanelBindings {
    [key: string]: any;
    device: any;
}

const ConfigDeviceObjectPanelBindings: IConfigDeviceObjectPanelBindings = {
    device: '<pipDevice'
}

class ConfigDeviceObjectPanelChanges implements ng.IOnChangesObject, IConfigDeviceObjectPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    device: ng.IChangesObject<iqs.shell.Device>;
}


class ConfigDeviceObjectPanelController implements ng.IController {
    public $onInit() { }
    public device: iqs.shell.Device;
    public typeCollection: iqs.shell.TypeCollection;
    public accessConfig: any;
    public panelTransaction: pip.services.Transaction;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        $rootScope: ng.IRootScopeService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsDevicesObjectsDialog,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private pipTransaction: pip.services.ITransactionService,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        iqsTypeCollectionsService.init();
        this.typeCollection = iqsTypeCollectionsService.getObjectType();
        this.panelTransaction = pipTransaction.create('LOCATION');
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
        }

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { runWhenReady() }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public get object() {
        return this.device.object_id ? this.iqsObjectsViewModel.getObjectById(this.device.object_id) : null;
    }

    public change(object) {
        this.panelTransaction.begin('change_related_object');
        this.iqsDevicesObjectsDialog.show({ selected: object, showFree: true }, (data) => {
            let device: iqs.shell.Device = _.cloneDeep(this.device);
            device.object_id = data.id;
            this.iqsDevicesViewModel.updateDevice(device, (item) => {
                this.iqsObjectsViewModel.read();

                if (this.$state.current.name == 'monitoring.objects') {
                    this.iqsStatesViewModel.updateStates(null, () => {
                        this.panelTransaction.end();
                    });
                } else {
                    this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('all', () => {
                        this.panelTransaction.end();
                    });
                }
                // this.iqsDevicesViewModel.invalidateState(
                //     device.id,
                //     () => {
                //         if (this.$state.current.name == 'monitoring.objects') {
                //             this.iqsStatesViewModel.updateStates(null, () => {
                //                 this.panelTransaction.end();
                //             });
                //         } else {
                //             this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('all', () => {
                //                 this.panelTransaction.end();
                //             });
                //         }
                //     },
                //     (error: any) => {
                //         this.panelTransaction.end(error);
                //     });
            }, (error: any) => { this.panelTransaction.end(error); })
        }, (error: any) => { this.panelTransaction.end(error); });
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsDevicesViewModel.getTransaction();
    }

    public delete() {
        this.panelTransaction.begin('change_related_object');
        let device: iqs.shell.Device = _.cloneDeep(this.device);
        device.object_id = null;
        this.iqsDevicesViewModel.updateDevice(device, (item) => {
            this.iqsObjectsViewModel.read();
            if (this.$state.current.name == 'monitoring.objects') {
                this.iqsStatesViewModel.updateStates(null, () => {
                    this.panelTransaction.end();
                });
            } else {
                this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('all', () => {
                    this.panelTransaction.end();
                });
            }
            // this.iqsDevicesViewModel.invalidateState(
            //     device.id,
            //     () => {
            //         if (this.$state.current.name == 'monitoring.objects') {
            //             this.iqsStatesViewModel.updateStates(null, () => {
            //                 this.panelTransaction.end();
            //             });
            //         } else {
            //             this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('all', () => {
            //                 this.panelTransaction.end();
            //             });
            //         }
            //     },
            //     (error: any) => {
            //         this.panelTransaction.end(error);
            //     });
        }, (error: any) => { this.panelTransaction.end(error); })

    }

    public gotoConfig(id: string) {
        // this.$state.go('app.objects', {
        //     object_id: id
        // })
        window.location.href = window.location.origin + '/config_objects/index.html#/objects?object_id=' + id;
    }
}

(() => {
    angular
        .module('iqsDeviceObjectPanel', [
            'iqsDevicesObjectsDialog'
        ])
        .component('iqsDeviceObjectPanel', {
            bindings: ConfigDeviceObjectPanelBindings,
            templateUrl: 'config/devices/panels/DeviceObjectPanel.html',
            controller: ConfigDeviceObjectPanelController,
            controllerAs: '$ctrl'
        })
})();
