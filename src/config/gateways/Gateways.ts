import { IGatewaysSaveService } from './IGatewaysSaveService';
import { IGatewaysViewModel } from '../../models';

export const ConfigGatewaysStateName: string = 'app.gateways';

class GatewaysController implements ng.IController {
    public $onInit() { }
    private cleanUpFunc: Function;
    private cf: Function[] = [];
    private mediaSizeGtSm: boolean;
    public gatewayModelCollection: iqs.shell.TypeCollection;
    public details: boolean;
    public searchCriteria: string = '';
    public searchQuery: string = '';
    public currentState: string;
    public new: iqs.shell.Gateway;
    public edit: iqs.shell.Gateway;
    public accessConfig: any;
    public isPreLoading: boolean = true;

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        $rootScope: ng.IRootScopeService,
        private pipNavService: pip.nav.INavService,
        public pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private pipTranslate: pip.services.ITranslateService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsGatewaysViewModel: IGatewaysViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsGatewaysSaveService: IGatewaysSaveService,
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
            this.gatewayModelCollection = this.iqsTypeCollectionsService.getGatewayModels();
            this.iqsGatewaysViewModel.filter = null;
            this.iqsGatewaysViewModel.isSort = true;
            this.iqsGatewaysViewModel.reload(() => {
                let collection = this.iqsGatewaysViewModel.getCollection(this.searchCriteria);
                this.isPreLoading = false;
            });
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { runWhenReady(); }));

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
    }

    public $onDestroy() {
        this.saveCurrentState();
        for (const f of this.cf) { f(); }
    }

    private saveCurrentState() {
        this.iqsGatewaysSaveService.gatewayId = this.collection && this.collection.length > 0 && this.selectedIndex > -1 ? this.collection[this.selectedIndex].id : null;
        this.iqsGatewaysSaveService.currState = this.currentState;
        this.iqsGatewaysSaveService.search = this.searchCriteria;
        this.iqsGatewaysSaveService.gateway = this.new ? this.new : this.edit;
    }

    private restoreState() {
        this.searchQuery = this.iqsGatewaysSaveService.search ? this.iqsGatewaysSaveService.search : this.$location.search()['search'] || '';
        this.searchCriteria = this.searchQuery;
        if (!this.$location.search()['gateway_id'] && this.iqsGatewaysSaveService.gatewayId) {
            this.$location.search('gateway_id', this.iqsGatewaysSaveService.gatewayId);
        }
        this.currentState = this.iqsGatewaysSaveService.currState ? this.iqsGatewaysSaveService.currState : null;
        this.currentState = this.currentState == iqs.shell.States.Add || this.currentState == iqs.shell.States.Edit ? null : this.currentState;
        if (this.currentState === iqs.shell.States.Add) {
            this.new = this.iqsGatewaysSaveService.gateway;
            this.edit = null;
        } else if (this.currentState === iqs.shell.States.Edit) {
            this.new = null;
            if (this.iqsGatewaysSaveService.gateway) {
                this.edit = this.iqsGatewaysSaveService.gateway;
            } else {
                this.edit = null;
                this.currentState = null;
            }
        }
    }

    private toMainFromDetails(): void {
        this.$location.search('details', 'main');
        this.details = false;
        this.onCancel();
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm') && this.details) {
            const detailsTitle = this.currentState === iqs.shell.States.Add
                ? 'GATEWAYS_DETAILS_NEW'
                : this.currentState === iqs.shell.States.Edit
                    ? 'GATEWAYS_DETAILS_EDIT'
                    : 'GATEWAYS_DETAILS';

            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: "GATEWAYS", click: () => {
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
            this.pipNavService.breadcrumb.text = 'GATEWAYS';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
    }

    private focusedNewButton() {
        this.pipScroll.scrollTo('.pip-list-container', '#new-item', 300);
    }

    public selectItem(index: number) {
        if (this.state != iqs.shell.States.Data) { return };

        if (index !== undefined && index !== null) this.iqsGatewaysViewModel.selectItem(index);

        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
    }

    public get selectedIndex() {
        return this.state != iqs.shell.States.Add ? this.iqsGatewaysViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

    }

    public get collection(): iqs.shell.Gateway[] {
        return this.iqsGatewaysViewModel.getCollection(this.searchCriteria);
    }

    public get state(): string {
        return this.currentState ? this.currentState : this.iqsGatewaysViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsGatewaysViewModel.getTransaction();
    }

    public get searchedCollection(): string[] {
        return this.iqsGatewaysViewModel.searchedCollection;
    }

    public reload(): void {
        this.iqsGatewaysViewModel.reload();
    }

    public onRetry() {
        this.$window.history.back();
    }

    public getStats(): void {
        if (this.selectedIndex == -1 || !this.collection[this.selectedIndex]) {
            return
        }

        this.transaction.begin('GET_GATEWAY_STATS');
        this.iqsGatewaysViewModel.statsGateway(
            this.collection[this.selectedIndex].id,
            (data: any) => {
                this.iqsGatewaysViewModel.readOne(this.collection[this.selectedIndex].id,
                    (data: iqs.shell.Gateway) => {
                        this.transaction.end();
                    },
                    (error: any) => {
                        this.transaction.end(error);
                    });
            },
            (error: any) => {
                this.transaction.end(error);
            });
    }

    public onPing(successCallback: (result: boolean) => void, errorCallback?: (error?: any) => void): void {
        if (this.selectedIndex == -1 || !this.collection[this.selectedIndex]) {
            return
        }
        // let currTime: Date = new Date();
        let time = this.collection[this.selectedIndex].ping_time;
        this.iqsGatewaysViewModel.pingGateway(
            this.collection[this.selectedIndex].id,
            (data: any) => {
                this.iqsGatewaysViewModel.readOne(this.collection[this.selectedIndex].id,
                    (data: iqs.shell.Gateway) => {
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

    public onEdit() {
        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            this.edit = _.cloneDeep(this.collection[this.selectedIndex]);
            this.new = null;
            this.currentState = iqs.shell.States.Edit;
        }
    }

    public onDelete() {
        if (this.transaction.busy()) {
            return;
        }

        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            this.pipConfirmationDialog.show(
                {
                    event: null,
                    title: this.pipTranslate.translate('GATEWAYS_DELETE_CONFIRMATION_TITLE') + ' "' + this.collection[this.selectedIndex].udi + '"?',
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
            this.iqsGatewaysViewModel.getCollection(this.searchCriteria);
        }
    }

    public onCanselSearch() {
        this.searchCriteria = '';
        this.searchQuery = '';
        this.$location.search('search', this.searchCriteria);
        if (this.state == iqs.shell.States.Empty) {
            this.iqsGatewaysViewModel.getCollection(this.searchCriteria);
        }
    }

    public onAdd() {
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }

        this.new = new iqs.shell.Gateway();
        this.edit = null;
        this.currentState = iqs.shell.States.Add;
        if (this.pipMedia('gt-sm')) {
            this.focusedNewButton();
        }
    }

    public onSave(item: iqs.shell.Gateway): void {
        if (this.transaction.busy() || !item) {
            return;
        }

        if (this.currentState == iqs.shell.States.Add) {
            item.org_id = this.iqsOrganization.orgId;
            this.iqsGatewaysViewModel.create(
                item,
                (data: iqs.shell.Gateway) => {
                    this.currentState = null
                    this.new = null;
                    this.searchCriteria = '';
                    if (this.state == iqs.shell.States.Empty) {
                        this.iqsGatewaysViewModel.getCollection(this.searchCriteria);
                    }
                },
                (error: any) => { }
            );
        } else if (this.currentState == iqs.shell.States.Edit) {
            this.iqsGatewaysViewModel.updateGatewayById(
                item.id,
                item,
                (data: iqs.shell.Gateway) => {
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

    public onDeleteItem(item: iqs.shell.Gateway) {
        if (this.transaction.busy()) {
            return;
        }

        if (item && item.id) {
            this.iqsGatewaysViewModel.deleteGatewayById(
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

function configureGatewaysRoute(
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGatewaysStateName, {
            url: '/gateways?gateway_id&search&details',
            controller: GatewaysController,
            reloadOnSearch: false,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/gateways/Gateways.html'
        });
}

function configureGatewaysAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {
        addGateway: iqs.shell.AccessRole.admin,
        editGateway: iqs.shell.AccessRole.admin,
        deleteGateway: iqs.shell.AccessRole.admin,
        pingGateway: iqs.shell.AccessRole.admin,
        statGateway: iqs.shell.AccessRole.admin
    }

    iqsAccessConfigProvider.registerStateAccess(ConfigGatewaysStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGatewaysStateName, accessConfig);
}

angular
    .module('iqsConfigGateways', [
        'pipNav',

        'iqsGateways.ViewModel',
        'iqsGatewayPanel',
        'iqsGatewayEmptyPanel',
        'iqsGatewayEditPanel',
        'iqsGateways.SaveService',

        'iqsGlobalSearch',
        'iqsPingDialog'
    ])
    .config(configureGatewaysRoute)
    .config(configureGatewaysAccess);