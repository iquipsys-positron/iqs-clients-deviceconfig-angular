export class CurrentDeviceStatesModel {
    private _state: string;
    private transaction: pip.services.Transaction;

    private states: iqs.shell.CurrentDeviceState[];

    constructor(
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsCurrentDeviceStatesData: iqs.shell.ICurrentDeviceStatesDataService,
        private iqsOrganization: iqs.shell.IOrganizationService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('CurrentDeviceState');
        this.states = [];

    }

    private collectionChanged() {
        this.setState();

        this.$timeout(() => {
            this.setState();
        }, 0);
    }

    private setState() {
        this.state = (this.states && this.states.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    public read(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');

        return this.iqsCurrentDeviceStatesData.readCurrentDeviceStates(
            (data: iqs.shell.DataPage<iqs.shell.CurrentDeviceState>) => {
                this.states = data.data;
                this.collectionChanged();
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }
    
    public readOne(id: string, successCallback?: (data: iqs.shell.CurrentDeviceState) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');

        return this.iqsCurrentDeviceStatesData.readCurrentDeviceState(id,
            (data: iqs.shell.CurrentDeviceState) => {
                // update collection
                let index: number = _.findIndex(this.states, (item: iqs.shell.CurrentDeviceState) => {
                    return item.id == data.id;
                });
                if (index == -1) {
                    this.states.push(data);
                } else {
                    this.states[index] = data;
                }

                this.collectionChanged();
                if (successCallback) {
                    successCallback(data);
                }                
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // data operation
    public get(): iqs.shell.CurrentDeviceState[] {
        return this.states;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public reload(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void) {
        this.states = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(successCallback, errorCallback);
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        if (value) {
            this._state = value;
        }
    }

    public cleanUp(): void {
        this.states = [];
        this.state = iqs.shell.States.Empty;
    }

    public getDeviceStateById(id: string): iqs.shell.CurrentDeviceState {
        return _.find(this.states, (state) => { return state.id === id; });
    }

}