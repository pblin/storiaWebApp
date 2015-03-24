define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/homeTemplate.html',
  'models/bookModel',
  'views/book/BookView',
  ], function($, _, Backbone, homeTemplate, BookModel, BookView){
    var HomeView = Backbone.View.extend({
      el: $("#page"),
      render: function(){
        this.$el.html(homeTemplate);
        //check if book downloaded or not
        this.checkIfDownloaed('9780545368759');
        this.checkIfDownloaed('9780545367771');
        this.checkIfDownloaed('9780545292757');
        this.checkIfDownloaed('9780545391832');
      },
	  
      events: {
        'click .BtnDownload': 'download'
      },
	  
      checkIfDownloaed:function(bookId)
      {
        var bookModel = Backbone.Relational.store.find(BookModel,bookId);
		  		
        if(bookModel === null){  
	 
          bookModel = new BookModel({
            'bookId'  :bookId,
            'checking': true,
            'downloading': false
          });
        }else{
          bookModel.checking=true;
          bookModel.downloading=false;
        }

        // hide download button if browser doesn't suport websql or indexeddb
        if(bookModel.store !== null || bookModel.database !== null){
          //fetch if downloaded info from api
          bookModel.fetchDownloaded({
            success: function (resp) {
              //console.log(resp);
              if(resp==true)
                $("#span-"+bookId ).html('Downloaded');
            }
          });
        }else{
          $("#span-"+bookId ).html('');
        }
      },
	  
      download: function (e) {
	  
        var bookId = e.target.id;
        document.getElementById('stylesheet').href = bookId+'/storia_'+bookId+'.css';    
        var cookieStr=getCookie('storiaBook');
        var cookied=false;
		 
        if(cookieStr && cookieStr.length>0)
        {
          var cookies=cookieStr.split(",");
			
          for (var i = 0; i < cookies.length; i++) {
            if(bookId == cookies[i])
            {
              cookied=true;
              break;
            }
          }
          if(!cookied)
            cookieStr+=','+bookId;
        }
        else 
          cookieStr=bookId;
		
        setCookie('storiaBook', cookieStr, 365);

	
        //var appCache = window.applicationCache;
      
        //appCache.update();
        e.preventDefault();
		
        var bookId = e.target.id;
        var bookModel = Backbone.Relational.store.find(BookModel,bookId);
		
        if(bookModel === null){       
          bookModel = new BookModel({
            'bookId'  :bookId,
            'downloading': true,
            'checking':false
          });
        }else{
          bookModel.downloading=true;
          bookModel.checking=false;
        }
         
        bookModel.fetch({
          success: function () {
			
          }
        });
     
      }
    });

    return HomeView;
  
  });