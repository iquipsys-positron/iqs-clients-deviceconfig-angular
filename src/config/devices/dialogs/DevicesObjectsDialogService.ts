import { IDevicesObjectsDialogService } from './IDevicesObjectsDialogService';

class DevicesObjectsDialogService implements IDevicesObjectsDialogService {
    public _mdDialog: angular.material.IDialogService;

    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }


    public show(params, successCallback?: (data?: any) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'config/devices/dialogs/DevicesObjectsDialog.html',
            controller: 'iqsDevicesObjectsDialogController',
            controllerAs: '$ctrl',
            locals: { selected: params.selected, dialogTitle: params.dialogTitle, showFree: params.showFree },
            clickOutsideToClose: true
        })
            .then(
                (data?: any) => {
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
    .module('iqsDevicesObjectsDialog')
    .service('iqsDevicesObjectsDialog', DevicesObjectsDialogService);