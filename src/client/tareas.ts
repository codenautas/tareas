"use strict";

import * as jsToHtml from "js-to-html"
import {html} from "js-to-html"
import * as likeAr from "like-ar"
import * as TypedControls from "typed-controls"
import * as TypeStore from "type-store"
import "dialog-promise"
import * as myOwn from "myOwn";

var my=myOwn;

myOwn.clientSides.$lock={
    update:true,
    prepare:function(depot:myOwn.Depot, fieldName:string){
        depot.rowControls[fieldName].addEventListener('update',function(){
            var control = this;
            var valor = control.getTypedValue();
            if((valor=='B' || valor=='⚿') && "no estaba lockeado"){
                control.setTypedValue('⌚');
                my.ajax.table["lock-record"]({
                    table:depot.def.name,
                    primaryKeyValues:depot.primaryKeyValues
                }).then(function(result){
                    var tables=[depot.def.name].concat(depot.def.offline.details)
                    var promiseChain=Promise.resolve();
                    tables.forEach(function(name,i){
                        promiseChain=promiseChain.then(function(){
                            my.ldb.putMany(name,result.data[i]);
                        })
                    })
                    return promiseChain;
                }).then(function(){
                    control.setTypedValue('⚿');
                })
            }
        })
    }
}