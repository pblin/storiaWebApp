define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/book/bookTemplate.html',
  'text!templates/book/pageTemplate.html',
  'common',
  'turn',
  'interaction',
  'jquerytouch',
  'jqueryflip',
  'jqueryui',
  'jqueryswipe',
  'jquerymove',
  'scratcher',
  'noteMaker',
  'dictionary',
  'highlighter',
  'excanvas',
  'zoomFeature',
  ], function ($, _, Backbone, bookTemplate, pageTemplate, Common) {
    var BookView = Backbone.View.extend({
      el: $("#page"),
      flipbook: $(".flipbook"),
      first: true,
      interactionOn: false,
      highlighterobj: null,
      highlightsOn: false,
      currentView: null,
      swiping: false,
      swipingCoord: [0, 0, 0],
      zoomFeatureObj: null,
      isZooming: false,
      zoomPart: 0,
      //turnJsDimmensions: false,

      initialize: function (param) {
        _.bindAll(this, 'render', 'displayInteraction','preRender','showUtility','resize', 'initSlider');
        this.model.bind('change:render', this.preRender);
        jQuery.event.special.swipe.settings.threshold = 0.1;
        jQuery.event.special.swipe.settings.sensitivity = 20;
      },

      events: {
        'click #next-page-button': 'nextPage',
        'click #prev-page-button': 'prevPage',
        'click #interaction-button': 'displayInteraction',
        'click #highlightBtn': 'controlHighlight',
        'click #utility-veil': 'showUtility',
        'click #helpBtn': 'showUtility',
        'click .utility-clicker': 'showUtility',
        'click #zoomBtn': 'zoomClick',
        'click #picStart': 'psClick'
      },
          
          
      preRender: function(){
        if(this.model.attributes.render != 0){
          this.render();
        }
      },

      psClick: function (e) {
        var self = this;
        e.preventDefault();

        $("#utility-veil, #utility1, #utility2").removeClass("clicked");
        this.interactionOn = true;
        $("#game-area .popup-inter").remove();
        $('.close-window').removeClass('topCorner');
        this.model.interaction.getPictureStarter();
        $('.close-window').removeClass('topCorner');
        $("#game-area").dialog('option','width','auto');
        $("#game-area").dialog("open");
      },

      helpBtn: function (e) {
        e.preventDefault();
      },

      zoomClick: function (e) {
        var self = this;
        e.preventDefault();
        self.model.audioView.stopAudio();

        if (!this.isZooming) {
          self.zoomFeatureObj.zoomPage();
        }
        else {
          self.zoomPage = 0;
          $(".flipbook").turn("disable", false);
          self.zoomFeatureObj.clearZoomDate(0);
          self.zoomPart=0;
        }
        self.isZooming = !this.isZooming;
      },

      showUtility: function (e) {
        e.preventDefault();
        closePopup();
        this.model.audioView.stopAudio();
        $("#utility-veil, #utility1, #utility2").toggleClass("clicked");
        this.swiping = $("#utility-veil").hasClass("clicked")
      },

      controlHighlight: function (event) {
        event.preventDefault();
        this.model.audioView.stopAudio();
        this.highlightsOn = !this.highlightsOn;
        for (var i = 0; i < this.currentView.length; i++) {
          //0-1 will be -1
          if (this.currentView[i] == 0)
            continue;

          var pageModel = this.model.get('bookPages').models[this.currentView[i] - 1];
          if (this.highlightsOn) $('#scholastic-book-page-' + pageModel.get('pageId')).find("#highlightsOnCSS").attr("href", "css/highlight.css");
          else $('#scholastic-book-page-' + pageModel.get('pageId')).find("#highlightsOnCSS").attr("href", "");
        }
      },

      swipePage: function (e) {
        var self = this;
        if (self.swiping) {
          self.swiping = false;

          var T = e.timeStamp - self.swipingCoord[2];
          var X = self.swipingCoord[0] - e.changedTouches[0].pageX;
          var Y = self.swipingCoord[1] - e.changedTouches[0].pageY;
          var Z = Math.round(Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2))); //the distance rounded in pixels
          var r = Math.atan2(Y, X); //angle in radians (Cartesian system)
          var swipeAngle = Math.round(r * 180 / Math.PI); //angle in degrees
          if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
          }
          //Checks time of touch first, then checks angle to decide which way to turn
          if (T < 1000 && Z > 100) {
            if ((swipeAngle < 15 || swipeAngle > 340) && self.swipingCoord[0] > $(window).width()/2 ) {
              //left
              self.nextPage(e);
            } else if ((swipeAngle < 200 && swipeAngle > 160) && self.swipingCoord[0] < $(window).width()/2) {
              //right
              self.prevPage(e);
            }
          }
          self.swipingCoord = [0, 0, 0];
        }
        
      },

      nextPage: function (e) {
        var self = this;
       
        e.preventDefault();
      
        self.model.audioView.stopAudio();

        if (!self.isZooming)
          $(".flipbook").turn('next');
        else {
          self.zoomPart++;
          //cover page
          if (self.currentView[0] == 0)
            self.zoomPart += 2;

          if (this.zoomPart > 3) {
            //if(currentPages[1]!=0)
            self.zoomFeatureObj.clearZoomDate(1);
            $(".flipbook").turn("disable", false);
            $(".flipbook").turn('next');
            self.zoomPart = 0;
          }
          else
            self.zoomFeatureObj.zoomPage();

        }
      },

      prevPage: function (e) {
        var self = this;
        e.preventDefault();

        self.model.audioView.stopAudio();

        if (!self.isZooming)
          $(".flipbook").turn('previous');
        else {
          self.zoomPart--;
          if (self.zoomPart < 0) {
            //if(currentPages[1]!=0)
            self.zoomFeatureObj.clearZoomDate(1);
            $(".flipbook").turn("disable", false);
            $(".flipbook").turn('previous');
            self.zoomPart = 0;
          }
          else
            self.zoomFeatureObj.zoomPage();
        }
      },

      render: function () {
        var self = this;

        var newPage = _.template(bookTemplate, {
          'bookTitle': self.model.attributes.title
        });

        self.$el.html(newPage);
        self.model.audioView.render();
        //starting page
        var currentPage = 0;
        self.initTurnjs();

        var noteMakerobj;
        noteMakerobj = new noteMaker($('#notesPopupWrapper'), $('#notesBody'), $('#notesBtn'), $('#notesCloseBtn'), $('#addnoteBtn'), this.model);
        noteMakerobj.init(self.model.bookId);
              
        this.app.vent.on('app:resize',function(){
          self.resize();
        });
              
        if(!($.browser.msie && $.browser.version.substr(0, 1) < 9))
          self.zoomFeatureObj = new zoomFeature(this);
      },
          
      resize:function(){
        // set book display based on device orientation
        if(this.app.orientation == 'portrait')
          bookDisplay = 'single';
        else
          bookDisplay = 'double';
        
        $(".flipbook").turn('display',bookDisplay);
        
        var pageModel = this.model.get('bookPages').models[$(".flipbook").turn('page') - 1];
        var iframeHeight = pageModel.get('meta_height');
        var iframeWidth = pageModel.get('meta_width');
        
        if(bookDisplay == 'single'){
          iframeWidth =  iframeWidth/2;
        }
        
        this.setBookDefaultSize(iframeWidth, iframeHeight);
        
        // set scale to all book pages that are in memory (only 6 pages are in DOM - so we have to set scale to all pages)
        scale_str = this.model.getCSSProperties('scale_str');
        var range = $('.flipbook').turn('range');
        pages = $('.flipbook').turn('data').pageObjs;
        
        for (page in pages) {
          $('.flipbook').turn('data').pageObjs[page].find('.scholastic-book-page-iframe').attr('style', scale_str);
        }
        this.model.interaction.repositionGameBox();
      },
      addPage: function (page, book) {
        var self = this;
        
        var pageModel = self.model.get('bookPages').models[page - 1];
        if (!book.turn('hasPage', page)) {
          // Create an element for this page
          var element = $('<div />', {
            'class': 'hard',
            id: 'page-number-' + page
          }).html('<div class="loader"></div>');
          // If not then add the page
          book.turn('addPage', element, page);

          var Ie8 = ($.browser.msie && $.browser.version.substr(0, 1) < 9) ? "Ie8-page-wrapper" : "";
				  
          // fetch page content if it doesn't exist in bookModel -> pageModel'
          if (pageModel.get('pageContent') != null) {
                              
            var iframeWidth = pageModel.get('meta_width');
            var iframeHeight = pageModel.get('meta_height');

            if(self.app.orientation == 'portrait')
              self.setBookDefaultSize((iframeWidth/2).toFixed(0), iframeHeight);
            else
              self.setBookDefaultSize(iframeWidth, iframeHeight);
             
            //            if(iframeWidth%2>0)
            //              $iframeWidth = $iframeWidth - 0.5;
            //add page css 
            document.getElementById('stylesheet').href = self.model.bookId+'/storia_'+self.model.bookId+'.css';           
            var tempContent = pageModel.get('pageContent').replace('<body', '<div id="iframe_body"');
            tempContent = tempContent.replace('</body>', '</div>')
            tempContent = tempContent.replace('<head>', '<div id="iframe_head">')
            tempContent = tempContent.replace('</head>', '</div>');

            var data = $('<div />').html(tempContent);
            
            var body = '<div class="page-body"><div id="passage-text">' + data.find('#iframe_body').html() + '</div></div>';
            var newPage = _.template(pageTemplate, {
              'pageIndex': pageModel.attributes.id,
              'pageId': pageModel.attributes.id + "-" + pageModel.attributes.pageId,
              'pageClass': Ie8,
              'pageNumber': page - 1,
              'iframeWidth': iframeWidth,
              'iframeHeight': iframeHeight,
              'style': self.model.getCSSProperties('scale_str'),
              'pageContent' : body
            });
            element.html(newPage);

            element.find("#passage-text > div:first-child").css('z-index',0);
            element.find("#passage-text > div:first-child").css({
              'z-index':0,
              'position':'relative',
              'width':'100%'
            });
            
          } else {
            pageModel.fetch({
              page: pageModel.get('pageId'),
              success: function () {
                var iframeWidth = pageModel.get('meta_width');
                var iframeHeight = pageModel.get('meta_height');
                
                if(self.app.orientation == 'portrait')
                  self.setBookDefaultSize((iframeWidth/2).toFixed(0), iframeHeight);
                else
                  self.setBookDefaultSize(iframeWidth, iframeHeight);
                
                //add page css 
                document.getElementById('stylesheet').href = self.model.bookId+'/storia_'+self.model.bookId+'.css';           
                var tempContent = pageModel.get('pageContent').replace('<body', '<div id="iframe_body"');
                tempContent = tempContent.replace('</body>', '</div>')
                tempContent = tempContent.replace('<head>', '<div id="iframe_head">')
                tempContent = tempContent.replace('</head>', '</div>');
                
                var data = $('<div />').html(tempContent);
                
                var body = '<div class="page-body"><div id="passage-text">' + data.find('#iframe_body').html() + '</div></div>';
                var newPage = _.template(pageTemplate, {
                  'pageIndex': pageModel.attributes.id,
                  'pageId': pageModel.attributes.id + "-" + pageModel.attributes.pageId,
                  'pageClass': Ie8,
                  'pageNumber': page - 1,
                  'iframeWidth': iframeWidth,
                  'iframeHeight': iframeHeight,
                  'style': self.model.getCSSProperties('scale_str'),
                  'pageContent' : body
                });
                element.html(newPage);
                element.find("#passage-text > div:first-child").css('z-index',0);
                element.find("#passage-text > div:first-child").css({
                  'z-index':0,
                  'position':'relative',
                  'width':'1224px!important',
                  'height' : '1584px'
                }).find('img').css({'width':'1224px!important',
                  'height' : '1584px'});
              }
            });
          }
        }
      },

      initTurnjs: function () {
        var self = this
        var numberOfPages = self.model.get('totalpage');

        // Insert page content after the page is turned
        // this is not fired for the last page so we initialize 
        // readAlong in the 'turned' event if the page is the last one
        self.app.vent.bind("app:iframeLoaded", function (param) {
          self.insertPageContent(param);
        // self.model.audioView.initReadAlong(param);
        });

        //  app:turnPage event - turn page automatically
        self.app.vent.bind("app:turnPage", function (param) {
          $(".flipbook").turn('next');
        });

        var orientation = 'double';

        // Orientation change to single page
        if (this.app.orientation == 'portrait') {
          orientation = "single";
        }
        
        // init turn.js library
        //        self.flipbook = null;
        //        $(".flipbook").turn('destroy');
        self.flipbook = $(".flipbook").turn({
          pages: this.model.get('totalpage'),
          autoCenter: false,
          acceleration: true,
          turnCorners: "bl,br",
          duration: 2000,
          display: orientation,
          elevation: 50,
          when: {
            missing: function (event, pages) {
              for (var i = 0; i < pages.length; i++) {
                self.addPage(pages[i], $(this));
              }
            },
            end: function(){
            },
            turning: function (event, page, view) {
              $('#interaction-button').removeClass("show");
            },
            turned: function (event, page, view) {
              
              if(!$.isTouch){
                // hide prev button if we are on first page
                if(page == 1){
                  $('#prev-page-button').css('display','none');
                }else{
                  $('#prev-page-button').css('display','block');
                }
              
                // hide next button if we are on last page
                if(page == self.model.get('totalpage')){
                  $('#next-page-button').css('display','none');
                }else{
                  $('#next-page-button').css('display','block');
                }
              }
                            
              if($("#slider").hasClass('ui-slider')){
                $("#slider").slider('value',page);
              }
            
              var intbutton = $('#interaction-button');
              var pagearray = self.model.interaction.get('pagesArray');
              
              // check if we are on the last page
              // if (numberOfPages == page)
              self.model.audio.set('currentPage', page);
              self.model.audioView.initReadAlong(page);
              self.currentView = view;
              self.model.set('currentPages', view);
              
              for (var i = 0; i < view.length; i++) {
                //0-1 will be -1
                if (view[i] == 0)
                  continue;
                var pageModel = self.model.get('bookPages').models[view[i] - 1];

                self.highlighterobj = new highlighter($('#scholastic-book-page-' + pageModel.attributes.id), view[i] - 1, self.model.bookId, self.highlightsOn);
                self.highlighterobj.init(self.model.bookId);
                self.dictionaryobj = new dictionaryLoader($('#scholastic-book-page-' + pageModel.attributes.id), $('#dicAudio'), 'YD');
              }

              if ((_.indexOf(pagearray, page) != -1) || (page % 2 == 0 && _.indexOf(pagearray, (page + 1)) != -1) || (page % 2 != 0 && _.indexOf(pagearray, (page - 1)) != -1)) {
                intbutton.attr("data-interaction", page);
                checkforSFX(["sfx/sfx_siappears_y2B"]);
                intbutton.addClass("show");
              } else {
                intbutton.attr('data-interaction', -1);
                intbutton.removeClass("show");
              }
               
              if (self.isZooming) {
                this.zoomPart = 0;
                setTimeout(function () {
                  self.zoomFeatureObj.zoomPage()
                }, 1500);
              }
            }
          }
        });
        
        if (!this.model.interaction.checkPictureStarter())
          $("#picStart").hide()

        // init slider
        self.initSlider();

        // init interactions dialog
        $("#game-area").dialog({
          // disable this for modal dialog-type of overlays
          closeOnEscape: true,
          autoOpen: false,
          modal: true,
          draggable: false,
          resizable: false,
          hide: "fade",
          closeText: "",
          width:'auto',
          height: 'auto',
          dialogClass: 'game-area-dialog',
          position: {
            my: "center",
            at: "center",
            of: window
          },
          close: function (e, ui) {
            $(".ui-dialog-title").html('');
            $(".ui-dialog-titlebar").attr("style", "");
            $("#game-area .popup-inter").remove();
            if (!($.browser.msie && $.browser.version.substr(0, 1) < 9)) {
              Glbaudio.pause();
              Glbaudio = new Audio();
            }

            this.interactionOn = false;
          },
          create: function (e, ui) {
            $("#game-area").prepend('<div class="close-window"></div>');
          }
        });

        $('.ui-widget-overlay').live("click", function () {
          closePopup();
        });
        
        $('#game-area .close-window').live('click',function () {
          closePopup();
        });

        $(document).keydown(function (e) {
          if (!self.interactionOn) {
            if (e.keyCode == 37) {
              $(".flipbook").turn('previous');
              return false;
            }
            if (e.keyCode == 39) {
              $(".flipbook").turn('next');
              return false;
            }
          }
        });

        // Touch Controls
        if (Common.isTouchDevice()) {
          var width = self.model.get('width');
          var height = self.model.get('height');

        //          // Orientation change to single page
        //          window.onorientationchange = function () {
        //            //initial scales of the device are always in the model
        //            self.resize(self.model.get('width'), self.model.get('height'));
        //          }
        }

        $("#scholastic-book-view-el").on("touchstart", function (e) {
          e.preventDefault();
          if (!self.swiping) {
            self.swiping = true;
            self.swipingCoord[0] = e.targetTouches[0].pageX;
            self.swipingCoord[1] = e.targetTouches[0].pageY;
            self.swipingCoord[2] = e.timeStamp;
          }
        });

        //Swipe on End
        $("#scholastic-book-view-el").on("touchend", function (e) {
          self.swipePage(e);
        });
      },
      
      setTurnJsBookSize:function(){
        var self = this;
        width = self.model.get('width');
        height = self.model.get('height');
        scale = self.model.get('scale');
      
        size = $('.flipbook').turn('size')
        
        bookWidth  = (width * scale).toFixed(0);
        bookHeight = (height * scale).toFixed(0);
        if(self.app.orientation != 'portrait' && bookWidth %2 !=0)
          bookWidth++;
        
        if(size.width != bookWidth ){
          $('.flipbook').turn('size', bookWidth,bookHeight);
          $('.flipbook').turn('resize');
        }
      },
    
      initSlider:function(){
        var self = this;
        $("#slider").slider({
          min: 1,
          max: self.numberOfViews(self.flipbook),
          create: function (e, ui) {
            var length = self.numberOfViews(self.flipbook) - 1;
            var questions = self.model.interaction.get('questionsArray');

            var aptext = "";
            var temp = 0;
            if (length > 0) {
              $(this).append('<div id="slide-interaction"></div>');
              for (var i = 0; i <= length * 2; i++) {
                //if 2 pages
                if (questions[i] && i % 2 == 0) {
                  temp = ((i - 1) * 100 / length).toFixed(1);
                  aptext = aptext + '<div class="slide-interact" style=" left:' + temp + '%; " title="' + (i + 1) + '"></div>';
                }
              }
              $("#slide-interaction").append(aptext);
            }
            _thumbPreview = $('<div />', {
              'class': 'thumbnail',
              'id' : 'thumbnail_holder'
            }).html('<div></div>');
            _thumbPreview.appendTo($(ui.handle));
            
          },
          start: function (e, ui) {
            var slidePage = self.model.attributes.bookPages.models[(ui.value - 1)];
        
            var thumbnail = self.model.thumbnail.get('thumbList')[slidePage.pageId];
            
            if (!$(ui.handle).find(_thumbPreview).length > 0) {
              _thumbPreview.appendTo($(ui.handle));
              self.setPreview(ui.value, self.model.attributes.bookPages.models[(ui.value - 1)], thumbnail);
            } else {
              self.setPreview(ui.value, self.model.attributes.bookPages.models[(ui.value - 1)], thumbnail);
            }

            self.moveBar(false);
          },
          slide: function (e, ui) {
            var slidePage = self.model.attributes.bookPages.models[(ui.value - 1)];
            var thumbnail = self.model.thumbnail.get('thumbList')[slidePage.pageId];
            self.setPreview(ui.value, self.model.attributes.bookPages.models[(ui.value - 1)], thumbnail);
          },
          stop: function (e, ui) {
            if (window._thumbPreview)
              _thumbPreview.removeClass('show');
            //$(".flipbook").turn('page', Math.max(1, ui.value * 2 - 2));
            $(".flipbook").turn('page', ui.value);
          }
        });
      },

      displayInteraction: function (event) {
        event.preventDefault();
        this.model.audioView.stopAudio();
        var interactionNumber = $('#interaction-button').attr('data-interaction');
        if (interactionNumber >= 0) {
          this.interactionOn = true;
          $("#game-area .popup-inter").remove();
          checkforSFX(["sfx/sfx_siopen_y"]);
          // store current interaction type
          interactionType = this.model.interaction.getInteraction(interactionNumber);
          this.model.interaction.set('interactionType',interactionType);
          $("#game-area").dialog("open");
          
          // extra actions based on interaction type
          // show close button for HotSpot interaction type
          if(interactionType == 'HotSpot'){
            $('.close-window').addClass('topCorner');
          }
          else{
            $('.close-window').removeClass('topCorner');
          }
            
        }
      },

      setBookDefaultSize: function (width, height) {
        this.model.fitToBest(width, height);
        
        this.model.set('width', width);
        this.model.set('height', height);
        this.setBookSize();
        this.setTurnJsBookSize();  
      },

      setBookSize: function () {
        var self = this;
        width = this.model.get('width');
        height = this.model.get('height');
        
        $('.scholastic-book-page-iframe .page-body').css({
          'width': width/2,
          'height':height
        });
        
        var scale = this.model.get('scale');
        
        //        if (width % 2 > 0)
        //          width = width-0.5;

        $('.scholastic-book-page-iframe').attr({
          'height':height
        });
        //      alert(self.model.getCSSProperties('scale_str'));

        $('.scholastic-book-page-iframe').attr('style', self.model.getCSSProperties('scale_str'));

        $('#page-wrap').css({
          'margin-left': this.model.get('leftShift')
          
        });
      },
      /* Added by Mike F. */
      // Number of views in a flipbook
      numberOfViews:function(book) {
        return book.turn('pages');
      },

      setPreview:function (view, page, thumbnail) {
        var previewWidth = 112,
        previewHeight = 73,
        //previewSrc = 'pages/preview.jpg',
        previewSrc = 'data:image/jpg;base64,'+thumbnail,
        preview = $(_thumbPreview.children(':first')),
        numPages = (view == 1 || view == $('#slider').slider('option', 'max')) ? 1 : 2,
        //width = (numPages == 1) ? previewWidth / 2 : previewWidth;
        width=previewWidth / 2;

        _thumbPreview.
        addClass('no-transition').
        css({
          width: width + 15,
          height: previewHeight + 15,
          top: -previewHeight - 30,
          left: ($($('#slider').children(':first')).width() - width - 15) / 2
        });

        preview.css({
          width: width,
          height: previewHeight
        });

        // if (preview.css('background-image') === '' || preview.css('background-image') == 'none') {

        preview.css({
          backgroundImage: 'url(' + previewSrc + ')'
        });

        setTimeout(function () {
          _thumbPreview.removeClass('no-transition');
        }, 0);

      // }

      /*preview.css({ backgroundPosition:
		'0px -' + ((view - 1) * previewHeight) + 'px'
    });

    if (page) {
        preview.html(view + " " + page.id);
    }*/
      },

      moveBar:function(yes) {
        //if (Modernizr && Modernizr.csstransforms) {
        $('#slider .ui-slider-handle').css({
          zIndex: yes ? -1 : 10000
        });
      //}
      }
      
      
    });

    return BookView;

  });