Connect-AzureTables
===================

An Azure Table Storage backed session store implementation for [express-session](https://github.com/expressjs/session#session-store-implementation), heavily based on [connect-redis]()https://www.npmjs.com/package/connect-redis).

*Health Warning:* This is work in progress - it is not finished and has had literally no testing!

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
    
Alternatively you can specify them in code as options:

    var options = {azureStorageConnectionString: "<your connection string>"};
    app.use(session({ store: new AzureTablesStore(options), secret: "keyboard cat"}));
 
or

    var options = {storageAccount: "<account name>", accessKey: "<key>"};
    app.use(session({ store: new AzureTablesStore(options), secret: "keyboard cat"}));
  
By default the session data will be stored in a table called

    ConnectAzureTablesSessions
    
This can be overridden using 

    var options = {table: "customtablename"}
  
Whether you use the default or specify your own name, the table will be created if it doesn't already exist.
