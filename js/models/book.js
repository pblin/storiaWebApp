define([
  'backbone',
  'underscore',
  'models/zooming',
  'models/toc',
  'backbone_websql',
  ],
  function (Backbone, _ , ZoomingModel,TocModel) {
    var db = openDatabase("library", "", "Backbone-websql example", 50*1024);
    var Book =  Backbone.Model.extend({
      defaults: {
        identity : '',
        id : 1,
        pageContent: ''
      },
      type:'full',
      action: 'GetContentFragments',
      zoomingModel: new ZoomingModel(),
      sessionToken :'xxxx',
      
      idAttribute : 'identity',
      
      bookPages : [],
     
      store : new Backbone.WebSQLStore(db, "bookPages"),
      url: function(){
        return this.app.apiUrl+this.action;
      },
      initialize: function (param) {
        this.bookId = param.bookId;
               
        this.loadData();
        var self = this;
        this.bind('localStorageDataLoaded',_.bind(function () {
          
          self.app.toc = new TocModel({
            'bookId': this.bookId
          });
          
          self2 = self;
          self.app.toc.fetch({
            'success' : function(){
              if(self.bookPages && self.app.toc.attributes.playOrder.length == _.size(self.bookPages)){
                self.trigger('dataLoaded');
              }else{
                var deferreds = [];
                for( var id in self.app.toc.attributes.playOrder){
                  if(typeof self.app.toc.attributes.playOrder[id] !== 'undefined'){
                    deferreds.push(self.fetch({
                      'page':'fixed',
                      'pageId':self.app.toc.attributes.playOrder[id]
                    }));
                  }
                }
                $.when.apply($,deferreds).done(function() {
                  self.trigger('dataLoaded');
                });
              }
            }
          });
        }, this));
      },
      
      loadData:function(){
        var self = this;
        var bookPages = [];
        database = this.store.findAll(this,function(tx,rs){
          if(rs.rows.length>0){
            for (var i=0; i < rs.rows.length; i++) {
              value = JSON.parse(rs.rows.item(i).value);
              bookPages[value.id] = {
                'content' :value.pageContent,
                'width' : value.meta_width,
                'height' : value.meta_height
              };
            }
          }
          self.trigger('localStorageDataLoaded');
        });
        this.bookPages = bookPages;
      },
      
      parse: function(resp, xhr) {
        if(typeof xhr !== 'undefined')
          if(typeof resp !== 'undefined'){
            if(resp.length > 1) {
              // our initial request
              this.attributes.toc = resp;
              this.attributes.tocArr = resp;
              resp = _.extend(resp,{
                'page':'pcover',
                'id':'pcover',
                'pageContent': resp.cover,
                'pcover':'',
                'identity':this.attributes.bookId+'_pcover',
                'frag' : '',
                'pageIndex' : 1
              });
            }
            else {
              resp = _.extend(resp[0],{
                'id' : resp[0].id,
                'pageCover' : '',
                'pageContent' : resp[0].frag,
                'identity':this.attributes.bookId+'_'+resp[0].id,
                'frag' : ''
              });
            }
            
            
            var pageSize;
            // only need to go through this one time, so only parse it
            // if it is not already known
            if(typeof resp.meta_width !== "undefined") {
              return;
            }

            pageSize = this.parseViewportTag(resp.pageContent);
            if(pageSize) {
              resp = _.extend(resp,{
                "meta_width": pageSize.width * 2, 
                "meta_height": pageSize.height
              });
            }
          }
        return resp;
      },
      
      fetch: function (options) {
        options = options || {};
        
        var queryParams = {
          data: {
            bookid: this.bookId,
            sessionToken: this.sessionToken,
            type : this.type
          }
        };

        if(options.page == 'fixed') {
          newPage = options.pageId;
          queryParams.data.refIds = newPage;
        }else{
          newPage = this.getPageId(options.page,this.attributes.page); 
          if(newPage!=-1){
            queryParams.data.refIds = newPage;
          }else
            return;
        }
       
        options = _.extend(options,queryParams);
         
        /*        
       * jsonp callback  
       */                                   
        options.dataType = 'jsonp';
        options.jsonp = 'jsonp';
         
        /*
       * If websqlstorage is false then we save into localstorage   
       */   
          
        // default fetch data from server
        options = _.extend(options,{
          'webSqlStorage' : false
        });
        
        var self = this;
        if(options.page) 
          id = newPage;
        else if(self.attributes.page)
          id = self.attributes.page;
        
        
        if(typeof id !== 'undefined'){
          options.searchId =this.attributes.bookId+'_'+id;
          
          self.store.find(self.attributes.bookId + '_' +id,function(tx,res) {
            var len = res.rows.length;
            if (len > 0){ 
              options.webSqlStorage = true;
            }

            if(!options.webSqlStorage){
              options.success = function(tx,rsp){
                self.store.update(self); 
              };
            }            
            Backbone.Model.prototype.fetch.call(self, options);
            return;
          });
        }else{
          if(!options.webSqlStorage){
            options.success = function(tx,rsp){
              self.store.update(self);  
            };
          }
          
          Backbone.Model.prototype.fetch.call(self, options);
        }
      },
      
      getNextPage:function(){
        return this.getPageId('next');
      },
      
      getPrevPage:function(){
        return this.getPageId('prev');
      },
      /*
   * get next page id / prev page depending on direction
   */
      getPageId:function(direction,pageId){
        currPage = this.app.settings.get('currentPageIndex');
        
        if(currPage == '' || typeof direction === 'undefined'){
          newPage = _.first(_.keys(this.app.toc.get('playOrder')));
          this.app.settings.set('currentPageIndex',1);
        }else{
          currPage = parseInt(currPage);
          if(direction == 'prev'){
            newPage = currPage-1;
          }else if(direction == 'next'){
            newPage = currPage+1;
          }
          
        }
        
        if(this.app.toc.attributes.playOrder[newPage]){
          this.app.settings.set('currentPageIndex',newPage);
          return this.app.toc.attributes.playOrder[newPage];
        }
        else 
          return -1;
        return -1;
      },

      getContentDom: function(content) {
        //        var content = this.get('pageContent');
        if(content) {
          var parser = new window.DOMParser();
          return parser.parseFromString(content, 'text/xml');
        }
      },
      
      // parse viewport tag
      // [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
      parseViewportTag: function(content) {
        var dom = this.getContentDom(content);       
        if(!dom) {
          return;
        }
        var viewportTag = dom.getElementsByName("viewport")[0];
        if(!viewportTag) {
          return null;
        }
        var str = viewportTag.getAttribute('content');
        str = str.replace(/\s/g, '');
        var valuePairs = str.split(',');
        var values = {};
        var pair;
        for(var i = 0; i < valuePairs.length; i++) {
          pair = valuePairs[i].split('=');
          if(pair.length === 2) {
            values[ pair[0] ] = pair[1];
          }
        }
        values['width'] = parseFloat(values['width'], 10);
        values['height'] = parseFloat(values['height'], 10);
        return values;
      },
      // parse viewbox tag - [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
      parseViewboxTag: function() {

        // The value of the ‘viewBox’ attribute is a list of four numbers 
        // `<min-x>`, `<min-y>`, `<width>` and `<height>`, separated by 
        // whitespace and/or a comma
        var dom = this.get('pageContent');
        if(!dom) {
          return;
        }
        var viewboxString = dom.documentElement.getAttribute("viewBox");
        // split on whitespace and/or comma
        var valuesArray = viewboxString.split(/,?\s+|,/);
        var values = {};
        values['width'] = parseFloat(valuesArray[2], 10);
        values['height'] = parseFloat(valuesArray[3], 10);
        return values;
      },
      
      isSvg: function() {
        return this.get("media_type") === "image/svg+xml";
      },

      isImage: function() {
        var media_type = this.get("media_type");

        if(media_type && media_type.indexOf("image/") > -1) {
          // we want to treat svg as a special case, so they
          // are not images
          return media_type !== "image/svg+xml";
        }
        return false;
      }   
    });
    return Book;
  });   
