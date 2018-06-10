import {TableDefinition} from "backend-plus";
import * as backendPlus from "backend-plus";

export * from "backend-plus";

export interface User extends backendPlus.User{
    usuario:string
    rol:string
}

export type TableDefinitionsGetters = {
    [key:string]: (context:backendPlus.TableContext) => TableDefinition
}

