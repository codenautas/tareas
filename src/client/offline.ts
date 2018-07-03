"use strict";

import * as myOwn from "myOwn";

var my=myOwn;

var testConnection = function testConnection() {
    return my.ajax.connection.test({}).then(function(result){
        return true;
    }).catch(function(err){
        return false;
    });
}
var updateOnlineStatus = function(){
    testConnection().then(function(connection){
        var state = connection ? "ONLINE" : "OFFLINE";
        alertPromise("Estado: " + state);
    })
}
window.onload = function() {
    setTimeout(updateOnlineStatus,1000);
    window.addEventListener("offline", updateOnlineStatus, false);
    window.addEventListener("online", updateOnlineStatus, false);
};