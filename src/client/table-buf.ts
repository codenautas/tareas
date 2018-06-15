"use strict";

import "dialog-promise"
import * as myOwn from "myOwn";
import * as bestGlobals from "best-globals";

var changing=bestGlobals.changing;
var my=myOwn;

myOwn.wScreens.localDb=function(addrParams){
    myOwn.TableConnector = myOwn.TableConnectorLocal;
};