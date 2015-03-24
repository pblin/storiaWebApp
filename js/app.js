define([
  'underscore',
  'backbone',
  'exports',
  'router',
  'models/settings',
  'collections/library',
  'models/dataModel'
  ], function (_, Backbone, Exports, Router, Settings, TocModel, dataModel) {
      var dm = new dataModel();
    Exports.app = {
      apiUrl: 'http://54.197.249.148:8080/ereader/restApp/',
      //apiUrl: 'http://cloudapi.cloudhub.io/cloudread/',
      collections: {},
      settings: null,
      bookPages:null,
      currentView:null,
      db: dm.openDatabase("library", "", "Backbone-websql example", 50 * 1024),
      initialize: function () {
        this.settings = new Settings();
        this.vent = new _.extend({}, Backbone.Events);
         window.vent = this.vent;
        
        // check device orientation - based on width/height (window.orientation is not reliable)
        this.checkDeviceOrientation();
        
        var self = this;
        window.onorientationchange = function () {
          self.checkDeviceOrientation();
          self.vent.trigger('app:resize');
        };
        
        window.onresize = function(event) {
          if($(window).height() > $(window).width()){
            if(self.orientation != 'portrait'){
              self.orientation = 'portrait';
            }
          }else{
            if(self.orientation != 'landscape'){
              self.orientation = 'landscape';
            }
          }
          self.vent.trigger('app:resize');
        } 
        Router.initialize();
      },
    checkDeviceOrientation:function(){
        width  = $(window).width();
        height = $(window).height();
        if(height > width){
          this.orientation = 'portrait';    
        }else{
          this.orientation = 'landscape';
        }
      },

      loadData: function () {
        this.settings.fetch({
          webSqlStorage: dm.check()
        });
      }

    };
    
  });
