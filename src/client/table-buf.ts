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
    var tableDef = await IDBX(tx);
    if(!tableDef){ 
        var err = new Error;
        err.code='NO-STRUCTURE';
        throw err;
    }
    connector.def = changing(tableDef, connector.opts.tableDef||{});
    connector.whenStructureReady = connector.def;
    return connector.whenStructureReady;
};

myOwn.TableConnectorLocal.prototype.getData = async function getData(){
    var connector = this;
    if(((connector.opts||{}).tableDef||{}).forInsertOnlyMode){
        return Promise.resolve([]);
    }
    if(connector.parameterFunctions){
        //throw new Error('no soportado parameterFunctions');
    }
    var tx = my.ldb.transaction([connector.tableName],'readonly').objectStore(connector.tableName).getAll();
    try{
        var rows = await IDBX(tx);
        await connector.whenStructureReady
        connector.getElementToDisplayCount().textContent=rows.length+' '+my.messages.displaying+'...';
        await bestGlobals.sleep(10);
        connector.my.adaptData(connector.def, rows);
        return rows;
    }catch(err){
        connector.getElementToDisplayCount().appendChild(html.span({style:'color:red', title: err.message},' error').create());
        throw err;
    };
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

myOwn.TableConnectorLocal.prototype.saveRecord = async function saveRecord(depot, opts){
    var connector = this;
    var sendedForUpdate = depot.my.cloneRow(depot.rowPendingForUpdate);
    var tx1 = my.ldb.transaction([connector.tableName],'readwrite').objectStore(connector.tableName).put(depot.row);
    var response = await IDBX(tx1);
    var tx2 = my.ldb.transaction([connector.tableName],'readonly').objectStore(connector.tableName).get([response[0]]);
    var row = await IDBX(tx2);
    return {sendedForUpdate:sendedForUpdate, updatedRow:row};
};

myOwn.TableConnectorLocal.prototype.enterRecord = function enterRecord(depot){
    return Promise.resolve();
};
myOwn.TableConnectorLocal.prototype.deleteEnter = function enterRecord(depot){
    return Promise.resolve();
};

myOwn.wScreens.localDb=function(addrParams){
    myOwn.TableConnector = myOwn.TableConnectorLocal;
};