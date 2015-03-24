(function() {
  
  // Hold reference to Underscore.js and Backbone.js in the closure in order
  // to make things work even if they are removed from the global namespace
  var _ = this._;
  var Backbone = this.Backbone;
  
  // ====== [UTILS] ======
  //function for generating "random" id of objects in DB
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  //function guid() {
  //   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  //}
  // Generate a pseudo-GUID by concatenating random hexadecimals
  //	matching GUID version 4 and the standard variant.
  var VERSION_VALUE = 0x4;// Bits to set
  var VERSION_CLEAR = 0x0;// Bits to clear
  var VARIANT_VALUE = 0x8;// Bits to set for Standard variant (10x)
  var VARIANT_CLEAR = 0x3;// Bits to clear
  function guid() {
    var data3_version = S4();
    data3_version = (parseInt( data3_version.charAt( 0 ), 16 ) & VERSION_CLEAR | VERSION_VALUE).toString( 16 )
    + data3_version.substr( 1, 3 );
    var data4_variant = S4();
    data4_variant = data4_variant.substr( 0, 2 )
    + (parseInt( data4_variant.charAt( 2 ), 16 ) & VARIANT_CLEAR | VARIANT_VALUE).toString( 16 )
    + data4_variant.substr( 3, 1 );
    return( S4() + S4() + '-' + S4() + '-' + data3_version + '-' + data4_variant + '-' + S4() + S4() + S4());
  }

  // ====== [ WebSQLStore ] ======

  Backbone.WebSQLStore = function (db, tableName, model, initSuccessCallback, initErrorCallback) {
    this.tableName = tableName;
    this.db = db;

    var success = function (tx,res) {
      if(initSuccessCallback) initSuccessCallback();
    };
    
    var error = function (tx,error) {
      window.console.error("Error while create table",error);
      if (initErrorCallback) initErrorCallback();
    };
    
    this._executeSql("CREATE TABLE IF NOT EXISTS `" + tableName + "` (`id` unique,`value`) ;",null,success, error);
  
  };
  
  Backbone.WebSQLStore.debug = false;
  _.extend(Backbone.WebSQLStore.prototype,{
	
    create: function (model,success,error) {
     
      //when you want use your id as identifier, use apiid attribute
      if(!model.attributes[model.websqlAttribute]) {
        // Reference model.attributes.apiid for backward compatibility.
        var obj = {};
        obj[model.websqlAttribute] = (model.attributes.apiid)?(model.attributes.apiid):(guid());
        model.set(obj);
      }

      this._executeSql("INSERT INTO `" + this.tableName + "`(`id`,`value`)VALUES(?,?);",[model.attributes[model.websqlAttribute], JSON.stringify(model.toJSON())], success, error);
    },
	
    destroy: function (model, success, error) {
      //window.console.log("sql destroy");
      var id = (model.attributes[model.websqlAttribute] || model.attributes.id);
      this._executeSql("DELETE FROM `"+this.tableName+"` WHERE(`id`=?);",[model.attributes[model.websqlAttribute]],success, error);
    },
	
    find: function (id, success, error) {
      //window.console.log("sql find");
      this._executeSql("SELECT * FROM `"+this.tableName+"` WHERE(`id`=?);",[id], success, error);
    },
	
    findAll: function (model, success,error) {
      //window.console.log("sql findAll");
      this._executeSql("SELECT id,value FROM `"+this.tableName+"` where `id` like '"+model.bookId+"%';",null, success, error);		
    },
	
    update: function (model, success, error) {
      this._executeSql("INSERT OR REPLACE INTO `"+this.tableName+"` (`id`,`value`) VALUES (?,?);",[model.attributes[model.websqlAttribute], JSON.stringify(model.toJSON())], success, error);
    },
	
    _save: function (model, success, error) {
      //      window.console.log("sql _save");
      var id = (model.attributes[model.websqlAttribute] || model.attributes.id);
      this.db.transaction(function(tx) {
        tx.executeSql("");
      });
    },
	
    _executeSql: function (SQL, params, successCallback, errorCallback) {
      var success = function(tx,result) {

        if(Backbone.WebSQLStore.debug) {
          window.console.log(SQL, params, " - finished");
        }
        if(successCallback) successCallback(tx,result);
      };
      
      var error = function(tx,error) {
        if(Backbone.WebSQLStore.debug) {
          window.console.error(SQL, params, " - error: ");
        };
        if(errorCallback) errorCallback(tx,error);
      };
      
      this.db.transaction(function(tx) {       
       tx.executeSql(SQL, params, success, error);
      },function(err){error(null,err)});
    },
    store: function() {
      return store;
    }
  });

  // ====== [ Backbone.sync WebSQL implementation ] ======

  Backbone.webSqlSync = function (method, model, options) {
  //console.log(method);
    var store = model.store || model.collection.store, success, error;
    if (store == null) {
      window.console.warn("[BACKBONE-WEBSQL] model without store object -> ", model);
      return;
    }
	
    success = function (tx, res) {
     
      var len = res.rows.length,result, i;
      if (len > 0) {
        result = JSON.parse(res.rows.item(0).value);
      } 
      options.success(result);
    };
    
    error = function (tx,error) {
      window.console.error("sql error");
      window.console.error(error);
      window.console.error(tx);
      options.error(error);
    };
    
    var resp, syncDfd = $.Deferred && $.Deferred(); //If $ is having Deferred - use it. 

    switch(method) {
      case "read":
        store.find(options.searchId,success,error); 
        break;
      case "create":
        store.update(model);
        break;
      case "update":
        store.update(model);
        break;
      case "delete":
        store.destroy(model);
        break;
      default:
        window.console.error(method);
    }
    

    if (syncDfd) syncDfd.resolve();
    return syncDfd && syncDfd.promise();
  
  };
  
  Backbone.ajaxSync = Backbone.sync;

  Backbone.getSyncMethod = function(model) {
 
    if(model.store || (model.collection && model.collection.store))
    {
      return Backbone.webSqlSync;
    }
	else if(model.database)
	{
	  return  Backbone.indexDBSync;
	}
	else
       return Backbone.ajaxSync;
  };
  
  // Override 'Backbone.sync' to default to localSync,
  // the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
  Backbone.sync = function(method, model, options) {
    return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
  };
  

})();