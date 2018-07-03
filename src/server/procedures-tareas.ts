"use strict";

import * as backendPlus from "backend-plus";
import {ProcedureContext} from "backend-plus";

var ConnectionTest:backendPlus.ProcedureDef={
    action: 'connection/test',
    parameters: [],
    coreFunction: function(context, parameters){
        return {code: 200};
    }
};

var ProceduresTareas = [ConnectionTest];

export {ProceduresTareas};