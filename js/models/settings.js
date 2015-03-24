/**
 * Local storage settings
 */
define([
  'backbone',
  'underscore',
  'models/dataModel',
  'backbone_websql'
  ],
  function (Backbone, _, dataModel) {
      var dm = new dataModel();
      var db = dm.openDatabase("settings", "", "Scholaric settings", 1024 * 1024);
      var Settings = Backbone.Model.extend({
          defaults: {
              id: 'settings',
              language: 'en',
              defaultInstrument: false,
              currentBookId: '',
              currentPageIndex: ''
          },
          aa: 10,
          url: function () {
              return "http://54.197.249.148:8080/ereader/restApp/GetContentFragments";
              //return "http://cloudapi.cloudhub.io/cloudread/GetContentFragments";
          },
          initialize: function () {
              // Load settings from local storage
              this.save(null, {
                  webSqlStorage: true
              });

              // Save settings when there is a change
              this.bind('change', function () {
                  this.save(null, {
                      webSqlStorage: true
                  });
              }, this);
          },
          store: dm.webStore(db, "settings")
      });
      return Settings
  });
