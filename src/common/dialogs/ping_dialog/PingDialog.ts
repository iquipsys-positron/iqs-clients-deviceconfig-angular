
import { PingDialogParams, PingDialogResult } from './IPingDialogService';

export class PingDialogController extends PingDialogParams implements ng.IController {

    public $onInit() { }

    public theme;
    private isAbort: boolean = false;
    private isPing: boolean = false;
    private error: any;
    public showOkButton: boolean = false;
    public progress: number = 0;
    private intervalPromise: any;

    constructor(
        private $mdDialog: angular.material.IDialogService,
        $scope: ng.IScope,
        private $rootScope: ng.IRootScopeService,
        private $interval: ng.IIntervalService,
        private params: PingDialogParams
    ) {
        "ngInject";

        super();

        this.dialogTitle = params.dialogTitle ? params.dialogTitle : 'PING_DEFAULT_DIALOG_TITLE';
        this.okButtonLabel = params.okButtonLabel ? params.okButtonLabel : 'PING_DEFAULT_BUTTON_OK';
        this.pingString = params.pingString ? params.pingString : 'PING_DEFAULT_PROCESS_LABEL';
        this.pingSuccess = params.pingSuccess ? params.pingSuccess : 'PING_DEFAULT_SUCCESS_LABEL';
        this.pingFailed = params.pingFailed ? params.pingFailed : 'PING_DEFAULT_FAILED_LABEL';
        this.pingTimeout = params.pingTimeout ? params.pingTimeout : 50000;
        this.pingFrequency = params.pingFrequency ? params.pingFrequency : 10000;

        this.theme = $rootScope[pip.themes.ThemeRootVar];
        this.ping = params.ping;
        if (this.ping) {
            this.pingInit();
        } else {
            throw new Error('Ping error: ping function do not set!');
        }

        $scope.$on('$destroy', () => {
            this.$interval.cancel(this.intervalPromise);
        });

    }

    private callPing(): void {
        this.ping(
            (result: boolean) => {
                this.error = null;
                if (!!result) {
                    this.isPing = true;
                    this.isAbort = false;
                    this.showOkButton = true;
                    this.$interval.cancel(this.intervalPromise);
                }
            },
            (error?: any) => {
                if (error && error.code == 'DEVICE_INACTIVE') {
                    this.error = 'PING_DEVICE_INACTIVE_ERROR';
                } else {
                    this.error = 'PING_UNKNOWN_ERROR';
                }
            }
        );
    }

    private pingInit() {
        let startTime: number = new Date().getTime();
        let count: number = 1;
        // this.progress = this.pingTimeout / this.pingFrequency * count;

        this.intervalPromise = this.$interval(() => {
            let currTime: number = new Date().getTime();
            count += 1;
            this.progress = this.pingTimeout / this.pingFrequency * count;

            if (currTime - startTime > this.pingTimeout) {
                this.$interval.cancel(this.intervalPromise);
                this.showOkButton = true;
                this.isPing = false;
                this.isAbort = false;
                this.progress = 100;

                return;
            }

            this.callPing();

        }, this.pingFrequency);

        this.callPing();
    }

    public onOk() {
        this.$interval.cancel(this.intervalPromise);
        let result: PingDialogResult = {
            isPing: this.isPing,
            isAbort: this.isAbort,
            error: this.error
        }
        this.$mdDialog.hide({});
    }

    public onAbort() {
        this.isAbort = true;
        this.onOk();
    }


}


angular
    .module('iqsPingDialog', [
        'ngMaterial'
    ])
    .controller('iqsPingDialogController', PingDialogController);

import "./PingDialogService"