declare let google: any;

import { IBeaconsViewModel } from '../../../models';

class BeaconParams {
    public item: iqs.shell.Beacon;
}

class ZoomParams {
    public zoom: number;
}

class BeaconForMap extends iqs.shell.Beacon {
    type?: string;
    latitude?: string;
    longitude?: string;
    pos?: any;
}

interface IBeaconEditPanelBindings {
    [key: string]: any;

    onBeaconSave: any;
    onBeaconCancel: any;
    onZoomChange: any;
    nameCollection: any;
    zoom: any;
    newItem: any;
    editItem: any;
    ngDisabled: any;
}

const BeaconEditPanelBindings: IBeaconEditPanelBindings = {
    // save beacon
    onBeaconSave: '&iqsSave',
    // cancel change 
    onBeaconCancel: '&iqsCancel',
    onZoomChange: '&iqsZoomChange',
    nameCollection: '<?iqsNameCollection',
    zoom: '=iqsZoom',
    //beacon for edit
    newItem: '=?iqsNewItem',
    editItem: '=?iqsEditItem',
    ngDisabled: '&?'
}

class BeaconEditPanelChanges implements ng.IOnChangesObject, IBeaconEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onBeaconSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onBeaconCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    nameCollection: ng.IChangesObject<string[]>;
    newItem: ng.IChangesObject<iqs.shell.Beacon>;
    editItem: ng.IChangesObject<iqs.shell.Beacon>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class BeaconEditPanelController implements ng.IController {
    public $onInit() { }
    public beacon: iqs.shell.Beacon;
    private mapControl: any;
    private cf: Function[] = [];
    private runWhenReady: Function[] = [];
    public mapOptions: any;
    private organizationCenter: any;
    public currentBeacon: BeaconForMap;

    public newItem: iqs.shell.Beacon;
    public editItem: iqs.shell.Beacon;
    public zoom: number;
    public onBeaconSave: (eventTempl: BeaconParams) => void;
    public onZoomChange: (value: ZoomParams) => void;
    public onBeaconCancel: () => void;
    public ngDisabled: () => boolean;
    public startPause: boolean = true;
    public section: any;
    public isQuery: boolean = false;
    public sections: any[] = [
        {
            title: 'Pan',
            type: 'pan',
            id: 0
        }, {
            title: 'POINT',
            type: 'point',
            id: 1
        }
    ];

    public error: string = '';
    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    public typeCollection: iqs.shell.TypeCollection;

    public unknownUDI: string = '';
    // EddystoneUID
    public namespaceId: string = '';
    public instanceId: string = '';
    // IBeacon and AltBeacon
    public proximityUUID: string = '';
    public major: string = '';
    public minor: string = '';

    public typeUnknown: string = iqs.shell.BeaconType.Unknown;
    public typeAltBeacon: string = iqs.shell.BeaconType.AltBeacon;
    public typeIBeacon: string = iqs.shell.BeaconType.iBeacon;
    public typeEddyStoneUdi: string = iqs.shell.BeaconType.EddyStoneUdi;

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private $timeout: ng.ITimeoutService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsBeaconsViewModel: IBeaconsViewModel,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-beacon-edit-panel');

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        this.section = 0;
        this.currentBeacon = this.beacon || new BeaconForMap();
        this.runWhenReady.push(() => {
            this.getMapOptions();
            this.typeCollection = this.iqsTypeCollectionsService.getBeaconType();
            this.startPause = false;

            this.$timeout(() => {
                this.setOrganizationCenter();
                let center: any = null;

                if (this.currentBeacon.latitude !== null && this.currentBeacon.latitude !== undefined &&
                    this.currentBeacon.longitude !== null && this.currentBeacon.longitude !== undefined) {
                    center = this.currentBeacon;
                }
                this.toCenter(center);
            }, 1000);
        });

        if (this.iqsLoading.isDone) { for(const rwr of this.runWhenReady) { rwr(); } }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { for(const rwr of this.runWhenReady) { rwr(); } }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public $onChanges(changes: BeaconEditPanelChanges): void {
        if (changes.newItem) {
            if (!_.isEqual(this.newItem, changes.newItem.previousValue)) {
                this.beacon = _.cloneDeep(this.newItem);
                this.prepare();

                return;
            }
        }

        if (changes.editItem) {
            if (!_.isEqual(this.editItem, changes.editItem.previousValue)) {
                this.beacon = _.cloneDeep(this.editItem);
                this.prepare();

                return;
            }
        }

        this.init();
    }

    private init() {
        if (this.editItem) {
            this.beacon = _.cloneDeep(this.editItem);
        } else {
            this.beacon = _.cloneDeep(this.newItem) || new iqs.shell.Beacon();
            this.beacon.center = {};
            this.beacon.center.type = 'Point';
        }

        this.prepare()
    }

    private setControlOnReady(control) {
        this.mapControl = control;
    }

    public setControl(control) {
        if (!this.iqsLoading.isDone) {
            this.runWhenReady.push(() => { this.setControlOnReady(control); });
        } else {
            this.setControlOnReady(control);
        }
    }

    private splitUDI(udi: string, type: string): void {
        if (!udi) return;

        let udis: string[] = udi.split(':');

        switch (type) {
            case iqs.shell.BeaconType.Unknown:
                this.unknownUDI = udis[0] ? udis[0] : '';
                break;
            case iqs.shell.BeaconType.AltBeacon:
                this.proximityUUID = udis[0] ? udis[0] : '';
                this.major = udis[1] ? udis[1] : '';
                this.minor = udis[2] ? udis[2] : '';
                break;
            case iqs.shell.BeaconType.iBeacon:
                this.proximityUUID = udis[0] ? udis[0] : '';
                this.major = udis[1] ? udis[1] : '';
                this.minor = udis[2] ? udis[2] : '';
                break;
            case iqs.shell.BeaconType.EddyStoneUdi:
                this.namespaceId = udis[0] ? udis[0] : '';
                this.instanceId = udis[1] ? udis[1] : '';
                break;
        }
    }

    private udiCombine(): string {
        let udi: string = null;

        switch (this.beacon.type) {
            case iqs.shell.BeaconType.Unknown:
                udi = this.unknownUDI ? this.unknownUDI : null;
                break;
            case iqs.shell.BeaconType.AltBeacon:
                if (this.proximityUUID && this.major && this.minor) {
                    udi = this.proximityUUID + ':' + this.major + ':' + this.minor;
                }
                break;
            case iqs.shell.BeaconType.iBeacon:
                if (this.proximityUUID && this.major && this.minor) {
                    udi = this.proximityUUID + ':' + this.major + ':' + this.minor;
                }
                break;
            case iqs.shell.BeaconType.EddyStoneUdi:
                if (this.namespaceId && this.instanceId) {
                    udi = this.namespaceId + ':' + this.instanceId;
                }
                break;
        }

        return udi;
    }

    private setValidity(isValid): void {
        let udi: string = null;

        switch (this.beacon.type) {
            case iqs.shell.BeaconType.Unknown:
                this.form.unknownUDI.$setValidity('verifyBeaconUdi', !isValid);
                break;
            case iqs.shell.BeaconType.AltBeacon:
                this.form.proximityUUID.$setValidity('verifyBeaconUdi', !isValid);
                this.form.major.$setValidity('verifyBeaconUdi', !isValid);
                this.form.minor.$setValidity('verifyBeaconUdi', !isValid);
                break;
            case iqs.shell.BeaconType.iBeacon:
                this.form.proximityUUID.$setValidity('verifyBeaconUdi', !isValid);
                this.form.major.$setValidity('verifyBeaconUdi', !isValid);
                this.form.minor.$setValidity('verifyBeaconUdi', !isValid);
                udi = this.proximityUUID + ':' + this.major + ':' + this.minor;
                break;
            case iqs.shell.BeaconType.EddyStoneUdi:
                this.form.namespaceId.$setValidity('verifyBeaconUdi', !isValid);
                this.form.instanceId.$setValidity('verifyBeaconUdi', !isValid);
                break;
        }

        if (isValid) {
            this.error = 'BEACON_UDI_UNIQUE_ERROR';
        } else {
            this.error = null;
        }
    }

    private prepare() {
        this.currentBeacon = _.cloneDeep(this.beacon) || new BeaconForMap();
        if (this.currentBeacon.center && this.currentBeacon.center.coordinates) {
            this.currentBeacon.latitude = this.currentBeacon.center.coordinates[1];
            this.currentBeacon.longitude = this.currentBeacon.center.coordinates[0];
            this.currentBeacon.pos = this.currentBeacon.center;
        }

        if (!this.beacon.id || !this.beacon.type) {
            this.beacon.type = iqs.shell.BeaconType.AltBeacon;
        }
        if (!this.typeCollection[this.beacon.type]) {
            this.beacon.type = iqs.shell.BeaconType.Unknown;
        }
        this.splitUDI(this.beacon.udi, this.beacon.type);
        this.currentBeacon.type = 'marker';
        this.error = null;
    }

    private getMapOptions() {
        this.mapOptions = _.cloneDeep(angular.extend(this.iqsMapConfig.organizationConfigs, {
            zoom: this.zoom,
            map: {
                mapTypeId: 'hybrid',
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false
            }
        }));
    }

    private setOrganizationCenter() {
        this.organizationCenter = _.cloneDeep(this.iqsMapConfig.organizationConfigs.center);
    }

    public clearMap() {
        this.mapControl.clearMap();
        this.currentBeacon.latitude = null;
        this.currentBeacon.longitude = null;
        this.changeType('pan');
        this.section = 0;
    }

    private changeType(type) {
        if (!this.mapControl) return;

        switch (type) {
            case 'point':
                this.mapControl.addMarker();
                break;
            case 'pan':
                this.mapControl.drawingManagerOptions.drawingMode = null;
                break;
        }
    }

    public selectSection(sectionIndex) {
        this.error = '';
        this.section = sectionIndex;
        const section = this.sections[this.section];
        this.changeType(this.sections[this.section].type);
    }

    public onZoomIn() {
        if (!this.mapControl) return;

        const curZ = this.mapControl.map.control.getGMap().getZoom() + 1;
        this.mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public onZoomOut() {
        if (!this.mapControl) return;

        const curZ = this.mapControl.map.control.getGMap().getZoom() - 1;
        this.mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public toCenter(center?: any) {
        const toCenter = center ? center : this.organizationCenter;
        if (this.mapControl) this.mapControl.map.control.getGMap().panTo(new google.maps.LatLng(
            toCenter.latitude,
            toCenter.longitude
        ));
    }

    public onChangeCenter() {
        this.error = null;
        if (this.currentBeacon.latitude !== null && this.currentBeacon.latitude !== undefined &&
            this.currentBeacon.longitude !== null && this.currentBeacon.longitude !== undefined) {

            this.$timeout(() => {
                let a = _.cloneDeep(this.currentBeacon)
                a.pos = {
                    coordinates: [a.longitude, a.latitude],
                    type: 'Point'
                }

                this.currentBeacon = a;
                this.organizationCenter = {
                    latitude: this.currentBeacon.latitude,
                    longitude: this.currentBeacon.longitude
                }

                this.selectSection(1);
                if (!this.iqsLoading.isDone) return;
                this.toCenter(this.organizationCenter);
            }, 0)
        }
    }

    public onChangeUdi() {
        this.error = null;
        let udi: string = this.udiCombine();
        if (!udi) { return }

        this.isQuery = true;
        this.iqsBeaconsViewModel.verifyBeaconUdi(udi,
            (data) => {
                if (this.form) {
                    if (!data || data == this.beacon.id) {
                        this.setValidity(false);
                    } else {
                        this.setValidity(true);
                    }
                }
                this.isQuery = false;
            },
            (err) => {
                this.isQuery = false;
            });

    }

    public onEdit(overlay, type, path, center, radius) {
        if (center.lat) {
            this.currentBeacon.latitude = center.lat();
            this.currentBeacon.longitude = center.lng();
            this.section = 0;
            this.error = null;
            this.$timeout(() => {
            }, 0)
        }
    }

    public onSaveClick(): void {
        if (this.isQuery) return;
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.onBeaconSave) {
            if ((this.currentBeacon.latitude) &&
                (this.currentBeacon.longitude)) {
                let center = {
                    coordinates: [],
                    type: 'Point'
                };
                center.coordinates[1] = _.clone(this.currentBeacon.latitude ? this.currentBeacon.latitude : this.currentBeacon.center.coordinates[1]);
                center.coordinates[0] = _.clone(this.currentBeacon.longitude ? this.currentBeacon.longitude : this.currentBeacon.center.coordinates[0]);
                this.beacon.center = center;

                this.beacon.udi = this.udiCombine();

                this.onBeaconSave({ item: this.beacon });
            }

            this.pipFormErrors.resetFormErrors(this.form, false);
        }
    }

    public onCancelClick(): void {
        if (this.onBeaconCancel) {
            this.onBeaconCancel();
        }
    }
}

(() => {
    angular
        .module('iqsBeaconEditPanel', ['ValidateDirectives'])
        .component('iqsBeaconEditPanel', {
            bindings: BeaconEditPanelBindings,
            templateUrl: 'config/beacons/panels/BeaconEditPanel.html',
            controller: BeaconEditPanelController,
            controllerAs: '$ctrl'
        })
})();
