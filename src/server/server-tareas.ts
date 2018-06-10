"use strict";

import {emergeAppTareas} from "./app-tareas"
import { AppBackend } from "backend-plus"

var AppTareas = emergeAppTareas(AppBackend);

new AppTareas().start();