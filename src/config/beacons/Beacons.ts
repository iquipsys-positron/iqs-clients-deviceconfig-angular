import { IBeaconsSaveService } from './IBeaconsSaveService';
import { IBeaconsViewModel } from '../../models';

export const ConfigBeaconsStateName: string = 'app.beacons';

class ConfigBeaconsController implements ng.IController {
    public $onInit() { }
    private mediaSizeGtSm: boolean;
    public details: boolean;
    public searchCriteria: string = '';
    public searchQuery: string = '';
    public currentState: string;
    public new: iqs.shell.Beacon;
    public edit: iqs.shell.Beacon;
    public accessConfig: any;
    public mapZoom: number;
    public nameCollection: string[];
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        private pipNavService: pip.nav.INavService,
        private pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsBeaconsViewModel: IBeaconsViewModel,
        private iqsBeaconsSaveService: IBeaconsSaveService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.restoreState();
        this.mediaSizeGtSm = this.pipMedia('gt-sm');
        if (!this.pipMedia('gt-sm')) {
            if (this.currentState === iqs.shell.States.Add || this.currentState === iqs.shell.States.Edit) {
                this.details = true;
            } else {
                this.details = $location.search().details == 'details' ? true : false;
            }
        } else {
            this.details = false;
            this.$location.search('details', 'main');
        }

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (this.mediaSizeGtSm !== this.pipMedia('gt-sm')) {
                this.mediaSizeGtSm = this.pipMedia('gt-sm');

                if (this.pipMedia('gt-sm')) {
                    this.details = false;
                } else {
                    if (this.currentState === iqs.shell.States.Add || this.currentState === iqs.shell.States.Edit) {
                        this.details = true;
                    }
                }
                this.appHeader();
            }
        }));

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.iqsBeaconsViewModel.filter = null;
            this.iqsBeaconsViewModel.isSort = true;
            this.iqsBeaconsViewModel.selectAllow = true;
            this.iqsBeaconsViewModel.reload(() => {
                let collection = this.iqsBeaconsViewModel.getCollection(this.searchCriteria);
                this.isPreLoading = false;
            });
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));

        this.appHeader();

        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
    }

    public $onDestroy() {
        this.saveCurrentState();
        this.iqsBeaconsViewModel.selectAllow = false;
        for (const f of this.cf) { f(); }
    }

    private saveCurrentState() {
        this.iqsBeaconsSaveService.beaconId = this.collection && this.collection.length > 0 && this.selectedIndex > -1 ? this.collection[this.selectedIndex].id : null;
        this.iqsBeaconsSaveService.currState = this.currentState;
        this.iqsBeaconsSaveService.search = this.searchCriteria;
        this.iqsBeaconsSaveService.beacon = this.new ? this.new : this.edit;
        this.iqsBeaconsSaveService.zoom = this.mapZoom;
    }

    private restoreState() {
        this.searchQuery = this.iqsBeaconsSaveService.search ? this.iqsBeaconsSaveService.search : this.$location.search()['search'] || '';
        this.searchCriteria = this.searchQuery;
        if (!this.$location.search()['beacon_id'] && this.iqsBeaconsSaveService.beaconId) {
            this.$location.search('beacon_id', this.iqsBeaconsSaveService.beaconId);
        }
        this.currentState = this.iqsBeaconsSaveService.currState ? this.iqsBeaconsSaveService.currState : null;
        this.currentState = this.currentState == iqs.shell.States.Add || this.currentState == iqs.shell.States.Edit ? null : this.currentState;
        if (this.currentState === iqs.shell.States.Add) {
            this.new = this.iqsBeaconsSaveService.beacon;
            this.edit = null;
        } else if (this.currentState === iqs.shell.States.Edit) {
            this.new = null;
            if (this.iqsBeaconsSaveService.beacon) {
                this.edit = this.iqsBeaconsSaveService.beacon;
            } else {
                this.edit = null;
                this.currentState = null;
            }

            this.new = null;
            this.edit = this.iqsBeaconsSaveService.beacon;
        }
        this.mapZoom = this.iqsBeaconsSaveService.zoom;
    }

    private toMainFromDetails(): void {
        this.$location.search('details', 'main');
        this.details = false;
        this.onCancel();
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.appbar.parts = {
            'icon': true,
            'actions': 'primary',
            'menu': true,
            'title': 'breadcrumb',
            'organizations': this.pipMedia('gt-sm')
        };
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm') && this.details) {
            const detailsTitle = this.currentState === iqs.shell.States.Add
                ? 'BEACON_DETAILS_NEW'
                : this.currentState === iqs.shell.States.Edit
                    ? 'BEACON_DETAILS_EDIT'
                    : 'BEACON_DETAILS';

            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: "BEACONS_TITLE", click: () => {
                        this.toMainFromDetails();
                    }, subActions: []
                },
                <pip.nav.BreadcrumbItem>{
                    title: detailsTitle, click: () => { }, subActions: []
                }
            ];
            this.pipNavService.icon.showBack(() => {
                this.toMainFromDetails();
            });
        } else {
            this.pipNavService.breadcrumb.text = 'BEACONS_TITLE';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
    }

    private focusedNewButton() {
        this.pipScroll.scrollTo('.pip-list-container', '#new-item', 300);
    }


    public selectItem(index: number) {
        if (this.state != iqs.shell.States.Data) { return };

        if (index !== undefined && index !== null) this.iqsBeaconsViewModel.selectItem(index);
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
    }

    public get selectedIndex() {
        return this.state != iqs.shell.States.Add ? this.iqsBeaconsViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

    }

    public get collection(): iqs.shell.Beacon[] {
        return this.iqsBeaconsViewModel.getCollection(this.searchCriteria);
    }

    public get state(): string {
        // return 'empty'
        return this.currentState ? this.currentState : this.iqsBeaconsViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsBeaconsViewModel.getTransaction();
    }

    public get searchedCollection(): string[] {
        return this.iqsBeaconsViewModel.searchedCollection;
    }

    public reload(): void {
        this.iqsBeaconsViewModel.reload();
    }

    public onRetry() {
        this.$window.history.back();
    }

    private prepareNameCollection() {
        this.nameCollection = [];
        _.each(this.iqsBeaconsViewModel.getCollection(), (item: iqs.shell.Beacon) => {
            if (this.edit && this.edit.id && this.edit.id != item.id || !this.edit || !this.edit.id) {
                if (item.label) this.nameCollection.push(item.label);
            }
        });
    }
    public onEdit() {
        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            this.edit = _.cloneDeep(this.collection[this.selectedIndex]);
            this.new = null;
            this.prepareNameCollection();
            this.currentState = iqs.shell.States.Edit;
        }
    }

    public onDelete() {
        if (this.transaction.busy()) {
            return;
        }

        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            let name = this.collection[this.selectedIndex].label || this.collection[this.selectedIndex].udi;
            this.pipConfirmationDialog.show(
                {
                    event: null,
                    title: this.pipTranslate.translate('BEACON_DELETE_CONFIRMATION_TITLE') + ' "' + name + '"?',
                    ok: 'CONFIRM_DELETE',
                    cancel: 'CONFIRM_CANCEL'
                },
                () => {
                    this.onDeleteItem(this.collection[this.selectedIndex]);
                },
                () => {
                    console.log('You disagreed');
                }
            );
        }
    }

    public onSearchResult(searchQuery: string): void {
        this.searchCriteria = searchQuery;
        this.$location.search('search', this.searchCriteria);
        if (this.state == iqs.shell.States.Empty) {
            this.iqsBeaconsViewModel.getCollection(this.searchCriteria);
        }
    }

    public onCanselSearch() {
        this.searchCriteria = '';
        this.searchQuery = '';
        this.$location.search('search', this.searchCriteria);
        if (this.state == iqs.shell.States.Empty) {
            this.iqsBeaconsViewModel.getCollection(this.searchCriteria);
        }
    }

    public onAdd() {
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }

        this.new = new iqs.shell.Beacon();
        this.edit = null;
        this.prepareNameCollection();
        this.currentState = iqs.shell.States.Add;
        if (this.pipMedia('gt-sm')) {
            this.focusedNewButton();
        }
    }

    public onZoomChange(zoom: number) {
        this.mapZoom = zoom;
    }

    public onSave(item: iqs.shell.Beacon): void {
        if (this.transaction.busy() || !item) {
            return;
        }

        if (this.currentState == iqs.shell.States.Add) {
            item.org_id = this.iqsOrganization.orgId;
            this.iqsBeaconsViewModel.create(
                item,
                (data: iqs.shell.Beacon) => {
                    this.currentState = null
                    this.new = null;
                    this.searchCriteria = '';
                    if (this.state == iqs.shell.States.Empty) {
                        this.iqsBeaconsViewModel.getCollection(this.searchCriteria);
                    }
                },
                (error: any) => { }
            );
        } else if (this.currentState == iqs.shell.States.Edit) {
            this.iqsBeaconsViewModel.updateBeaconById(
                item.id,
                item,
                (data: iqs.shell.Beacon) => {
                    this.currentState = null
                    this.edit = null;
                },
                (error: any) => { }
            );
        }
    }

    public onCancel() {
        this.details = this.currentState == iqs.shell.States.Add ? false : this.details;
        this.currentState = null;
        this.new = null;
        this.edit = null;
        this.appHeader();
    }

    public onDeleteItem(item: iqs.shell.Beacon) {
        if (this.transaction.busy()) {
            return;
        }

        if (item && item.id) {
            this.iqsBeaconsViewModel.deleteBeaconById(
                item.id,
                () => {
                    this.details = false;
                    this.$location.search('details', 'main');
                    this.appHeader();
                    // todo toast deleted
                },
                (error: any) => { }
            );
        }
    }
}

function configureConfigBeaconsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigBeaconsStateName, {
            url: '/beacons?beacon_id&search&details',
            controller: ConfigBeaconsController,
            reloadOnSearch: false,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/beacons/Beacons.html'
        });
}

function configureConfigBeaconsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addBeacon: iqs.shell.AccessRole.manager,
        editBeacon: iqs.shell.AccessRole.manager,
        deleteBeacon: iqs.shell.AccessRole.manager
    }

    iqsAccessConfigProvider.registerStateAccess(ConfigBeaconsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigBeaconsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigBeacons', [
            'pipNav', 'iqsBeacons.ViewModel',
            'iqsZoomButtonsPanel',
            'iqsBeacons.SaveService',


            'iqsAccessConfig',
            'iqsBeaconPanel',
            'iqsBeaconEmptyPanel',
            'iqsBeaconEditPanel',

            'iqsGlobalSearch'
        ])
        .config(configureConfigBeaconsRoute)
        .config(configureConfigBeaconsAccess);
})();
