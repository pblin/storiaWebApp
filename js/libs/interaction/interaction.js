var Glbaudio;
var Glbsfx;
var isAudible = !($.browser.msie && $.browser.version.substr(0, 1) < 9);
var isOgg = $.browser.mozilla ? true : false;
if (isAudible) {
    Glbaudio = new Audio();
    Glbsfx = new Audio();
}

//Play one sound (IE8 compliant) Can't play in order
function playSound(soundfile) {
  document.getElementById("sound").innerHTML="<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
}

//Play sounds in order (HTML5) Checks for an HTML5 compliant browser
function checkforSounds(sounds, callback) {
    if (isAudible) {
        playsoundqueue(sounds, callback);
    }
}

//Play sounds in order (HTML5) Checks for an HTML5 compliant browser
function checkforSFX(sounds, callback) {
    if (isAudible) {
        playsfxqueue(sounds, callback);
    }
}

function playsfxqueue(sounds, callback) {
    var index = 0;
    function recursive_play() {
        if (index + 1 === sounds.length) {
            playSFX(sounds[index], callback);
        }
        else {
            playSFX(sounds[index], function () {
                index++;
                recursive_play();
            });
        }
    }
    recursive_play();
}

function playSFX(audio, callback) {
  Glbsfx.pause();
  Glbsfx.src = isOgg ? audio + ".ogg" : audio + ".mp3";
  Glbsfx.load();
  Glbsfx.play();

  if (callback)
    $(Glbsfx).unbind("ended").bind('ended', callback);
}


function play(audio, callback) {
    Glbaudio.pause();
    Glbaudio.src = isOgg ? audio + ".ogg" : audio + ".mp3";
    Glbaudio.load();
    Glbaudio.play();

    if (callback)
        $(Glbaudio).unbind("ended").bind('ended', callback);
}

//Changed the name to better reflect the functionality
function playsoundqueue(sounds, callback){	
  var index = 0;
  function recursive_play() {
      if (index + 1 === sounds.length) {
        play(sounds[index], callback);
    }
    else {
      play(sounds[index],function(){
        index++;
        recursive_play();
      });
    }
  }
  recursive_play();   
}

function stopplay(){
  Glbaudio.pause();
}

function closePopup() {
    if ($("#game-area").dialog("isOpen"))
        $("#game-area").dialog("close");
}

(function ($) {
    $.fn.randomize = function (childElem) {
        return this.each(function () {
            var $this = $(this);
            var elems = $this.children(childElem);

            elems.sort(function () {return (Math.round(Math.random()) - 0.5);});

            $this.remove(childElem);

            for (var i = 0; i < elems.length; i++)
                $this.append(elems[i]);

        });
    }
})(jQuery);

//Hidden Element
(function ($) {
    $.fn.getHiddenDimensions = function (includeMargin) {
        var $item = this,
        props = {position: 'absolute', visibility: 'hidden', display: 'block'},
        dim = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0},
        $hiddenParents = $item.parents().andSelf().not(':visible'),
        includeMargin = (includeMargin == null) ? false : includeMargin;

        var oldProps = [];
        $hiddenParents.each(function () {
            var old = {};

            for (var name in props) {
                old[name] = this.style[name];
                this.style[name] = props[name];
            }

            oldProps.push(old);
        });

        dim.width = $item.width();
        dim.outerWidth = $item.outerWidth(includeMargin);
        dim.innerWidth = $item.innerWidth();
        dim.height = $item.height();
        dim.innerHeight = $item.innerHeight();
        dim.outerHeight = $item.outerHeight(includeMargin);

        $hiddenParents.each(function (i) {
            var old = oldProps[i];
            for (var name in props) {
                this.style[name] = old[name];
            }
        });

        return dim;
    }
} (jQuery));

//Support Touch events
$.extend($.support, {
    touch: "ontouchend" in document
});
$.fn.addTouch = function () {
    if ($.support.touch) {
        this.each(function (i, el) {
            el.addEventListener("touchstart", iPadTouchHandler, false);
            el.addEventListener("touchmove", iPadTouchHandler, false);
            el.addEventListener("touchend", iPadTouchHandler, false);
            el.addEventListener("touchcancel", iPadTouchHandler, false);
        });
    }
};
var lastTap = null;

