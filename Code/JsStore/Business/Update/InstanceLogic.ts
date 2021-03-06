namespace JsStore {
    export namespace Business {
        export namespace Update {
            export class Instance extends Where {
                constructor(query: IUpdate, onSuccess: () => void, onError: (err: IError) => void) {
                    super();
                    try {
                        this._onSuccess = onSuccess;
                        this._onError = onError;
                        this._error = new SchemaChecker(this.getTable(query.In)).check(query.Set, query.In);
                        if (!this._error) {
                            this._query = query;
                            if (query.Where) {
                                if (query.Where.Or || Array.isArray(query.Where)) {
                                    this.executeComplexLogic();
                                }
                                else {
                                    this.createTransaction();
                                    this.goToWhereLogic();
                                }
                            }
                            else {
                                this.createTransaction();
                                this.executeWhereUndefinedLogic();
                            }
                        }
                        else {
                            this._errorOccured = true;
                            this.onErrorOccured(this._error, true);
                        }
                    }
                    catch (ex) {
                        this._errorOccured = true;
                        this.onExceptionOccured.call(this, ex, { TableName: query.In });
                    }
                }

                private onTransactionCompleted = function () {
                    this._onSuccess(this._rowAffected);
                };

                private createTransaction = function () {
                    this._transaction = db_connection.transaction([this._query.In], "readwrite");
                    this._objectStore = this._transaction.objectStore(this._query.In);
                    this._transaction.oncomplete = this.onTransactionCompleted.bind(this);
                    (this._transaction as any).ontimeout = this.onTransactionTimeout;
                };

                private executeComplexLogic = function () {
                    var select_object = new Select.Instance({
                        From: this._query.In,
                        Where: this._query.Where
                    } as ISelect, function (results: any[]) {
                        var key = this.getPrimaryKey(this._query.In),
                            in_query = [],
                            where_qry = {};
                        results.forEach(function (value) {
                            in_query.push(value[key]);
                        });
                        results = null;
                        where_qry[key] = { In: in_query };
                        this._query['Where'] = where_qry;
                        this.createTransaction();
                        this.goToWhereLogic();
                    }.bind(this), this._onError.bind(this));
                };
            }
        }
    }
}
