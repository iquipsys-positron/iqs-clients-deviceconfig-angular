import { ZoomParams } from '../../../common';

declare var google;

interface IBeaconPanelBindings {
    [key: string]: any;

    onBeaconEdit: any;
    onBeaconDelete: any;
    onZoomChange: any;
    zoom: any;
    item: any;
    ngDisabled: any;
}

const BeaconPanelBindings: IBeaconPanelBindings = {
    // change beacon
    onBeaconEdit: '&iqsEdit',
    // add beacon
    onBeaconDelete: '&iqsDelete',
    onZoomChange: '&iqsZoomChange',
    zoom: '=iqsZoom',
    // beacon
    item: '<?iqsBeaconItem',
    ngDisabled: '&?'
}

class BeaconPanelChanges implements ng.IOnChangesObject, IBeaconPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onBeaconEdit: ng.IChangesObject<() => ng.IPromise<void>>;
    onBeaconDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    item: ng.IChangesObject<iqs.shell.Beacon>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class BeaconPanelController implements ng.IController {
    public $onInit() { }

    private mapControl: any;
    public mapOptions: any;
    private organizationCenter: any;
    private currBeaconMap: any;
    public accessConfig: any;
    private cf: Function[] = [];
    private runWhenReady: Function[] = [];
    public currBeacon: any;
    public item: iqs.shell.Beacon;
    public zoom: number;
    public onBeaconEdit: () => void;
    public onZoomChange: (value: ZoomParams) => void;
    public onBeaconDelete: () => void;
    public ngDisabled: () => boolean;
    public typeCollection: iqs.shell.TypeCollection;

    private markerOptions: any = {
        icon: {
            path: 0,
            scale: 4,
            strokeWeight: 8,
            fillColor: '#fbd93e',
            strokeColor: '#fbd93e',
            strokeOpacity: 0.9
        }
    };

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-beacon-panel');
        this.accessConfig = iqsAccessConfig.getStateConfigure().access;
        this.runWhenReady.push(() => {
            this.typeCollection = this.iqsTypeCollectionsService.getBeaconType();
            this.prepare();
            this.getMapOptions();
            this.$timeout(() => {
                this.setOrganizationCenter();
                this.toCenter();
            }, 1000);
        });

        if (this.iqsLoading.isDone) { for(const rwr of this.runWhenReady) { rwr(); } }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { for(const rwr of this.runWhenReady) { rwr(); } }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private setControlOnReady(control) {
        this.mapControl = control;
        if (this.item) {
            this.$timeout(() => {
                this.createBeaconPoint(this.item);
            }, 300);
        }
    }

    public setControl(control) {
        if (!this.iqsLoading.isDone) {
            this.runWhenReady.push(() => { this.setControlOnReady(control); });
        } else {
            this.setControlOnReady(control);
        }
    }

    public getTypeTitle(type: string): string {
        let typeeObj: iqs.shell.TypeCollectionItem = this.typeCollection[type];

        if (!typeeObj) {
            return this.typeCollection[iqs.shell.BeaconType.Unknown].title
        } else {
            return typeeObj.title;
        }
    }

    private createBeaconPoint(beacon, isEditable = false) {
        if (this.currBeaconMap && this.currBeaconMap.setMap) this.currBeaconMap.setMap(null);

        if (beacon && beacon.center && beacon.center.coordinates) {
            const center = new google.maps.LatLng(beacon.center.coordinates[1], beacon.center.coordinates[0])

            this.currBeaconMap = new google.maps.Marker(angular.extend(this.markerOptions, {
                position: center,
                draggable: isEditable,
                editable: isEditable
            }));

            this.currBeacon = {
                id: beacon.id || '0',
                latitude: center.lat(),
                longitude: center.lng(),
                pos: {
                    coordinates: []
                },
                icon: this.markerOptions.icon
            };

            this.currBeacon.pos.coordinates[1] = center.lat();
            this.currBeacon.pos.coordinates[0] = center.lng();
            if (this.mapControl) {
                this.currBeaconMap.setMap(this.mapControl.map.control.getGMap());
                this.mapControl.map.control.getGMap().panTo(center);
            }
        } else {
            this.currBeacon = null;
        }
    }

    private prepare() {
        if (!this.item || !this.iqsLoading.isDone) return;

        this.createBeaconPoint(this.item);
    }

    private getMapOptions() {
        this.mapOptions = angular.extend(this.iqsMapConfig.organizationConfigs, {
            zoom: this.zoom,
            map: {
                mapTypeId: 'hybrid',
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true
            }
        });
    }

    private setOrganizationCenter() {
        this.organizationCenter = _.cloneDeep(this.mapOptions.center);
    }

    public $onChanges(changes: BeaconPanelChanges): void {
        if (changes.item && changes.item.currentValue) {
            this.item = changes.item.currentValue;

            this.prepare();
        }
    }

    public onEdit(item: iqs.shell.Beacon): void {
        if (this.onBeaconEdit) {
            this.onBeaconEdit();
        }
    }

    public onDelete(item: iqs.shell.Beacon): void {
        if (this.onBeaconDelete) {
            this.onBeaconDelete();
        }
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

    public toCenter() {
        if (this.mapControl) this.mapControl.map.control.getGMap().panTo(new google.maps.LatLng(
            this.organizationCenter.latitude,
            this.organizationCenter.longitude
        ));
    }

}

(() => {
    angular
        .module('iqsBeaconPanel', ['iqsIncidents.Panel.Map'])
        .component('iqsBeaconPanel', {
            bindings: BeaconPanelBindings,
            templateUrl: 'config/beacons/panels/BeaconPanel.html',
            controller: BeaconPanelController,
            controllerAs: '$ctrl'
        })
})();
