"use strict";

import { TableContext, TableDefinition } from "./types-tareas"

export function tareas(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'tareas',
        elementName: 'tarea',
        editable: admin,
        allow:{update:true, "vertical-edit":false},
        fields: [
            { name: "objetivo"   , typeName: 'text', allow:{update:admin}, },
            { name: "tarea"      , typeName: 'text', allow:{update:admin}, },
            { name: "descripcion", typeName: 'text', allow:{update:admin}, isName:true },
            { name: "avance"     , typeName: 'decimal', },
            { name: "estado"     , typeName: 'text', },
        ],
        primaryKey: ['objetivo','tarea'],
        foreignKeys: [
            { references: 'objetivos'      , fields: ['objetivo'] },
            { references: 'estados'        , fields: ['estado'  ] },
        ]
    };
}


