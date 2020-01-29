import { IPingDialogService, PingDialogParams, PingDialogResult } from './IPingDialogService';

class PingDialogService implements IPingDialogService {
    public _mdDialog: angular.material.IDialogService;

    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }

    public show(params: PingDialogParams, successCallback?: (data?: PingDialogResult) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'common/dialogs/ping_dialog/PingDialog.html',
            controller: 'iqsPingDialogController',
            controllerAs: '$ctrl',
            locals: { params: params },
            bindToController: true,
            clickOutsideToClose: true
        })
            .then(
                (data: PingDialogResult) => {
                    if (successCallback) {
                        successCallback(data);
                    }
                },
                () => {
                    if (cancelCallback) {
                        cancelCallback();
                    }
                }
            );
    }

}

angular
    .module('iqsPingDialog')
    .service('iqsPingDialog', PingDialogService);