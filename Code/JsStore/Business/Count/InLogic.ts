module JsStore {
    export module Business {
        export module Count {
            export class In extends NotWhere {
                private executeInLogic = function (column, values) {
                    var Cursor: IDBCursorWithValue,
                        That = this,
                        CursorOpenRequest;
                    if (That.CheckFlag) {
                        for (var i = 0, length = values.length; i < length; i++) {
                            if (!That.ErrorOccured) {
                                CursorOpenRequest = this.ObjectStore.index(column).
                                    openCursor(IDBKeyRange.only(values[i]));
                                CursorOpenRequest.onsuccess = function (e) {
                                    Cursor = (<any>e).target.result;
                                    if (Cursor) {
                                        if (That.checkForWhereConditionMatch(Cursor.value)) {
                                            ++That.ResultCount;
                                        }
                                        Cursor.continue();
                                    }
                                }
                                CursorOpenRequest.onerror = function (e) {
                                    That.ErrorOccured = true;
                                    That.onErrorOccured(e);
                                }
                            }
                        }
                    }
                    else {
                        if (this.ObjectStore.count) {
                            for (var i = 0, length = values.length; i < length; i++) {
                                if (!That.ErrorOccured) {
                                    CursorOpenRequest = this.ObjectStore.index(column).count(IDBKeyRange.only(values[i]));
                                    CursorOpenRequest.onsuccess = function (e) {
                                        That.ResultCount += CursorOpenRequest.result;
                                    }
                                    CursorOpenRequest.onerror = function (e) {
                                        That.ErrorOccured = true;
                                        That.onErrorOccured(e);
                                    }
                                }
                            }
                        }
                        else {
                            for (var i = 0, length = values.length; i < length; i++) {
                                if (!That.ErrorOccured) {
                                    CursorOpenRequest = this.ObjectStore.index(column).openCursor(IDBKeyRange.only(values[i]));
                                    CursorOpenRequest.onsuccess = function (e) {
                                        Cursor = (<any>e).target.result;
                                        if (Cursor) {
                                            ++That.ResultCount;
                                            Cursor.continue();
                                        }
                                    }
                                    CursorOpenRequest.onerror = function (e) {
                                        That.ErrorOccured = true;
                                        That.onErrorOccured(e);
                                    }
                                }
                            }
                        }
                    }

                    CursorOpenRequest.onerror = function (e) {
                        That.ErrorOccured = true;
                        That.onErrorOccured(e);
                    }
                }
            }
        }
    }
}
