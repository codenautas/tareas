"use strict";

import "dialog-promise"
import * as myOwn from "myOwn";
import * as bestGlobals from "best-globals";
import { connect } from "http2";

var changing=bestGlobals.changing;
var my=myOwn;

//myOwn.TableConnectorDirect = myOwn.TableConnector;

myOwn.TableConnectorLocal = function(context, opts){
    var connector = this;
    for(var attr in context){
        connector[attr] = context[attr];
    }
    connector.opts = opts||{};
    connector.fixedFields = connector.opts.fixedFields || [];
    connector.fixedField = {};
    connector.fixedFields.forEach(function(pair){
        if(!pair.range){
            connector.fixedField[pair.fieldName] = pair.value;
        }
    });
    connector.parameterFunctions=connector.opts.parameterFunctions||{};
};

myOwn.TableConnectorLocal.prototype.getStructure = async function getStructure(){
    var connector = this;
    var tx = my.ldb.transaction(['$structures'],'readonly').objectStore('$structures').get(connector.tableName);
    connector.whenStructureReady = IDBX(tx).then(function(tableDef){
        if(!tableDef){ 
            var err = new Error;
            err.code='NO-STRUCTURE';
            throw err;
        }
        connector.def = changing(tableDef, connector.opts.tableDef||{});
        return connector.def;
    });
    return connector.whenStructureReady;
};

myOwn.TableConnectorLocal.prototype.getData = function getData(){
    var connector = this;
    if(((connector.opts||{}).tableDef||{}).forInsertOnlyMode){
        return Promise.resolve([]);
    }
    if(connector.parameterFunctions){
        //throw new Error('no soportado parameterFunctions');
    }
    var tx = my.ldb.transaction([connector.tableName],'readonly').objectStore(connector.tableName).getAll();
    return IDBX(tx).then(function(rows){
        return connector.whenStructureReady.then(function(){
            connector.getElementToDisplayCount().textContent=rows.length+' '+my.messages.displaying+'...';
            return bestGlobals.sleep(10);
        }).then(function(){
            connector.my.adaptData(connector.def, rows);
            return rows;
        });
    }).catch(function(err){
        connector.getElementToDisplayCount().appendChild(html.span({style:'color:red', title: err.message},' error').create());
        throw err;
    });
};

myOwn.TableConnectorLocal.prototype.deleteRecord = function deleteRecord(depot, opts){
    return (depot.primaryKeyValues===false?
        Promise.resolve():
        db[depot.def.name].delete(depot.primaryKeyValues).then(function(){
            depot.tr.dispatchEvent(new CustomEvent('deletedRowOk'));
            var grid=depot.manager;
            grid.dom.main.dispatchEvent(new CustomEvent('deletedRowOk'));
        })
    );
};

myOwn.TableConnectorLocal.prototype.saveRecord = function saveRecord(depot, opts){
    var connector = this;
    var sendedForUpdate = depot.my.cloneRow(depot.rowPendingForUpdate);
    var tx = my.ldb.transaction([connector.tableName],'readwrite').objectStore(connector.tableName).put(depot.row);
    return IDBX(tx).then(function(response){
        return {sendedForUpdate:sendedForUpdate, updatedRow:depot.rowPendingForUpdate};
    });
};

myOwn.TableConnectorLocal.prototype.enterRecord = function enterRecord(depot){
    return Promise.resolve();
};
myOwn.TableConnectorLocal.prototype.deleteEnter = function enterRecord(depot){
    return Promise.resolve();
};

myOwn.TableConnector = myOwn.TableConnectorLocal;