define([
  'backbone',
  'underscore',
  'backbone_websql',
  'backbone_indexeddb',
  ],
  function (Backbone, _) {
    var dataModel = Backbone.Model.extend({

      defaults: {
        webSql: null,
        action: 'GetContentMetaData',
        sessionToken: 'xxhdhnv',
        indexedDB: null
      },

      //url: function () {
      //    return this.app.apiUrl + this.action;
      //},

      initialize: function (param) {
        this.check();
      },

      check: function () {
        this.webSql = (typeof (window.openDatabase) != 'undefined');
        return this.webSql;
      },
		  
      checkIndexedDB: function () {
        this.indexedDB = (typeof (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB) != 'undefined');
        return (this.indexedDB && !this.check());
      },

      // openDatabase(db name, required version (blank string for n/a), human-readable database name, expected size in bytes)
      openDatabase: function (dbname, version, friendname, size) {
        var db = null;
        if (this.webSql == null)
          this.check();

        if (this.webSql)
          db = openDatabase(dbname, version, friendname, size);
			  
			     
        return db;
      },

      //Backbone.WebSQLStore(db, tableName, model, initSuccessCallback, initErrorCallback)
      webStore: function (db, name, model, initSuccessCallback, initErrorCallback) {
        var store = null;
        if (this.webSql == null)
          this.check();

        if (this.webSql && db != null)
          store = new Backbone.WebSQLStore(db, name, model, initSuccessCallback, initErrorCallback);
					
        return store;
      },
		  
      indexedDBStore: function () {
        var database=null;
			   
        if(this.checkIndexedDB())
        {
          database = {
            id: "library",
            description: "The database for the storia",
            migrations: [{
              version: 1.0,
              migrate: function (transaction, next) {
                var store = transaction.db.createObjectStore("thumbnails", {
                  keyPath: "identity"
                });
                var store2 = transaction.db.createObjectStore("bookPages", {
                  keyPath: "identity"
                });
                var store3 = transaction.db.createObjectStore("books", {
                  keyPath: "bookId"
                });
                next();
              }
            }]
          };
        }
        return database;
      },
		
      transaction: function (tx) {
        if (this.webSql == null)
          this.check();

        if (this.webSql)
          return tx();
        else
          return null;
      }

    });

    return dataModel;
  });   