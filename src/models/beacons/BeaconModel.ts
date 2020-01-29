export class BeaconsModel {
    private _state: string;
    private _isSort: boolean;
    private _filter: any;
    private _selectAllow: boolean;

    private beacon: iqs.shell.Beacon[];
    private beaconFiltered:iqs.shell.Beacon[];
    private searchedCollection: string[];
    private selectIndex: number;
    private selectedItem: iqs.shell.Beacon;
    private transaction: pip.services.Transaction;
    private start: number = 0;
    private take: number = 100;
    private localSearch: string = null;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsBeaconsData: iqs.shell.IBeaconsDataService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('beacon');
        this.beacon = [];
        this.searchedCollection = [];
    }

    // private operation
    private updateItemInCollection(item: iqs.shell.Beacon): void {
        let index: number = _.findIndex(this.beacon, (ev) => {
            return ev.id == item.id;
        });
        this.prepare(item);
        // insert beacon without sort
        if (index > -1) {
            let sortNeed: boolean = item.udi != this.beacon[index].udi;
            this.beacon[index] = item;
            if (this.isSort && sortNeed) {
                this.sortCollection(this.beacon);
            }
            if (this.selectedItem) {
                if (this.selectedItem.id != item.id) {
                    this.selectItem(0);
                }
            } else {
                this.selectItem(index);
            }
        } else {
            if (this._isSort) {
                let lSort = item.label ? item.label.toLocaleLowerCase() : item.udi;
                index = _.findIndex(this.beacon, (ev) => {
                    return ev.label ? ev.label.toLocaleLowerCase() > lSort :  ev.udi > lSort;
                });

                if (index > -1) {
                    this.beacon.splice(index, 0, item);
                } else {
                    this.beacon.push(item);
                    index = this.beacon.length - 1;
                }
            } else {
                this.beacon.unshift(item);
                index = 0;
            }
            // let search: string = this.localSearch;
            this.localSearch = '';

            this.getFiltered(this.localSearch);
            index = _.findIndex(this.beaconFiltered, (ev) => {
                return ev.id == item.id;
            });

            this.selectItem(index);
        }

        this.collectionChanged();
    }

    private prepare(item: iqs.shell.Beacon): void {
        if (item.udi.length < 17) {
            item.shortUDI = item.udi;

            return;
        }
        let first: string = item.udi.slice(0, 8);
        let last: string = item.udi.slice(-8, item.udi.length);
        item.shortUDI = first + '...' + last;
    }

    private collectionChanged() {
        // this.$timeout(() => {
            this.localSearch = null;
            this.setState();
        // }, 0);
        // send broadcast ???
    }

    private setState() {
        this.state = (this.beaconFiltered && this.beaconFiltered.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    private prepareSearchedCollection() {
        this.searchedCollection = [];
        _.each(this.beacon, (item: iqs.shell.Beacon) => {
            this.searchedCollection.push(item.udi.toLocaleLowerCase());
        });
    }

    private sortCollection(data: iqs.shell.Beacon[]): void {
        this.beacon = _.sortBy(data, function (item: iqs.shell.Beacon) {
            return item.label ? item.label.toLocaleLowerCase() : item.udi;
        });
    }

    private onRead(data: iqs.shell.Beacon[], callback?: (data: iqs.shell.Beacon[]) => void): void {
        let index: number;
        if (data && data.length > 0) {
            if (this.isSort) {
                this.sortCollection(data);
            } else {
                this.beacon = data;
            }
            index = _.findIndex(this.beacon, (item: iqs.shell.Beacon) => {
                return item.id == this.$location.search()['beacon_id'];
            });
            index = index > -1 ? index : 0;
        } else {
            this.beacon = [];
            this.searchedCollection = [];
            index = -1;
        }
        _.each(this.beacon, (item: iqs.shell.Beacon) => {
            this.prepare(item);
        });

        if (!this.localSearch) {
            this.beaconFiltered = this.beacon;
        }
        this.prepareSearchedCollection();

        this.selectItem(index);
        this.transaction.end();

        if (callback) {
            callback(this.beacon);
        }
        this.collectionChanged();
    }

    private getFiltered(localSearch?: string): iqs.shell.Beacon[] {
        let searchedCollection: iqs.shell.Beacon[] = [];

        // not filtered, return all collection
        if (!localSearch) {
            this.localSearch = null;
            this.beaconFiltered = this.beacon;
            this.selectItem();

            return this.beaconFiltered;
        }

        if (localSearch && localSearch != this.localSearch) {
            let searchQuery = localSearch.toLowerCase();
            searchedCollection = _.filter(this.beacon, (item: iqs.shell.Beacon) => {
                return item.udi.toLowerCase().indexOf(searchQuery) > -1 || item.label && item.label.toLowerCase().indexOf(searchQuery) > -1;
            });

            this.localSearch = localSearch;
            this.beaconFiltered = searchedCollection;
            this.selectItem();
        }

        return this.beaconFiltered;
    }

    private getFilter(): any {
        if (!this._filter || !angular.isObject(this._filter)) {
            this._filter = {};
        }

        if (!this._filter.org_id && this.iqsOrganization.orgId) {
            this._filter.org_id = this.iqsOrganization.orgId
        }

        return this._filter;
    }

    // CRUD operation
    public read(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');
        return this.iqsBeaconsData.readBeacons(this.getFilter(),
            (response: iqs.shell.DataPage<iqs.shell.Beacon>) => {
                this.onRead(response.data, successCallback);
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Error: ' + JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public readOne(id: string, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
       let params = {
            beacon_id: id,
            org_id: this.iqsOrganization.orgId
        };
        return this.iqsBeaconsData.readBeacon(
            params,
            (data: iqs.shell.Beacon) => {
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
            },
            (error: any) => {
                this.$log.error('Error: ' + JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public create(beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('create_beacon');
        this.iqsBeaconsData.createBeacon(beacon,
            (data: iqs.shell.Beacon) => {
                this.state = iqs.shell.States.Data;
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Create beacon error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public delete(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('delete_beacon');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this.selectIndex < this.beaconFiltered.length - 1 ? this.selectIndex : this.selectIndex - 1;
        } else {
            index = this.selectIndex;
        }

        this.iqsBeaconsData.deleteBeacon(id,
            () => {
                this.remove(id);
                if (successCallback) {
                    successCallback();
                }
                this.selectItem(index);
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Delete beacon error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public calculatePosition(ids: string[], successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        let params = {
            udis: ids,
            org_id: this.iqsOrganization.orgId
        }
        this.iqsBeaconsData.calculatePosition(params,
            (data: any) => {
                if (successCallback) {
                    successCallback(data);
                }
            },
            (error: any) => {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public verifyBeaconUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        let params = {
            udi: udi,
            org_id: this.iqsOrganization.orgId
        }
        this.iqsBeaconsData.verifyBeaconUdi(params,
            (data: any) => {
                if (successCallback) {
                    successCallback(data);
                }
            },
            (error: any) => {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public update(id: string, beacon: iqs.shell.Beacon, successCallback?: (data: iqs.shell.Beacon) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('update_beacon');

        this.iqsBeaconsData.updateBeacon(id, beacon,
            (data: iqs.shell.Beacon) => {
                this.state = iqs.shell.States.Data;
                this.$location.search('beacon_id', data.id);
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Update beacon error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // property

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    public get selectAllow(): boolean {
        return this._selectAllow;
    }

    public set selectAllow(value: boolean) {
        if (!!value) {
            this._selectAllow = value;
        }
    }

    public get isSort(): boolean {
        return this._isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this._isSort = value;
        }
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        if (value) {
            this._state = value;
        }
    }

    // data operation
    public get(localSearch?: string): iqs.shell.Beacon[] {
        let result = this.getFiltered(localSearch);
        this.setState();

        return result;
    }

    public getSearchedCollection(): string[] {
        return this.searchedCollection;
    }

    public getSelectedIndex(): number {
        return this.selectIndex;
    }

    public getSelectedItem(): iqs.shell.Beacon {
        return this.selectedItem;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public remove(id: string): void {
        _.remove(this.beacon, { id: id });
        _.remove(this.beaconFiltered, { id: id });
        this.collectionChanged();
    }

    public reload(successCallback?: (data: iqs.shell.Beacon[]) => void, errorCallback?: (error: any) => void) {
        this.beacon = new Array();
        this.beaconFiltered = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(successCallback, errorCallback);
    }

    public selectItem(index?: number): void {
        if (!this._selectAllow) return;

        if (index === undefined || index === null || index < 0 || index > this.beaconFiltered.length - 1) {
            let id: string = this.$location.search()['beacon_id'];
            if (id) {
                index = _.findIndex(this.beaconFiltered, (item: iqs.shell.Beacon) => {
                    return item.id == id;
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this.selectIndex = index;

        this.selectedItem = (this.beaconFiltered && this.beaconFiltered.length > 0) ? this.beaconFiltered[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('beacon_id', this.selectedItem.id);
        }
    }

    public clean(): void {
        this.beacon = [];
        this.beaconFiltered = [];
        this.searchedCollection = [];
        this.selectIndex = -1;
        this.selectedItem = null;
        this.state = iqs.shell.States.Empty;
    }
}
