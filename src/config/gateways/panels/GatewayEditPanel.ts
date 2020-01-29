import { IGatewaysViewModel } from '../../../models/gateways/IGatewaysViewModel';

class GatewayParams {
    public item: iqs.shell.Gateway;
}

interface IGatewayEditPanelBindings {
    [key: string]: any;

    onGatewaylSave: any;
    onGatewaylCancel: any;
    newItem: any;
    editItem: any;
    ngDisabled: any;
}

const GatewayEditPanelBindings: IGatewayEditPanelBindings = {
    // change operational event
    onGatewaylSave: '&iqsSave',
    // add operational event
    onGatewaylCancel: '&iqsCancel',
    // event template for edit
    newItem: '=?iqsNewItem',
    editItem: '=?iqsEditItem',
    ngDisabled: '&?'
}

class GatewayEditPanelChanges implements ng.IOnChangesObject, IGatewayEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onGatewaylSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onGatewaylCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    newItem: ng.IChangesObject<iqs.shell.Gateway>;
    editItem: ng.IChangesObject<iqs.shell.Gateway>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class GatewayEditPanelController implements ng.IController {
    public $onInit() { }
    public gateway: iqs.shell.Gateway;

    public form: any;
    public touchedErrorsWithHint: Function;

    public newItem: iqs.shell.Gateway;
    public editItem: iqs.shell.Gateway;
    public onGatewaylSave: (eventTempl: GatewayParams) => void;
    public onGatewaylCancel: () => void;
    public ngDisabled: () => boolean;

    public gatewayModelCollection: iqs.shell.TypeCollection;

    public isQuery: boolean = false;

    private cf: Function[] = [];

    constructor(
        private $element: JQuery,
        private $scope: ng.IScope,
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsGatewaysViewModel: IGatewaysViewModel,
        private $http: ng.IHttpService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-gateways-edit-panel');

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        const runWhenReady = () => {
            this.gatewayModelCollection = this.iqsTypeCollectionsService.getGatewayModels();
            this.init();
        };
    
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { runWhenReady(); }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: GatewayEditPanelChanges): void {
        let change: boolean = false;

        if (changes.newItem) {
            if (!_.isEqual(this.newItem, changes.newItem.previousValue)) {
                this.init();

                return;
            }
        }

        if (changes.editItem) {
            if (!_.isEqual(this.editItem, changes.editItem.previousValue)) {
                this.init();

                return;
            }
        }

        this.init();
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public onChangeUdi() {
        if (!this.gateway.udi) { return }

        this.isQuery = true;
        this.iqsGatewaysViewModel.verifyGatewayUdi(this.gateway.udi,
            (data) => {
                if (this.form && this.form.udi) {
                    if (!data || data == this.gateway.id) {
                        this.form.udi.$setValidity('verifyGatewayUdi', true);
                    } else {
                        this.form.udi.$setValidity('verifyGatewayUdi', false);
                    }
                }
                this.isQuery = false;
            },
            (err) => {
                // this.error = err;
                this.isQuery = false;
            });

    }

    private init() {
        if (this.editItem) {
            this.gateway = _.cloneDeep(this.editItem);
        } else {
            this.gateway = _.cloneDeep(this.newItem);
            this.gateway.model = iqs.shell.GatewayModel.Unknown;

        }
    }

    public onSaveClick(): void {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.onGatewaylSave) {
            this.pipFormErrors.resetFormErrors(this.form, false);
            this.onGatewaylSave({ item: this.gateway });
        }
    }

    public onCancelClick(): void {
        if (this.onGatewaylCancel) {
            this.onGatewaylCancel();
        }
    }
}

(() => {
    angular
        .module('iqsGatewayEditPanel', [])
        .component('iqsGatewayEditPanel', {
            bindings: GatewayEditPanelBindings,
            templateUrl: 'config/gateways/panels/GatewayEditPanel.html',
            controller: GatewayEditPanelController,
            controllerAs: '$ctrl'
        })
})();
