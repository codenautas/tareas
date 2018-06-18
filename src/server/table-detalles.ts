"use strict";

import { TableContext, TableDefinition } from "./types-tareas"

export function detalles(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'detalles',
        elementName: 'detalle',
        editable: admin,
        allow:{update:true, "vertical-edit":false},
        fields: [
            { name: "objetivo"     , typeName: 'text', allow:{update:admin}, },
            { name: "tarea"        , typeName: 'text', allow:{update:admin}, },
            { name: "detalle"      , typeName: 'text', allow:{update:admin}, },
            { name: "descripcion"  , typeName: 'text', allow:{update:admin}, isName:true },
            { name: "observaciones", typeName: 'text', },
        ],
        primaryKey: ['objetivo','tarea','detalle'],
        foreignKeys: [
            { references: 'tareas'         , fields: ['objetivo','tarea'] },
        ]
    };
}


