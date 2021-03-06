namespace JsStore {
    export namespace Model {
        export class TableHelper {
            _name: string;
            _columns: Column[] = [];

            // internal Members
            _primaryKey: string;
            _version: number;
            _requireDelete: boolean = false;
            _requireCreation: boolean = false;
            _callback: () => void;

            constructor(table: Table) {
                this._name = table._name;
                this._version = table._version;
                this._columns = table._columns;
            }

            public createMetaData = function (dbName: string, callBack: () => void) {
                this._callback = callBack;
                this.setPrimaryKey();
                this.setRequireDelete(dbName);
                this.setDbVersion(dbName);
            };

            public getAtsTable = function () {
                var table: Table = null;
                this._columns.every(function (column: Column) {
                    if (column._advTextSearch) {
                        table = new Table({
                            Columns: [
                                {
                                    Name: this._primaryKey,
                                    PrimaryKey: true
                                },
                                {
                                    MultiEntry: true,
                                    Name: column._name,
                                }
                            ],
                            Name: this._name + "_" + column._name,
                        });
                        return false;
                    }
                    return true;
                }, this);
                return table;
            };

            private setPrimaryKey() {
                this._columns.every(function (item) {
                    this._primaryKey = item._primaryKey ? item._name : "";
                    return !item._primaryKey;
                }, this);
            }

            private setRequireDelete(dbName: string) {
                KeyStore.get("JsStore_" + dbName + "_" + this._name + "_Version", function (tableVersion) {
                    if (tableVersion == null) {
                        this._requireCreation = true;
                    }
                    // mark only table which has version greater than store version
                    else if (tableVersion < this._version) {
                        this._requireDelete = true;
                    }
                }.bind(this));
            }

            private setDbVersion(dbName: string) {
                db_version = db_version > this._version ? db_version : this._version;
                // setting db version
                KeyStore.set('JsStore_' + dbName + '_Db_Version', db_version)
                    // setting table version
                    .set("JsStore_" + dbName + "_" + this._name + "_Version", db_version, this._callback);
                this._version = db_version;
            }

        }
    }
}