import { StatusObject } from './StatusObject';
import { IStatusService } from './IStatusService';
// todo: not use
class Status implements IStatusService {

    constructor(

    ) {
        "ngInject";
    }


    public status(date: any) {
        let localDate: Date = new Date(),
            inputDate: Date = new Date(date),
            statusObject: StatusObject = new StatusObject();

        if (_.isDate(inputDate)) {

            if ((_.toInteger(localDate) - _.toInteger(inputDate)) / (1000 * 15 * 60) > 1) {
                statusObject.active = false;
                statusObject.time = new Date((_.toInteger(inputDate)));
                statusObject.status = 'INFO_INCONNECT';
            } else {
                statusObject.active = true;
                statusObject.time = new Date((_.toInteger(inputDate)));
                statusObject.status = 'INFO_CONNECT';
            }
        }
        return statusObject;
    }
}

angular
    .module('iqsStatus', [])
    .service('iqsStatusService', Status);