var zoomFeature = function(bFobj){
	
	function zoomPage(){
	    
	     var currentPages=bFobj.currentView;
	     var currentPage=0;
		 //var theZindex=0;
	     //only zooming destop version, double display
	     if(currentPages && currentPages.length==2)
	     {
	        $(".flipbook").turn('stop');
		    $(".flipbook").turn("disable", true);
			
	        //width of two pages
            var width=$('.flipbook').turn('size').width;
            
            //left page
            if(bFobj.zoomPart==0 || bFobj.zoomPart==1)
            {
                //not cover page
                if(currentPages[0]!=0)
                  currentPage=currentPages[0];
                //cover page
                else 
                {
                    currentPage=currentPages[1];
                    if(bFobj.zoomPart==0)
                        bFobj.zoomPart==2
                    if(bFobj.zoomPart==1)
                        bFobj.zoomPart==3
                     
                }
            }
            //right page
            if(bFobj.zoomPart==2 || bFobj.zoomPart==3)
            {
               clearZoomDate(0);
                   
               //check last page    
               if(currentPages[1]!==0)    
                 currentPage=currentPages[1];
                
            }
			
            if(currentPage!=0)
            {
                var pageModel = bFobj.model.get('bookPages').models[currentPage - 1];
                
                var page=$('#page-number-'+currentPage);
                var pageWrapper=$(".page-wrapper[page="+currentPage+"]");
                var pageWrapperFirstChild=$(".page-wrapper[page="+currentPage+"]").children('div');
                var pageFrame= $('#scholastic-book-page-' + pageModel.get('pageId'));
                //double the size of page
                pageWrapper.css('width', width);
                pageWrapperFirstChild.css('width', width);
                page.css('width', width);
                //make it on front
				var theZindex=parseInt(pageWrapper.css('z-index'));
				//alert(theZindex);
                pageWrapper.css('z-index', (theZindex+100));
                //console.log( pageWrapper.css('z-index'));
                pageFrame.css("-webkit-transform", "scale(2)");
				pageFrame.css("transform", "scale(2)");
                //the top
                if((bFobj.zoomPart==0||bFobj.zoomPart==2))
				{
                  $('#scholastic-book-page-' + pageModel.get('pageId')).css("-webkit-transform-origin", "0px 0px");
				   $('#scholastic-book-page-' + pageModel.get('pageId')).css("transform-origin", "0px 0px");
				  }
                //the bottom
                if((bFobj.zoomPart==1||bFobj.zoomPart==3))
				{
                  $('#scholastic-book-page-' + pageModel.get('pageId')).css("-webkit-transform-origin", "0px 100%");
				  $('#scholastic-book-page-' + pageModel.get('pageId')).css("transform-origin", "0px 100%");
				  }
              
                //console.log( pageWrapper.css('z-index'));
            }
        }
	}
	
	function clearZoomDate(isTurned){
	
	    var currentPages=bFobj.currentView;
	    var currentPage=0;
	    //for double page display
		var zIndex=0;
		var zIndexLeft=0;
		var zIndexRight=0;
		for (var i = 0; i < currentPages.length; i++){
		      var pageWrapperLeft=$(".page-wrapper[page="+currentPages[0]+"]");
              var pageWrapperRight=$(".page-wrapper[page="+currentPages[1]+"]");
              if(!pageWrapperLeft)
              {			  
			      zIndex=parseInt(pageWrapperRight.css('z-index'));
			   }
			  if(!pageWrapperRight)
			      zIndex=parseInt(pageWrapperLeft.css('z-index'));
			  if(pageWrapperLeft && pageWrapperRight)
			  {
			      zIndexRight=parseInt(pageWrapperRight.css('z-index'));
			      zIndexLeft=parseInt(pageWrapperLeft.css('z-index'));
			      zIndex=zIndexRight<zIndexLeft?zIndexRight:zIndexLeft;
			  }
		}
	    if(currentPages && currentPages.length==2)
	    {
	        for (var i = 0; i < currentPages.length; i++) {
	            //change the width back
                width=$('.flipbook').turn('size').width/2;
                currentPage= currentPages[i];
                //check if cover page or last page
                if(currentPage!=0)
                {
                    var pageModel = bFobj.model.get('bookPages').models[currentPage - 1];
                    var page=$('#page-number-'+currentPage);
                    var pageWrapper=$(".page-wrapper[page="+currentPage+"]");
                    var pageWrapperFirstChild=$(".page-wrapper[page="+currentPage+"]").children('div');
                    var pageFrame= $('#scholastic-book-page-' + pageModel.get('pageId'));
                    //reset the z-index
					var theZindex=parseInt(pageWrapper.css('z-index'));
					//alert(theZindex);
                    if(isTurned==0)
                        pageWrapper.css('z-index', zIndex);
                        
                    pageWrapper.css('width', width);
                    page.css('width', width);
                    pageWrapperFirstChild.css('width',  pageWrapperFirstChild.css('height'));
                    pageFrame.css("-webkit-transform-origin", "");
                    pageFrame.css("-webkit-transform", "");
					pageFrame.css("transform-origin", "");
                    pageFrame.css("transform", "");
                }
            }
        }
    }
    
	function resetZoom(){
		
	}
	
	// Begin Public Section
	return {
		reset: function(){
			resetZoom();
		},
		zoomPage: function(){
			zoomPage();
		},
		clearZoomDate: function(){
			clearZoomDate(0);
		}
	};
};