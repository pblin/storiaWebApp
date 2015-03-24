// Set the require.js configuration for your application.
require.config({
  // bust caching of js files
  urlArgs: 'bust=' + (new Date()).getTime(),
  // Initialize the application with the main application file
  paths: {
    // Libraries
    jquery: "libs/jquery/jquery",
    jqueryui: "libs/jquery/jquery-ui-1.10.0.custom.min",
    jqueryuinocustom: "libs/jquery/jquery-ui",
    jquerytouch: "libs/jquery/jquery.ui.touch",
    jqueryswipe: "libs/jquery/jquery.event.swipe",
    jquerymove: "libs/jquery/jquery.event.move",
    jqueryflip: "libs/jquery/jquery.quickflip.min",
    aes: "libs/aes/aes",
    underscore: "libs/underscore/underscore",
    backbone: "libs/backbone/backbone",
    json2: "libs/common/json2",
    turn :"libs/turn/turn",
    turn4 :"libs/turn/turn.html4",
    cookie: "libs/cookie/cookie",
    readalong:"libs/read-along/read-along",
    noteMaker :"libs/noteMaker/noteMaker",
    dictionary :"libs/dictionary/dictionary",
    highlighter:"libs/highlighter/highlighter",
    zoomFeature:"libs/zoom/zoomFeature",
    backbone_relational: 'libs/backbone/backbone.relational',
    backbone_websql : 'libs/backbone/backbone-websql',
    backbone_indexeddb : 'libs/backbone/backbone-indexeddb',
    modernizr :'libs/modernizr/modernizr.min',
    interaction: 'libs/interaction/interaction',
    scratcher: 'libs/interaction/scratcher2',
    excanvas: 'libs/interaction/excanvas.compiled',
    templates: "../templates"
  },
  // Non-AMD libraries
  shim: {
    underscore: {
      exports: function () {
        return _;
      }
    },

    backbone: {
      deps: ['jquery', 'underscore'],

      exports: function ($, _) {
        return Backbone;
      }
    },
    
    backbone_relational: ['backbone'],
    backbone_websql :{
      deps : ['backbone','json2']
    },
    backbone_indexeddb :{
      deps : ['backbone','json2']
    },
    turn:{
      deps : ['jquery']
    },
    turn4:{
      deps : ['jquery']
    },
    jqueryui: {
      deps : ['jquery']
    },
    jqueryuinocustom: {
      deps : ['jquery']
    },
    interaction: {
      deps: ['jquery']
    },
    jquerytouch: {
      deps: ['jquery']
    },
    jquerymove: {
      deps: ['jquery']
    },
    jqueryswipe: {
      deps: ['jquery']
    },
    jqueryflip: {
      deps: ['jquery']
    }
  }

});

require([
  'app'
  ],
  function (Exports) {

    // Start the application
    Exports.app.initialize();
    if(Modernizr.csstransforms){
      // Factories load asynchronous so we have the
      // initialized variables available
      require(['factories'], function () {
        // Execute route
        $(document).ready(function() {
          Backbone.history.start();
      
        });
      });
    }else{
      // Factories load asynchronous so we have the
      // initialized variables available
      require(['turn4','factories'], function () {
        // Execute route
        $(document).ready(function() {
          Backbone.history.start();
      
        });
      });
    }
    
  });
