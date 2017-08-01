var wordMatches = [];
var filterMatches = [];

var words = (function(){

	var sWords = document.body.innerText.toLowerCase().trim().replace(/[,;.]/g,'').split(/[\s\/]+/g).sort();
	var iWordsCount = sWords.length; // count w/ duplicates

	// array of words to ignore
	var ignore = ['and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if'];
	ignore = (function(){
		var o = {}; // object prop checking > in array checking
		var iCount = ignore.length;
		for (var i=0;i<iCount;i++){
			o[ignore[i]] = true;
		}
		return o;
	}());

	var counts = {}; // object for math
	for (var i=0; i<iWordsCount; i++) {
		var sWord = sWords[i];
		if (!ignore[sWord]) {
			counts[sWord] = counts[sWord] || 0;
			counts[sWord]++;
		}
	}

	var arr = []; // an array of objects to return
	for (sWord in counts) {
		arr.push({
			text: sWord,
			frequency: counts[sWord]
		});
	}

	// sort array by descending frequency | http://stackoverflow.com/a/8837505
	return arr.sort(function(a,b){
		return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
	});

}());
/*
(function(){
	var iWordsCount = words.length; // count w/o duplicates
	for (var i=0; i<iWordsCount; i++) {
		var word = words[i];
		//console.log(word.frequency, word.text);
	}
}());
*/

// Should move this out at some point, and load it from cloud
var filterDescription = {
	time : "Time, to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you’re talking about people who support an opposing argument to the one you’re presenting in an essay. You can use some of these words to imply that what this person says isn’t necessarily true or correct: Suggestive language is a very clever techinique to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you're talking about people who support an opposing argument to the one you're presenting in an essay.", 	
	place : "Place, to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you’re talking about people who support an opposing argument to the one you’re presenting in an essay. You can use some of these words to imply that what this person says isn’t necessarily true or correct: Suggestive language is a very clever techinique to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you're talking about people who support an opposing argument to the one you're presenting in an essay.", 	
	event : "event, to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you’re talking about people who support an opposing argument to the one you’re presenting in an essay. You can use some of these words to imply that what this person says isn’t necessarily true or correct: Suggestive language is a very clever techinique to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you're talking about people who support an opposing argument to the one you're presenting in an essay.", 	
	date : "Date, to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you’re talking about people who support an opposing argument to the one you’re presenting in an essay. You can use some of these words to imply that what this person says isn’t necessarily true or correct: Suggestive language is a very clever techinique to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you're talking about people who support an opposing argument to the one you're presenting in an essay.", 	
	labeling : "Labeling langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	suggestive: "Suggestive language is a linguistic technique to subtly communicate to the reader what your opinion is on a topic without actually coming out and saying it. For instance, say you're talking about people who support an opposing argument to the one you're presenting in an essay. It can be used some of these words to imply that what this person says isn’t necessarily true or correct.",
	hedging : "Hedging langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	inflammatory : "Inflammatory langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	charged : "Charged langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	attcking : "Attcking langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	protective : "Favarable langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	feargenerating : "Fear Mongering langauage is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	opinion : "Unsubstantiated statements is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	echoing : "Echo chamber is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people.",
	political : "Poltical glossary is describing someone or something in a word or short phrase. For example, describing someone who has broken a law as a criminal. labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behavior. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labelled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities. The labeling of people can be related to a reference group. For example, the labels black and white are related to black people and white people; the labels young and old are related to young people and old people."
}

// Get Media Sifter sidebar and append click events
$.get(chrome.extension.getURL('src/content-script/ms-sidebar.html'), function(data) {
    $(data).appendTo('body');

	//$('body').css({'padding-right': '100px'}); // Uncomment this to avoid sidebar being overlayed the content
	
	$("a.ms-hide-contentbar").click(function (event) {
		event.preventDefault();
		$("#media-sifter-contentbar").animate({width:'toggle'},550);
	});
	
	$("#ms-filter-all").click(function() {
		var activeFilters = [];
		$('.ms-filter').each(function(i, obj) {
			if($(this).hasClass("ms-filter-selected")) {
				activeFilters.push($(this).data('filter'));
				$(this).toggleClass('ms-filter-selected');
			}
		});
		
		/*
		getDatabase(function(database){
			for(var i = 0; i < activeFilters.length; i++) {
				highlightContent(activeFilters[i], database[activeFilters[i]],0);
			}
		});		
		*/		
	});
	
	$(".ms-filter").clickToggle(function() {
		$(this).toggleClass('ms-filter-selected');
		var filter = $(this).data('filter');
		
		/*
		getDatabase(function(database){
			highlightContent(filter, database[filter],1);
		});	
		*/
	}, function() {
		$(this).toggleClass('ms-filter-selected');
		var filter = $(this).data('filter');

		/*
		getDatabase(function(database){
			highlightContent(filter, database[filter],0);
		});	
		*/
	});	
	
});


jQuery.fn.clickToggle = function(a,b) {
	var ab=[b,a];
	function cb(){ ab[this._tog^=1].call(this); }
	return this.on("click", cb);
};

