define([
  'backbone',
  'underscore',
  'backbone_websql',
  ],
  function (Backbone, _ ){
    var db = openDatabase("library", "", "Backbone-websql example", 50*1024);
    var toc =  Backbone.Model.extend({
      
      defaults: {
        bookId: '',
        action: 'GetContentMetaData',
        sessionToken :'xxhdhnv'
      },
      
      idAttribute : 'bookId',
      
      bookPages:null,
      
      store : new Backbone.WebSQLStore(db, "toc"),
      
      initialize: function (param) {
        this.bookId = param.bookId;
      
      },
      

      
      fetch: function (options) {
        options = options ? _.clone(options) : {};
        
        var queryParams = {
          data: {
            bookid: this.bookId,
            sessionToken: this.get('sessionToken')
          }
        };  
        
        
        
        
        options = _.extend(options,queryParams);
        
        /*        
       * jsonp callback  
       */ 
        
        options.dataType = 'jsonp';
        options.jsonp = 'jsonp';
        
        options.url = this.app.apiUrl+this.get('action');
        
        //        var self = this;
        //        console.log(self.attributes.bookId);
        //        this.store.find(self.attributes.bookId ,function(tx,res) {
        //          var len = res.rows.length;
        //          if (len > 0){ 
        //            options.webSqlStorage = true;
        //          }
        //          
        //          if(!options.webSqlStorage){
        //            options.success = function(tx,rsp){
        //              self.store.update(self);  
        //            };
        //          }
        //            
        //          Backbone.Model.prototype.fetch.call(self, options);
        //          
        //          return;
        //        });
        
        Backbone.Model.prototype.fetch.call(this, options);
      
      },
      
      parse: function(resp, xhr) {
        response = response ? _.clone(response) : {};
        //console.log(resp);
        
        if(typeof xhr !== 'undefined')
          if(resp){
            //console.log(jQuery.parseJSON(resp[1].playOrders));
            var playOrderResponse = jQuery.parseJSON(resp[1].playOrders);
            
            var bookPages = [];
            var playOrder = [];
            $.each(playOrderResponse,function(index,value){
              if(typeof value.order !== 'undefined'){
                bookPages[value.fragId] = value;
                playOrder[value.order] = value.fragId;
              }
              
            });
          
            var response = {
              'info' :resp[0], 
              'bookPages' : bookPages,
              'playOrder' : playOrder
            };
            //console.log(response);
          }
          
        return response;
      }
      
    });
    
    return toc;
  });   