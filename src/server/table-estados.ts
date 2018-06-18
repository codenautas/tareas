"use strict";

import { TableContext, TableDefinition } from "./types-tareas"

export function estados(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'estados',
        elementName: 'estado',
        editable: admin,
        allow:{update:true, "vertical-edit":false},
        fields: [
            { name: "estado"     , typeName: 'text', },
            { name: "descripcion", typeName: 'text', isName:true },
            { name: "final"      , typeName: 'boolean'           },
        ],
        primaryKey: ['estado'],
        detailTables: [
            { table: 'tareas'      , fields: ['objetivo'], abr: 'T' },
        ],
        offline:{
            mode:'reference',
            details:[]
        },
    };
}


