/**
 * Pluging and override methods
 */
define([
  'backbone',
  'underscore',
  'app',
  'module',
  'backbone_relational',
  'backbone_websql',
  ],function (Backbone, _,Exports, Module) {
    
    // Override sync function to switch storage to localstorage or API
    Backbone.sync = function(method, model, options, error) {
   
      if (options.webSqlStorage || options.indexedDBStorage) {
        return Backbone.getSyncMethod(model).apply(this, [method, model, options, error]);
      }
      else {
        // Run default backbone ajax sync
       return Backbone.ajaxSync.apply(this, [method, model, options, error]);
      }
    };
    
    
    var Factories = {
      app: Exports.app
    };

    // Add factories method to all backbone models
    _.extend(Backbone.Model.prototype, Factories);
    _.extend(Backbone.View.prototype, Factories);
    _.extend(Backbone.Collection.prototype,Factories);
    _.extend(Backbone.Router.prototype, Factories);
    
    // do not cache requests
    $.ajaxSetup({
//      cache: false
    });
  });