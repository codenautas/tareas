"use strict";

import {ProceduresTareas} from "./procedures-tareas";

// tslint:disable TS6133
import * as pgPromise from "pg-promise-strict";
// tslint:disable-next-line:TS6133.
import * as express from "express";
import { AppBackend } from "backend-plus";
import * as bp from "backend-plus";


export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppTareas<T extends Constructor<AppBackend>>(Base:T){
    
    return class AppTareas extends Base{
        constructor(...args:any[]){ 
            super(...args);
        }
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    ProceduresTareas.map(be.procedureDefCompleter, be)
                );
            });
        }    
        clientIncludes(req:bp.Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , module:'dexie' },
                {type:'js' , src:'client/tareas.js'},
            ])
        }
        getMenu():bp.MenuDefinition{
            let myMenuPart:bp.MenuInfo[]=[
                {menuType:'table', name:'objetivos'},
                {menuType:'table', name:'usuarios' },
            ];
            let menu = {menu: super.getMenu().menu.concat(myMenuPart)}
            return menu;
        }
        getTables(){
            return [
                'usuarios',
                'objetivos',
                'tareas',
            ]
        }
    }
}