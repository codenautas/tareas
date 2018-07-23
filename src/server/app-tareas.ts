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
        configStaticConfig(){
            super.configStaticConfig();
            this.setStaticConfig(`
              server:
                port: 3032
                base-url: /tareas
                session-store: memory
              db:
                motor: postgresql
                host: localhost
                database: tareas_db
                schema: tar
                user: tareas_user
                search_path: 
                - tar
              install:
                dump:
                  db:
                    owner: tareas_owner
                  admin-can-create-tables: true
                  enances: inline
                  skip-content: true
                  scripts:
                    post-adapt: 
                    - event_control_creates.sql
                    - para-install.sql
                    - ../node_modules/pg-triggers/lib/recreate-his.sql
                    - ../node_modules/pg-triggers/lib/table-changes.sql
                    - ../node_modules/pg-triggers/lib/function-changes-trg.sql
                    - ../node_modules/pg-triggers/lib/enance.sql
              login:
                table: usuarios
                userFieldName: usuario
                passFieldName: md5clave
                rolFieldName: rol
                infoFieldList: [usuario, rol]
                activeClausule: activo
                plus:
                  maxAge-5-sec: 5000    
                  maxAge: 864000000
                  maxAge-10-day: 864000000
                  allowHttpLogin: true
                  fileStore: false
                  loginForm:
                    formTitle: Tareas
                    usernameLabel: usuariox
                    passwordLabel: md5clave
                    buttonLabel: entrar
                    formImg: img/login-lock-icon.png
                    autoLogin: true
                  chPassForm:
                    usernameLabel: usuario
                    oldPasswordLabel: clave anterior
                    newPasswordLabel: nueva clave
                    repPasswordLabel: repetir nueva clave
                    buttonLabel: Cambiar
                    formTitle: Cambio de clave
                messages:
                  userOrPassFail: el nombre de usuario no existe o la clave no corresponde
                  lockedFail: el usuario se encuentra bloqueado
                  inactiveFail: es usuario está marcado como inactivo
              client-setup:
                cursors: true
                lang: es
                menu: true
                grid-buffer: idbx
                version: 0.2
            `);
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
                {type:'js' , src:'client/offline.js', ts:'src/client'}
            ])
        }
        getMenu():bp.MenuDefinition{
            let myMenuPart:bp.MenuInfo[]=[
                {menuType:'table', name:'objetivos', showInOfflineMode: true},
                {menuType:'table', name:'usuarios', showInOfflineMode: true },
                { menuType: 'menu', name: 'menu_visible_offline', showInOfflineMode: true, menuContent: [
                    { menuType: 'table', name: 'objetivos', label: 'no_visible_offline' },
                    { menuType: 'table', name: 'objetivos', showInOfflineMode: true, label: 'visible_offline' },
                    { menuType: 'table', name: 'objetivos', label: 'no_visible_offline' },
                ] },
                { menuType: 'menu', name: 'menu_no_visible_offline', menuContent: [
                    { menuType: 'table', name: 'objetivos', label: 'no_visible_offline'  },
                    { menuType: 'table', name: 'objetivos' , label: 'no_visible_offline' },
                ] },
            ];
            let menu = {menu: super.getMenu().menu.concat(myMenuPart)}
            return menu;
        }
        getTables(){
            return super.getTables().concat([
                'usuarios',
                'estados',
                'objetivos',
                'tareas',
                'detalles',
            ]);
        }
    }
}