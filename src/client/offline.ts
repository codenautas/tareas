"use strict";

import * as myOwn from "myOwn";

var my=myOwn;

var updateOnlineStatus = function updateOnlineStatus(){
   console.log("Conectado al servidor: ", my.server.connected)
}
window.onload = function() {
   my.server.broadcaster.addEventListener("noServer", updateOnlineStatus, false);
   my.server.broadcaster.addEventListener("serverConnected", updateOnlineStatus, false);
};