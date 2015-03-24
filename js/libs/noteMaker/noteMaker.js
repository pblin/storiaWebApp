/* Author: Tyler Abrams
Note Maker
*/

var noteMaker = function ($notesPopupWrapper, $notesBody, $notesBtn, $notesCloseBtn, $addnoteBtn, model) {
    /* Begin Private Section */

    /*	By default, attach event listeners to DOM objects that will remain persistent through out the app
    regardless of the book
    */
    attachListeners();
    var bookId = model.bookId;
    var strPages = "";
    var currentPages = null;
    var isWebSql = typeof (window.openDatabase) != 'undefined';


    function attachListeners() {
        $notesCloseBtn.on('click', function (e) {
            e.preventDefault();
            $(".noteText").blur();
            $notesPopupWrapper.toggle();
        });

        $notesBtn.on('click', function (e) {
            e.preventDefault();
            $notesPopupWrapper.toggle();
            currentPages = model.get('currentPages');
            //console.log('currentPages' + currentPages);
        });

        $addnoteBtn.on('click', function (e) {
            e.preventDefault();
            currentPages = model.get('currentPages');
            strPages = getPages(currentPages);
            //console.log('currentPages' + currentPages);
            //console.log('addnoteBtn' + strPages);
            renderNote(strPages, '', e.timeStamp, '-1');
        });

        $notesBody.on('click', ' .removeNote a', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var parentNote = $(this).parents('.note');
            var currentNoteID = parentNote.attr('data-noteID');

            if (currentNoteID > -1) notesManager.webdb.deleteTodo(currentNoteID);

            $(this).parents('.note').remove();
        });

        $notesBody.on('click', '.note', function (e) {
            //console.log('data-notelink'+$(this).attr('data-notelink'));
            //console.log('currentpage'+getPages(currentPages) );
            if (getPages(model.get('currentPages')) != $(this).attr('data-notelink')) {
                var pages = $(this).attr('data-notelink').split("-");
                if (pages.length > 0) {


                    var page = pages[0];
                    if (page == 0)
                        page = 1;
                    //console.log('turn'+page);
                    $(".flipbook").turn('page', page);
                }
            }
        });


        $notesBody.on('click', ' .note', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if ('ontouchstart' in document.documentElement) {
                $(this).find('.noteText').focus();
            }
        });

        $notesBody.on('focusout', '.noteText', function (e) {

            var parentNote = $(this).parents('.note');
            var currentNoteID = parentNote.attr('data-noteID');

            parentNote.attr('data-notets', e.timeStamp);
            parentNote.find('.noteTimestamp').text(updateTimestamp(e.timeStamp));


            if (currentNoteID == -1 && ($(this).text() != '')) {
                //notesManager.webdb.addNote(bookFrameobj.getcurrentISBN(), $(this).html(),parentNote.attr('data-notets'),parentNote,bookFrameobj.getcurrentPagesFilename());				
                notesManager.webdb.addNote(bookId, $(this).html(), parentNote.attr('data-notets'), parentNote, getPages(currentPages));
            }

            else if (currentNoteID > -1) {
                notesManager.webdb.updateNote($(this).html(), parentNote.attr('data-notets'), currentNoteID);
            }

        });
    }

    function getPages(pages) {
        if (pages && pages.length > 1)
            return pages[0] + '-' + pages[1];
        else
            return pages[0] + '-' + pages[0];
    }

    /* 	Build HTML to append to NoteManager body
    params:
    pages - pages relevant to individual note (ex. "2-3.html")
    message - HTML block inserted into .noteText, can be empty if it is a new note
    timestamp - Unix timestamp originating from event timestamp, eventually formatted into readable date
    noteID - unique identifier for note
    */
    function renderNote(pages, message, timestamp, noteID) {
        //console.log(timestamp);
        var noteHTML = '<div data-noteLink="' + pages + '" data-noteID="' + noteID + '" data-notets="' + timestamp + '" class="note">' +
            '<div class="notePages">' + convertPageIndexToText(pages) + '</div>' +
        //'<div class="notePages">' + (pages) + '</div>' +
        //'<div class="noteText" contenteditable="true">' + message +
        //'</div>' +
        //Text area doesn't always allow input so a space is added in the middle to insure edit abilities
            '<textarea class="noteText">' + (message ? message : ' ') +
            '</textarea>' +
            '<div class="noteTimestamp">' + updateTimestamp(timestamp) + '</div>' +
            '<div class="removeNote"><a href="#"></a></div>' +
            '</div>';
        $notesBody.prepend(noteHTML);
        //console.log(noteHTML);
    }


    /* SQLite Database Config */
    var notesManager = {};
    notesManager.webdb = {};
    notesManager.webdb.db = null;

    /* Open SQLite DB*/
    notesManager.webdb.open = function () {
        if (isWebSql) {
            var dbSize = 5 * 1024 * 1024;
            notesManager.webdb.db = openDatabase("notesDB", "1.0", "Notes manager", dbSize);
        }
    }

    /* Create SQLite Table */
    notesManager.webdb.createTable = function () {
        if (isWebSql) {
            var db = notesManager.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS notes(ID INTEGER PRIMARY KEY ASC, isbn TEXT, noteHTML TEXT, noteTS INTEGER, pageNOs TEXT)", []);
            });
        }
    }

    /*	Add Note entry to DB/Table 
    params: 
    ISBNno - ISBN of Book currently open
    noteHTML - HTML entered into the note
    noteTS - Timestamp from note creation, based on focus event

    Description:
    New note has been added, so INSERT is done on DB
    SQL transaction (tx.executeSql) will return the auto-incremented id, which will then be added to the HTML rendered note for future reference
    */
    notesManager.webdb.addNote = function (ISBNno, noteHTML, noteTS, noteParent, pageNOs) {
        if (isWebSql) {
            var db = notesManager.webdb.db;

            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO notes(isbn, noteHTML, noteTS, pageNOs) VALUES (?,?,?,?)", [ISBNno, noteHTML, noteTS, pageNOs],
                function (tx, result) {
                    noteParent.attr('data-noteID', result.insertId);
                }, notesManager.webdb.onError);
            });
        }
    }


    /*	Update Note entry om DB/Table 
    params: 
    noteHTML - HTML entered into the note
    noteTS - Timestamp from note creation, based on focus event
    noteID - Note Identifier

    Description:
    New note has been added, so INSERT is done on DB
    SQL transaction (tx.executeSql) will return the auto-incremented id, which will then be added to the HTML rendered note for future reference
    */
    notesManager.webdb.updateNote = function (noteHTML, noteTS, noteID) {
        if (isWebSql) {
            var db = notesManager.webdb.db;

            db.transaction(function (tx) {
                tx.executeSql("UPDATE notes SET noteHTML=?, noteTS=? WHERE ID =?", [noteHTML, noteTS, noteID], function (tx, result) { }, notesManager.webdb.onError);
            });
        }
    }

    /*	Delete Note entry from DB/Table 
    params: 
    id - ID from relevant note

    Description:
    Delete note record from the database based on the ID key
    */
    notesManager.webdb.deleteTodo = function (id) {
        if (isWebSql) {
            var db = notesManager.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("DELETE FROM notes WHERE ID=?", [id], notesManager.webdb.onSuccess, notesManager.webdb.onError);
            });
        }
    }

    /*	Retrieve all notes from the database
    params: 
    id - ID from relevant note

    Description:
    Delete note record from the database based on the ID key
    */
    notesManager.webdb.getAllNotes = function (ISBN) {
        if (isWebSql) {
            var db = notesManager.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM notes WHERE isbn=?", [ISBN], function (tx, results) {
                    for (i = 0; i < results.rows.length; i++) {

                        renderNote(results.rows.item(i).pageNOs, results.rows.item(i).noteHTML, results.rows.item(i).noteTS, results.rows.item(i).ID);
                    }
                }, notesManager.webdb.onError);
            });
        }
    }

    notesManager.webdb.onError = function (tx, e) {
        alert("There has been an error: " + e.message);
    }


    function initDB(ISBN) {
        notesManager.webdb.open();
        notesManager.webdb.createTable();
        notesManager.webdb.getAllNotes(ISBN);
    }

    function clearNotes() {
        $notesBody.html('');
    }

    function updateTimestamp(timestamp) {
        var TSDate;
        TSDate = new Date(timestamp);
        //console.log(getDayofweek(TSDate.getDay()));
        //console.log(TSDate.getTime());
        return getDayofweek(TSDate.getDay()) + ' ' + getTimeAMPM(TSDate.getHours(), TSDate.getMinutes(), TSDate.getSeconds())
    }

    /* Date Formatting Functions */
    function getDayofweek(number) {
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        return weekday[number];
    }

    /* Date Formatting Functions */
    function getTimeAMPM(hours, minutes, seconds) {
        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }

        if (hours == 0) hours = 12;
        if (minutes < 10) minutes = "0" + minutes
        return hours + ":" + minutes + " " + suffix;
    }

    function convertPageIndexToText(pageIndex) {
        //var pageText = pageIndex.replace('-', ' and ');
        if (pageIndex == '0-1' || pageIndex == '1-1') pageText = "Cover Page";
        else {
            page = pageIndex.split('-');
            if (page && page.length > 1) {


                if (page[1] == 0 || page[1] == page[0])
                    pageText = 'Page: ' + page[0] - 1;
                else

                    pageText = 'Pages: ' + (page[0] - 1) + ' and ' + (page[1] - 1);
            }
        }
        return pageText;
    }

    function getMonthName(number) {
        var month = new Array(12);
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        return month[number];
    }
    /* End Date Formatting Functions */


    /* Begin Public Section */
    return {
        init: function (ISBN) {
            clearNotes();
            initDB(ISBN);
        },

        clearNotesHTML: function () {
            clearNotes();
        },

        setCurrentPages: function (view) {
            currentPages = view;
        }

    };
};