define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/book/audioTemplate.html',
  'text!templates/book/audioPlayer.html',
  'readalong'
  ],
  function($, _, Backbone,audioTemplate,audioPlayer){
    var AudioView = Backbone.View.extend({
	  
	  leftRightAudio: 'Both',
	  
      initialize: function(){
        _.bindAll(this, 'render','checkForAudio','renderPlayer','startAutoplay');
        this.model.bind('change:currentPage',this.checkForAudio);
        
        var self = this;
        
        $('#play-pause-audio').live('click',function(event){
          event.preventDefault();

          playStatus = self.model.get('playStatus');
          
          if(playStatus == 'pause'){
		    if(self.leftRightAudio=='Both' || self.leftRightAudio=='Left' )
               $('#passage-audio').trigger('play');
			if(self.leftRightAudio=='Right')
               $('#passage-audio-right').trigger('play');
			if(self.leftRightAudio=='Left')
			{
				$('#passage-audio').unbind('ended').bind('ended',function(){
				  self.app.vent.trigger('app:turnPage');
				});
			}
			if(self.leftRightAudio=='Right')
			{
				 $('#passage-audio-right').unbind('ended').bind('ended',function(){
					self.app.vent.trigger('app:turnPage');
				});
			}
			if(self.leftRightAudio=='Both')
			{
				 $('#passage-audio').unbind('ended').bind('ended',function(){
				   $('#passage-audio-right').trigger('play');
				});
			
				$('#passage-audio-right').unbind('ended').bind('ended',function(){
				  self.app.vent.trigger('app:turnPage');
				});
			}
        
            self.model.set('playStatus','play');
            self.model.set('playNext',true);
          }else{
            $('#passage-audio').unbind('ended');
            $('#passage-audio').trigger('pause');
		    $('#passage-audio-right').unbind('ended');
            $('#passage-audio-right').trigger('pause');
            self.model.set('playStatus','pause');
            self.model.set('playNext',false);
          }
        });
      },
      /*
      playAudio: function(event){
        event.preventDefault();
        this.model.set('autoPlay',true);
        $('#passage-audio').trigger('play');
      },
      
      stopAudio: function(event){
        event.preventDefault();
        this.model.set('autoPlay',true);
        $('#passage-audio').trigger('pause');
      },
      */
	  stopAudio: function(){
            $('#passage-audio').unbind('ended');
            $('#passage-audio').trigger('pause');
			$('#passage-audio-right').unbind('ended');
            $('#passage-audio-right').trigger('pause');
            this.model.set('playStatus','pause');
            this.model.set('playNext',false);
      },
	  
      setCurrentFilePaths:function(leftPage,rightPage){
        var audioFilename = [];
		var audioFilepath = [];
        
        if(leftPage != 0){
          audioFilename['left'] = this.model.get('playQueue')[leftPage];
        }
        audioFilename['right'] = this.model.get('playQueue')[rightPage];
        
        if(audioFilename['left'])
		{
          this.model.set('audioFilename',audioFilename['left']);
		  audioFilepath['left'] = this.model.getAudioPath();
		}
        if(audioFilename['right'])
		{
          this.model.set('audioFilename',audioFilename['right']);
		  audioFilepath['right'] = this.model.getAudioPath();
		}
        
        this.model.set('currentPages',[leftPage,rightPage]);
        
        if(typeof audioFilename['right'] === 'undefined' && typeof audioFilename['left'] === 'undefined' )
          this.removePlayer();
        else{
          this.showAudioControls();
          this.renderPlayer(audioFilepath);
        }
      },
      
      checkForAudio:function(){
        var audioFilename = null;
        var currentPage = this.model.get('currentPage');
        
        //stop the current audio playback
        $('#passage-audio').trigger('pause');

        if( currentPage ==1){
          this.setCurrentFilePaths(0,1);
        }else{
          if(currentPage %2 == 0){
            this.setCurrentFilePaths(currentPage,currentPage+1);
          }else{
            this.setCurrentFilePaths(currentPage-1,currentPage);
          }
        }
        
      },
	  
      render:function(){
        $('#audio').html(audioTemplate); 
      },
	  
      renderPlayer:function(audioFilepath){
        var self = this;
        var currentPages = this.model.get('currentPages');
        
        if(typeof audioFilepath['left'] !== 'undefined' && typeof audioFilepath['right'] !== 'undefined'){
          
		  self.leftRightAudio='Both';
          var audioElement = _.template(audioPlayer,
          {
            'filepath' : audioFilepath['left']+'.mp3',
			'filepathright':audioFilepath['right']+'.mp3',
			'filepathogg' : audioFilepath['left']+'.ogg',
			'filepathrightogg':audioFilepath['right']+'.ogg'
          });

          $('#passage-audio-wrapper').html(audioElement);
          
          this.model.loaded = 0;        
          
          if(self.model.get('playNext')){
            $('#passage-audio').unbind('ended').bind('ended',function(){
			 $('#passage-audio-right').trigger('play');
            });
          }
		  if(self.model.get('playNext')){
            $('#passage-audio-right').unbind('ended').bind('ended',function(){
              self.app.vent.trigger('app:turnPage');
            });
          }
        } 
        if(typeof audioFilepath['left'] !== 'undefined' && typeof audioFilepath['right'] == 'undefined')
        {   
		  self.leftRightAudio='Left';
		  
          var audioElement = _.template(audioPlayer,
          {
            'filepath' : audioFilepath['left']+'.mp3',
			'filepathright':'',
			'filepathogg' : audioFilepath['left']+'.ogg',
			'filepathrightogg':''
          });

          $('#passage-audio-wrapper').html(audioElement);
          
          this.model.loaded = 0;        
          
          if(self.model.get('playNext')){
            $('#passage-audio').unbind('ended').bind('ended',function(){
              self.app.vent.trigger('app:turnPage');
            });
          }
		}		
		if(typeof audioFilepath['left'] == 'undefined' && typeof audioFilepath['right'] !== 'undefined')
        { 
		  self.leftRightAudio='Right';
          var audioElement = _.template(audioPlayer,
          {
           'filepathright':audioFilepath['right']+'.mp3',
		   'filepath' : '',
		   'filepathogg' : '',
		   'filepathrightogg':audioFilepath['right']+'.ogg'
          });

          $('#passage-audio-wrapper').html(audioElement);
          
          this.model.loaded = 0; 
		  
          if(self.model.get('playNext')){
			 $('#passage-audio-right').trigger('play');
          }		  
          
          if(self.model.get('playNext')){
            $('#passage-audio-right').unbind('ended').bind('ended',function(){
              self.app.vent.trigger('app:turnPage');
            });
          }
		}		
      },
      
      initReadAlong : function(pageNumber){
	    var self=this;
        var ReadAlongLeft = null;
        var ReadAlongRight = null;
        var args = {};
        var passage_text = null;

        var currentPages = this.model.get('currentPages');
        var audioFilename = this.model.get('audioFilename');
        
        if(typeof pageNumber !== undefined && (currentPages[0] == pageNumber || currentPages[1] == pageNumber)){
          
        passage_text_right = $('#page-number-'+currentPages[1]).find('#passage-text').get(0);
          //if(typeof passage_text_right !== 'undefined' && !$('#page-number-'+currentPages[1]).find('iframe').find('body').hasClass('initialized') ){
		  if(typeof passage_text_right !== 'undefined'){
            if(passage_text_right.querySelectorAll('[data-begin]').length != 0){
              args_right = {
                text_element: passage_text_right,
                audio_element: $('#passage-audio-right').get(0),
                autofocus_current_word: false
              };
            
              ReadAlongright = null;
              ReadAlongright = ReadAlong;
              ReadAlongright.init(args_right);
              $('#page-number-'+currentPages[1]).find('.scholastic-book').addClass('initialized');
			  //stop play when span clicked
			  $('#page-number-'+currentPages[1]).find('span').on('click', function(e) {
					e.preventDefault();
					$('#passage-audio-right').unbind('ended');
					$('#passage-audio-right').trigger('pause');
					self.model.set('playStatus','pause');
					self.model.set('playNext',false);
			 });
            }
          }
          
          passage_text_left = $('#page-number-'+currentPages[0]).find('#passage-text').get(0);
          //if(typeof passage_text_left !== 'undefined' && !$('#page-number-'+currentPages[0]).find('iframe').contents().find('body').hasClass('initialized')){
          if(typeof passage_text_left !== 'undefined'){ 
			if(passage_text_left.querySelectorAll('[data-begin]').length != 0) {
              args_left = {
                text_element: passage_text_left,
                audio_element: $('#passage-audio').get(0),
                autofocus_current_word: false
              };
                          
              ReadAlongleft = null;
              ReadAlongleft = _.clone(ReadAlong);
              ReadAlongleft.init(args_left);
              
              $('#page-number-'+currentPages[0]).find('.scholastic-book').addClass('initialized');
			  
			  //stop play when span clicked
			  $('#page-number-'+currentPages[0]).find('span').on('click', function(e) {
					e.preventDefault();
					$('#passage-audio').unbind('ended');
					$('#passage-audio').trigger('pause');
					self.model.set('playStatus','pause');
					self.model.set('playNext',false);
			  });
              
            }
          }
            
          //this.model.loaded = this.model.loaded  +1;
          //if(this.model.loaded == 2 || (this.model.loaded ==1 && (currentPages[1]+1) == this.model.get('numberOfPages') ) )
            if(this.model.get('playNext'))
              $('#passage-audio').trigger('play');
        }
      },
      startAutoplay:function(){
        if(this.model.get('playNext'))
          $('#passage-audio').trigger('play');
      },
      
      showAudioControls:function(){
        $('#play-pause-audio').show();
      },
      
      removePlayer: function(){
        $('#play-pause-audio').hide();
        $('#passage-audio-wrapper').empty();
      }
    }
    );
    return AudioView;
  })