"use strict";

import * as jsToHtml from "js-to-html"
import {html} from "js-to-html"
import * as likeAr from "like-ar"
import * as TypedControls from "typed-controls"
import * as TypeStore from "type-store"
import "dialog-promise"
import * as myOwn from "myOwn";


myOwn.clientSides.$lock={
    update:true,
    prepare:function(depot:myOwn.Depot, fieldName:string){
        console.log(depot,fieldName)
    }
}