// Listen for information sent from background.js [in this case - browser action button click]
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.show) {
			$("#media-sifter-sidebar").toggle();
			//$('body').css({'padding-right': '100px'}); // Uncomment this to avoid sidebar being overlayed the content
		} else if(request.db) {
			console.log(request.db);
			//highlightContent("labeling",request.db,1);
			
			// This could potentially become a large time sink, depending on the size of the term database and the words in an article. 
			//var number = 0; 
			for(var j = 0; j<request.db.length; j++) {
				for (var i=0; i<words.length; i++) {
					//var word = words[i];
					//console.log(word.frequency, word.text);
					
					// Match on words - add term information to array 
					if(words[i].text == request.db[j].term) {
						//console.log("match: " + words[i].text);
						//number = number + 1;
						
						wordMatches.push({
							id: request.db[j]._id,
							filter: request.db[j].filter,
							term: words[i].text,
							description: request.db[j].description,
							example: request.db[j].example,
							exampleUrl: request.db[j].exampleUrl,
							source: request.db[j].source,
							sourceUrl: request.db[j].sourceUrl,
							frequency: words[i].frequency
						});
						
						// Need an array with references to type of term and the term
						// Use this later for call the highlight, would be faster because we allready know the words exist there 
					}
				}				
			}
			//console.log(wordMatches.length);
			// Call function to add numbers to the filters
			//updateFilterCount(wordMatches);
			
			// Not always firing - unsure why. Because it might fire before the HTML is injected in the tab. 
			// Need to have a callback function of some sort. Either on loaded html, or this.
			$('.ms-filter').each(function(i, obj) {
				var search = $(this).data('filter');
				var count = wordMatches.reduce(function(n, val) {
					return n + (val.filter === search);
				}, 0);
				//console.log(search, ": ", count);
				// $(this + " span.ms-filter-count").text(count);
				// Need to find the span of the specific div
			});
			
			// Send overall number to background.js - to show it on badge of icon 
			chrome.runtime.sendMessage({n: wordMatches.length}, function(response) {});		
				
		} else if(request.dom) {
			console.log(request);
		} else if(request.info) {
			console.log(request);
		}
	}
);
/*
function getDatabase(callback){
	$.getJSON(chrome.extension.getURL('src/db/db.json'), function( data ) {
		callback(data);
	});
}
*/

$('body').on('click', '.ms-link', function(event){
	event.preventDefault();
	var filter = $(this).data('filter');
	var term = $(this).data('term');
	var termDescription = $(this).data('description');
	var termExample = $(this).data('example');

	if($("#media-sifter-contentbar").is(":hidden")) {
		$("#media-sifter-contentbar").animate({width:'toggle'},550);
	} else if($("#media-sifter-contentbar").is(":visible")) {
		// No need, yet
	}
	
	// Add the term, description and filter category to the sidebar description menu
	$("#media-sifter-contentbar #ms-description-content").empty();
	$("#media-sifter-contentbar #ms-description-content").append("<div class='filter-title'>"+filter+"</div><div class='filter-description'>"+filterDescription[filter]+"</div>");
	$("#media-sifter-contentbar #ms-description-content").append("<div class='term-title'>"+term+"</div><div class='term-description'>"+termDescription+"</div>");
	$("#media-sifter-contentbar #ms-description-content").append("<div class='term-example'>"+termexample+"</div>");
	
});


// Highlighter function
function highlightContent(filter,data,state) {
	var hlClass = "ms-highlight-"+filter;
	var keywords = [];
	var description = [];
	var example = [];

	$.each(data, function() {
	  $.each(this, function(key, val){
		  //console.log(key,val);
		  if(key === 'term') {
			  keywords.push(val);
		  }
		  if(key === 'description') {
			  description.push(val);
		  }	
		  if(key === 'example') {
			  example.push(val);
		  }	
	  });
	});
	
	if(state == 1) {
		// Add highlight
		// Add links for each keyword, to be able to send a reference for looking up further information 
		for(var i = 0; i < keywords.length; i++) {
			$("body p, body span, body h1, body h2, body h3, body h4, body h5").highlight(keywords[i], { wordsOnly: true, element: 'span', className: 'ms-highlight-link-'+filter+i });
			$("body .ms-highlight-link-"+filter+i).wrapInner( "<a class='ms-link' data-filter='"+filter+"' data-term='"+keywords[i]+"' data-description='"+description[i]+"' data-example='"+example[i]+"' href='#'></a>" ); // add data-
		}
	} else {
		// Remove highlight	and injected link
		for(var i = 0; i < keywords.length; i++) {
			$("body span.ms-highlight-link-"+filter+i+" a").contents().unwrap();			
			$("body").unhighlight({element: 'span', className: 'ms-highlight-link-'+filter+i });
		}
	}	
}

// When word is highlighted in text, get the text. 
$(document).mouseup(function() {
	var selectedText = document.getSelection().getRangeAt(0).toString();
	if(selectedText !== '') {
		console.log(selectedText); // Print it to console. To see, left click page and select 'inspect'. Then select console tab. Log to console to be able to debug your code. 
	}
});