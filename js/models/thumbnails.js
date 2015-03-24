define([
  'backbone',
  'underscore',
  'models/dataModel'
  ],
  function (Backbone, _, dataModel) {
    var dm = new dataModel();
    var websqlDB = dm.openDatabase("library", "", "Backbone-websql example", 50 * 1024);
    var indexedDB=dm.indexedDBStore();
	 
    var thumbModel = Backbone.Model.extend({
      //websql variable
      store: dm.webStore(websqlDB, "thumbnails"),
      //indexeddb variable
      database: indexedDB,
      storeName: "thumbnails",
		
      defaults: {
        identity: '',
        id: 1,
        tb: '',
        pageId: ''
      },

      type: 'tb',
      action: 'GetContentFragments',
      sessionToken: 'xxxx',
      idAttribute: 'pageId',
      websqlAttribute: 'identity',
      bookId: '',

      //store the thumbnail for all pages
      thumbList: [],
		
      initialize: function (param) {
        this.bookId = param.bookId;
      },
		  
      fetch: function (options) {

        options = options ? _.clone(options) : {};
        var success = options.success;

        var aditionalOptions = {
          data: {
            bookid: this.bookId,
            sessionToken: this.sessionToken,
            type: this.type,
            refIds: options.pageId
          },
          url: this.app.apiUrl + this.action,
          dataType: 'jsonp',
          jsonp: 'jsonp',
          webSqlStorage: false,
          indexedDBStorage: false
        };

        var self = this;
        options = _.extend(options, aditionalOptions);

        var id = options.pageId;
        options.searchId = this.attributes.bookId + '_' + id;
			  
        //check if broswer support websql
        if (typeof id !== 'undefined' && self.store != null) {
                 
          //select record from websqldb
          self.store.find(self.attributes.bookId + '_' + id, function (tx, res) {
            var len = res.rows.length;
            //check if record in websqldb
            if (len > 0) {
              options.webSqlStorage = true;
            }
            //if not in websqldb, call webapi and saved to websqldb
            if (!options.webSqlStorage) {
              options.success = function (tx, rsp) {
                //save to websqldb
                self.store.update(self);
                if (typeof success !== 'undefined') {
                  success(self.attributes);
                }
              };
            //pull from websqldb
            } else if (typeof success !== 'undefined') {
              options.success = function (tx, rsp) {
                success(rsp);
              };
            }
            //call fetch with option:webSqlStorage. if (option:webSqlStorage==false) will call webapi. else do nothing
            Backbone.Model.prototype.fetch.call(self, options);
            return;

          });
        }
        //not support websql
        else
        {
          //check if support indexeddb
          if(typeof id !== 'undefined' && self.database!=null)
          {
            options.indexedDBStorage = true;
            options.isSavedIndexedDB=true;
				  
            options.success = function (tx, rsp) {
              //save into indexedDB
              if(options.isSavedIndexedDB==false)
              { 
                self.save(rsp, {
                  indexedDBStorage:true
                });
                if (typeof success !== 'undefined') success(self.attributes);
                return;
              }
              else{
                if (typeof success !== 'undefined') success(rsp);
              }
                      
            };
            options.error = function (tx, rsp) {
              //not found in indexeddb call webapi
              if(rsp=='Not Found')
              { 
                options.isSavedIndexedDB=false;
                options.indexedDBStorage = false;
                Backbone.Model.prototype.fetch.call(self, options);
              }
            };
          }
          //do not support websql and indexdb
          else if (typeof success !== 'undefined') {
            options.success = function (tx, rsp) {
              success(self.attributes);
            };
          }
          Backbone.Model.prototype.fetch.call(self, options);
        }
      },

      parse: function (resp, xhr) {
        if (typeof xhr !== 'undefined') {
          if (typeof resp !== 'undefined') {
            var response = resp[0];
            if (response)
              response = _.extend(response, {
                'id': response.id,
                'tb': response.tb,
                'identity': this.bookId + '_' + response.id
              });
          }
        }

        return response;
      }
    });

    return thumbModel;
  });