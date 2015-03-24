define([
  'backbone',
  'models/bookModel',
  'models/dataModel'
  ],
  function (Backbone, BookModel, dataModel) {
      var dm = new dataModel();
      var db = dm.openDatabase("library", "", "Backbone-websql example", 1024 * 1024);
      return Backbone.Collection.extend({
          model: BookModel
      });
  });