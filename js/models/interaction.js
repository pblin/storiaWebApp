define([
  'backbone',
  'underscore',
  'backbone_websql',
  'modernizr',
  'interaction'
  ],
  function (Backbone, _) {
    var interactModel = Backbone.Model.extend({

      idAttribute: 'bookId',

      defaults: {
        bookId: '',
        pagesArray: '',
        questionsArray: '',
        interactions: '',
        hasInteraction: false,
        InteractFile: '',
        interactionXML:''
      },

      initialize: function (param) {
        this.bookId = param.bookId;
        this.InteractFile = 'interactions.xml';
        this.interactionXML=param.interactionXML;
        // get the browser vendor prefixed attrs one time, rather than
        // every time we render

        this.pagesArray = this.importXMLpagesArray();
        this.set('pagesArray', this.pagesArray);
        this.questionsArray = new Array();

        for (var i = 0; i < this.pagesArray.length; i++) {
          this.questionsArray[this.pagesArray[i]] = [0, '0%'];
        }

        this.set('questionsArray', this.questionsArray);
      },

      setDefaults: function () {
        this.set(this.defaults);
      },
		  
      loadXMLString: function (txt)
      {
        if (window.DOMParser)
        {
          parser=new DOMParser();
          xmlDoc=parser.parseFromString(txt,"text/xml");
        }
        else // Internet Explorer
        {
          xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async=false;
          xmlDoc.loadXML(txt);
        }
        return xmlDoc;
      },
		  
      loadXMLDoc: function (dname) {
        /*
              if (window.XMLHttpRequest) {
                  xhttp = new XMLHttpRequest();
              }
              else {
                  xhttp = new ActiveXObject("Microsoft.XMLHTTP");
              }

              xhttp.open("GET", dname, false);

              this.hasInteraction = true;
              xhttp.send();
              return xhttp.responseXML;
			  */
        if(this.interactionXML!="")
          return this.loadXMLString($.trim(this.interactionXML));

      },

      importXMLpagesArray: function () {
        //Loads container.xml
        var xmlDoc = this.loadXMLDoc(this.bookId + "/" + this.InteractFile);
        if (xmlDoc && xmlDoc != null) {
          var y = xmlDoc.getElementsByTagName("StoryInteraction");
          var z = new Array();
          var pagenum = -1;

          for (i = 0; i < y.length; i++) {
            var node = y[i].getElementsByTagName("DocumentPageNumber")[0];
            if (node) {
              var pagenum = node.textContent ? node.textContent : node.firstChild.nodeValue;
              if (!isNaN(pagenum)) {
                pagenum = Number(pagenum);
                z.push(pagenum);
                if (y[i].getAttribute("StoryInteractionType") == "HotSpot")
                  z.push(pagenum + 1);
              }
            }
          }
          return z;
        }
        else {
          this.hasInteraction = false;
        }
        return [];
      },

      importXMLbyPagenum: function (page) {
        //Loads container.xml
        var xmlDoc = this.loadXMLDoc(this.bookId + "/" + this.InteractFile);
        if (xmlDoc && xmlDoc != null) {
          var y = xmlDoc.getElementsByTagName("StoryInteraction");
          var z;
          var pagenum = -1;
          for (i = 0; i < y.length; i++) {
            var node = y[i].getElementsByTagName("DocumentPageNumber")[0];
            if (node)
              pagenum = node.textContent ? node.textContent : node.firstChild.nodeValue;

            if (Number(pagenum) == page)
              z = y[i]
          }
          return z;
        }
        return null;
      },

      importXMLbyInteractionId: function (intid) {
        //Loads container.xml
        var xmlDoc = this.loadXMLDoc(this.bookId + "/" + this.InteractFile);
        if (xmlDoc && xmlDoc != null) {
          var y = xmlDoc.getElementsByTagName("StoryInteraction");
          var z;
          for (i = 0; i < y.length; i++) {
            if (y[i].getAttribute("ID") == intid)
              z = y[i]
          }
          return z;
        }
        return null;
      },

      checkPictureStarter: function () {
        var interact = this.importXMLbyInteractionId("ps");
        if (interact && interact != null)
          return true;
        else
          return false;
      },

      getPictureStarter: function () {
        var interact = this.importXMLbyInteractionId("ps");
        if (interact) {
          $("#game-area").dialog("option", {
            "position": {
              my: "center", 
              at: "center", 
              of: window
            }, 
            "width": 750
          });
          $("#game-area").dialog("option", "modal", true);
          var bookId = this.bookId;
          var Inttype = interact.getAttribute("ID");
          var Interaction = new PictureStarterCustom(interact, Inttype, bookId);
          Interaction.init();
        }
      },
      
      repositionGameBox:function(){
        if(this.get('interactionType') !== undefined)
          if(this.get('interactionType') != 'HotSpot'){
            $("#game-area").dialog("option", "position", {
              my: "center",
              at: "center",
              of: window
            });
          }else{
            $("#game-area").dialog("option", "position", {
              my: "left top", 
              at: "left top", 
              of: $("#container")
            });
            $("#game-area").dialog("option", "width", $("#container").width());
            $("#game-area").dialog("option", "height", $("#container").height());
          }
        

      },

      getInteraction: function (page) {
        var interact = this.importXMLbyPagenum(page);
        if (!interact)
          interact = this.importXMLbyPagenum(page - 1);
        if (interact) {
          $("#game-area").dialog("option", {
            "position": {
              my: "center", 
              at: "center", 
              of: window
            }
          });
          $("#game-area").dialog("option", "modal", true);
          var Inttype = interact.getAttribute("ID");
          var bookId = this.bookId;
          var Interaction;

          switch (interact.getAttribute("StoryInteractionType")) {
            case 'TitleTwister':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new TitleTwister(interact, bookId);
              Interaction.init();
              break;
            case 'WordScrambler':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new WordScrambler(interact, bookId);
              Interaction.init();
              break;
            case 'WhoSaidIt':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new WhoSaidIt(interact, bookId);
              Interaction.init();
              break;
            case 'PopQuiz':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new PopQuiz(interact, bookId);
              Interaction.init();
              break;
            case 'AboutYouQuiz':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new AboutYouQuiz(interact, bookId);
              Interaction.init();
              break;
            case 'CardCollection':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new CardCollection(interact, bookId);
              Interaction.init();
              break;
            case 'PictureStarterCustom':
              Interaction = new PictureStarterCustom(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'StartingLetter':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new SameLetter(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'HotSpot':
              $("#game-area").dialog("option", "position", {
                my: "left top", 
                at: "left top", 
                of: $("#container")
              });
              //              $("#game-area").dialog("option", "modal", false);
              $("#game-area").dialog("option", "width", $("#container").width());
              $("#game-area").dialog("option", "height", $("#container").height());

              Interaction = new HotSpot(interact, Inttype, bookId);
              Interaction.init();
              $('.ui-widget-overlay').css('opacity',0);
              break;
            case 'MultipleChoiceWithAnswerPictures':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new MultiChoice(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'ScratchAndSee':
              $("#game-area").dialog("option", "width",'auto');
              Interaction = new ScratchSee(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'Sequencing':
              $("#game-area").dialog("option", "width",'auto');
              Interaction = new Sequence(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'Concentration':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new Matching(interact, Inttype, bookId);
              Interaction.init();
              break;
            case 'Video':
              $("#game-area").dialog("option", "width", 'auto');
              Interaction = new PlayVideo(interact, bookId);
              Interaction.init();
              break;
          }
        }

        return interact.getAttribute("StoryInteractionType");
      }
    });

    return interactModel;

  });  