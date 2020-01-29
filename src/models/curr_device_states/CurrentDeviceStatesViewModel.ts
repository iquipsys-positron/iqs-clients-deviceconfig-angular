import { CurrentDeviceStatesModel } from './CurrentDeviceStatesModel';
import { ICurrentDeviceStatesViewModel } from './ICurrentDeviceStatesViewModel';

class CurrentDeviceStatesViewModel implements ICurrentDeviceStatesViewModel {
    public model: CurrentDeviceStatesModel;

    constructor(
        $location: ng.ILocationService,
        $timeout: ng.ITimeoutService,
        pipTransaction: pip.services.ITransactionService,
        iqsCurrentDeviceStatesData: iqs.shell.ICurrentDeviceStatesDataService,
        iqsOrganization: iqs.shell.IOrganizationService
    ) {
        "ngInject";

        this.model = new CurrentDeviceStatesModel(
            $location,
            $timeout,
            pipTransaction,
            iqsCurrentDeviceStatesData,
            iqsOrganization
        );
    }

    public read(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        return this.model.read(successCallback, errorCallback);
    }

    public readOne(id: string, successCallback?: (data: iqs.shell.CurrentDeviceState) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        return this.model.readOne(id, successCallback, errorCallback);
    }

    // data operation
    public get(): iqs.shell.CurrentDeviceState[] {
        return this.model.get();
    }

    public getTransaction(): pip.services.Transaction {
        return this.model.getTransaction();
    }

    public reload(successCallback?: (data: iqs.shell.CurrentDeviceState[]) => void, errorCallback?: (error: any) => void): void {
        this.model.reload(successCallback, errorCallback);
    }

    public get state(): string {
        return this.model.state;
    }

    public set state(value: string) {
        this.model.state = value;
    }

    public clean(): void {
        this.model.cleanUp();
    }

    public getDeviceStateById(id: string): iqs.shell.CurrentDeviceState {
        return this.model.getDeviceStateById(id);
    }
}

angular.module('iqsCurrentDeviceStates.ViewModel', ['iqsCurrentDeviceStates.Data'])
    .service('iqsCurrentDeviceStatesViewModel', CurrentDeviceStatesViewModel);


