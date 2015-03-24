define([
  'backbone',
  'underscore',
  'backbone_websql',
  'modernizr',
  'interaction',
  'readalong'
  ],
  function (Backbone, _) {
    var readAlongModel = Backbone.Model.extend({
      defaults:{
        bookId: '',
        text_element : $('#scholastic-book-page-p3').find('#passage-text').get(0),
        audio_element : $('#passage-audio')[0],
        autofocus_current_word:'',
        dic_body:'',
        playAll :'',
        playQueue:'',
        currentTrack: '',
        playNext : false,
        playStatus: 'pause',
        currentPage : '',
        audioFilename :[]
		
      },
      audioFolder: 'MP3',
      
      initialize: function(param){
        this.bookId = param.bookId;
		if(this.bookId==9780545368759)
        this.set('playQueue',{
          '3':'3',
          '5': '5',
          '6': '6',
          '7' : '7',
          '8' : '8',
		  '9' : '9',
          '10' : '10',
          '11' : '11',
          '12' : '12',
		  '13' : '13',
          '14' : '14',
		  '15' : '15',
          '16' : '16',
		  '17' : '17',
          '18' : '18',
		  '19' : '19',
          '20' : '20',
		  '21' : '21',
          '22' : '22',
          '24' : '24',
		  '26' : '26',
          '27' : '27',
          '28' : '28',
		  '30' : '30',
          '31' : '31',
          '33' : '33',
          '34' : '34'
        });     
        _.bindAll(this, 'getAudioPath');
      },
      /*
      initReadAlong:function(){
        var textElement = $('#scholastic-book-page-p3').contents().find('#passage-text').get(0);
        var audioElement = $('#passage-audio')[0];
        if(typeof textElement !== 'undefined'){
          var args = {
            text_element: textElement,
            audio_element: audioElement,
            playAll:true
          };
          ReadAlong.init(args);
        }
      },
	  */
      // build audio path based on the bookId and the audio filename
      getAudioPath:function(){
        var filename = this.get('audioFilename');
        if(typeof filename !== 'undefined')
          return this.bookId+'/'+this.audioFolder+'/'+this.get('audioFilename');
      }
    });

    return readAlongModel;
  });
