"use strict";

import { TableContext, TableDefinition } from "./types-tareas"

export function objetivos(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'objetivos',
        elementName: 'objetivo',
        editable: admin,
        allow:{update:true, "vertical-edit":false},
        fields: [
            { name: "objetivo"   , typeName: 'text', },
            { name: "descripcion", typeName: 'text', isName:true },
        ],
        primaryKey: ['objetivo'],
        detailTables: [
            { table: 'tareas'      , fields: ['objetivo'], abr: 'T' },
        ]
    };
}


