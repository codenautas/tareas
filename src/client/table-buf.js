
var Dexie = require('dexie');

myOwn.TableConnectorDirect = myOwn.TableConnector;

var db = new Dexie("buffer");
db.version(1).stores({
    structures:'tableName',
    objetivos:'objetivo',
    tareas:'[objetivo+tarea]',
});

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

myOwn.TableConnectorLocal.prototype.getStructure = function getStructure(){
    var connector = this;
    connector.whenStructureReady = db.$structures.get({
        tableName:connector.tableName
    }).then(function(tableDef){
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
        throw new Error('no soportado parameterFunctions');
    }
    return db[connector.tableName].where(fixedFields).toArray().then(function(rows){
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
    var sendedForUpdate = depot.my.cloneRow(depot.rowPendingForUpdate);
    // var newRow=changing(depot.row, depot.rowPendingForUdpate);
    return db[depot.def.name].update(depot.primaryKeyValues, depot.rowPendingForUpdate).then(function(){
        return db[depot.def.name].get(depot.primaryKeyValues);
    }).then(function(updatedRow){
        depot.my.adaptData(depot.def,[updatedRow]);
        return {sendedForUpdate:sendedForUpdate, updatedRow:updatedRow};
    });
};

myOwn.TableConnectorLocal.prototype.enterRecord = function enterRecord(depot){
    return Promise.resolve();
};
myOwn.TableConnectorLocal.prototype.deleteEnter = function enterRecord(depot){
    return Promise.resolve();
};
