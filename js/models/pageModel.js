define([
  'backbone',
  'underscore',
  'models/zooming',
  'models/dataModel',
  'models/bookModel',
  'backbone_relational',
  'aes'
  ],
  function (Backbone, _, ZoomingModel, dataModel, bookModel) {
    var dm = new dataModel();
    var websqlDB = dm.openDatabase("library", "", "Backbone-websql example", 50 * 1024 * 1024);
    var indexedDB=dm.indexedDBStore();

    var bookPage = Backbone.RelationalModel.extend({
      //websql variable
      store: dm.webStore(websqlDB, "bookPages"),
      //indexeddb variable
      database: indexedDB,
      storeName: "bookPages",
		      
           
      defaults: {
        identity: null,
        id: 1,
        pageContent: null,
        pageId: null
      },

      type: 'full',
      action: 'GetContentFragments',
      zoomingModel: new ZoomingModel(),
      sessionToken: 'xxxx',

      idAttribute: 'identity',

      websqlAttribute: 'identity',

         
      url: function () {
        return this.app.apiUrl + this.action;
      },
		  
      initialize: function (param) {
        this.bookId = param.bookId;
        this.pageId=param.pageId;
        this.identity = param.bookId+'_'+param.pageId;
      },
		  
      fetch: function (options) {
        options = options || {};
        var success = options.success;
        var error = options.error;
        
        var queryParams = {
          data: {
            bookid: this.get('bookId'),
            sessionToken: this.sessionToken,
            type: this.type
          }
        };
			  
        queryParams.data.refIds = options.page;
        options = _.extend(options, queryParams);

        /*        
              * jsonp callback  
              */
        options.dataType = 'jsonp';
        options.jsonp = 'jsonp';
        options.indexedDBStorage = false;
        // default fetch data from server
        options = _.extend(options, {
          'webSqlStorage': false
        });

        var self = this;
           
        var id = options.page;
        options.searchId = this.attributes.bookId + '_' + id;
			  
        //check if browser srupport websql
        if (typeof id !== 'undefined' && self.store != null) {              
             
             
          //check if data saved in websql
          self.store.find(self.attributes.bookId + '_' + id, function (tx, res) {
            var len = res.rows.length;
            if (len > 0) {
              options.webSqlStorage = true;
            }
            //if no data in websql, save it then
            if (!options.webSqlStorage) {
              options.success = function (tx, rsp) {
                //encrypt pagecontent before save to db,  so the pagecontent is encrypted in db
                var encrypted = CryptoJS.AES.encrypt(self.get('pageContent'), "test");
                self.set('pageContent',encrypted.toString());
								   
                self.store.update(self, function (tx, res) {
                  //decrypt the pageContent after saved
                  var decrypted = CryptoJS.AES.decrypt(encrypted, "test");
                  self.set('pageContent',decrypted.toString(CryptoJS.enc.Utf8));
                  success(options.page);
                },function(tx, err){
                  error(options.pageIndex,err)
                });
              };
            } else if (typeof success !== 'undefined') {
              options.success = function (tx, rsp) {
                //decrypt the pageContent 
                var decrypted = CryptoJS.AES.decrypt(self.get('pageContent'), "test");
                self.set('pageContent',decrypted.toString(CryptoJS.enc.Utf8));
                success(options.page);
              };
            }
            return Backbone.Model.prototype.fetch.call(self, options);
          });
          
          
        } else {
          //check if support indexeddb
          if(typeof id !== 'undefined' && self.database!=null)
          {
            options.indexedDBStorage = true;
            options.isSavedIndexedDB = true;
            self.identity = options.searchId;
						  
            options.success = function (tx, rsp) {
              //console.log(options);
              //save into indexedDB
              if(options.isSavedIndexedDB==false)
              { 
                //encrypt pagecontent before save to db,  so the pagecontent is encrypted in db
                var encrypted = CryptoJS.AES.encrypt(self.get('pageContent'), "test");
                self.set('pageContent',encrypted.toString());
									   
                self.save(rsp, {
                  indexedDBStorage:true,
                  success: function () {
                    //decrypt the pageContent after saved
                    var decrypted = CryptoJS.AES.decrypt(encrypted, "test");
                    self.set('pageContent',decrypted.toString(CryptoJS.enc.Utf8));
                    //console.log('saved');
                    success(options.page);
                  }
                });
              }
              else{
                if (typeof success !== 'undefined') 
                {
                  //decrypt the pageContent after saved
                  var decrypted = CryptoJS.AES.decrypt(self.get('pageContent'), "test");
                  self.set('pageContent',decrypted.toString(CryptoJS.enc.Utf8));
                  success(options.page);
                }
              }
            };
            options.error = function (tx, rsp) {
              //console.log(rsp)
              //not found in indexeddb call webapi
              if(rsp=='Not Found')
              { 
                options.isSavedIndexedDB=false;
                options.indexedDBStorage = false;
                return Backbone.Model.prototype.fetch.call(self, options);
              }
            };
          }
          //do not support websql and indexdb
          else if (typeof success !== 'undefined') {
            options.success = function (tx, rsp) {
              if (typeof success !== 'undefined') success(options.page);
            };
          }

          return Backbone.Model.prototype.fetch.call(self, options);
        }
      },

      parse: function (resp, xhr) {
        if (typeof xhr !== 'undefined') {
          if (typeof resp !== 'undefined') {
            if (resp.length > 1) {
              // our initial request
              this.attributes.toc = resp;
              this.attributes.tocArr = resp;
              resp = _.extend(resp, {
                'page': 'pcover',
                'id': this.attributes.bookId +'_pcover',
                'pageContent': resp.cover,
                'pcover': '',
                'identity': this.attributes.bookId + '_pcover',
                'frag': '',
                'pageIndex': 1
              });
            }
            else {
              if (resp[0]) {
                resp = _.extend(resp[0], {
                  'id': resp[0].id,
                  'pageCover': '',
                  'pageContent': resp[0].frag,
                  'identity': this.attributes.bookId + '_' + resp[0].id,
                  'frag': ''
                });
              }
            }

            var pageSize;
            // only need to go through this one time, so only parse it
            // if it is not already known
            if (typeof resp.meta_width !== "undefined") {
              return;
            }

            pageSize = this.parseViewportTag(resp.pageContent);
            if (pageSize) {
              resp = _.extend(resp, {
                "meta_width": pageSize.width * 2,
                "meta_height": pageSize.height
              });
            }
          }
        }

        return resp;
      },

         
      getNextPage: function () {
        return this.getPageId('next');
      },

      getPrevPage: function () {
        return this.getPageId('prev');
      },
      /*
          * get next page id / prev page depending on direction
          */
      getPageId: function (direction, pageId) {
        currPage = this.app.settings.get('currentPageIndex');

        if (currPage == '' || typeof direction === 'undefined') {
          newPage = _.first(_.keys(this.app.toc.get('playOrder')));
          this.app.settings.set('currentPageIndex', 1);
        } else {
          currPage = parseInt(currPage);
          if (direction == 'prev') {
            newPage = currPage - 1;
          } else if (direction == 'next') {
            newPage = currPage + 1;
          }

        }

        if (this.app.toc.attributes.playOrder[newPage]) {
          this.app.settings.set('currentPageIndex', newPage);
          return this.app.toc.attributes.playOrder[newPage];
        }
        else
          return -1;
        return -1;
      },

      getContentDom: function (content) {
        if(content) {
          return jQuery.parseXML(content);
        }
      },

      // parse viewport tag
      // [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
      parseViewportTag: function (content) {
        var dom = this.getContentDom(content);       
        if(!dom) {
          return;
        }
        var viewportTag = $(dom).find("meta[name='viewport']");
        if(!viewportTag) {
          return null;
        }
        
        var str = viewportTag.attr('content');
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
      parseViewboxTag: function () {
        // The value of the ‘viewBox’ attribute is a list of four numbers 
        // `<min-x>`, `<min-y>`, `<width>` and `<height>`, separated by 
        // whitespace and/or a comma
        var dom = this.get('pageContent');
        if (!dom) {
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

      isSvg: function () {
        return this.get("media_type") === "image/svg+xml";
      },

      isImage: function () {
        var media_type = this.get("media_type");

        if (media_type && media_type.indexOf("image/") > -1) {
          // we want to treat svg as a special case, so they
          // are not images
          return media_type !== "image/svg+xml";
        }
        return false;
      }


    });

    return bookPage;

  });