"use strict";

import * as backendPlus from "backend-plus";
import {ProcedureContext} from "backend-plus";

type TablaDatosGenerarParameters={
    objetivo: string
    tabla_datos: string
}

var ProceduresTareas = [
    {
        action:'table/lock-record',
        parameters:[
            {name: 'table', encoding:'plain'},
            {name: 'primaryKeyValues'}
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            var be=context.be;
            var db=be.db;
            var tableDef=be.tableStructures[parameters.table](context);
            if(!tableDef || !tableDef.offline.mode){
                throw new Error("No offline mode for "+parameters.table);
            }
            var pk_clausule = tableDef.primaryKey.map((name,i)=>db.quoteIdent(name)+' = $'+(i+1)).join(' and ')
            var results = await Promise.all([tableDef].concat(
                tableDef.offline.details.map(name=>be.tableStructures[name](context))
            ).map(tableDef=>context.client.query(
                `select * from ${db.quoteIdent(tableDef.sql.tableName)}
                  where ${pk_clausule}`,
                parameters.primaryKeyValues
            ).fetchAll()));
            return {data:results.map(result=>result.rows)};
        }
    },   
];

export {ProceduresTareas};