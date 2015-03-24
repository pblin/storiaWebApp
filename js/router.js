// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/book/BookView',
  'models/bookModel',
  'cookie',
  ], function($, _, Backbone, HomeView,BookView,BookModel) {
  
    var AppRouter = Backbone.Router.extend({
      routes: {
        // Define some URL routes
        'book/:param': 'showBook',
      
        // Default
        '*actions': 'defaultAction'
      }
    });
  
    var initialize = function(){

      var app_router = new AppRouter;
      
      // Book view
      app_router.on('route:showBook', function(param){
        //used for manifest cache
        var cookieStr=getCookie('storiaBook');
        var cookied=false;
		 
        if(cookieStr && cookieStr.length>0)
        {
          var cookies=cookieStr.split(",");
			
          for (var i = 0; i < cookies.length; i++) {
            if(param == cookies[i])
            {
              cookied=true;
              break;
            }
          }
          if(!cookied)
            cookieStr+=','+param;
        }
        else 
          cookieStr=param;
		
        setCookie('storiaBook', cookieStr, 365);
        //update cache
        //var appCache = window.applicationCache;
        //appCache.update();
        // get book
        var bookModel = Backbone.Relational.store.find(BookModel,param);

        if(bookModel === null){       
          bookModel = new BookModel({
            'bookId'  :param,
            'downloading':false,
            'checking':false
          });
        }else{
          bookModel.downloading=false;
          bookModel.checking=false;
        }

        bookModel.init();
		
        if(this.app.currentView !== null){
          this.app.currentView.undelegateEvents();
          this.app.currentView = null;
        }
        // initialize book view and render
        var bookView = new BookView({
          'model' : bookModel
        });
        this.app.currentView = bookView;
        
        bookModel.fetch({
          success: function () {
          }
        });
   
      });
      
      // Home view
      app_router.on('route:defaultAction', function (actions) {
//      We have no matching route, lets display the home page 
        
        if(this.app.currentView !== null){
//      this.app.currentView.remove();
          this.app.currentView.undelegateEvents();
          this.app.currentView = null;
        }
        
        var homeView = new HomeView();
        this.app.currentView = homeView;
        this.app.currentView.render();

      });
    };
    return { 
      initialize: initialize
    };
  });