//#region PictureStarterCustom Object
function PictureStarterCustom(xmlPort, type, bookISBN) {
    this.Xml = xmlPort;
    this.Inttype = type;
    this.bookISBN = bookISBN;
    this.intros = new Array();
    this.width = 594;
    this.height = 517;
    this.stampBox = 120;

    this.Contents = '<div class="draw-game-contain"><div class="draw-palette"><div class="draw-swatches">\
			<a rel="#000000" class="draw-swA draw-swZ selected"><span></span></a><a rel="#ffffff" class="draw-swB draw-swZ"><span></span></a><a rel="#d5d5d5" class="draw-swC draw-swZ"><span></span></a><a rel="#797979" class="draw-swD draw-swZ"><span></span></a>\
			<a rel="#AC1500" class="draw-swA draw-swY"><span></span></a><a rel="#FF2700" class="draw-swB draw-swY"><span></span></a><a rel="#FED8FF" class="draw-swC draw-swY"><span></span></a><a rel="#FF29A5" class="draw-swD draw-swY"><span></span></a>\
            <a rel="#3BD100" class="draw-swA draw-swX"><span></span></a><a rel="#007500" class="draw-swB draw-swX"><span></span></a><a rel="#80D8FF" class="draw-swC draw-swX"><span></span></a><a rel="#0170FE" class="draw-swD draw-swX"><span></span></a>\
			<a rel="#FFFC01" class="draw-swA draw-swW"><span></span></a><a rel="#FFA800" class="draw-swB draw-swW"><span></span></a><a rel="#AB7900" class="draw-swC draw-swW"><span></span></a><a rel="#A838FF" class="draw-swD draw-swW"><span></span></a></div><div class="draw-brushes">\
			<a rel="2" class="draw-brush1 selected"><span></span></a><a rel="5" class="draw-brush2"><span></span></a><a rel="8" class="draw-brush3"><span></span></a><a rel="10" class="draw-brush4"><span></span></a><a rel="14" class="draw-brush5"><span></span></a>\
		    </div><div class="draw-erases"><a>Eraser</a></div><div class="draw-stamps"><a><img src="imgs/smile.png" /></a></div></div><a class="draw-done">Done</a><a class="draw-save">Save</a><a class="draw-print">Print</a><a class="draw-clear">Clear</a><canvas id="canvas"></canvas></div>';

    this.init = function () {
        var self = this;
        var game = document.createElement("div");
        game.innerHTML = '<div id="draw-game-area"></div>';
        game.id = "draw-game";
        game.className = "popup-inter";
        document.getElementById("game-area").appendChild(game);

        var introsText = this.Xml.getElementsByTagName("Introduction");

        self.intros[0] = ["", ""];
        for (var i = 0; i < introsText.length; i++) {
            self.intros[i + 1] = [self.Inttype + "_q" + (i + 1) + ".png", introsText[i].getAttribute("Transcript")];
        }

        checkforSounds([self.bookISBN + "/gen_chooseyourpicture"]);
        self.chooseBackground();
    }

    this.chooseBackground = function () {
		$("#draw-game").removeClass("canvas");
        var self = this;
        var lvl = ""
        for (var i = 1; i < self.intros.length; i++) {
            lvl = lvl + '<li class="draw-level"><a href="' + i + '" class="draw-type"><span><img src="' + self.bookISBN + '/' + self.intros[i][0] + '" /></span></a></li>';
        }
        lvl = lvl + '<li class="draw-level"><a href="0" class="draw-type"><span><img src="imgs/interactions/PictureStarter_QuestionMark.png" /></span></a></li>';

        document.getElementById("draw-game-area").innerHTML = '<h1 id="draw-game-title">Picture Starter</h1><h3>Choose a picture below to get started</h3><ul id="draw-levels">' + lvl + '</ul>';
        $(".draw-type").bind("click", function (e) {
            e.preventDefault();
            var link = $(this);
            var number = link.attr("href");
            var position = link.position()
            link.css({"left": position.left + "px", "top": position.top + "px"});
            link.parent().siblings().fadeOut();
            setTimeout(function () {link.css({"transition": "all 1s ease-in-out", "-webkit-transition": "all 1s ease-in-out", "left": "230px", "top": "300px"}).addClass("selected");}, 10);
            setTimeout(function () {self.chosenBackground(number);}, 1500);
        });

    }

    this.chosenBackground = function (num) {
        this.prepareCanvas(num)
        num = Number(num);
        if (num > 0) {
            var div = "<div>" + this.intros[num][1] + "</div>";
            checkforSounds([this.bookISBN + "/" + this.Inttype + "_q" + num + ""]);

            $(div).dialog({
                closeOnEscape: true,
                autoOpen: true,
                dialogClass: 'info-popup',
                draggable: false,
                hide: "fade",
                closeText: "X",
                position: {
                    my: "center",
                    at: "center",
                    of: window
                },
                close: function (e, ui) {
                    if (isAudible) {
                        Glbaudio.pause();
                        Glbaudio = new Audio();
                    }
                }
            });
        }
    }

    this.prepareCanvas = function (num) {
        var self = this;
		$("#draw-game").addClass("canvas");
        document.getElementById("draw-game-area").innerHTML = "";
        document.getElementById("draw-game-area").innerHTML = self.Contents;

        var canvas = document.getElementById("canvas"),
			ctx = canvas.getContext("2d"),
			painting = false,
			lastX = 0,
			lastY = 0,
			lineThickness = 2,
			lineColor = "#000000",
			stamping = null;

        var oImg = document.createElement("img");
        oImg.setAttribute('height', self.height + 'px');
        oImg.setAttribute('width', self.width + 'px');

        if (num) {
            oImg.setAttribute('src', self.bookISBN + '/' + self.intros[num][0]);
            canvas.setAttribute('style', "background-image:url(" + self.bookISBN + '/' + self.intros[num][0] + ")");
        }

        canvas.width = self.width;
        canvas.height = self.height;
        canvas.onmousedown = function (e) {
            lastX = e.pageX - $(canvas).offset().left;
            lastY = e.pageY - $(canvas).offset().top;
            if (stamping == null) {
                painting = true;

                ctx.fillStyle = lineColor;
                ctx.beginPath();
                ctx.arc(lastX, lastY, lineThickness, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();

            } else {
                ctx.drawImage(stamping, lastX - self.stampBox / 2, lastY - self.stampBox / 2, self.stampBox, self.stampBox);
                stamping = null;
                $(".draw-stamps a").removeClass("selected");
            }
        };

        canvas.onmouseup = function (e) {
            painting = false;
        }

        canvas.onmousemove = function (e) {
            if (painting) {
                mouseX = e.pageX - $(canvas).offset().left;
                mouseY = e.pageY - $(canvas).offset().top;

                // find all points between        
                var x1 = mouseX,
					x2 = lastX,
					y1 = mouseY,
					y2 = lastY;

                var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
                if (steep) {
                    var x = x1;
                    x1 = y1;
                    y1 = x;

                    var y = y2;
                    y2 = x2;
                    x2 = y;
                }
                if (x1 > x2) {
                    var x = x1;
                    x1 = x2;
                    x2 = x;

                    var y = y1;
                    y1 = y2;
                    y2 = y;
                }

                var dx = x2 - x1,
					dy = Math.abs(y2 - y1),
					error = 0,
					de = dy / dx,
					yStep = -1,
					y = y1;

                if (y1 < y2) {
                    yStep = 1;
                }


                for (var x = x1; x < x2; x++) {
                    ctx.beginPath();
                    if (steep) {
                        ctx.arc(y, x, lineThickness, 0, 2 * Math.PI);
                    } else {
                        ctx.arc(x, y, lineThickness, 0, 2 * Math.PI);
                    }
                    ctx.closePath();
                    ctx.fill();

                    error += de;
                    if (error >= 0.5) {
                        y += yStep;
                        error -= 1.0;
                    }
                }
                lastX = mouseX;
                lastY = mouseY;

            }
        }

        $(".draw-swatches a").click(function (e) {
            e.preventDefault;
            $(".draw-swatches a, .draw-stamps a, .draw-erases a").removeClass("selected");
            stamping = null;

            //Change the color
            ctx.globalCompositeOperation = "source-over";
            $(this).addClass("selected");
            lineColor = $(this).attr("rel");
        });

        $(".draw-brushes a").click(function (e) {
            e.preventDefault;
            $(".draw-brushes a, .draw-stamps a, .draw-erases a").removeClass("selected");
            stamping = null;

            //Change the brush size
            ctx.globalCompositeOperation = "source-over";
            $(this).addClass("selected");
            lineThickness = $(this).attr("rel");
        });

        $(".draw-stamps a").click(function (e) {
            e.preventDefault;
            $(".draw-stamps a, .draw-erases a").removeClass("selected");
            $(this).addClass("selected");

            //Add a stamp
            stamping = $(this).find("img").get(0);
            ctx.globalCompositeOperation = "source-over";
        });

        $(".draw-erases a").click(function (e) {
            e.preventDefault;
            $(".draw-stamps a, .draw-erases a").removeClass("selected");
            $(this).addClass("selected");
            stamping = null;

            //Activate eraser
            lineThickness = 8;
            ctx.globalCompositeOperation = "destination-out";
        });

        $(".draw-clear").click(function (e) {
            e.preventDefault;
            checkforSounds([self.bookISBN + "/gen_clearpicture"]);

            var div = "<div>Do you want to clear this picture and start again?</div>";

            $(div).dialog({
                closeOnEscape: true,
                autoOpen: true,
                dialogClass: 'info-popup',
                draggable: false,
                hide: "fade",
                closeText: "X",
                position: {
                    my: "center",
                    at: "center",
                    of: window
                },
                buttons:
                {
                    Yes: function (e) {
						e.preventDefault();
                        //Clear all content
                        ctx.clearRect(0, 0, self.width, self.height);
                        $(this).dialog("close");
                    },
                    No: function (e) {
						e.preventDefault();
                        $(this).dialog("close");
                    }
                }
            });

        });

        $(".draw-save").click(function (e) {
            e.preventDefault;

            //Add in background image to canvas
            ctx.globalCompositeOperation = "destination-over";
            ctx.drawImage(oImg, 0, 0, self.width, self.height);
            ctx.globalCompositeOperation = "source-over";

            //Save image (currently only takes over window)
            var img = canvas.toDataURL("image/png");
            //document.write('<img src="'+img+'"/>');
            window.win = open(img);
        });

        $(".draw-print").click(function (e) {
            e.preventDefault();

            //Save current canvas to image
            var img = canvas.toDataURL("image/png");

            //Create new canvas on its side
            var canvas2 = document.createElement('canvas');
            var ctx2 = canvas2.getContext('2d');
            canvas2.width = self.height;
            canvas2.height = self.width;

            //Cause content of previous canvas to display at a 90 degreen angle
            ctx2.translate(self.height / 2, self.height / 2);
            ctx2.rotate(90 * Math.PI / 180);  // rotate 90 degrees
            ctx2.translate(-(self.height / 2), -(self.height / 2));
            ctx2.drawImage(oImg, 0, 0, self.width, self.height);
            ctx2.drawImage(canvas, 0, 0);

            //Save turned canvas to image
            img = canvas2.toDataURL("image/png");

            //Display image sideways in popup and allow printing
            var prtWin = window.open('', 'My Drawing', 'height=' + self.height + ',width=' + self.width);
            prtWin.document.write('<html><head><title>My Drawing</title>');
            prtWin.document.write('</head><body>');
            prtWin.document.write('<img src="' + img + '" width="100%" style="border:3px solid #ccc; border-radius:20px" />');
            prtWin.document.write('</body></html>');
            prtWin.print();
            //Can't close because then the canvas will not render.
            //prtWin.close();
        });

        $(".draw-done").click(function (e) {
            e.preventDefault;
            self.chooseBackground();
        });
    }
}
//#endregion PictureStarterCustom Object

//#region CardCollection Object
function CardCollection(xmlPort, bookISBN) {
    this.Xml = xmlPort;
    this.cards = new Array();
    this.flipped = false;
    this.fullDim = [334, 512];
    this.halfDim = [167, 256];
    this.curID = 0;
    this.curPos = [0, 0];
    this.zoomPos = [140, 20];
    this.halfPos = [240, 160];
    this.bookISBN = bookISBN

    this.init = function () {

        var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        var self = this;
        var text = "";
        var cardTags = self.Xml.getElementsByTagName("Card");
        for (var i = 0; i < cardTags.length; i++) {
            self.cards[i] = [self.bookISBN + '/' + cardTags[i].getAttribute("srcfront"), self.bookISBN + '/' + cardTags[i].getAttribute("srcback")];
            text = text + '<div class="card-item" id="card-item' + i + '"><img width="' + self.halfDim[0] + '" height="' + self.halfDim[1] + '" src="' + self.cards[i][0] + '" /><span class="card-zoom"></span></div>';
        }

        document.getElementById("game-area").innerHTML = '<div id="card-game" class="popup-inter"><div class="card-grid">' + text + '<div id="hider"></div></div><div id="zoomer"><img src="" /></div><div id="card-over"><div class="flipper"><div class="front"><img /><a href="#" class="quickFlipCta"></a> <a href="#" class="card-goback"></a></div><div class="back"><img /><a href="#" class="quickFlipCta"></a> <a href="#" class="card-goback"></a></div></div></div></div>';

        $("#card-over").hide();

        $("#card-over").css({left: self.zoomPos[0] + 'px', top: self.zoomPos[1] + 'px'});

        //position and animate size of div to bring to the front
        if ($('html').hasClass('no-csstransitions') || isChrome) {
            $('.flipper').quickFlip();
        } else {
            $('#card-over').addClass("css3");
        }

        $("#card-over.css3 .quickFlipCta").click(function (e) {
            $(".flipper").toggleClass("flip");
        });

        //add front and back image to flipper
        $(".card-item .card-zoom").bind("click", function (e) {
            e.preventDefault();

            self.curID = Number(($(this).parent().attr("id")).replace("card-item", ""));
            self.curPos = [$('#card-item' + self.curID).position().left, $('#card-item' + self.curID).position().top];

            $("#card-over .front img").attr('src', self.cards[self.curID][0]);
            $("#card-over .back img").attr('src', self.cards[self.curID][1]);
            $("#zoomer img").attr('src', self.cards[self.curID][0]);
            $(".card-grid").fadeOut();
            $("#zoomer img").css({width: self.halfDim[0] + 'px', height: self.halfDim[1] + 'px'});
            $("#zoomer").show().css({left: self.curPos[0] + 'px', top: self.curPos[1] + 'px', 'z-index': '115'});
            $("#hider").show().css({left: self.curPos[0] + 'px', top: self.curPos[1] + 'px'});

            $("#zoomer").animate({left: self.halfPos[0] + 'px', top: self.halfPos[1] + 'px'}, 400, function () {
                $("#zoomer").animate({left: self.zoomPos[0] + 'px', top: self.zoomPos[1] + 'px'}, 400);
                $("#zoomer img").animate({width: self.fullDim[0] + 'px', height: self.fullDim[1] + 'px'}, 400, function () {
                    $("#card-over").fadeIn(500, function () {$("#zoomer").fadeOut(400, function () { });});
                    $("#zoomer").css('z-index', '95');
                });
            });
        });


        $(".card-goback").bind("click", function (e) {
            e.preventDefault();
            var timeO = 0
            if ($(".front").css('display') == 'none') {
                var timeO = 400
                $('.flipper').quickFlipper();
            }

            if ($(".flipper").hasClass('flip')) {
                var timeO = 400
                $(".flipper").removeClass("flip");
            }

            window.setTimeout(function () {
                $("#zoomer").show();
                $("#card-over").fadeOut(400, function () {
                    $("#zoomer").animate({left: self.halfPos[0] + 'px', top: self.halfPos[1] + 'px'}, 400);
                    $("#zoomer img").animate({width: self.halfDim[0] + 'px', height: self.halfDim[1] + 'px'}, 400, function () {
                        $("#hider").hide();
                        //$("#zoomer").css('z-index', '95');
                        $("#zoomer").animate({left: self.curPos[0] + 'px', top: self.curPos[1] + 'px'}, 400, function () {
                            $(".card-grid").fadeIn(400, function () {$("#zoomer").hide();});
                        });
                    });
                });
            }, timeO);
        });
    }
}
//#endregion CardCollection Object

//#region AboutYouQuiz Object
function AboutYouQuiz(xmlPort) {
    this.Xml = xmlPort;
    this.questions = new Array();
    this.outgoing = new Array();
    this.count = 0;
    this.scores = new Array();
    this.alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.ties = "";

    this.init = function () {
        var self = this;

        self.questions = self.Xml.getElementsByTagName("Question");
        self.outgoing = self.Xml.getElementsByTagName("OutcomeMessage");
        self.count = self.questions.length;
        if (self.Xml.getElementsByTagName("TiebreakOrder")) {
            self.ties = self.Xml.getElementsByTagName("TiebreakOrder")[0].getAttribute("Transcript");
        }
        self.scores = new Array(self.outgoing.length);
        for (var i = 0; i < self.scores.length; i++) {
            self.scores[i] = 0;
        }
        self.getQuestion(0);
    }

    this.getQuestion = function (num) {
        var self = this;
        if (num < self.count) {
            var quest = self.questions[num];

            var pagetext = "";
            for (var i2 = 0; i2 < self.count; i2++) {
                pagetext = pagetext + '<span class="quiz-circle' + ((i2 == num) ? ' current' : '') + '"><span class="quiz-num">' + (i2 + 1) + '</span></span>';
            }
            var questtext = '<div class="quiz-quest">' + quest.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript") + '</div>';
            var answers = quest.getElementsByTagName("Answer");

            var anstext = "";

            for (var i = 0; i < answers.length; i++) {
                anstext = anstext + '<div class="quiz-answer">' + answers[i].getAttribute("Transcript") + '</div>';
            }

            document.getElementById("game-area").innerHTML = '<div id="quiz-game" class="popup-inter"><h1>About You...</h1><div>' + pagetext + '</div><div>' + questtext + '</div><div>' + anstext + '</div></div>';

            $(".quiz-answer").click(function (e) {
                e.preventDefault();
                self.scores[$(this).index()] = self.scores[$(this).index()] + 1;
                $(this).addClass("clicked safe");
                setTimeout(function () {
                    self.getQuestion(num + 1);
                }, 1000);
            });
        } else {
            var endtext = self.outgoing[self.getOutcome()].getAttribute("Transcript");

            document.getElementById("game-area").innerHTML = '<div id="quiz-game" class="popup-inter"><h1>About You...</h1>' + endtext + '<div id="quiz-again" class="ylwbtn">Try Again</div></div>';
            $("#quiz-again").click(function (e) {
                e.preventDefault();
                self.getQuestion(0);
            });
        }
    }

    this.getOutcome = function () {
        var self = this;
        var win = 0;
        var sam = -1;
        //get score response here
        for (var i = 0; i < self.scores.length; i++) {
            if (win <= 0) {
                win = i;
            } else if (self.scores[win] < self.scores[i]) {
                sam = -1;
                win = i;
            } else if (self.scores[win] == self.scores[i]) {
                sam = i;
            }
        }

        if (sam >= 0 && self.ties) {
            if (self.ties.indexOf(self.alpha[sam]) < self.ties.indexOf(self.alpha[win]))
                return sam;
        }
        return win
    }
}
//#endregion PopQuiz Object

//#region PopQuiz Object
function PopQuiz(xmlPort) {
    this.Xml = xmlPort;
    this.questions = new Array();
    this.count = 0;
    this.score = 0;

    this.init = function () {
        var self = this;

        self.questions = self.Xml.getElementsByTagName("Question");
        self.count = self.questions.length;
        self.getQuestion(0);
    }

    this.getQuestion = function (num) {
        var self = this;
        if (num < self.count) {
            var quest = self.questions[num];

            var pagetext = "";
            for (var i2 = 0; i2 < self.count; i2++) {
                pagetext = pagetext + '<span class="quiz-circle' + ((i2 == num) ? ' current' : '') + '"><span class="quiz-num">' + (i2 + 1) + '</span></span>';
            }
            var questtext = '<div class="quiz-quest">' + quest.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript") + '</div>';
            var answers = quest.getElementsByTagName("Answer");

            var anstext = "";

            for (var i = 0; i < answers.length; i++) {
                anstext = anstext + '<div class="quiz-answer' + ((answers[i].getAttribute("IsCorrect") == "true") ? ' correct' : '') + '">' + answers[i].getAttribute("Transcript") + '</div>';
            }

            document.getElementById("game-area").innerHTML = '<div id="quiz-game" class="popup-inter"><h1>Do You Know?</h1><div>' + pagetext + '</div><div class="question-ask">' + questtext + anstext + '</div></div>';

            $(".quiz-answer").click(function (e) {
                e.preventDefault();
                if ($(this).hasClass("correct"))
                    self.score += 1;
                $(this).addClass("clicked");
                $(".quiz-answer").not(".clicked").addClass("not-clicked");
                setTimeout(function () {
                    self.getQuestion(num + 1);
                }, 1000);
            });
        } else {
            var endtext = "";
            if (self.score / self.count < .5) {
                endtext = self.Xml.getElementsByTagName("ScoreResponseLow")[0].getAttribute("Transcript");
            } else if (self.score / self.count == 1) {
                endtext = self.Xml.getElementsByTagName("ScoreResponseHigh")[0].getAttribute("Transcript");
            } else {
                endtext = self.Xml.getElementsByTagName("ScoreResponseMedium")[0].getAttribute("Transcript");
            }

            document.getElementById("quiz-game").innerHTML = '<h1>Do You Know?</h1><p>You got ' + self.score + ' out of 5 right!</p><p>' + endtext + '</p><div id="quiz-again" class="ylwbtn">Play Again</div>';
            self.score = 0;
            $("#quiz-again").click(function (e) {
                e.preventDefault();
                self.getQuestion(0);
            });
        }
    }
}
//#endregion PopQuiz Object

//#region TitleTwister Object
function TitleTwister(xmlPort) {
    this.Xml = xmlPort;
    this.word = "";
    this.answers = new Array();
    this.checks = new Array();
    this.counts = [0, 0, 0, 0, 0, 0, 0, 0];
    this.founds = [0, 0, 0, 0, 0, 0, 0, 0];

    this.Contents = '<div id="twister-answer"><div id="twister-test"></div><div id="twister-done" class="ylwbtn">Done</div><div id="twister-clear" class="ylwbtn">Clear</div></div><div id="twister-answers">';

    this.init = function () {
        var self = this;
        self.word = self.Xml.getElementsByTagName("BookTitle")[0].getAttribute("Phrase").toUpperCase();
        self.answers = self.Xml.getElementsByTagName("Words")[0].getAttribute("Words").toUpperCase().split(",");
        for (var i = 0; i < self.answers.length; i++) {
            self.checks[i] = false;
            self.answers[i] = $.trim(self.answers[i]);
            var count = self.answers[i].length;
            if (count > 6)
                self.counts[7] = self.counts[7] + 1;
            else
                self.counts[count] = self.counts[count] + 1;
        }

        document.getElementById("game-area").innerHTML = '<div id="twister-game" class="popup-inter"><h1>Title Twister</h1><div id="twister-text"><p>How many words can you make using the letters in</p><h2>' + self.word + '</h2><span id="GoGame" class="ylwbtn">Go</span></div></div>'
        $("#GoGame").click(function (e) {e.preventDefault();$("#twister-game").addClass("play-game");self.loadTwisterGame();});
    }

    this.loadTwisterGame = function () {
        var self = this;
		$("#twister-game").addClass("gamestart");
        document.getElementById("twister-game").innerHTML = '<h1>Title Twister</h1>';
        var div1 = document.createElement('div');
        for (var i = 0; i < self.word.length; i++) {
            var div2 = document.createElement('span');
            if (self.word[i] == " ") {
                div2.className = "space";
            } else {
                div2.className = "letter letter-tile";
                div2.innerHTML = self.word[i];
            }
            div1.appendChild(div2);
        }
        document.getElementById("twister-game").appendChild(div1);

        var div3 = document.createElement('div');
        var gametext = self.Contents;

        for (var j = 3; j <= 7; j++) {
            var idnum = (j == 7 ? '7+' : j);
            gametext += '<div id="words-' + j + '" class="twister-answer-box"><div class="twister-answer-title"><h3>' + idnum + ' Letters</h3><p class="words-out-of">(found 0 out of ' + self.counts[j] + ')</p></div><div class="words-found"></div></div>'
        }

        gametext += '</div>';
        div3.innerHTML = gametext;
        document.getElementById("twister-game").appendChild(div3);

        $(".letter").bind("click", function (e) {
            e.preventDefault();
            if (!$(this).hasClass("clicked")) {
                $(this).addClass("clicked");
                document.getElementById("twister-test").innerHTML += $(this).text();
            }
        });

        $("#twister-clear").bind("click", function (e) {
            e.preventDefault();
            document.getElementById("twister-test").innerHTML = "";
            $(".letter").removeClass("clicked");
        });

        $("#twister-done").bind("click", function (e) {
            e.preventDefault();
            var text = document.getElementById("twister-test").innerHTML;
            var index = self.answers.indexOf(text);
            document.getElementById("twister-test").innerHTML = "";
            $(".letter").removeClass("clicked");
            if (index != -1 && !self.checks[index]) {
                self.checks[index] = true;
                var len = text.length;
                self.founds[len] = self.founds[len] + 1;
                $("#words-" + len + " .words-found").prepend('<div class="word-found words-' + text + '">' + text + '</div>');
                $("#words-" + len + " .words-out-of").text('found ' + self.founds[len] + ' out of ' + self.counts[len]);

            } else if (index != -1) {
                $('.words-' + text).addClass("already");
                setTimeout(function () {
                    $('.words-' + text).removeClass("already");
                }, 1000);
            } else {
                $("#twister-done").addClass("incorrect");
                setTimeout(function () {
                    $("#twister-done").removeClass("incorrect");
                }, 1000);
            }
        });
    }
}
//#endregion TitleTwister Object

//#region WordScrambler Object
function WordScrambler(xmlPort) {
    this.Xml = xmlPort;
    this.word = "";
    this.clue = "";
    this.letters = "";
    this.hints = new Array();

    this.Contents = '<div id="scramble-game" class="popup-inter"><h1>Scramble</h1><div id="scramble-clue"></div><div id="scramble-play"></div><p class="scramble-instruct">Drag the tiles to unscramble the answer</p><div class="ylwbtn" id="scramble-hint">HINT</div></div>';

    this.init = function () {
        var self = this;
        self.word = self.Xml.getElementsByTagName("Scramble")[0].getAttribute("Answer").toUpperCase();
        self.clue = self.Xml.getElementsByTagName("Scramble")[0].getAttribute("Clue");
        self.hints = self.Xml.getElementsByTagName("Hint")[0].getAttribute("index").split(",");

        $("#game-area").html(self.Contents);
        $("#scramble-clue").html(self.clue);

        var wordArray = self.word.split(" ");

        self.letters = wordArray.join('');

        var countArray = new Array();
        for (var j = 0; j < self.letters.length; j++) {
            countArray[j] = j;
        }

        countArray.sort(function () {return (Math.round(Math.random()) - 0.5);});

        var text = "";
        var len = 0;
        for (var i = 0; i < self.word.length; i++) {
            if (self.word[i] == " ") {
                text += '<span class="space"> </span>';
            } else {
                text += '<span id="answer-' + (len + 1) + '" class="letter-drop"><span class="letter-tile letter-drag" id="letter-' + (countArray[len] + 1) + '">' + self.letters[countArray[len]] + '</span></span>';
                len++;
            }
        }

        $("#scramble-play").html(text);

        $(".letter-drag:not(.correct)").draggable({
            helper: "clone",
            start: function (e, ui) {$(this).addClass("dragging-on");},
            stop: function (e, ui) {$(this).removeClass("dragging-on");}
        }).addTouch();
        $(".letter-drop:not(.correct)").droppable({
            drop: function (event, ui) {
                $(".letter-drag").removeClass("dragging-on");
                var dropper = $(this);
                var dragger = $("#" + ui.draggable.context.id).parent();

                var con1 = $(dropper).html();
                var con2 = $(dragger).html();

                $(dropper).html(con2);
                $(dragger).html(con1);
                $(".ui-draggable-dragging").remove();
                $(".letter-drag:not(.correct)").draggable({
                    helper: "clone",
                    start: function (e, ui) {$(this).addClass("dragging-on");},
                    stop: function (e, ui) {$(this).removeClass("dragging-on");}
                }).addTouch();

                //All Correct
                if ($("#scramble-play").text() == self.word) {
                    $(".letter-drag:not(.correct)").addClass("correct").draggable('disable').parent().addClass("correct");
                    $("#scramble-hint").hide();
                }
            }
        });
        $("#scramble-hint").click(function (e) {e.preventDefault();self.showHint()});
    }

    this.showHint = function () {
        var self = this;
        for (var i = 0; i < self.hints.length; i++) {
            var test = $("#scramble-play .letter-drop, #scramble-play .space")[self.hints[i]];
            var id = Number($(test).attr("id").replace("answer-", "")) - 1;

            var dropper = $("#answer-" + id);
            var dragger = $("#letter-" + id).parent();

            var con1 = $(dropper).html();
            var con2 = $(dragger).html();
            $(dropper).html(con2).addClass("correct").find(".ui-draggable").addClass("correct");
            $(dragger).html(con1);
            $(dropper).find(".ui-draggable").addClass("correct");
        }
        $(".letter-drag:not(.correct)").draggable({
            helper: "clone",
            start: function (e, ui) {$(this).addClass("dragging-on");},
            stop: function (e, ui) {$(".letter-drag").removeClass("dragging-on");}
        }).addTouch();
        $(".letter-drop.correct").droppable("option", "disabled", true);
        $("#scramble-hint").hide();
    }
}
//#endregion WordScrambler Object

//#region WhoSaidIt Object
function WhoSaidIt(xmlPort) {
    this.Xml = xmlPort;
    this.quotes = new Array();
    this.answers = new Array();


    this.init = function () {
        var self = this;

        var states = self.Xml.getElementsByTagName("Statement")
        for (var i = 0; i < states.length; i++) {
            self.quotes[i] = states[i].getAttribute("Transcript");
            self.answers[i] = states[i].getAttribute("Source");
        }

        var text2 = ""
        for (var i2 = 0; i2 < self.quotes.length; i2++) {
            if (self.quotes[i2] != "")
                text2 += '<tr class="quote-box"><td><div id="quote-' + i2 + '" class="quote-drop quote-game"></div></td><td class="quote-text"><p>' + self.quotes[i2] + '</p></td></tr>';
        }

        var text3 = ""
        for (var i3 = 0; i3 < self.answers.length; i3++) {
            if (self.answers[i3] != "")
                text3 += '<div id="name-' + i3 + '" class="name-drag quote-drop"><span id="name-drag' + i3 + '"  class="name-dragger"><span class="circle"></span>' + self.answers[i3] + '</span></div>';
        }

        $("#game-area").html('<div id="quote-game" class="popup-inter"><h1>Who Said It</h1><div class="quote-table"><table>' + text2 + '</table><div id="quote-names">' + text3 + '</div></div><div id="quote-check" class="ylwbtn disable">Check Answers</div></div>');

        $("#quote-names").randomize("div.name-drag");

        //Resize text to fix in boxes
        $('.name-dragger').each(function (i, el) {
            var parent = $(el).parent(),
				width = $(parent).width(),
				html = '<span style="white-space:nowrap;"></span>',
				line = $(el).wrapInner(html).children()[0],
				n = 14;
                
            $(el).css('font-size', n);

            while ($(line).getHiddenDimensions().width > width) {
                $(el).css('font-size', --n);
            }

            $(el).html($(line).html());
            $(el).css({'width': width, 'display': 'block'});
        });

        $(".name-dragger:not(.correct)").draggable({revert: "invalid", revertDuration: 0}).addTouch();
        $(".quote-drop:not(.correct)").droppable({
            drop: function (event, ui) {
                $("#quote-check").removeClass("disable");
                var dropper = $(this);
                var dragger = $("#" + ui.draggable.context.id);

                var con1 = $(dropper).html();
                var con2 = $(dragger);
                if ($(this).hasClass("correct")) {

                } else {
                    if (con1 == "") {
                        if ($(dropper).hasClass("name-drag")) {
                            $("#" + ($(dragger).attr("id")).replace("drag", "")).html(con2);
                        } else {
                            $(dropper).html(con2);
                        }
                        $(".name-dragger:not(.correct)").draggable({revert: "invalid", revertDuration: 0}).addTouch();
                    } else {
                        if ($(dragger).text() != $(dropper).text()) {
                            if ($(dropper).hasClass("name-drag")) {
                                $("#" + ($(dragger).attr("id")).replace("drag", "")).html(con2);
                            } else {
                                $("#" + ($(dropper).find(".name-dragger").attr("id")).replace("drag", "")).html(con1);
                                $(dropper).html(con2);
                            }
                        }
                    }
                }
                $(con2).css({left: -2, top: -2});
            }
        });
        $("#quote-check").click(function (e) {e.preventDefault();self.CheckAnswers();});
    }

    this.CheckAnswers = function () {
        var self = this;
        $("#quote-check").addClass("disable");
        $(".quote-game").each(function (i) {
            if ($(this).text() != "") {
                if (self.answers[i] == $(this).text()) {
                    $("#quote-" + i).addClass("correct").find(".name-dragger").addClass("correct");
                    $(".name-dragger.correct").draggable('disable');
                } else {
                    $(this).addClass("incorrect");
                    var id = ($(this).find(".name-dragger").attr("id")).replace("drag", "");
                    var that = this;
                    setTimeout(function () {
                        $("#" + id).html($(that).html());
                        $(that).html("").removeClass("incorrect");

                        //Not All Correct
                        if ($(".name-dragger.correct").size() != $(".quote-game").size())
                            $(".name-dragger:not(.correct)").draggable({revert: "invalid", revertDuration: 0}).addTouch();
                    }, 1000);
                }
            }
        });

    }
}
//#endregion WhoSaidIt Object

//Children Interactions

//#region HotSpot Object
function HotSpot(xmlPort, type, bookISBN) {
    this.Xml = xmlPort;
    this.Inttype = type;
    this.HotSpots = new Array();
    this.original = [0, 0];
    this.bookISBN = bookISBN
    this.Contents = '<div id="find-game" class="popup-inter"><h1 id="find-game-title"></h1><div id="find-game-area"><div id="find-game-area-else"></div></div></div>';

    this.init = function (num) {
        var self = this;

        //Use this to check width of area to see if 2 page or 1 page?		
        //document.getElementById("page").offsetWidth;

        var questions = self.Xml.getElementsByTagName("Question");

        for (var i = 0; i < questions.length; i++) {
            var hotspot = questions[i].getElementsByTagName("Hotspot")[0];
            var page = (self.original[0] / 2 > Number(hotspot.getAttribute("Left"))) ? 0 : 1;

            var spot = new Object();
            spot.page = page;
            spot.hotspot = questions[i];
            self.HotSpots[i] = spot;
            if (hotspot.getAttribute("OriginalBookWidth") && hotspot.getAttribute("OriginalBookHeight")) {
                self.original = [Number(hotspot.getAttribute("OriginalBookWidth")), Number(hotspot.getAttribute("OriginalBookHeight"))];
            }
        }

        var game = document.createElement("div");
        game.innerHTML = this.Contents;
        document.getElementById("game-area").appendChild(game);

        self.getQuestion(0);

        $("#find-game-area-else").bind("click", function () {
            $("#find-game-area").addClass('incorrect');
            checkforSFX(["sfx/sfx_wa"]);
            checkforSounds([self.bookISBN + "/gen_tryagain"]);
            setTimeout(function () {
                $("#find-game-area").removeClass('incorrect');
            }, 1000);
        });
    }
    this.getPossible = function (pages, page) {
        //gets only the hotspots available for the number of pages and current page
        //first page available seems to always be even
        var self = this;
        var returnArray = new Array();
        if (pages > 1) {
            return self.HotSpots;
        } else if (page % 2 == 0) {
            for (var i = 0; i < self.HotSpots.length; i++) {
                if (self.HotSpots[i].page == 0)
                    returnArray.push(self.HotSpots[i])
            }
        } else {
            for (var i2 = 0; i2 < self.HotSpots.length; i2++) {
                if (self.HotSpots[i2].page == 1)
                    returnArray.push(self.HotSpots[i2])
            }
        }
        return returnArray;
    }

    this.getResizeRatio = function (container) {
        var self = this;
        var w = $(container).width();
        var h = $(container).height();
        var r = h / self.original[1];
        return r;
    }

    this.getQuestion = function (num) {
        var self = this;

        var divold = document.getElementById("click-spot-div");
        if (divold)
            divold.parentNode.removeChild(divold);

        //Get current question by Index
        var questItem = self.HotSpots[num].hotspot;

        $(".ui-dialog-title").html('<div class="hotspot-window"><span>' + questItem.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript") + '</span></div>');
        $(".ui-dialog-titlebar").css({'top': '50px', 'left': '50px'});
        //document.getElementById("find-game-title").innerHTML = questItem.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript");

        //Create a new click area
        var div = document.createElement('div');
        var hotspot = questItem.getElementsByTagName("Hotspot")[0];
        var ratio = self.getResizeRatio($("#container"));
        div.style.left = (Number(hotspot.getAttribute("Left")) * ratio).toFixed(2) + "px";
        div.style.top = (Number(hotspot.getAttribute("Top")) * ratio).toFixed(2) + "px";
        div.style.width = (Number(hotspot.getAttribute("Width")) * ratio).toFixed(2) + "px";
        div.style.height = (Number(hotspot.getAttribute("Height")) * ratio).toFixed(2) + "px";
        div.className = "click-spot";
        div.id = "click-spot-div";
        $("#find-game").css({"width": (self.original[0] * ratio).toFixed(2) + "px", "height": (self.original[1] * ratio).toFixed(2) + "px"});

        //Append click area to the game area
        document.getElementById("find-game-area").appendChild(div);

        checkforSounds([self.bookISBN + "/" + self.Inttype + "_q" + (num + 1) + ""]);

        $("#find-game-area img").bind("click", function () {
            $("#find-game-area").addClass('incorrect');
            checkforSFX(["sfx/sfx_wa"]);
            checkforSounds([self.bookISBN + "/gen_tryagain"]);
            setTimeout(function () {
                $("#find-game-area").removeClass('incorrect');
            }, 1000);
        });

        //Bind on click event to the new click area for when the user finds it
        $(".click-spot").bind("click", function () {
            $("#find-game-area").addClass('correct');
            checkforSFX(["sfx/sfx_ca"]);
            checkforSounds([self.bookISBN + "/" + self.Inttype + "_ca" + (num + 1) + ""], closePopup);
        });
    }
};
//#endregion HotSpot Object

//#region SameLetter Object
function SameLetter (xmlPort, type,bookISBN) {
  this.Xml = xmlPort;
  this.Inttype = type;
  this.StartLetter = "";
  this.correct = 0;
  this.possible = 0;
  this.bookISBN = bookISBN;
  this.Contents = '<h1 id="same-game-title"></h1><div id="same-game-area"></div>';

  this.init = function () {
      var self = this;

      var game = document.createElement("div");
      game.innerHTML = this.Contents;
      game.id = "same-game";
      game.className = "popup-inter";
      document.getElementById("game-area").appendChild(game);

      checkforSounds([self.bookISBN + "/" + self.Inttype + "_intro"]);

      document.getElementById("same-game-title").innerHTML = self.Xml.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript");


      self.StartingLetter = self.Xml.getElementsByTagName("StartingLetter")[0].getAttribute("Character");

      //Get the number of answers and get a row vs column count
      var a = self.Xml.getElementsByTagName("Pictures")[0].getElementsByTagName("Answer");
      var acount = a.length;
      var ccount = Math.sqrt(acount);
      var rcount = 0;
      if (ccount % 1 != 0) {
          ccount = Math.floor(ccount);
          rcount = ccount + 1;
      } else {
          rcount = ccount;
      }

      //Populate an array with the HTML answers
      var contents = new Array();
      for (var ar = 0; ar < acount; ar++) {
          contents[ar] = "<img title=\"" + a[ar].getAttribute("suffix") + "\" class=\"same-letter-img " + (a[ar].getAttribute('IsCorrect') == 'True' ? 'Correct' : 'InCorrect') + "\" src=\"" + self.bookISBN + "/" + self.Inttype + "_" + a[ar].getAttribute("suffix") + ".png\" />";
          if (a[ar].getAttribute('IsCorrect') == 'True') self.possible++;
      }

      //Randomize the answers
      contents = contents.sort(function () {
          return 0.5 - Math.random();
      });

      //Create and append a div with all the images organized in rows and columns
      var div1 = document.createElement('div');
      for (var c = 0; c < rcount; c++) {
          var div2 = document.createElement('div');
          div2.className = "row";
          for (var r = 0; r < ccount; r++) {
              var ind = (c * rcount + r);
              if (ind < acount) {
                  var div3 = document.createElement('div');
                  div3.className = "column";
                  div3.innerHTML = contents[ind];
                  div2.appendChild(div3);
              }
          }
          div1.appendChild(div2);
      }
      document.getElementById("same-game-area").appendChild(div1);

      //Add Event binding
      $(".same-letter-img").bind("click", function () {
          var ti = $(this).attr("title");
          if ($(this).hasClass('Correct')) {
              $(this).parent().addClass("correct");
              self.correct++;
              checkforSFX(["sfx/sfx_ca"]);
              if (self.correct != self.possible) {
                  checkforSounds([self.bookISBN + "/gen_thatsright", self.bookISBN + "/" + self.Inttype + "_" + ti + "", self.bookISBN + "/" + "gen_startswith", self.bookISBN + "/" + "gen_" + self.StartingLetter + ""]);
              } else {
                  checkforSounds([self.bookISBN + "/gen_thatsright", self.bookISBN + "/" + self.Inttype + "_" + ti + "", self.bookISBN + "/" + "gen_startswith", self.bookISBN + "/" + "gen_" + self.StartingLetter + "", self.bookISBN + "/" + "gen_gotthemall"], closePopup);
              }
          } else {
              $(this).parent().addClass("incorrect");
              checkforSFX(["sfx/sfx_wa"]);
              checkforSounds([self.bookISBN + "/" + self.Inttype + "_" + ti + "", self.bookISBN + "/" + "gen_doesntstartwith", self.bookISBN + "/" + "gen_" + self.StartingLetter + "", self.bookISBN + "/" + "gen_tryagain"]);
          }
      });
  }
}
//#endregion SameLetter Object

//#region MatchingGame Object
function Matching (xmlPort, type,bookISBN) {
  this.Xml = xmlPort;
  this.Inttype = type;
  this.clicks = 0;
  this.flips = 0;
  this.fullcount = 0;
  this.intro = "";
  this.bookISBN = bookISBN;
  this.Contents = '<h1 id="match-game-title">Memory Match</h1><div id="match-game-area"></div>';

  this.init = function () {
      var game = document.createElement("div");
      game.innerHTML = this.Contents;
      game.id = "match-game";
      game.className = "popup-inter";
      document.getElementById("game-area").appendChild(game);

      this.intro = this.Xml.getElementsByTagName("Introduction")[0].getAttribute("Transcript");

      this.getLevels();
  };

  this.getLevels = function () {
      $("#match-game").removeClass("size1").removeClass("size2").removeClass("size3");
      var self = this;
      //show the options for the concentation game (number of concentration cards)
      var lvl = '<p>Choose your level</p><ul class="match-levels"><li class="match-blue match-level"><a href="12" class="match-type match-img"><img src="imgs/interactions/MemoryMatch_6PairsThumb.png" alt="3x4" /></a><a href="12" class="match-type match-btn"><img src="imgs/interactions/MemoryMatch_6PairsBtn.png" alt="6 Pairs" /></a></li> \
                   <li class="match-purple match-level"><a href="18" class="match-type match-img"><img src="imgs/interactions/MemoryMatch_9PairsThumb.png" alt="3x6" /></a><a href="18" class="match-type match-btn"><img src="imgs/interactions/MemoryMatch_9PairsBtn.png" alt="9 Pairs" /></a></li> \
                   <li class="match-orange match-level"><a href="24" class="match-type match-img"><img src="imgs/interactions/MemoryMatch_12PairsThumb.png" alt="4x6" /></a><a href="24" class="match-type match-btn"><img src="imgs/interactions/MemoryMatch_12PairsBtn.png" alt="12 Pairs" /></a></li></ul>';
      document.getElementById("match-game-area").innerHTML = lvl;
      $(".match-type").bind("click", function (e) {
          e.preventDefault();
          self.fullcount = Number($(this).attr("href"));
          self.showConcentration(self.fullcount);
      });

      checkforSounds([self.bookISBN + "/gen_memorymatch"]);
  }

  this.showConcentration = function (num) {
      var self = this;
      document.getElementById("match-game-title").innerHTML = self.intro;
      //Populate the concentation game depending on how many cards to show
      checkforSounds([self.bookISBN + "/mm_intro"]);

      var contents = new Array();
      var ccount = 0;
      var rcount = 0;

      //Organize rows and columns
      if (num == 12) {
          $("#match-game").addClass("size1");
          ccount = 4;
          rcount = 3;
      } else if (num == 18) {
          $("#match-game").addClass("size2");
          ccount = 6;
          rcount = 3;
      } else if (num == 24) {
          $("#match-game").addClass("size3");
          ccount = 6;
          rcount = 4;
      }

      //Create the html items in an array
      var count = 1;
      for (var i = 0; i < num; i += 2) {
          contents[i] = '<div class="match-card match' + count + '"><span class="front"></span><span class="back"><img class="match-img" src="' + self.bookISBN + '/' + self.Inttype + '_match' + count + 'a.png" /></span></div>';
          contents[i + 1] = '<div class="match-card match' + count + '"><span class="front"></span><span class="back"><img class="match-img" src="' + self.bookISBN + '/' + self.Inttype + '_match' + count + 'b.png" /></span></div>';
          count++;
      }

      //Randomize the array
      contents = contents.sort(function () {
          return 0.5 - Math.random();
      });

      //Create and append a div with all the concentration cards organized in rows and columns
      var ind = 0;
      var div1 = document.createElement('div');
      for (var c = 0; c < rcount; c++) {
          var div2 = document.createElement('div');
          div2.className = "row";
          for (var r = 0; r < ccount; r++) {
              var div3 = document.createElement('div');
              div3.className = "column";
              div3.innerHTML = contents[ind];
              ind++;
              div2.appendChild(div3);
          }
          div1.appendChild(div2);
      }
      document.getElementById("match-game-area").innerHTML = div1.innerHTML + '<div id="flips">0 Flips</div><a class="play-again start-over" href="#">Start Over</a>';

      $(".start-over").bind("click", function (e) {
          e.preventDefault();
          self.getLevels();
      });

      //Add the onclick event for flipping cards
      $("#match-game-area .match-card").bind("click", function (e) {
          e.preventDefault();
          if (!$(this).hasClass("found") && !$(this).hasClass("click") && self.clicks < 2) {
            checkforSFX(["sfx/sfx_pickup"]);
              $(this).addClass("click flip");
              $(this).quickFlipper();
              self.clicks++;
              self.flips++;
              document.getElementById("flips").innerHTML = self.flips + " Flips";
              if (self.clicks >= 2) {
                  var img1 = $("#match-game-area .match-card.click").first().attr("class");
                  var img2 = $("#match-game-area .match-card.click").last().attr("class");
                  //If two cards have been clicked, compare the classes on each, if they match there is a match, if not flip them back
                  if (img1 == img2) {
                      $("#match-game-area .match-card.click").addClass("found").removeClass("click");
                      if (self.fullcount == $("#match-game-area .match-card.found").size()) {
                          setTimeout(function () {
                              checkforSFX(["sfx/sfx_win_y", "sfx/gen_youwon_jigsaw"]);
                              document.getElementById("match-game-area").innerHTML = '<h2>DONE</h2><a class="play-again" href="#">Play Again</a>'

                              $(".play-again").click(function (e) {
                                  e.preventDefault();
                                  self.getLevels();
                              });
                          }, 1000);
                      } else {
                          checkforSFX(["sfx/sfx_ca"]);
                      }
                      self.clicks = 0;
                  } else {
                      setTimeout(function () {
                          $("#match-game-area .match-card.click").quickFlipper();
                          $("#match-game-area .match-card.click").removeClass("flip").removeClass("click");
                          self.clicks = 0;
                          checkforSFX(["sfx/sfx_wa"]);
                      }, 1000);
                  }
              }
          }
      });


      var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

      if ($('html').hasClass('no-csstransitions') || isChrome) {
          $('#match-game-area .match-card').quickFlip();
      } else {
          $('#match-game-area').addClass("css3");
      }
  }
}
//#endregion MatchingGame Object

//#region ScratchAndSee Object
function ScratchSee (xmlPort, type,bookISBN) {
  this.Xml = xmlPort;
  this.Inttype = type;
  this.showQuest1 = false;
  this.pickQuest = false;
  this.curState = 0;
  this.square = 190;
  this.radius = 20;
  this.img = 'imgs/interactions/ScratchAway_Overlay.png';
  this.pct = 0;
  this.questions = new Array();
  this.bookISBN = bookISBN;	
  this.Contents = '<div id="scratch-game-area"><h1>Scratch away the question mark to see the picture</h1><div id="scratch-off">\
			<canvas id="scratcher" class="scratcher-canvas" width="' + this.square + '" height="' + this.square + '"></canvas>\
			<div id="scratcherPct" class="scratcher-margin-bottom"><div class="scratcherProg"></div></div></div>\
			<div class="scratch-over"><div class="scratch-overcan"></div><div id="scratch-questions"></div></div></div>';
		
  this.init = function(num){
    var self = this;
    self.questions = self.Xml.getElementsByTagName("Question");
		
    if(num)
      self.getQuestion(num);
    else
      self.getQuestion(1);
  };

  this.getQuestion = function (num) {
      var self = this;
      var game = document.createElement("div");
      game.innerHTML = self.Contents;
      game.id = "scratch-game";
      game.className = "popup-inter";
      document.getElementById("game-area").innerHTML = "";
      document.getElementById("game-area").appendChild(game);

      self.pct = 0;
      self.showQuest1 = false;
      self.pickQuest = true;
      self.curState = 0;
      $(".scratch-over").hide();
      $('#scratcherPct').show();

      var scratcher1 = new Scratcher('scratcher', self.bookISBN + '/' + self.Inttype + '_q' + num + '.png', self.img, self.square, self.square, self.radius);
      scratcher1.reset();

      //adds event listeners for the scratcher percentage
      scratcher1.addEventListener('reset', function (ev) {
          self.pct = 0;
          $('#scratcherPct .scratcherProg').css("width", '0%');
      });
      scratcher1.addEventListener('scratch', function (ev) {
          // Test every pixel. Very accurate, but might be slow on large canvases on underpowered devices:
          // Only test every 32nd pixel. 32x faster, but might lead to inaccuracy
          self.pct = (this.fullAmount(32) * 100).toFixed(3);
          //checks percentage and shows questions

          $('#scratcherPct .scratcherProg').css("width", (!self.showQuest1 ? (self.pct * 5) : ((self.pct * 5) - 100)) + '%');


          if (self.pct >= 20 && !self.showQuest1) {
              $('#scratcherPct .scratcherProg').css("width", '0%');
              self.showQuestions(num);
          } else if (self.pct >= 40) {
              $('#scratcherPct .scratcherProg').css("width", '0%');
              self.showQuestions(num);
          }
      });

      scratcher1.addEventListener('scratchesbegan', function (ev) {
          if (isAudible) {
              Glbsfx.pause();
              Glbsfx.src = 'sfx/sfx_scratch';
              Glbsfx.addEventListener('ended', function () {
                  this.currentTime = 0;
                  this.play();
              }, false);
              Glbsfx.play();
          }
      });

      scratcher1.addEventListener('scratchesended', function (ev) {
          if (isAudible) {
              Glbsfx.pause();
          }
      });

      //populate answers for the question
      var answers = self.questions[num - 1].getElementsByTagName("Answer");
      document.getElementById("scratch-questions").innerHTML = "";
      for (var i = 0; i < answers.length; i++) {
          document.getElementById("scratch-questions").innerHTML += '<div class="answer-image"><span ' + (answers[i].getAttribute("IsCorrect") && answers[i].getAttribute("IsCorrect") == "True" ? ' class="correct" ' : '') + ' >' + answers[i].getAttribute("Transcript") + '</span>';
      }

      checkforSounds([self.bookISBN + "/gen_scratchaway"]);

      $(".answer-image span").bind("click", function () {
          if (self.pickQuest) {
              self.pickQuest = false;
              var picked = ($(this).parent().index()) + 1;
              //If this is the first answer pick
              if (!self.showQuest1) {
                  self.showQuest1 = true;
                  if ($(this).hasClass("correct")) {
                      $(this).parent().addClass("correct");
                      checkforSFX(["sfx/sfx_ca"]);
                      checkforSounds([self.bookISBN + "/" + self.Inttype + "_q" + num + "a" + picked + "", self.bookISBN + "/gen_thatsright"], closePopup);
                      document.getElementById("scratch-off").innerHTML = '<img src="' + self.bookISBN + '/' + self.Inttype + '_q' + num + '.png" />';
                  }
                  else {
                      //If the first pick is wrong
                      $(this).parent().addClass("incorrect");
                      checkforSFX(["sfx/sfx_wa"]);
                      checkforSounds([self.bookISBN + "/" + self.Inttype + "_q" + num + "a" + picked + "", self.bookISBN + "/gen_thatsnotit", self.bookISBN + "/gen_keepscratching"]);
                      setTimeout(function () {
                          //remove the scratch protector which allows scratchign to continue
                          $(".answer-image").removeClass("incorrect");
                          $(".scratch-over").hide();
                          $('#scratcherPct').show();
                          self.pickQuest = true;
                      }, 1500);
                  }
              }
              else {
                  if ($(this).hasClass("correct")) {
                      $(this).parent().addClass("correct");
                      checkforSFX(["sfx/sfx_ca"]);
                      checkforSounds([self.bookISBN + "/" + self.Inttype + "_q" + num + "a" + picked + "", self.bookISBN + "/gen_thatsright"], closePopup);
                      document.getElementById("scratch-off").innerHTML = '<img src="' + self.bookISBN + '/' + self.Inttype + '_q' + num + '.png" />';
                  }
                  else {
                      //If the pick is not the first pick and it is wrong, allow other picks but not more scratching
                      $(this).parent().addClass("incorrect");
                      checkforSFX(["sfx/sfx_wa"]);
                      checkforSounds([self.bookISBN + "/" + self.Inttype + "_q" + num + "a" + picked + "", self.bookISBN + "/gen_tryagain"]);
                      setTimeout(function () {
                          $(".answer-image").removeClass("incorrect");
                          self.pickQuest = true;
                      }, 1000);
                  }
              }
          }
      });
  };

  this.playChoices = function (num) {
      var self = this;
      //plays the question choices and highlights each question as read
      self.curState++;
      if (self.curState <= 2 && isAudible) {
          //Glbsfx = new Audio();
          //checkforSFX(["sfx/sfx_scratchDing"]);
          self.pickQuest = false;
          var ansboxes = $(".answer-image");
          Glbaudio = new Audio(self.bookISBN + "/gen_whatdoyousee" + (isOgg ? ".ogg" : ".mp3"));
          Glbaudio.play();
          Glbaudio.addEventListener('ended', function () {
              $(ansboxes[0]).addClass("readalong");
              Glbaudio = new Audio(self.bookISBN + "/" + self.Inttype + "_q" + num + "a1" + (isOgg ? ".ogg" : ".mp3"));
              Glbaudio.play();
              Glbaudio.addEventListener('ended', function () {
                  $(ansboxes[0]).removeClass("readalong");
                  $(ansboxes[1]).addClass("readalong");
                  Glbaudio = new Audio(self.bookISBN + "/" + self.Inttype + "_q" + num + "a2" + (isOgg ? ".ogg" : ".mp3"));
                  Glbaudio.play();
                  Glbaudio.addEventListener('ended', function () {
                      $(ansboxes[1]).removeClass("readalong");
                      $(ansboxes[2]).addClass("readalong");
                      Glbaudio = new Audio(self.bookISBN + "/" + self.Inttype + "_q" + num + "a3" + (isOgg ? ".ogg" : ".mp3"));
                      Glbaudio.play();
                      Glbaudio.addEventListener('ended', function () {
                          $(ansboxes[2]).removeClass("readalong");
                          self.pickQuest = true;
                      });
                  });
              });
          });
      }
  };

  this.showQuestions = function(num){
    var self = this;
    //Shows the questions, put up a scratch protective div, and plays the choice sequence

    $(".scratch-over").show();
    $('#scratcherPct').hide();
    $("#scratcher").trigger('mouseout').trigger('mouseup');
    self.playChoices(num);
  };	
}
//#endregion ScratchAndSee Object

//#region MultiChoice Object
function MultiChoice(xmlPort, type, bookISBN) {
    this.Xml = xmlPort;
    this.Inttype = type;
    this.answered = new Array();
    this.questions = new Array()
    this.bookISBN = bookISBN;
    this.Contents = '<h1 id="choice-game-title"></h1>\
		<div id="choice-game-area"></div>';


    this.init = function () {
        var self = this;
        var game = document.createElement("div");
        game.id = "choice-game";
        game.className = "popup-inter";
        game.innerHTML = self.Contents;
        document.getElementById("game-area").appendChild(game);

        //document.getElementById("choice-game-title").innerHTML = self.Xml.getElementsByTagName("Introduction")[0].getAttribute("Transcript");

        self.questions = self.Xml.getElementsByTagName("Question");
        for (var i = 0; i < self.questions.length; i++)
            self.answered[i] = false;

        self.getQuestion(0);
    }

    this.getQuestion = function (num) {
        var self = this;

        //Get current question by Index
        var quest = self.questions[num];
        quest.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript");

        //Create div to house the question and answer
        var div1 = document.createElement('div');
        div1.className = "question-area";

        //Create and append the question 
        var div2 = document.createElement('div');
        div2.className = "question-text";
        div2.innerHTML = quest.getElementsByTagName("QuestionPrompt")[0].getAttribute("Transcript");
        document.getElementById("choice-game-title").appendChild(div2);

        //Create and append the answers
        var div3 = document.createElement('div');
        div3.className = "answers-area";
        var answers = quest.getElementsByTagName("Answer");
        for (var ans = 0; ans < answers.length; ans++) {
            div3.innerHTML += ('<div class="answer-image"><img ' + (answers[ans].getAttribute("IsCorrect") && answers[ans].getAttribute("IsCorrect") == "True" ? ' class="correct" ' : '') + ' src="' + self.bookISBN + '/' + self.Inttype + '_q' + (num + 1) + 'a' + (ans + 1) + '.png" /></div>');
        }
        div1.appendChild(div3);

        //Clear out old question area and append the new one
        document.getElementById("choice-game-area").innerHTML = "";
        document.getElementById("choice-game-area").appendChild(div1);
        checkforSounds([self.bookISBN + '/' + self.Inttype + "_q" + (num + 1) + ""]);

        //Bind new onclick event for the answer
        $(".answer-image img").bind("click", function (e) {
            if (!self.answered[num]) {
                if ($(this).hasClass("correct")) {
                    checkforSFX(["sfx/sfx_ca"]);
                    checkforSounds([self.bookISBN + "/gen_thatsright", self.bookISBN + "/" + self.Inttype + "_ca" + (num + 1) + ""], closePopup);
                    $(this).parent().addClass("correct");
                    self.answered[num] = true;
                } else {
                    $(this).parent().addClass("incorrect").delay(1000).queue(function () {
                        $(this).removeClass("incorrect");
                    });
                    checkforSFX(["sfx/sfx_wa"]);
                    checkforSounds([self.bookISBN + "/" + "gen_tryagain"]);
                }
            }
        });
    };
}
//#endregion MultiChoice Object

//#region Sequence Object
function Sequence (xmlPort, type,bookISBN) {
  this.Xml = xmlPort;
  this.Inttype = type;
  this.IsPopulated = [0, 0, 0];
  this.Coorheight = 160;
  this.CoorArray = [0, 104, 208];
  this.bookISBN = bookISBN;

  this.Contents = '<div class="sequence-game"><h1 id="sequence-game-title">Put the story in order of what happened first, next, and last.</h1><div id="sequence-game-area"><div id="draggables">\
		<div id="drag1" class="drag-bucket"><div class="sequence-img" id="img1"><img src="' + this.bookISBN + '/seq_img1.png" /></div></div>\
		<div id="drag2" class="drag-bucket"><div class="sequence-img" id="img2"><img src="' + this.bookISBN + '/seq_img2.png" /></div></div>\
		<div id="drag3" class="drag-bucket"><div class="sequence-img" id="img3"><img src="' + this.bookISBN + '/seq_img3.png" /></div></div>\
		</div><div id="dropables">\
		<div class="drop-bucket" id="drop1"></div>\
		<div class="drop-bucket" id="drop2"></div>\
		<div class="drop-bucket" id="drop3"></div>\
        </div><div id="describables">\
		<div class="desc-bucket">first</div>\
		<div class="desc-bucket">next</div>\
		<div class="desc-bucket">last</div>\
        </div></div></div>';

  this.init = function () {
      var self = this;
      var game = document.createElement("div");
      game.innerHTML = self.Contents;
      game.id = "seq-game";
      game.className = "popup-inter";
      document.getElementById("game-area").appendChild(game);

      //Shuffle draggable images
      $("#draggables").randomize("div.drag-bucket");

      //Initialize the drop buckets for the images
      $('#dropables .drop-bucket').droppable({
          scroll: false,
          cursorAt: {
              top: 56,
              left: 46
          },
          accept: '#draggables .drag-bucket .sequence-img',
          drop: function (event, ui) {
              ui.draggable.data('dropped', true);
              var imgnum = Number(ui.draggable.context.id.replace("img", ""));
              var drpnum = Number(($(this).attr("id")).replace("drop", ""));

              //If the area being dropped into has nothing in it
              if (self.IsPopulated[drpnum - 1] == 0) {
                  //Set the area to the image id and position it
                  self.IsPopulated[drpnum - 1] = imgnum;
                  var leftw = $(this).position().left - self.CoorArray[$("#drag" + imgnum).index()];
                  $("#img" + imgnum).animate({
                      top: self.Coorheight,
                      left: leftw
                  }, 350, function () {
                      var done = true;
                      var finish = true;

                      //See if all areas are filled
                      for (var i2 = 0; i2 < self.IsPopulated.length; i2++) {
                          if (self.IsPopulated[i2] == 0)
                              done = false;
                      }

                      checkforSFX(["sfx/sfx_dropOK"]);
                      if (done) {
                          //See if all areas are correct
                          for (var i3 = 0; i3 < self.IsPopulated.length; i3++) {
                              if (self.IsPopulated[i3] != i3 + 1)
                                  finish = false;
                          }

                          //Reset the drops and drags or initiate the done sequence
                          if (finish) {
                              $("#draggables .drag-bucket .sequence-img").draggable('disable');
                              self.doneSequence();
                          } else {
                              checkforSounds([self.bookISBN + "/gen_tryagain"]);
                              self.IsPopulated = [0, 0, 0];
                              $(".sequence-img").css({
                                  left: 0,
                                  top: 0
                              });
                          }
                      }
                  });
              }
              else {
                  checkforSFX(["sfx/sfx_dropNo"]);
                  ui.draggable.data('dropped', false);
                  $("#img" + imgnum).animate({
                      top: 0,
                      left: 0
                  }, 350);
              }
          }
      });

      $('#draggables .drag-bucket .sequence-img').draggable({
          revert: function (drop) {
              //if false then no drop occurred, therefore revert, else don't revert
              if (drop === false) {
                  checkforSFX(["sfx/sfx_dropNo"]);
                  return true;
              }
              else {
                  return false;
              }
          },
          start: function (event, ui) {

              checkforSFX(["sfx/sfx_pickup"]);
              ui.helper.data('dropped', false);
              ui.originalPosition.left = 0;
              ui.originalPosition.top = 0;
              var imgnum = Number(ui.helper.context.id.replace("img", ""));

              //when picking up an image, clear its id from the droppable areas
              for (var i = 0; i < self.IsPopulated.length; i++) {
                  if (self.IsPopulated[i] == imgnum)
                      self.IsPopulated[i] = 0;
              }
          },
          stop: function (event, ui) {
          }
      }).addTouch();
      checkforSounds([self.bookISBN + "/gen_putinorder"]);
  }

  this.doneSequence = function () {
      var self = this;
      //plays all sounds and highlights areas individually
      if (isAudible) {
          checkforSFX(["sfx_win_y"]);
          var ansboxes = $(".drop-bucket");
          Glbaudio.src = self.bookISBN + "/gen_thatsright" + (isOgg ? ".ogg" : ".mp3");
          Glbaudio.load();
          Glbaudio.play();
          Glbaudio.addEventListener('ended', function () {
              $(ansboxes[0]).addClass("readalong");
              Glbaudio.src = self.bookISBN + "/" + self.Inttype + "_ca1" + (isOgg ? ".ogg" : ".mp3");
              Glbaudio.load();
              Glbaudio.play();
              Glbaudio.addEventListener('ended', function () {
                  $(ansboxes[0]).removeClass("readalong");
                  $(ansboxes[1]).addClass("readalong");
                  Glbaudio.src = self.bookISBN + "/" + self.Inttype + "_ca2" + (isOgg ? ".ogg" : ".mp3");
                  Glbaudio.load();
                  Glbaudio.play();
                  Glbaudio.addEventListener('ended', function () {
                      $(ansboxes[1]).removeClass("readalong");
                      $(ansboxes[2]).addClass("readalong");
                      Glbaudio.src = self.bookISBN + "/" + self.Inttype + "_ca3" + (isOgg ? ".ogg" : ".mp3");
                      Glbaudio.load();
                      Glbaudio.play();
                      Glbaudio.addEventListener('ended', function () {
                          $(ansboxes[2]).removeClass("readalong");
                          pickQuest = true;
                          Glbaudio.pause();
                          closePopup();
                      });
                  });
              });
          });
      }
  }
}
//#endregion Sequence Object
//#region Video Object
function PlayVideo(xmlPort, bookISBN) {
    this.Xml = xmlPort;
    this.bookISBN = bookISBN;
    this.Contents = '<h1>Video</h1><div class="video-game"><h3 id="video-title"></h3><div id="video-area">\
		<video controls id="video-player"></video>';

    this.init = function () {
        var self = this;
        var game = document.createElement("div");
        game.id = "video";
        game.className = "popup-inter";
        game.innerHTML = self.Contents;
		var videoPath=self.Xml.getElementsByTagName("Video")[0].getAttribute("Url");
		videoPath=$.browser.msie ? videoPath + "_new":videoPath;
		//videoPath=isOgg ? videoPath + ".ogg" : videoPath + ".mp4";
        document.getElementById("game-area").appendChild(game);

        document.getElementById("video-title").innerHTML = self.Xml.getElementsByTagName("Video")[0].getAttribute("Transcript");
		    document.getElementById("video-player").innerHTML ='<source src="./'+self.bookISBN+'/'+videoPath+'.mp4" type="video/mp4"><source src="./'+self.bookISBN+'/'+videoPath+'.ogg" type="video/ogg">'; 

    }

   
}
//#endregion Video Object