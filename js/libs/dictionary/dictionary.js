/* Author: Bernard Lin
Dictionary
*/
var dictionaryLoader = function ($bookFrame, $dicAudio, age) {

    var isAudible = !($.browser.msie && $.browser.version.substr(0, 1) < 9);
    var dictionaryOn = true;
    var dictionaryClickHandler;
    var $thisWord;
    var $pronIcon = $('.pron-icon');
    var clickEventType = ((document.ontouchstart !== null) ? 'click' : 'touchstart');

    var age = "YD";
    if (age == "YD") {
        $dictPopup = $('#youngdictPopup');
        $dictClose = $('#youngdictClose');
        $dictBody = $('#youngdictBody');
    }
    else {

        $dictPopup = $('#dictPopup');
        $dictClose = $('#dictClose');
        $dictBody = $('#dictBody');
    }

    /* 	handler for iframe load
    1. hides dictionary if open
    2. clears all unused handlers assigned within the iframe, if already assigned
    3. assign click handlers to all words in the iframe that are wrapped in a span tag
    a. grab word from clicked span, make a query to the dictionary
    b. highlight word with background-color
    c. save DOM node of the word for later use
    */
    //$bookFrame.load(function(){
    //var pageno;
    hideDictionary();

    if (dictionaryClickHandler != null) {
        dictionaryClickHandler.off();
    }

    dictionaryClickHandler = $bookFrame.find('span').on(clickEventType, function (e) {
        e.stopPropagation();
        var word = $(this).attr('data-dic');
        if (!word) {
            word = $(this).html();
            if (word.indexOf("<div") > 0)
                word = word.substring(0, word.indexOf("<div"));
        }
        if (word) {
            queryDictionary(word);
            $(this).css({ 'background-color': '#99CCFF', 'opacity': '.5' });
            $thisWord = $(this);
        }
    });
    //});	

    /*	handler for dictionary close button
    hide the dictionary pop-up, then remove the highlighting from the word
    */
    $dictClose.click(function (e) {
        e.preventDefault();
        hideDictionary();
        if ($thisWord != null) $thisWord.css({ 'background-color': '', 'opacity': '1.0' });
    });

    //this is playaudio for yound reader
    /*
    $('.young-pron-icon').on(clickEventType, function (e) {
    e.preventDefault();
    var id = $('#dicWordId').html();
    $dicAudio[0].src = 'http://66.9.124.235/dictionary/ReadthroughAudio/fd_' + id + '.mp3';
    $dicAudio[0].load();
    });
    */

    //this is playaudio for old reader
    /*
    $dictBody.on(clickEventType, $('.pron-icon'), function (e) {
    e.preventDefault();
    var word = $dictBody.find('.hw').text();
    word = removePunctuation(word);
    $dicAudio[0].src = 'http://66.9.124.235/dictionary/pronunciation/pron_' + word + '.mp3';
    $dicAudio[0].load();
    });
    */

    /*	HTML5 Audio event handler
    Audio can be played, it has been downloaded and can start 
    */
    /*
    if (isAudible) {
    $dicAudio[0].addEventListener("canplay", function () {
    this.play();
    }, false);
    }
    */

    /* Queries web service through jQuery load 
    strips out all extraneous non-alpha character
    Also positions dictionary popup on opposite page based on the content-# of the words' parent element
    */
    function queryDictionary(word) {
        /* remove background from previous word before highlighting the next */
        if ($thisWord != null) $thisWord.css({ 'background-color': '', 'opacity': '1.0' });

        var iframePos = $bookFrame.offset();
        var iframeWidth = $bookFrame.width();


        var xCoord = iframePos.left;
        var top = iframePos.top;
        var cssProp = {};


        cssProp = {
            'display': 'block',
            'top': '20%',
            'left': '15%',
            'right': ''
        }


        /*strip word of extraneous punctuation for web service */
        word = $.trim(removePunctuation(word));

        /*	make a call to dictionary webservice
        if return successful, load specified chunk of html ('.entry') into the dictionary popup block
        if return empty/non-successful, popuplate dictionary popup with 'word not found' text

        apply css properties to the popup, including the display: block property
        */

        /*
        $dictBody.load('http://66.9.124.235/dictionary.ashx?word=' + encodeURIComponent(word) + '&age=' + age + ' .entry', function () {
        if ($dictBody.text() == '') $dictPopup.css({ 'display': 'none' });
        else {

        var $imageSrc = $dictBody.find('img').attr('src');
        $dictBody.find('img').attr('src', 'http://66.9.124.235/dictionary/images/' + $imageSrc);
        $dictPopup.css(cssProp);
        if (age == "YD") {

        $('.young-pron-icon').click();
        }
        else
        $('.pron-icon').click();
        }
        });
        */

        //uupdate dictionary code 
        dichostname = "54.197.249.148";
        httphead = "http://" + dichostname + ":8080/" + "ereader/restApp/";
        //httphead = "http://cloudapi.cloudhub.io/cloudread/";
        jsonpcallback = "&jsonp=?";

        var requestUrl = httphead + 'GetWordDef?' + "v=" + "YD" + "&w=" + encodeURIComponent(word.toLowerCase());

        var jqxhr = $.getJSON(requestUrl+jsonpcallback, function (json) {
            dicturl = "http://" + dichostname + "/dictionary" + json.wordurl;
            //window.open(dicturl,'dictionary','height=600,width=500,toolbar=no,location=no,menubar=no');
            $iframeelem = "<iframe id='dict_if' width=\"520\" height=\"530\" src=" + dicturl + ">" + "</iframe>";
            $dictBody.append($iframeelem);
            $dictPopup.css(cssProp);
            //$dictBody.remove();
        });


    }

    /* Hide dictionary */
    function hideDictionary() {
        $dictPopup.css({ 'display': 'none' });
        $('#dict_if').remove();
        if (this.isAudible)
            $dicAudio[0].pause();
    }

    function removePunctuation(word) {
        return word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    }

    /* 	Begin Public Section
    No public functions needed, yet
    Could possibly be used to initialize dictionary based on reader age?
    */
    return {
    };
};