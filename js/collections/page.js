define([
  'backbone',
  'models/pageModel',
  'backbone_websql'
  ],
  function (Backbone, PageModel) {
    return Backbone.Collection.extend({
      model: PageModel
    });
  });