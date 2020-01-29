class ZoomButtonsPanelController implements ng.IController {

    public $onInit() { }

    public zoomIn: Function;
    public zoomOut: Function;

    constructor(
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $rootScope: any,
        private iqsMapConfig: iqs.shell.IMapService
    ) {
        "ngInject";

    }

    public onZoomIn() {
        if (this.zoomIn) this.zoomIn();
    }

    public onZoomOut() {
        if (this.zoomIn) this.zoomOut();
    }

}

(() => {

    function declareZoomButtonsPanelTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            ZOOM_IN: 'Zoom in',
            ZOOM_OUT: 'Zoom out',
        });
        pipTranslateProvider.translations('ru', {
            ZOOM_IN: 'Уменьшить масштаб',
            ZOOM_OUT: 'Увеличить масштаб',
        });
    }

    angular
        .module('iqsZoomButtonsPanel', [])
        .component('iqsZoomButtonsPanel', {
            bindings: {
                zoomIn: '&?iqsZoomIn',
                zoomOut: '&?iqsZoomOut'
            },
            templateUrl: 'common/panels/map/zoom_buttons/ZoomButtonsPanel.html',
            controller: ZoomButtonsPanelController,
            controllerAs: '$ctrl'
        })
        .config(declareZoomButtonsPanelTranslateResources);
})();
