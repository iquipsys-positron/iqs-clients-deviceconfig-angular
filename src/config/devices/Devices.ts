import { ICurrentDeviceStatesViewModel } from '../../models';

export const ConfigDevicesStateName: string = 'app.devices';

class ConfigDevicesController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private pipMedia: pip.layouts.IMediaService,
        private pipNavService: pip.nav.INavService,
        private $location: ng.ILocationService,
        private $scope: ng.IScope,
        iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsCurrentDeviceStatesViewModel: ICurrentDeviceStatesViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";


        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
        this.cf.push(this.$rootScope.$on('pipMainResized', () => {
            this.changeAppBar();
        }));
        this.cf.push(this.$rootScope.$on('iqsChangeNav', () => {
            this.changeAppBar();
        }));
        if (this.iqsLoading.isDone) { this.iqsCurrentDeviceStatesViewModel.read(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.iqsCurrentDeviceStatesViewModel.read(); }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.actions.hide();
        this.changeAppBar();
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        this.$rootScope.$broadcast('iqsChangeNavPage');
        this.changeAppBar();
    }

    public changeAppBar() {
        this.pipNavService.breadcrumb.text = 'ADMINISTRATION_DEVICES';
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().details == 'details') {
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_DEVICES", click: () => {
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "MONITORING_DEVICE_DETAILS", click: () => { }
                    }
                ];
                this.pipNavService.icon.showBack(() => {
                    this.toMainFromDetails();
                });
            } else {
                this.pipNavService.icon.showMenu();
            }

            if (this.$location.search().details == 'edit') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_DEVICES", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "EDIT", click: () => { }
                    }
                ];
            }

            if (this.$location.search().details == 'add') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_DEVICES", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADD", click: () => { }
                    }
                ];
            }

        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigDevicesRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigDevicesStateName, {
            url: '/devices?device_id&edit&status&details&section',
            controller: ConfigDevicesController,
            auth: true,
            controllerAs: '$ctrl',
            reloadOnSearch: false,
            templateUrl: 'config/devices/Devices.html'
        });
}

function configureConfigDevicesAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {
        addDevice: iqs.shell.AccessRole.admin,
        pingDevice: iqs.shell.AccessRole.admin,
        editDevice: iqs.shell.AccessRole.admin, // active/disable, attach/dettach object
        deleteDevice: iqs.shell.AccessRole.admin
    }
    iqsAccessConfigProvider.registerStateAccess(ConfigDevicesStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigDevicesStateName, accessConfig);
}

(() => {

    const translateConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {
            'MONITORING_DEVICE_DETAILS': 'Tracker',
            LOADING_DEVICES: 'Loading trackers',
            DEVICE_UDI_PHONE_REQUIRED_ERROR: 'Phone number is required',
            DEVICE_UDI_PHONE_VALIDATE_ERROR: 'Use E.164 to format phone numbers: +xxxxxxxxxxx',
            DIVICE_TYPE_REQUIRED_ERROR: 'You must enter a device type',
            DEVICE_UDI_REQUIRED_ERROR: 'You must enter the UDI device',
            DEVICE_UDI_NOT_UNIQUE: 'The entered UDI is already in use',
            DIVICE_LABEL_UNIQUE_ERROR: 'The entered label is already in use',
            DEVICE_PING: 'Ping',
            DEVICE_UDI_UNKNOWN: 'Unique device identificator',
            DEVICE_ID: 'System identifier',
            DEVICE_MAC_NOTVALID_ERROR: 'The entered value is not a MAC-address',
            DEVICE_HEX_NOTVALID_ERROR: 'The entered value is not a hex string',
            DEVICE_PHONE_ERROR_SERVER_11000: 'A device with this phone number has already been created. Perhaps it was deleted. To re-create, contact support.',
            DEVICE_UDI_ERROR_SERVER_11000: 'A device with this UDI has already been created. Perhaps it was deleted. To re-create, contact support.',
            'INFORMATION': "Information",
        });

        pipTranslateProvider.translations('ru', {
            'MONITORING_DEVICE_DETAILS': 'Трекер',
            LOADING_DEVICES: 'Загрузка трекеров',
            DEVICE_UDI_PHONE_REQUIRED_ERROR: 'Необходимо указать номер телефона',
            DEVICE_UDI_PHONE_VALIDATE_ERROR: 'Используйте E.164 формат для телефонных номеров: +xxxxxxxxxxx',
            DIVICE_TYPE_REQUIRED_ERROR: 'Необходимо указать тип устройства',
            DEVICE_UDI_REQUIRED_ERROR: 'Необходимо указать UDI устройства',
            DEVICE_UDI_NOT_UNIQUE: 'Введенный UDI уже используется',
            DIVICE_LABEL_UNIQUE_ERROR: 'Введеная метка уже используется',
            DEVICE_PING: 'Проверка связи',
            DEVICE_UDI_UNKNOWN: 'Уникальный идентификатор устройства',
            DEVICE_ID: 'Системный идентификатор',
            DEVICE_MAC_NOTVALID_ERROR: 'Введенное значение не является MAC-адресом',
            DEVICE_HEX_NOTVALID_ERROR: 'Введенное значение не является 16 числом',
            DEVICE_PHONE_ERROR_SERVER_11000: 'Устройство с таким номером телефона уже создано. Возможно оно было удалено. Для повторного создания, обратитесь в поддержку.',
            DEVICE_UDI_ERROR_SERVER_11000: 'Устройство с таким UDI уже создано. Возможно оно было удалено. Для повторного создания, обратитесь в поддержку.',
            'INFORMATION': "Информация",
        });
    }

    angular
        .module('iqsConfigDevices', ['pipNav', 'iqsDevicesPanel'])
        .config(configureConfigDevicesRoute)
        .config(translateConfig)
        .config(configureConfigDevicesAccess);

})();

