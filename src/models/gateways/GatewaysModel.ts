export class GatewaysModel {
    private _state: string;
    private _isSort: boolean;
    private _filter: any;

    private gateway: iqs.shell.Gateway[];
    private gatewayFiltered: iqs.shell.Gateway[];
    private searchedCollection: string[];
    private selectIndex: number;
    private selectedItem: iqs.shell.Gateway;
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
        private iqsGatewaysData: iqs.shell.IGatewaysDataService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('gateway');
        this.gateway = [];
        this.searchedCollection = [];
    }

    // private operation
    private updateItemInCollection(item: iqs.shell.Gateway): void {
        let index: number = _.findIndex(this.gateway, (ev) => {
            return ev.id == item.id;
        });

        // insert gateway without sort
        if (index > -1) {
            let sortNeed: boolean = item.udi != this.gateway[index].udi;
            this.gateway[index] = item;
            if (this.isSort && sortNeed) {
                this.sortCollection(this.gateway);
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
                index = _.findIndex(this.gateway, (ev) => {
                    return ev.label ? ev.label.toLocaleLowerCase() > lSort :  ev.udi > lSort;
                });

                if (index > -1) {
                    this.gateway.splice(index, 0, item);
                } else {
                    this.gateway.push(item);
                    index = this.gateway.length - 1;
                }
            } else {
                this.gateway.unshift(item);
                index = 0;
            }
            // let search: string = this.localSearch;
            this.localSearch = '';

            this.getFiltered(this.localSearch);
            index = _.findIndex(this.gatewayFiltered, (ev) => {
                return ev.id == item.id;
            });

            this.selectItem(index);
        }

        this.collectionChanged();
    }

    private collectionChanged() {
        // this.$timeout(() => {
            this.localSearch = null;
            this.setState();
        // }, 0);
        // send broadcast ???
    }

    private setState() {
        this.state = (this.gatewayFiltered && this.gatewayFiltered.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    private prepareSearchedCollection() {
        this.searchedCollection = [];
        _.each(this.gateway, (item: iqs.shell.Gateway) => {
            this.searchedCollection.push(item.udi.toLocaleLowerCase());
        });
    }

    private sortCollection(data: iqs.shell.Gateway[]): void {
        this.gateway = _.sortBy(data, function (item: iqs.shell.Gateway) {
            return item.label ? item.label.toLocaleLowerCase() : item.udi;
        });
    }

    private onRead(data: iqs.shell.Gateway[], callback?: (data: iqs.shell.Gateway[]) => void): void {
        let index: number;
        if (data && data.length > 0) {
            if (this.isSort) {
                this.sortCollection(data);
            } else {
                this.gateway = data;
            }
            index = _.findIndex(this.gateway, (item: iqs.shell.Gateway) => {
                return item.id == this.$location.search()['gateway_id'];
            });
            index = index > -1 ? index : 0;
        } else {
            this.gateway = [];
            this.searchedCollection = [];
            index = -1;
        }
        if (!this.localSearch) {
            this.gatewayFiltered = this.gateway;
        }
        this.prepareSearchedCollection();

        this.selectItem(index);
        this.transaction.end();

        if (callback) {
            callback(this.gateway);
        }
        this.collectionChanged();
    }

    private getFiltered(localSearch?: string): iqs.shell.Gateway[] {
        let searchedCollection: iqs.shell.Gateway[] = [];

        // not filtered, return all collection
        if (!localSearch) {
            this.localSearch = null;
            this.gatewayFiltered = this.gateway;
            this.selectItem();

            return this.gatewayFiltered;
        }

        if (localSearch && localSearch != this.localSearch) {
            let searchQuery = localSearch.toLowerCase();
            searchedCollection = _.filter(this.gateway, (item: iqs.shell.Gateway) => {
                return item.udi.toLowerCase().indexOf(searchQuery) > -1 || item.label && item.label.toLowerCase().indexOf(searchQuery) > -1;
            });

            this.localSearch = localSearch;
            this.gatewayFiltered = searchedCollection;
            this.selectItem();
        }

        return this.gatewayFiltered;
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
    public read(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');
        return this.iqsGatewaysData.readGateways(this.getFilter(),
            (response: iqs.shell.DataPage<iqs.shell.Gateway>) => {
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

    public readOne(id: string, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
       let params = {
            gateway_id: id,
            org_id: this.iqsOrganization.orgId
        };
        return this.iqsGatewaysData.readGateway(
            params,
            (data: iqs.shell.Gateway) => {
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

    public create(gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('create_gateway');
        this.iqsGatewaysData.createGateway(gateway,
            (data: iqs.shell.Gateway) => {
                this.state = iqs.shell.States.Data;
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Create gateway error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public delete(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('delete_gateway');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this.selectIndex < this.gatewayFiltered.length - 1 ? this.selectIndex : this.selectIndex - 1;
        } else {
            index = this.selectIndex;
        }

        this.iqsGatewaysData.deleteGateway(id,
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
                this.$log.error('Delete gateway error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public statsGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        let params = {
            gateway_id: id,
            org_id: this.iqsOrganization.orgId
        }
        this.iqsGatewaysData.statsGateway(params,
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

    public pingGateway(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        let params = {
            gateway_id: id,
            org_id: this.iqsOrganization.orgId
        }
        this.iqsGatewaysData.pingGateway(params,
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

    public verifyGatewayUdi(udi: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void {
        let params = {
            udi: udi,
            org_id: this.iqsOrganization.orgId
        }
        this.iqsGatewaysData.verifyGatewayUdi(params,
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

    public update(id: string, gateway: iqs.shell.Gateway, successCallback?: (data: iqs.shell.Gateway) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('update_gateway');

        this.iqsGatewaysData.updateGateway(id, gateway,
            (data: iqs.shell.Gateway) => {
                this.state = iqs.shell.States.Data;
                this.$location.search('gateway_id', data.id);
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Update gateway error: ', JSON.stringify(error));
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
    public get(localSearch?: string): iqs.shell.Gateway[] {
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

    public getSelectedItem(): iqs.shell.Gateway {
        return this.selectedItem;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public remove(id: string): void {
        _.remove(this.gateway, { id: id });
        _.remove(this.gatewayFiltered, { id: id });
        this.collectionChanged();
    }

    public reload(successCallback?: (data: iqs.shell.Gateway[]) => void, errorCallback?: (error: any) => void) {
        this.gateway = new Array();
        this.gatewayFiltered = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(successCallback, errorCallback);
    }

    public selectItem(index?: number): void {
        if (index === undefined || index === null || index < 0 || index > this.gatewayFiltered.length - 1) {
            let id: string = this.$location.search()['gateway_id'];
            if (id) {
                index = _.findIndex(this.gatewayFiltered, (item: iqs.shell.Gateway) => {
                    return item.id == id;
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this.selectIndex = index;

        this.selectedItem = (this.gatewayFiltered && this.gatewayFiltered.length > 0) ? this.gatewayFiltered[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('gateway_id', this.selectedItem.id);
        }
    }

    public clean(): void {
        this.gateway = [];
        this.gatewayFiltered = [];
        this.searchedCollection = [];
        this.selectIndex = -1;
        this.selectedItem = null;
        this.state = iqs.shell.States.Empty;
    }
}
