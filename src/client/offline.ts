"use strict";

import * as myOwn from "myOwn";

var my=myOwn;

var updateOnlineStatus = function updateOnlineStatus() {
    var condition = navigator.onLine ? "ONLINE" : "OFFLINE";
    alertPromise("Estado: " + condition);
}
window.onload = function() {
    updateOnlineStatus();
    window.addEventListener("offline", updateOnlineStatus, false);
    window.addEventListener("online", updateOnlineStatus, false);
};