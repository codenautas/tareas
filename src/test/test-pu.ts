"use strict";

import * as bp from 'backend-plus';
import {emergeAppTareas} from '../server/app-tareas.js';
import {promises as fs} from 'fs';

var defConfig={
    server:{
        port:3334
    },
    db:{
        host: 'localhost',
        database: 'test_db',
        schema: 'tst4',
        user: 'test_user',
        password: 'test_pass',
    },
    test:{}
}


class AppTareas extends emergeAppTareas(bp.AppBackend){
    configList(){
        var list = super.configList().concat(defConfig);
        return list;
    }
}

import * as puppeteer from "puppeteer";
import * as pg from 'pg-promise-strict';
import { fstat } from 'fs';

// @ts-ignore
pg.easy = true;
const MiniTools = require('mini-tools');
const discrepances = require('discrepances');

describe("interactive ",function(){
    var browser:puppeteer.Browser;
    var page:puppeteer.Page;
    var client:pg.Client;
    var config;
    var server:InstanceType<typeof AppTareas>;
    before(async function(){
        this.timeout(50000);
        server = new AppTareas();
        console.log("starting server");
        config = await MiniTools.readConfig(
            [defConfig,'test/local-config'],
            {whenNotExist:'ignore'}
        );
        client = await pg.connect(config.db);
        var createScript = await fs.readFile('local-db-dump.sql',{encoding:'utf-8'}) as string;
        var sentences = createScript.replace(/tareas_owner/gi,'test_user').split(/\r?\n\r?\n/);
        await client.executeSentences(sentences);
        console.log('base abierta y limpia');
        await server.start({readConfig:{whenNotExist:'ignore'}, testing:true});
        console.log('XXXXXXXXX OPCIONES',process.env.TRAVIS?null:{headless: !!process.env.TRAVIS || !config.test["view-chrome"], slowMo: 50},process.env.TRAVIS);
        browser = await puppeteer.launch(process.env.TRAVIS?null:{headless: !!process.env.TRAVIS || !config.test["view-chrome"], slowMo: 50});
        page = await browser.newPage();
        page.on('console', msg => { 
            console.log('console.'+msg.type(), msg.text()) 
        });
        await page.setViewport({width:1360, height:768});
        await page.goto('http://localhost:'+config.server.port+'/tareas');
        await page.type('#username', 'mat');
        await page.type('#password', 'matpass');
        await page.click('[type=submit]');
        await page.waitForSelector('#light-network-signal');
        console.log('sistema logueado');
    });
    it("abrir objetivos", async function(){
        this.timeout(38000);
        console.log('tengo el menu')
        await page.click('[menu-name=objetivos]');
        await page.waitForSelector('[my-table=objetivos] tbody tr [alt=INS]');
        await page.click('[my-table=simple] tbody tr [alt=INS]');
        await page.waitFor(500);
        await page.screenshot({path: 'local-capture1.png'});
        var pkNewRecord = await page.$('[my-table=simple] tbody tr td');
        var pkValue='333';
        await pkNewRecord.type(pkValue,{delay:10});
        await page.keyboard.press('Enter');
        var data = ('x'+Math.random()).substr(0,8);
        await page.waitForSelector('[my-colname=simple_code][io-status="temporal-ok"]');
        await page.keyboard.type(data);
        await page.screenshot({path: 'local-capture2.png'});
        await page.keyboard.press('Enter');
        await page.waitForSelector('[my-colname=simple_name][io-status="temporal-ok"]');
        var result = await client.query("select simple_name from simple where simple_code = $1",[pkValue]).fetchUniqueValue();
        discrepances.showAndThrow(result.value,data);
        return 1;
    });
    it.skip("inserts one record with fk data", async function(){
        this.timeout(38000);
        console.log('tengo el menu')
        await page.click('[menu-name=tables]');
        await page.click('[menu-name=with_fk]');
        console.log('vamos por acá 1');
        await page.waitForSelector('[my-table=with_fk] [alt=INS]');
        console.log('vamos por acá 2');
        await page.click('[my-table=with_fk] [alt=INS]');
        console.log('vamos por acá 3');
        await page.waitFor(500);
        console.log('vamos por acá 4');
        await page.screenshot({path: 'local-capture1.png'});
        console.log('vamos por acá 5');
        var pkNewRecord = await page.$('[my-table=with_fk] tbody tr td');
        var pkValue='A1';
        await pkNewRecord.press('Enter');  // keep empty simple_code
        await page.keyboard.type('Three');          // simple_name (lookup field)
        await page.keyboard.press('Enter');
        await page.waitForSelector('[my-colname=simple_name][io-status="temporal-ok"]');
        var result = await client.query("select simple_code, simple_name from simple where simple_name = $1",['Three']).fetchUniqueRow();
        discrepances.showAndThrow(result.row,{simple_code:'3', simple_name:'Three'});
        var result = await page.$eval('[my-colname=simple_code]', td => td.textContent);
        discrepances.showAndThrow(result,'3');
        return ;
        await page.keyboard.type(pkValue);
        await page.keyboard.press('Enter'); 
        await page.screenshot({path: 'local-capture2.png'});
        await page.keyboard.press('Enter');
        var result = await client.query("select * from with_fk where wf_code = $1",['A1']).fetchUniqueRow();
        discrepances.showAndThrow(result.row,{simple_code:'3', wf_code:'A1'});
        return 1;
    });
    after(async function(){
        this.timeout(30000);
        await client.done();
        await page.waitFor(process.env.TRAVIS?10:config.test["stay-chrome-ms"]||1000);
        await browser.close()
        //@ts-ignore only for test shootDownBackend
        await server.shootDownBackend();
    });
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});