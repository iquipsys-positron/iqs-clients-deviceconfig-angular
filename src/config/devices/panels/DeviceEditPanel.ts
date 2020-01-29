interface IConfigDeviceEditPanelBindings {
    [key: string]: any;
    device: any;
    details: any;
    edit: any;
}

const ConfigDeviceEditPanelBindings: IConfigDeviceEditPanelBindings = {
    device: '<iqsDevice',
    edit: '=iqsEdit',
    details: '=iqsDetails'
}

class ConfigDeviceEditPanelChanges implements ng.IOnChangesObject, IConfigDeviceEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    device: ng.IChangesObject<iqs.shell.Device>;
    edit: ng.IChangesObject<boolean>;
    details: ng.IChangesObject<boolean>;
}

class ConfigDeviceEditPanelController implements ng.IController {
    public $onInit() { }
    public device: iqs.shell.Device;
    public deviceLocal: iqs.shell.Device;
    public edit: string;
    public picture: any;
    public typeCollection: iqs.shell.TypeCollection;
    public details: boolean;

    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    public isQuery: boolean = false;

    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: any,
        private $scope: ng.IScope,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private pipMedia: pip.layouts.IMediaService,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;

        const runWhenReady = () => {
            this.device = _.cloneDeep(this.device);
            if (this.edit == 'add') {
                this.iqsDevicesViewModel.selectedIndex = null;
            }
            iqsTypeCollectionsService.init();
            this.typeCollection = iqsTypeCollectionsService.getDeviceType();
            this.prepare();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public $onChanges(changes: ConfigDeviceEditPanelChanges) {
        if (changes.device) {
            this.device = _.cloneDeep(changes.device.currentValue);
            if (!this.device) this.device = new iqs.shell.Device();
            this.prepare();
        }
    }

    private prepare(): void {
        this.nameCollection = [];
        // fill collection without editing object
        _.each(this.iqsDevicesViewModel.allDevices, (item: iqs.shell.Device) => {
            if (this.device && this.device.id && this.device.id != item.id || !this.device || !this.device.id) {
                // if (item.udi) this.nameCollection.push(item.udi);
                if (item.label) this.nameCollection.push(item.label);
            }
        });
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsDevicesViewModel.getTransaction();
    }

    public cancelClick() {
        this.$location.search('edit', 'data');
        if (!this.pipMedia('gt-sm')) {
            if (this.edit == 'edit') {
                this.$location.search('details', 'details');
                this.details = true;
            } else {
                this.$location.search('details', 'main');
                this.details = false;
            }

        }
        this.iqsDevicesViewModel.selectItem();
        this.$rootScope.$broadcast('iqsChangeNav');
        this.edit = 'data';
        this.$location.search('edit', 'data');
    }

    public onChangeUdi() {
        if (!this.device.udi) { return }

        this.isQuery = true;
        this.iqsDevicesViewModel.verifyDeviceUdi({ udi: this.device.udi },
            (data) => {
                if (this.form) {
                    let udiFormVal: any;
                    if (this.device.type == 'smartphone') {
                        udiFormVal = this.form.phone;
                    } else {
                        udiFormVal = this.form.udi;
                    }
                    if (!udiFormVal) return;

                    if (!data || this.device && data == this.device.id) {
                        udiFormVal.$setValidity('verifyDeviceUdi', true);
                    } else {
                        udiFormVal.$setValidity('verifyDeviceUdi', false);
                    }
                }
                this.isQuery = false;
            },
            (err) => {
                // this.error = err;
                this.isQuery = false;
            });

    }

    public saveClick() {
        if (this.isQuery) return;

        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.edit == 'edit') {
            this.iqsDevicesViewModel.updateDevice(
                this.device,
                (item) => {
                    this.$location.search('device_id', item.id);
                    this.iqsDevicesViewModel.selectItem();
                    this.edit = 'data';
                    this.$location.search('edit', 'data');
                    if (!this.pipMedia('gt-sm')) {
                        this.$location.search('details', 'details');
                        this.details = true;
                        this.$rootScope.$broadcast('iqsChangeNav');
                    }
                },
                (err) => {

                });
        } else {
            this.device.org_id = this.iqsOrganization.orgId;
            this.iqsDevicesViewModel.saveDevice(
                this.device,
                (item) => {
                    this.device = item;
                    this.$location.search('device_id', item.id);
                    this.iqsDevicesViewModel.selectItem();
                    this.edit = 'data';
                    this.$location.search('edit', 'data');
                    if (!this.pipMedia('gt-sm')) {
                        this.$location.search('details', 'details');
                        this.details = true;
                        this.$rootScope.$broadcast('iqsChangeNav');
                    }
                    this.pipFormErrors.resetFormErrors(this.form, false);
                },
                (error: any) => {
                    console.log('error', error);
                    this.pipFormErrors.resetFormErrors(this.form, true);
                    this.pipFormErrors.setFormError(
                        this.form, error, {
                            '11000': 'form'
                        }
                    );
                });
        }

    }

    public onPictureCreated(obj) {
        this.picture = obj.$control;
    };

    public onResetClick() {
        this.picture.reset();
    };
}

(() => {
    angular
        .module('iqsDeviceEditPanel', ['iqsDevices.ViewModel', 'iqsDeviceObjectPanel'])
        .component('iqsDeviceEditPanel', {
            bindings: ConfigDeviceEditPanelBindings,
            templateUrl: 'config/devices/panels/DeviceEditPanel.html',
            controller: ConfigDeviceEditPanelController,
            controllerAs: '$ctrl'
        })
})();
