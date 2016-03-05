/*   Copyright 2016 Mike Goodwin

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var azure = require('azure-storage');
var util = require('util');

var DEFAULT_TABLE = 'ConnectAzureTablesSessions';
var RETRY_LIMIT = 3;
var RETRY_INTERVAL = 3000 //miliseconds

module.exports = function(session) {
    
    var Store = session.Store;
    
    function AzureTablesStore(options) {
        
        if (!(this instanceof AzureTablesStore)) {
            throw new TypeError('Cannot call AzureTablesStore constructor as a function');
        }
        
        var self = this;
        
        options = options || {};
        Store.call(this, options);
        
        /* 
        storage account set up. azure-storage will attempt to read the following environment variables:
        AZURE_STORAGE_ACCOUNT
        AZURE_STORAGE_ACCESS_KEY
        or
        AZURE_STORAGE_CONNECTION_STRING
        if these are not found, storageAccount and accessKey
        must be supplied on options
        */
        
        //todo: allow retry policy to bet set on options
        var retryOperations = new azure.LinearRetryPolicyFilter(RETRY_LIMIT, RETRY_INTERVAL);
        var azureStorageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        
        if (azureStorageConnectionString) {
            self.tableService = azure.createTableService().withFilter(retryOperations);
        }
        else {
            var storageAccount = process.env.AZURE_STORAGE_ACCOUNT || options.storageAccount;
            var accessKey = process.env.AZURE_STORAGE_ACCESS_KEY ||options.accessKey;
            self.tableService = azure.createTableService(storageAccount, accessKey).withFilter(retryOperations);
        }
        
        /*
        table setup
        table name can be supplied on options
        */
        
        self.table = options.table || DEFAULT_TABLE;
        self.tableService.createTableIfNotExists(self.table, function(error, result) {
            
            if(!error && result) {
                console.info('created table ' + self.table);    
            }
            else {
                throw ('failed to create table: ' + error);
            } 
        });  
    }
    
    util.inherits(AzureTablesStore, Store);
    
    //all - optional function
    
    //destroy - required function
    AzureTablesStore.prototype.destroy = function(sid, fn) {
        var store = this;
        var cleanSid = sanitize(sid);
        var entGen = azure.TableUtilities.entityGenerator;
        var session = {
            PartitionKey: entGen.String(cleanSid),
            RowKey: entGen.String(cleanSid),
        };
        
        if (!fn) {
            fn = noop;
        }
        console.info('DESTROY "%s"', sid);
        
        store.tableService.deleteEntity(store.table, session, function(error, result) {     
            return error ? fn(error) : fn(null, result); 
        });  
    }
    
    //clear - optional function
    
    //length - optional function
    
    //get - required function
    AzureTablesStore.prototype.get = function(sid, fn) {
        var store = this;
        var cleanSid = sanitize(sid);
        if (!fn) {
            fn = noop;
        }
        console.info('GET "%s"', sid);
        
        store.tableService.retrieveEntity(store.table, cleanSid, cleanSid, function(error, result) {     
            return error ? fn(error) : fn(null, JSON.parse(result.data._)); 
        });  
    }
    
    //set - required function
    AzureTablesStore.prototype.set = function(sid, data, fn) {
        var store = this;
        var cleanSid = sanitize(sid);
        var entGen = azure.TableUtilities.entityGenerator;
        var session = {
            PartitionKey: entGen.String(cleanSid),
            RowKey: entGen.String(cleanSid),
            data: entGen.String(JSON.stringify(data))
        };
        
        if (!fn) {
            fn = noop;
        }
        console.info('SET "%s"', sid);
        
        store.tableService.insertOrReplaceEntity(store.table, session, function(error, result) {     
            return error ? fn(error) : fn(null, result); 
        });  
    }
    
    //touch - optional function
    
    //ensure sid is suitable as a row key
    function sanitize(sid) {
        return sid.replace(/[^0-9A-Za-z]/g,'')
    }
    
    //no-op function
    function noop() {}
    
    return AzureTablesStore;
}