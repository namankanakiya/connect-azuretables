[![Build Status](https://travis-ci.org/mike-goodwin/connect-azuretables.svg?branch=master)](https://travis-ci.org/mike-goodwin/connect-azuretables) [![codecov.io](http://codecov.io/github/mike-goodwin/connect-azuretables/coverage.svg?branch=master)](http://codecov.io/github/mike-goodwin/connect-azuretables?branch=master) [![Code Climate](https://codeclimate.com/github/mike-goodwin/connect-azuretables/badges/gpa.svg)](https://codeclimate.com/github/mike-goodwin/connect-azuretables) [![GitHub license](https://img.shields.io/github/license/mike-goodwin/connect-azuretables.svg)](LICENSE.txt)

Connect-AzureTables
===================

An Azure Table Storage backed session store implementation for [express-session](https://github.com/expressjs/session#session-store-implementation), heavily based on [connect-redis](https://www.npmjs.com/package/connect-redis).

Why?
====

1. Azure tables might not be the most performant place to keep sessions, but they are incredibly cheap and simple to get started. There is no need for a server and the cost is practically zero when you're working at dev scale. So, they seem to be a pretty good option where cost is a bigger factor than performance.
2. Why not?

Usage
=====

Not is any NPM repo (yet) so you'll need to download it from here. Sorry.

    var express = require('express');
    var session = require('express-session');
    var AzureTablesStore = require('connect-azuretables')(session);
    var app = express();
    app.use(session({ store: new AzureTablesStore(), secret: "keyboard cat"}));

By default, the Azure storage account will be read from environment variables. Either specify 

    AZURE_STORAGE_CONNECTION_STRING
    
or both of

    AZURE_STORAGE_ACCOUNT
    AZURE_STORAGE_ACCESS_KEY
    
Alternatively you can specify th account/key code as options:

    var options = {storageAccount: "<account name>", accessKey: "<key>"};
    app.use(session({ store: new AzureTablesStore(options), secret: "keyboard cat"}));
  
By default the session data will be stored in a table called

    ConnectAzureTablesSessions
    
This can be overridden using 

    var options = {table: "customtablename"}
  
Whether you use the default or specify your own name, the table will be created if it doesn't already exist.

Tests
=====

Test are written in Jasmine with coverage by Istanbul. The pretest script runs JSLint.

    npm test
    
I aim to maintain test coverage at 100%, since it is only a small project ;-)
