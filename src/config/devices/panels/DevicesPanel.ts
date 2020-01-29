import { IPingDialogService, PingDialogParams, PingDialogResult } from '../../../common/dialogs';
import { ICurrentDeviceStatesViewModel } from '../../../models/curr_device_states/ICurrentDeviceStatesViewModel';

let async = require('async');

interface IConfigDevicesPanelBindings {
    [key: string]: any;
}

const ConfigDevicesPanelBindings: IConfigDevicesPanelBindings = {}

class ConfigDevicesPanelChanges implements ng.IOnChangesObject, IConfigDevicesPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class DevicesStatuses {
    id: string;
    title: string;
}

class ConfigDevicesPanelController implements ng.IController {
    public $onInit() { }

    public status: string;
    public edit: string;
    public details: boolean;

    public defaultCollection: string[];
    public searchedCollection: string[];
    public typeCollection: iqs.shell.TypeCollection;

    public tabs = [
        {
            title: 'INFORMATION',
            id: 0
        }, {
            title: 'LOCATION',
            id: 1
        }
    ];
    public tabIndex: number;
    private cf: Function[] = [];
    public object: iqs.shell.ObjectState;
    public showMap: boolean = false;
    public accessConfig: any;
    public isPreLoading: boolean = true;

    public deviceState: iqs.shell.CurrentDeviceState;

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: any,
        private $location: ng.ILocationService,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        public pipMedia: pip.layouts.IMediaService,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        public pipTranslate: pip.services.ITranslateService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private iqsPingDialog: IPingDialogService,
        private iqsCurrentDeviceStatesViewModel: ICurrentDeviceStatesViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        if (!this.pipMedia('gt-sm')) {
            this.details = $location.search().details == 'details' || $location.search().details == 'add' || $location.search().details == 'edit' ? true : false;
        } else {
            this.details = false;
            this.$location.search('details', 'main');
        }
        this.edit = $location.search().edit || 'data';

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (this.pipMedia('gt-sm')) {
                this.details = false;
                this.$location.search('details', 'main');
                this.$rootScope.$broadcast('iqsChangeNav');
            }
        }));
        this.cf.push($rootScope.$on('iqsChangeNavPage', () => {
            if (!this.pipMedia('gt-sm')) {
                this.details = $location.search().details == 'details' ? true : false;
                this.edit = $location.search().edit || 'data';
            }
        }));

        const runWhenReady = () => {
            this.iqsDevicesViewModel.initDevices();
            iqsTypeCollectionsService.init();
            this.typeCollection = iqsTypeCollectionsService.getDeviceType();
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.status = this.$location.search()['status'] || '';

            let objectType: string = iqs.shell.SearchObjectTypes.Device;
            this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
            this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(objectType);

            this.onSearchResult(this.status, true);
            this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data', () => {
                this.showMap = true
                this.selectItem(this.iqsDevicesViewModel.selectedIndex);
            });


            this.tabIndex = $location.search().section || 0;
            if (this.edit == 'add') {
                this.iqsDevicesViewModel.selectedIndex = null;
            }

            this.iqsDevicesViewModel.selectItem();
            this.selectItem(this.iqsDevicesViewModel.selectedIndex);
            this.isPreLoading = false;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        $rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady);
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onSearchResult(query: string, init: boolean = false) {
        this.status = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.Device,
            (data: iqs.shell.SearchResult[]) => {
                this.$location.search('status', this.status);
                this.iqsDevicesViewModel.filterDevices('all');
                this.iqsDevicesViewModel.filterWithArrayObjects(data);

                this.iqsDevicesViewModel.selectItem();
            });
    }

    public onCanselSearch() {
        this.status = '';

        this.$location.search('status', this.status);
        this.iqsDevicesViewModel.filterDevices('all');
        this.iqsDevicesViewModel.selectItem();
    }

    public selectSection(id: string) {
        this.$location.search('section', this.tabIndex);
    }

    public changeEdit() {
        this.edit = 'edit';
        this.$location.search('edit', 'edit');
        this.$location.search('details', 'edit');
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$rootScope.$broadcast('iqsChangeNav');
        }
    }

    public get collection() {
        return this.iqsDevicesViewModel.devices;
    }

    public state() {
        return this.iqsDevicesViewModel.state;
    }

    public selectedIndex() {
        return this.iqsDevicesViewModel.selectedIndex;
    }

    public selectButtons() {
        this.iqsDevicesViewModel.filterDevices(this.status);
        this.iqsDevicesViewModel.selectItem();
    }

    public getObjectName(object_id: string) {
        return this.iqsObjectsViewModel.getObjectById(object_id) ?
            this.iqsObjectsViewModel.getObjectById(object_id).name : object_id;
    }

    private setPos(item: iqs.shell.CurrentDeviceState): void {
        if (item) {
            item.latitude = item.pos && item.pos.coordinates[1] ? item.pos.coordinates[1] : null;
            item.longitude = item.pos && item.pos.coordinates[0] ? item.pos.coordinates[0] : null;
        }
    }

    public selectItem(index: number) {
        if (this.edit == 'add' || this.edit == 'edit') {
            return;
        }

        this.iqsDevicesViewModel.selectedIndex = index;
        this.iqsDevicesViewModel.selectItem(this.iqsDevicesViewModel.selectedIndex);

        let item: iqs.shell.Device = this.collection[index];
        if (item) {
            let deviceState: iqs.shell.CurrentDeviceState = this.iqsCurrentDeviceStatesViewModel.getDeviceStateById(item.id);
            let objState = this.iqsCurrentObjectStatesViewModel.getCurrentObjectStateByDeviceId(item.id);
            if (objState && objState.id) {
                this.deviceState = _.cloneDeep(objState);
                this.deviceState['options'] = null;
                this.setPos(this.deviceState);
            } else if (deviceState && deviceState.id) {
                this.deviceState = _.cloneDeep(deviceState);
                this.setPos(this.deviceState);
            } else {
                this.deviceState = null;
            }

            async.parallel([
                (callback) => {
                    this.iqsCurrentDeviceStatesViewModel.readOne(
                        item.id,
                        (deviceState: iqs.shell.CurrentDeviceState) => {
                            callback(null, deviceState);
                        },
                        (error: any) => {
                            callback(error);
                        });
                },
                (callback) => {
                    if (item.object_id) {
                        this.iqsCurrentObjectStatesViewModel.readOne(
                            item.object_id,
                            (state: iqs.shell.ObjectState) => {
                                callback(null, state);
                            },
                            (error: any) => {
                                callback(error);
                            });
                    } else {
                        callback();
                    }

                }
            ],
                // optional callback
                (error, results) => {
                    if (error) {

                    } else {
                        if (results[1] && results[1].id) {
                            this.deviceState = _.cloneDeep(results[1]);
                            this.setPos(this.deviceState);
                        } else if (results[0] && results[0].id) {
                            this.deviceState = _.cloneDeep(results[0]);
                            this.setPos(this.deviceState);
                        }
                    }
                });
        } else {
            this.deviceState = null;
        }

        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.$rootScope.$broadcast('iqsChangeNav');
        }
    }

    // public getObject(): ObjectState {
    //     if (!this.collection[this.iqsDevicesViewModel.selectedIndex]) return null;

    //     return this.iqsCurrentObjectStatesViewModel.findByDevice(this.collection[this.iqsDevicesViewModel.selectedIndex].id);
    // }

    public get transaction(): pip.services.Transaction {
        return this.iqsDevicesViewModel.getTransaction();
    }

    public addClick() {
        this.edit = 'add';
        this.iqsDevicesViewModel.selectedIndex = null;
        this.$location.search('edit', 'add');
        this.$location.search('details', 'add');

        if (!this.pipMedia('gt-sm')) {
            this.$rootScope.$broadcast('iqsChangeNav');
        }
    }

    public deleteClick(id: string) {
        let confirmParams: pip.dialogs.ConfirmationDialogParams = {},
            device: iqs.shell.Device = this.iqsDevicesViewModel.getDeviceById(id),
            name: string = device.label || device.udi;
        confirmParams.title = this.pipTranslate.translate('DELETE_DEVICE') + name + '?';
        confirmParams.cancel = 'CANCEL';
        confirmParams.ok = 'DELETE';

        this.pipConfirmationDialog.show(confirmParams, () => {
            this.iqsDevicesViewModel.deleteDevice(
                id,
                () => {
                    this.selectItem(this.selectedIndex());
                    if (!this.pipMedia('gt-sm') && this.details) {
                        this.details = false;
                        this.$location.search('details', 'main');
                        this.$rootScope.$broadcast('iqsChangeNav');
                    }

                    this.iqsObjectsViewModel.read();
                },
                () => { });
        })
    }

    public deviceStatusActive(device: iqs.shell.Device): boolean {
        if (!device) return false;

        return device.status == iqs.shell.DeviceStatus.Active;
    }

    public activeClick(device: iqs.shell.Device) {
        device = _.cloneDeep(device);
        device.status = device.status != iqs.shell.DeviceStatus.Active ? iqs.shell.DeviceStatus.Active : iqs.shell.DeviceStatus.Inactive;
        this.iqsDevicesViewModel.updateDevice(device, (item) => {
            // this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data');
            this.iqsCurrentDeviceStatesViewModel.readOne(item.id, (deviceState: iqs.shell.CurrentDeviceState) => {
                this.deviceState = _.cloneDeep(deviceState);
                this.setPos(this.deviceState);
            });
        }, (err) => { })
    }

    public onPing() {
        if (this.selectedIndex() == -1 || !this.collection[this.selectedIndex()]) {
            return
        }
        // let currTime: Date = new Date();

        let obj: iqs.shell.Device = this.collection[this.selectedIndex()];
        let time = obj.ping_time;
        let pingParams: PingDialogParams = {
            dialogTitle: '',
            pingString: '',
            pingSuccess: '',
            pingFailed: '',
            ping: (successCallback: (result: boolean) => void, errorCallback?: (error?: any) => void) => {
                this.iqsDevicesViewModel.pingDevice(
                    obj.id,
                    (data: any) => {
                        this.iqsDevicesViewModel.readOne(
                            obj,
                            (data: iqs.shell.Device) => {
                                if (data && data.ping_time) {
                                    // let pingTime: Date = new Date(data.ping_time);
                                    // let reqTime: Date = new Date();

                                    // successCallback(currTime.getTime() < pingTime.getTime() && pingTime.getTime() < reqTime.getTime());
                                    successCallback(data.ping_time != time);
                                } else {
                                    successCallback(false);
                                }
                            });
                    },
                    (error: any) => {
                        errorCallback(error);
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
    const translateDevicePanelConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {
            'ADD_DEVICE_EMPTY': 'Trackers empty',
            'ADD_DEVICE': 'Add tracker',
            "ADMINISTRATION_DEVICES": 'Trackers',
            'ADMIN_REGISTRATE': 'Registrated',
            'ADMIN_MODEL': 'Model',
            'ADMIN_UDI': 'UDI',
            'ADMIN_LABEL': 'Label',
            'ADMIN_MISS': 'Inactive',
            'ADMIN_ACTIVE': 'Active',
            'ADMIN_WITH_OBJECT': 'Attached to object',
            'ADMIN_DETAILS': 'Details',
            'DEVICES': 'Trackers',
            'ADMIN_ACTIVE_LABEL': 'Status',
            'DEVICES_DELETE_ASSINE_OBJECT': 'Detach',
            "NEW_DEVICE": 'New tracker',
            'TYPE': 'Type',
            'LABEL': 'Label',
            'OBJECT_EMPTY_DEVICE': 'There is no attached object',
            'DEVICE_UDI': 'MAC-address',
            'DEVICE_UDI_UNKNOW': 'Unique device identifier',
            'DEVICE_UDI_PHONE': 'Phone number',
            'DEVICE_UDI_HINT': 'See it on the back of the device',
            'ADD_DEVICE_EMPTY_LOCATION': 'The location is unknown',
            'DELETE_DEVICE': 'Delete tracker ',

            'DEVICES_ADD_ASSINE_OBJECT': 'Change',
            'DEVICES_ADD_ASSINE_OBJECT_EMPTY': 'Attach object',

            'DEVICE_UDI_HINT_PHONE': 'Phone format: +xxxxxxxxxxxxx',

            'ADD_DEVICE_EMPTY1': 'The system adds Lora trackers automatically when messages are received from a registered gateway',
            'ACTIVE': 'Activate',
            'INACTIVE': 'Deactivate'
        });

        pipTranslateProvider.translations('ru', {
            'ADD_DEVICE_EMPTY': 'Зарегистрированные трекеры не найдены.',
            'ADD_DEVICE_EMPTY1': 'LoRa трекеры добавляются автоматически, при получении данных от зарегистриварованного маршрутизатора',
            'ADD_DEVICE': 'Добавить трекер вручную',
            "ADMINISTRATION_DEVICES": 'Трекеры',
            'ADMIN_REGISTRATE': 'Зарегистрирован ',
            'ADMIN_MODEL': 'Тип',
            'ADMIN_UDI': 'Системный идентификатор',
            'ADMIN_LABEL': 'Метка',
            'ADMIN_ACTIVE': 'Включен',
            'ADMIN_MISS': 'Отключен',
            'ADMIN_ACTIVE_LABEL': 'Рабочий статус',
            'ADMIN_WITH_OBJECT': 'Прикреплен к объекту',
            'ADMIN_DETAILS': 'Подробнее',
            'DEVICES': 'Трекеры',
            'DEVICES_ADD_ASSINE_OBJECT': 'Редактировать',
            'DEVICES_ADD_ASSINE_OBJECT_EMPTY': 'Прикрепить объект',
            'DEVICES_DELETE_ASSINE_OBJECT': 'Открепить',
            'ACTIVE': 'Включить',
            'INACTIVE': 'Отключить',
            "NEW_DEVICE": 'Новый трекер',
            'TYPE': 'Тип',
            'LABEL': 'Метка',
            'OBJECT_EMPTY_DEVICE': 'Прикрепленных объектов нет',
            'DEVICE_UDI': 'MAC-адрес',
            'DEVICE_UDI_UNKNOW': 'Уникальный идентификатор устройства',
            'DEVICE_UDI_PHONE': 'Номер телефона',
            'DEVICE_UDI_HINT': 'Указан на тыльной стороне устройства',
            'DEVICE_UDI_HINT_PHONE': 'Формат номера: +xxxxxxxxxxxxx',
            'ADD_DEVICE_EMPTY_LOCATION': 'Позиция неизвестна',
            'DELETE_DEVICE': 'Удалить трекер  '
        });
    }

    angular
        .module('iqsDevicesPanel', [
            'iqsDevices.ViewModel',
            'iqsDeviceObjectPanel',
            'iqsDeviceEditPanel'])
        .component('iqsDevicesPanel', {
            bindings: ConfigDevicesPanelBindings,
            templateUrl: 'config/devices/panels/DevicesPanel.html',
            controller: ConfigDevicesPanelController,
            controllerAs: '$ctrl'
        })
        .config(translateDevicePanelConfig)
})();
