define([
  'backbone',
  'underscore',
  'models/zooming',
  'models/pageModel',
  'models/dataModel',
  'models/interaction',
  'models/readAlong',
  'models/thumbnails',
  'collections/page',
  'views/book/audioView',
  'common',
  'backbone_relational',
  'modernizr',
  'jqueryuinocustom'
  ],
  function(Backbone, _, ZoomingModel, PageModel, dataModel, InteractionModel, AudioModel, thumbModel, PageCollection, AudioView, Common) {

    var dm = new dataModel();
    var websqlDB = dm.openDatabase("library", "", "Backbone-websql example", 50 * 1024 * 1024);
    var indexedDB = dm.indexedDBStore();

    var bookModel = Backbone.RelationalModel.extend({
      //websql variable
      store: dm.webStore(websqlDB, "books"),
      //indexeddb variable
      database: indexedDB,
      storeName: "books",
      relations: [{
        type: Backbone.HasMany,
        key: 'bookPages',
        relatedModel: PageModel,
        keyDestination: 'pageId',
        collectionType: PageCollection,
        autoFetch: true
      }],
      defaults: {
        bookId: '',
        author: '',
        title: '',
        publisher: '',
        playOrders: [],
        currentPage: '',
        currentPages: null,
        bookPage: null,
        render: 0,
        loaded: 0,
        downloading: false,
        downloaded: false,
        //check if book downloaded or not
        checking: false,
        audioView: null,
        audio: null,
        thumbnail: null,
        interaction: null
      },
      idAttribute: 'bookId',
      websqlAttribute: 'bookId',
      action: 'GetContentMetaData',
      sessionToken: 'xxhdhnv',
      horizontalPad: 0,
      verticalPad: 0,
      url: function() {
        return this.app.apiUrl + this.action;
      },
      initialize: function(params) {
        this.bookId = params.bookId;
        this.downloading = params.downloading;
        this.checking = params.checking;

        this.thumbnail = new thumbModel({
          'bookId': this.bookId
        });
      },
      //initial all these only when need render
      init: function()
      {
        this.styleAttrs = this.getModernizedAttrs();
        this.interaction = new InteractionModel({
          'bookId': this.bookId
        });

        // ReadAlong view and model
        this.audio = new AudioModel({
          'bookId': this.bookId
        });

        this.audioView = new AudioView({
          'model': this.audio,
          'el': $('#audio')
        });
      },
      //handle the progress bar
      updateProgress: function(newValue)
      {

        var progressbar = $("#progressbar-" + this.bookId),
        progressLabel = $(progressbar).children(".progress-label")

        progressbar.progressbar({
          value: newValue
        });
        progressLabel.text(progressbar.progressbar("value") + "%");
      },
      parse: function(resp, xhr) {
        response = response ? _.clone(response) : {};

        if (!this.checking)
        {
          //parse resp from webapi
          if (typeof xhr !== 'undefined') {
            if (resp) {
              var playOrderResponse = jQuery.parseJSON(resp[1].playOrders);

              var pages = [];
              var playOrder = [];
              var bookPages = [];
              var bookId = this.get('bookId');

              $.each(playOrderResponse, function(index, value) {
                if (typeof value.order !== 'undefined') {
                  pages[value.fragId] = value;
                  playOrder[value.order] = value.fragId;
                  bookPages.push({
                    'pageId': value.fragId,
                    'playOrder': value.order,
                    'bookId': bookId
                  });
                }


              });

              var response = resp[0];
              response = _.extend(response, {
                'pages': pages,
                'playOrders': playOrder,
                'bookPages': bookPages,
                'bookId': this.bookId
              });

            }

          }
          //parse resp from webdb
          else
          {
            if (resp)
            {
              var response = resp;
              var playOrder = [];

              playOrder = resp.playOrders;

              if (this.get('bookPages').models.length == 0) {

                response = _.extend(response, {
                  'bookPages': resp.pageId
                });
              }

            }

          }

          //donot need it when just check if book downloaed
          if (resp)
          {
            //only need this when render
            if (!this.downloading)
            {
              var totalPage = 0;

              if (typeof response.totalpage == 'undefined')
                totalPage = (response.bookPages).length;
              else
                totalPage = response.totalpage;

              this.audio.set('numberOfPages', totalPage);

              //passing interactionxml to interaction module
              this.interaction = new InteractionModel({
                'bookId': response.bookId,
                'interactionXML': response.interaction
              });
            }

            var thumbList = [];
            var count = 0;
            for (var page in playOrder) {
              if (playOrder.hasOwnProperty(page)) {
                var self = this;
                if (self.thumbnail && playOrder[page]) {
                  self.thumbnail.fetch({
                    'pageId': playOrder[page],
                    success: function(rsp) {
                      thumbList[rsp.id] = rsp.tb;
                      self.thumbnail.set('thumbList', thumbList);
                    }
                  });
                }
              }
            }
          }
        }

        response.render = 0;
        response.loaded = 0;
        delete response.filibook;

        return response;
      },
      /*
     * Fetch book information
     */

      fetchBookPages: function(a, b, $percentage) {
        this.updateProgress(0);
        var self = this;
        
        $percentage = 0;
        calls = [];

        $.each(self.get('bookPages').models,function(key, val){
          if (val.attributes.pageContent == null) {
            pageId = val.pageId;
            val.fetch({
              page:pageId,
              pageIndex: key,
              success:function(page){
              
                loaded = self.get('loaded');
                loaded = loaded + 1;
                self.set('loaded', loaded)
              
                $percentage = Math.ceil(loaded / self.attributes.totalpage * 100);
                self.updateProgress($percentage);
                self.checkIfDownloaded();
              },
              error:function(page,error){
                // transaction error
                self.savePageInDb(page);
              }
            });
          } else {
            loaded = self.get('loaded');
            loaded = loaded + 1;
            self.set('loaded', loaded);
            self.checkIfDownloaded();
            $percentage = Math.ceil(loaded / self.attributes.totalpage * 100);
            self.updateProgress($percentage);
          }
        }        
        );
      },
      savePageInDb:function(pageIndex){
        self = this;
        self.get('bookPages').models[pageIndex].store.update(self.get('bookPages').models[pageIndex],function(){
          loaded = self.get('loaded');
          loaded = loaded + 1;
          self.set('loaded', loaded);
          self.checkIfDownloaded();
		  var encrypted=self.get('bookPages').models[pageIndex].get('pageContent');
          var decrypted = CryptoJS.AES.decrypt(encrypted, "test");
          self.get('bookPages').models[pageIndex].set('pageContent',decrypted.toString(CryptoJS.enc.Utf8));
        },function(err,re){
          //          retry until all pages are saved into DB
          self.savePageInDb(pageIndex);
        });
      },
      checkIfDownloaded:function(){
        self = this;
        if(self.get('loaded') == self.attributes.totalpage ){
                  
          //set downloaded flag and save to db
          self.set('downloaded', true);
          //if support websql
          if (self.store != null)
          {

            self.store.update(self, function() {
              $("#span-" + self.bookId).html('Downloaded');
              //finish download
              self.updateProgress(100);
            });
          }
          //check if support indexdb
          else if (self.database != null)
          {
            self.save(self, {
              indexedDBStorage: true, 
              success: function() {
                $("#span-" + self.bookId).html('Downloaded');
                //finish download
                self.updateProgress(100);

              }
            });
          }
        }
      },
      
      fetchDownloaded: function(options) {

        options = options ? _.clone(options) : {};
        var success = options.success;

        var aditionalOptions = {
          data: {
            bookid: this.bookId,
            sessionToken: this.sessionToken
          },
          url: this.app.apiUrl + this.action,
          dataType: 'jsonp',
          jsonp: 'jsonp',
          webSqlStorage: false,
          indexedDBStorage: false
        };

        options = _.extend(options, aditionalOptions);
        var id = this.bookId;

        var self = this;

        options.searchId = id;

        //check if broswer support websql
        if (self.store != null) {

          options.webSqlStorage = true;

          options.success = function(tx, rsp) {


            //if pull db return nothing, then book did not downloaded, return false
            if (typeof rsp == 'undefined' && options.webSqlStorage == true)
            {
              success(false);
            }
            else
            {
              if (rsp.downloaded)
                success(true);
              else
                success(false);
            }
          };
          //call fetch with option:webSqlStorage. if (option:webSqlStorage==false) will call webapi. else call websql

          Backbone.Model.prototype.fetch.call(self, options);
          return;
        }
        //not support websql
        else {
          //check if support indexeddb
          if (self.database != null)
          {
            options.indexedDBStorage = true;

            options.success = function(tx, rsp) {
              if (rsp.downloaded)
                success(true);
              else
                success(false);
            };
            options.error = function(tx, rsp) {

              //not found in indexeddb call webapi
              if (rsp == 'Not Found' && options.indexedDBStorage == true)
              {
                success(false);
              }
            };
            Backbone.Model.prototype.fetch.call(self, options);
            return;
          }
          //donot support db, return false
          success(false);
        }

      },
      fetch: function(options) {
        options = options ? _.clone(options) : {};
        var success = options.success;

        var aditionalOptions = {
          data: {
            bookid: this.bookId,
            sessionToken: this.sessionToken
          },
          url: this.app.apiUrl + this.action,
          dataType: 'jsonp',
          jsonp: 'jsonp',
          webSqlStorage: false,
          indexedDBStorage: false
        };

        options = _.extend(options, aditionalOptions);
        var id = this.bookId;

        var self = this;
        options.searchId = id;

        //check if broswer support websql
        if (self.store != null) {

          options.webSqlStorage = true;

          options.success = function(tx, rsp) {

            //if pull db return nothing, then call webapi
            if (typeof rsp == 'undefined' && options.webSqlStorage == true)
            {
              options.webSqlStorage = false;
              Backbone.Model.prototype.fetch.call(self, options);
            }
            else
            {
              if (options.webSqlStorage == false && rsp)
              {
                if (!self.downloading)
                {
                  self.store.update(self);
                }
              }

              success();

              if (self.downloading)
                self.fetchBookPages();
              //if not downloading, then trigger render page on bookview
              if (!self.downloading)
                self.set('render', self.get('render') + 1);
            }
          };
          //call fetch with option:webSqlStorage. if (option:webSqlStorage==false) will call webapi. else call websql
          Backbone.Model.prototype.fetch.call(self, options);
          return;
        }
        //not support websql
        else {
          //check if support indexeddb
          if (self.database != null)
          {
            options.indexedDBStorage = true;

            options.success = function(tx, rsp) {
              //save into indexedDB
              if (options.indexedDBStorage == false)
              {
                //save after all paged saved on parse function
                if (!self.downloading)
                {
                  self.save(rsp[0], {
                    indexedDBStorage: true
                  });
                }
              }
              success();
              if (self.downloading)
                self.fetchBookPages(0,10,0);
              if (!self.downloading)
                self.set('render', self.get('render') + 1);
            };
            options.error = function(tx, rsp) {

              //not found in indexeddb call webapi
              if (rsp == 'Not Found' && options.indexedDBStorage == true)
              {
                options.indexedDBStorage = false;
                Backbone.Model.prototype.fetch.call(self, options);
              }
            };

            Backbone.Model.prototype.fetch.call(self, options);
            return;
          }else
            //do not support websql and indexdb
            options.success= function(){
              self.set('render', self.get('render') + 1);
            }
          Backbone.Model.prototype.fetch.call(self, options);
        }
      },
      fitToBest: function(width, height) {

        if (width != '') {

          var size = {
            'width': width,
            'height': height
          }
          $('#scholastic-book-view-el').css(size);
        }

        var widthScale = this.fitToWidthScale();
        var heightScale = this.fitToHeightScale();

        if (widthScale < heightScale) {
          this.applyScale(widthScale);
        }
        else {
          this.applyScale(heightScale);
        }

        size = {
          'width': $(window).width(),
          'height': $(window).height()
        }
        $('#scholastic-book-view-el').css(size);

      },
      // apply transformations that fit the books pages as best as possible linearly
      fitToWidth: function() {
        var scale = this.fitToWidthScale();
        this.applyScale(scale);
      },
      // apply transformations that fit the books pages as best as possible veritcally
      fitToHeight: function() {
        var scale = this.fitToHeightScale();
        this.applyScale(scale);
      },
      /* ------------------------------------------------------------------------------------ */
      //  "PRIVATE" HELPERS                                                                   //
      /* ------------------------------------------------------------------------------------ */

      fitToWidthScale: function() {
        
        return ((this.containerWidth() - this.horizontalPad) / this.bookWidth()).toFixed(4);
      },
      fitToHeightScale: function() {
        return ((this.containerHeight() - this.verticalPad) / this.bookHeight()).toFixed(4);
      },
      applyScale: function(scale) {
        this.set("scale", scale);
        this.set("leftShift", this.leftShift(scale));
      //        this.set("topShift", (this.containerHeight()-this.pageHeight()) / 2);
      },
      // calculate the amount of left shift required to center the book's pages
      // after applying a given scale transormation
      leftShift: function(scale) {
        var width = this.containerWidth();
        return (width - (this.bookWidth() * scale)) / 2;
      },
      containerWidth: function() {
        return $("#scholastic-right-content").width();
      },
      containerHeight: function() {
        return $("#scholastic-right-content").height();
      },
      bookWidth: function() {
        return $("#page-wrap").width();
      },
      bookHeight: function() {
        return $("#page-wrap").height();
      },
      setDefaults: function() {
        this.set(this.defaults);
      },
      getModernizedAttrs: function() {

        var attrs = {};
        attrs.transform = this.modernizrCssPrefix("transform");
        attrs.transformOrigin = this.modernizrCssPrefix("transformOrigin");
        return attrs;
      },
      modernizrCssPrefix: function(attr) {
        var str = Modernizr.prefixed(attr);
        if(str){
          return str.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase();
          }).replace(/^ms-/, '-ms-');
        }else{
          return '';
        }
      },
      getCSSProperties: function(attr) {
        var css;
        if (attr == 'scale_str') {
          
          if(this.styleAttrs.transform !== ''){
            css = this.styleAttrs.transform + ":scale(" + this.get("scale") + ");" + this.styleAttrs.transformOrigin + ":0 0";
          }
          else{
            css = "zoom:"+this.get('scale')+';position:relative';
          }
        }
        else
        if (attr == 'translate') {
          css = {};
          css[this.styleAttrs.transform] = "translate(" + this.get("leftShift") + "px, " + this.get("topShift") + "px) ";
          css[this.styleAttrs.transformOrigin] = "0 0";
        } else if (attr == 'scale') {
          css = {};
          css[this.styleAttrs.transform] = this.getTransformString();
          css[this.styleAttrs.transformOrigin] = "0 0";
        }

        return css;
      },
      getTransformString: function() {
        if(this.styleAttrs.transform !== ''){
          str = "";
          str += "scale(" + this.get("scale").toString() + ")";
          return str;
        }else{
          str = "";
          str += "zoom:"+this.get('scale')+';position:relative';
          return str;
        }
      }

    });
    return bookModel;

  }
  );