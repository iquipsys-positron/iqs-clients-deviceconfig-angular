export class DevicesObjectsDialogController implements ng.IController {
    public $onInit() { }
    public theme;
    public defaultCollection: string[];
    public searchedCollection: string[];
    public search: string;
    public objects: iqs.shell.SearchResult[];
    public showFreeDevice: boolean;

    constructor(
        private $mdDialog: angular.material.IDialogService,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        public selected: any,
        public dialogTitle: string,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        showFree: boolean
    ) {
        "ngInject";

        this.dialogTitle = this.dialogTitle || 'DEVICES_OBJECTS_DIALOG_TITLE';
        this.theme = $rootScope[pip.themes.ThemeRootVar];
        this.search = '';
        this.showFreeDevice = !!showFree;

        let objectType: string = iqs.shell.SearchObjectTypes.ControlObject;
        this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
        this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(objectType);
        this.onSearchResult(this.search);
    }

    public onSearchResult(query: string) {
        this.search = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.ControlObject,
            (data) => {
                this.objects = data;
                if (this.showFreeDevice) {
                    this.objects = _.filter(this.objects, (item: any) => {
                        return !item.item.device_id;
                    });
                }
            });

    }

    public onCanselSearch() {
        this.search = '';
        this.onSearchResult(this.search);
    }

    public selectItem(index) {
        if (this.objects[index] && this.objects[index].item) {
            this.selected = this.objects[index].item;
        }
    }

    public change() {
        this.$mdDialog.hide(this.selected);
    }
    public cancel() {
        this.$mdDialog.cancel();
    }


}

const translateConfig = function (pipTranslateProvider) {
    // Set translation strings for the module
    pipTranslateProvider.translations('en', {
        'DEVICES_OBJECTS_DIALOG_TITLE': 'Attach object',
        'DEVICES_OBJECTS_DIALOG_OK': 'Attach',
        'DEVICES_OBJECTS_DIALOG_EMPTY': 'No free objects found'
    });

    pipTranslateProvider.translations('ru', {
        'DEVICES_OBJECTS_DIALOG_TITLE': 'Прикрепить объект',
        'DEVICES_OBJECTS_DIALOG_OK': 'Прикрепить',
        'DEVICES_OBJECTS_DIALOG_EMPTY': 'Свободные объекты не найдены'
    });
}

angular
    .module('iqsDevicesObjectsDialog', [
        'ngMaterial'
    ])
    .controller('iqsDevicesObjectsDialogController', DevicesObjectsDialogController)
    .config(translateConfig);

import "./DevicesObjectsDialogService"