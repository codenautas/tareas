"use strict";

import * as myOwn from "myOwn";

var my=myOwn;

var updateOnlineStatus = function updateOnlineStatus(){
   console.log("Conectado al servidor: ", my.server.connected)
}
myOwn.autoSetupFunctions.push(
    function(){
        my.server.broadcaster.addEventListener("noServer", updateOnlineStatus, false);
    }
)
myOwn.autoSetupFunctions.push(
    function(){
        my.server.broadcaster.addEventListener("serverConnected", updateOnlineStatus, false);
    }
)