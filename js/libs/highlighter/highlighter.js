/* Author: Tyler Abrams
   Highlighter
*/

var highlighter = function($bookFrame, pageNumber, ISBN, highlightsOn){

	
  var deleteBTNHTML = "<div class='highlightRemove'></div>";
  var highlightedHoverGroups = [];
  var isWebSql = typeof (window.openDatabase) != 'undefined';
	
	
  function bookframeListener(ISBN){
		
    /*On Frame load, inject highlight stylesheet into the HEAD of the HTML*/
    //$bookFrame.load(function(){
    var selectWordsExist = false;
    var $selectableSpans =null;
    if(highlightsOn) $bookFrame.find("#highlightsOnCSS").attr("href","css/highlight.css");
    else $bookFrame.find("#highlightsOnCSS").attr("href","");
    var $contentHolder = $bookFrame.find('.page-body');
			
    $contentHolder.find('#passage-text').each(function(i){
      $selectableSpans = $(this).find('span');
      if($selectableSpans.length) {
        attachListeners($contentHolder,$selectableSpans);
      }
    });
    highlightManager.webdb.getAllHighlights($selectableSpans,ISBN,pageNumber);
  //});
  }
	
	
  function attachListeners($contentDiv,$selectableWords){
    var mouseDown, selectingWords = false;
    var $firstEl, $lastEl, firstElPos, lastElPos;
		
	
    /* Attach 'mousedown' event listener to all bounding boxes for words */
    $selectableWords.on('mousedown', function (e){
		   
      $firstEl = $(this);
      firstElPos = $selectableWords.index(this);
      lastElPos = firstElPos;
      $(this).addClass('ui-selecting');
      mouseDown = true;
    });

		
    $contentDiv.on('mouseup', function (e){
		
      mouseDown = false;
      selectingWords = false

      var $selectedWords = $selectableWords.filter('.ui-selecting');
            
      var tStamp = e.timeStamp;
      var prevHID = 0;
      var $newselectedWords;
			
      //First find if any of the words being selected are not in ui-selected state
      if($selectedWords.not(".ui-selected").length){
				
        $selectedWords.filter(".ui-selected").each(function (i){
					
          if(prevHID != $selectableWords.index(this)){
            $(this).attr('hid',tStamp);
          }
          prevHID = $selectableWords.index(this);
        });
				
        $selectedWords.removeClass('ui-selecting').addClass('ui-selected').attr('hid',tStamp);
        $newselectedWords = $selectableWords.filter('[hid="' + tStamp + '"]');
        $newselectedWords.find('.highlightRemove').remove();
        $newselectedWords.last().append(deleteBTNHTML);
      }
			
      grabHighlights($selectableWords);
      $selectedWords.removeClass('ui-selecting');
			
    });
		
		


    /*	Mouseover listener, code only runs if preceded by a 'mousedown' event
			Keeps track of the moused-over elements position in lastElPos
			Removes all ui-selecting classes before reapplying
			
			To handle left-to-right & right-to-left selection, slice function is used
		*/
    $selectableWords.on('mouseover', function (){
			
      if(mouseDown){
        selectingWords = true;
        lastElPos =  $selectableWords.index(this);
        //console.log("last : " + lastElPos);
        $selectableWords.removeClass('ui-selecting');
				
        if(firstElPos < lastElPos)	$selectableWords.slice(firstElPos,lastElPos + 1).addClass('ui-selecting');
        else if (firstElPos === lastElPos)	$selectableWords.slice(firstElPos).addClass('ui-selecting');
        else if(firstElPos > lastElPos)	$selectableWords.slice(lastElPos,firstElPos + 1).addClass('ui-selecting');
      }
			
      else if($(this).hasClass('ui-selected')){
        var overHID = $(this).attr('hid');
        $selectableWords.filter('[hid="'+ overHID +'"]').find('.highlightRemove').show();
      }
    });

    $selectableWords.on('mouseout', function (){
	
      if($(this).hasClass('ui-selected')){
        var overHID = $(this).attr('hid');
        $selectableWords.filter('[hid="'+ overHID +'"]').find('.highlightRemove').hide();
      }
    });
		
    $selectableWords.on('click', '.highlightRemove', function (e){
      e.stopPropagation();
			
      var parentHID = $(this).parent('span').attr('hid');
      $selectableWords.filter('[hid="' + parentHID + '"]').attr('hid','').removeClass('ui-selected').find('.highlightRemove').remove();
      grabHighlights($contentDiv.find('.ui-selected'));
    });

  }

  /* SQLite Database Config */
  var highlightManager = {};
  highlightManager.webdb = {};
  highlightManager.webdb.db = null;
      
  /* Open SQLite DB*/

  highlightManager.webdb.open = function() {
        
    if(isWebSql){
      var dbSize = 5 * 1024 * 1024;
      highlightManager.webdb.db = openDatabase("highlightDB", "1.0", "Highlight manager", dbSize);
    }
  }

  /* Create SQLite Table */
  highlightManager.webdb.createTable = function() {
    if(isWebSql){
      var db = highlightManager.webdb.db;
      db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS highlight(ID INTEGER PRIMARY KEY ASC, isbn TEXT, highlightOBJ TEXT, pageNOs TEXT)", []);
      });
    }
  }

  /* 	adds high data to DB*/
  highlightManager.webdb.addHighlight = function(ISBNno,pageNOs,highlightOBJ) {
    if(isWebSql){
      var db = highlightManager.webdb.db;
      db.transaction(function(tx){
        tx.executeSql("SELECT * FROM highlight WHERE isbn=? AND pageNOs=?",
          [ISBNno, pageNOs],
          function (tx,result){
            if(!result.rows.length){
              tx.executeSql("INSERT INTO highlight(isbn, highlightOBJ, pageNOs) VALUES (?,?,?)",
                [ISBNno, highlightOBJ, pageNOs],function (tx,result){},	highlightManager.webdb.onError);
            }
            else{
              tx.executeSql("UPDATE highlight SET highlightOBJ=? WHERE isbn=? AND pageNOs=?",
                [highlightOBJ, ISBNno, pageNOs],function (tx,result){},highlightManager.webdb.onError);
            }
          },
          highlightManager.webdb.onError);
      });
    }
  }

  highlightManager.webdb.getAllHighlights = function($selectableWords,ISBNno,pageNOs) {
    if(isWebSql){
      var db = highlightManager.webdb.db;
      var JSONresult;
      db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM highlight WHERE isbn=? AND pageNOs=?", [ISBNno, pageNOs], function(tx,results){
          if(results.rows.length !== 0) { 
            JSONresult = JSON.parse(results.rows.item(0).highlightOBJ); 
            highlightResults(JSONresult,$selectableWords);
          };
        },highlightManager.webdb.onError);
      });
    }
  }
	
  function highlightResults(JSONresult,$selectableWords){
    console.log($selectableWords);
    var currentHID = 0;
    var highlightGroups = [];
		
    $.each(JSONresult, function(i,d){
      var highlightBlocks = [];
      var $lastBlock
			
      $.each(d, function(j,word){
        var $block;
        $block = $selectableWords.eq(word.wid).addClass('ui-selected').attr('hid',i);
        $lastBlock = $block;
        highlightBlocks.push($block);
      });
      $lastBlock.append(deleteBTNHTML);
      highlightGroups.push(highlightBlocks);
    });
  }
	
	
  highlightManager.webdb.onError = function(tx, e) {
    alert("There has been an error: " + e.message);
  }
	
  function initDB(ISBN) {
    highlightManager.webdb.open();
    highlightManager.webdb.createTable();
  }
	
  /*	
		Grabs all currently highlighted words from the page, and builds an array of objects:
		Example
			highlightJSON[##id of highlight][{wid : ##word ID }]
			
	*/
  function grabHighlights($selectableWords){
	
    var prevID = -1;
    var highlightJSON = {};
		
    $selectableWords.filter('.ui-selected').each(function(i){
      var currentID = $(this).attr('hid');
      var currentWID =$selectableWords.index(this);
		   
      if (prevID != currentID) highlightJSON[currentID] = [];
      highlightJSON[currentID].push({
        wid : currentWID
      });
      prevID = currentID;
    });
		
    highlightManager.webdb.addHighlight(ISBN,pageNumber,JSON.stringify(highlightJSON));		
		
  }	

  // Begin Public Section
  return {
    init: function(ISBN){
      initDB();
      bookframeListener(ISBN);
			
    }
  };
}
