"use strict";

import * as myOwn from "myOwn";

var my=myOwn;

var updateOnlineStatus = async function updateOnlineStatus() {
    var connection;
    try{
        await my.ajax.connection.test();
        connection = navigator.onLine;
    }catch(err){
        connection = false;
    }
    var state = connection ? "ONLINE" : "OFFLINE";
    alertPromise("Estado: " + state);
}
window.onload = function() {
    updateOnlineStatus();
    window.addEventListener("offline", updateOnlineStatus, false);
    window.addEventListener("online", updateOnlineStatus, false);
};