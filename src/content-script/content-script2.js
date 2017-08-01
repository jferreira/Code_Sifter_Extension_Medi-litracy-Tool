var wordMatches = [];
var filterMatches = [];
var highlightMode = false;
var msState = true; 
var tabId;
var tabUrl;
var tabTitle;

// Get all the words of body element, remove articles and fillwords and sort them after usage frequancy
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
	labeling : "Labeling is describing someone or something in a word or short phrase. For example, describing someone who has broken the law as a criminal. Labeling theory is a theory in sociology which ascribes labeling of people to control and identification of deviant behaviour. It has been argued that labeling is necessary for communication. However, the use of the term labeling is often intended to highlight the fact that the label is a description applied from the outside, rather than something intrinsic to the labeled thing. This can be done for several reasons: labeling is often equivalent to pigeonholing or the use of stereotypes and can suffer from the same problems as these activities.",
	hedging : "Hedging is a mitigating word or sound used to lessen the impact of an utterance. Typically, they are adjectives or adverbs, but can also consist of clauses. It could be regarded as a form of euphemism.",
	political : "This glossary is designed to demystify some of the terms used in politics and explain their origins. The definitions that follow, with background drawn from Safire's New Political Dictionary, should help you understand phrases and domain specific language within politics."
}

// Get Media Sifter sidebar and append click events
$.get(chrome.extension.getURL('src/content-script/ms-sidebar.html'), function(data) {
    $(data).appendTo('body');
	
	$("#media-sifter-sidebar").hide();
	if($("#media-sifter-sidebar").is(":visible")) {
		$('body').css({'padding-right': '150px'}); // Uncomment this to avoid sidebar being overlayed the content		
	} else if($("#media-sifter-sidebar").is(":hidden")) {
		$('body').css({'padding-right': '0px'});
	}
	
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
	});
	
	$(".ms-filter").clickToggle(function() {
		$(this).toggleClass('ms-filter-selected');
		var filter = $(this).data('filter');
		highlightContentNew(filter,wordMatches,1);
	}, function() {
		$(this).toggleClass('ms-filter-selected');
		var filter = $(this).data('filter');
		highlightContentNew(filter,wordMatches,0);
	});	

	$("#media-sifter-highlight").clickToggle(function() {
		$(this).toggleClass('ms-highlight-selected ms-highlight-off');
		highlightMode = true;
		$("#media-sifter-edit-form").show();
		// Show the edit/addition contentbar
	}, function() {
		$(this).toggleClass('ms-highlight-selected ms-highlight-off');
		highlightMode = false;
		$("#media-sifter-edit-form").hide();
		// Hide the edit/addition contentbar
	});	
	
	$("#media-sifter-show-sidebar").clickToggle(function() {
		$(this).toggleClass('ms-show-siderbar-selected ms-show-siderbar-off');
		$("#media-sifter-sidebar").show();
		$('#media-sifter-floatingbar').css({'right': '100px'});
	}, function() {
		$(this).toggleClass('ms-show-siderbar-selected ms-show-siderbar-off');
		$("#media-sifter-sidebar").hide();
		$('#media-sifter-floatingbar').css({'right': '0px'});
	});		
	
	// Call save option from here
    $('input.ms-all-filters-toggle:checkbox').change(function() {
		var optionId = $(this).attr("name");		
		//var activeFilters = [];
		
        if($(this).is(":checked")) {
			console.log("all on");
			$('.ms-filter').each(function(i, obj) {
				if(!$(this).hasClass("ms-filter-selected")) {
					//activeFilters.push($(this).data('filter'));
					$(this).addClass('ms-filter-selected');
				}
				highlightContentNew($(this).data('filter'),wordMatches,1);
			});			
        } else {
			console.log("all off");
			$('.ms-filter').each(function(i, obj) {
				if($(this).hasClass("ms-filter-selected")) {
					//activeFilters.push($(this).data('filter'));
					$(this).removeClass('ms-filter-selected');
				}
				highlightContentNew($(this).data('filter'),wordMatches,0);
			});				
		}
		
		
		
    });		
	
	// Call to background.js to get the overall count for this specific tab, and then append it appropriatly
	/*
	chrome.runtime.sendMessage({getCount: true}, function(response) {
		console.log("Count for this tab: ", response);
	});
	*/
	
	//var count = String("count" + tabId);
	/*
	console.log(tabId);
	tabId = String(tabId);
	chrome.storage.sync.get(tabId, function(res) {
		console.log(res);
	});	
	*/
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
			// Will not fire anymore, because of browser action option page specified in manifest.json
			if(msState) {
				msState = false;
				$('body').css({'padding-right': '0px'});
			} else {
				msState = true;
				$('body').css({'padding-right': '100px'});
			}
			$("#media-sifter-sidebar").toggle();
			
			/* // Figure out logic to hide the edit-form if it's visible 
			if($("#media-sifter-contentbar").is(":visible")) {
				$("#media-sifter-contentbar").animate({width:'toggle'},550);
				$('#media-sifter-highlight').toggleClass('ms-highlight-selected ms-highlight-off');
				highlightMode = false;
			}*/			
			
			//$('body').css({'padding-right': '100px'}); // Uncomment this to avoid sidebar being overlayed the content
		} else if(request.tabId) {
			//console.log(request.tabId, request.tabUrl, request.tabTitle);
			tabId = request.tabId; // This one is the important one
			tabUrl = request.tabUrl;			
		} else if(request.db) {
			console.log(request.db);
			// Recieved the initial database of existing terms. Load it in wordMatches for later usage.
			// This could potentially become a large time sink, depending on the size of the term database and the words in an article. 
			for(var j = 0; j<request.db.length; j++) {
				for (var i=0; i<words.length; i++) {
					// Match on words - add term information to array 
					if(words[i].text == request.db[j].term) {
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
					}
				}				
			}
			
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
			chrome.runtime.sendMessage({n: wordMatches.length, matches: wordMatches}, function(response) {});
			
			// Set overall number in overall count
			// $("#media-sifter-overall-count span").text(wordMatches.length);
				
		} else if(request.dom) {
			console.log(request);
		} else if(request.info) {
			console.log(request);
		}
	}
);

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		/*
		console.log('Storage key "%s" in namespace "%s" changed. ' +
					'Old value was "%s", new value is "%s".',
					key,
					namespace,
					storageChange.oldValue,
					storageChange.newValue);
		*/
		
		var s = String(tabId);
		if(key == s) {
			//console.log(storageChange.oldValue, storageChange.newValue);
			// Set the value of the insite overall counter here
			$("#media-sifter-overall-count span").text(storageChange.newValue.length);
			
			$('.ms-filter').each(function(i, obj) {
				var search = $(this).data('filter');
				var count = storageChange.newValue.reduce(function(n, val) {
					return n + (val.filter === search);
				}, 0);
				console.log(search, ": ", count);
				$(this).children('.ms-filter-count').text(count);
				// Need to find the span of the specific div
			});			
			
		}
	}
});

// Inject information about the clicked term in contentbar
$('body').on('click', '.ms-link', function(event){
	event.preventDefault(); // Avoid any existing link being run
	var filter = $(this).data('filter'),
		term = $(this).data('term'),
		termDescription = $(this).data('description'),
		termExample = $(this).data('example'),
		termExampleUrl = $(this).data('exampleurl'),
		source = $(this).data('source'),
		sourceUrl = $(this).data('sourceurl'),
		frequency = $(this).data('frequency');	

	if($("#media-sifter-contentbar").is(":hidden")) {
		$("#media-sifter-contentbar").animate({width:'toggle'},550);
	} else if($("#media-sifter-contentbar").is(":visible")) {}
	
	// Add the term, description and filter category to the sidebar description menu
	$("#media-sifter-contentbar #ms-description-content").empty();
	$("#media-sifter-contentbar #ms-description-content").append("<div class='filter-title'>"+filter+"</div><div class='filter-description'>"+filterDescription[filter]+"</div>");
	$("#media-sifter-contentbar #ms-description-content").append("<div class='term-title'>"+term+" (used "+frequency+" times)</div><div class='term-description'>"+termDescription+"</div>");
	$("#media-sifter-contentbar #ms-description-content").append("<div class='term-example'><b>Examples of usage:</b><br />"+termExample+"<br /><a href='"+termExampleUrl+"'>Link to example</a></div>");
	$("#media-sifter-contentbar #ms-description-content").append("<div class='term-source'><b>Source:</b><br />"+source+"<br /><a href='"+sourceUrl+"'>Source</a></div>");
});

$("body").on('click', '#media-sifter-highlight', function(event) {
	//$("body p, body span, body h1, body h2, body h3, body h4, body h5").toggleClass("ms-select-text");
	
	if($("#media-sifter-contentbar").is(":hidden")) {
		$("#media-sifter-contentbar").animate({width:'toggle'},550);
		$('body').css({'padding-right': '450px'}); // Uncomment this to avoid sidebar being overlayed the content
	} else if($("#media-sifter-contentbar").is(":visible")) {
		$("#media-sifter-contentbar").animate({width:'toggle'},550);
		$('body').css({'padding-right': '100px'}); // Uncomment this to avoid sidebar being overlayed the content
	}
});

function highlightContentNew(filter,data,state) {
	// Loop through the database and do lookup on the specified filter

	for(var i = 0; i < data.length; i++) {
		if(data[i].filter === filter && state == 1) {
			// Turn on highlights within these elements and add data to the injected link
			$("body p, body span, body h1, body h2, body h3, body h4, body h5").highlight(data[i].term, { wordsOnly: true, element: 'span', className: 'ms-highlight-link-'+filter+i });
			$("body .ms-highlight-link-"+filter+i).
				wrapInner("<a class='ms-link' \
					data-filter='"+filter+"' \
					data-term='"+data[i].term+"' \
					data-description='"+data[i].description+"' \
					data-example='"+data[i].example+"' \
					data-exampleurl='"+data[i].exampleUrl+"' \
					data-source='"+data[i].source+"' \
					data-sourceurl='"+data[i].sourceUrl+"' \
					data-frequency='"+data[i].frequency+"' \
					href='#'></a>"
				);		
		} else if(data[i].filter === filter && state == 0) {
			// Turn off highlights
			$("body span.ms-highlight-link-"+filter+i+" a").contents().unwrap();			
			$("body").unhighlight({element: 'span', className: 'ms-highlight-link-'+filter+i });	
		}
	}	
}

function getSelectedText() {
    var selectedText = "", containerText = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0);
            selectedText = range.toString();
            var container = range.commonAncestorContainer;
            if (container.nodeType == 3) {
                container = container.parentNode;
            }
            containerText = container.textContent;
        }
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        selectedText = textRange.text;
        containerText = textRange.parentElement().innerText;
    }
    return {
        selectedText: selectedText,
        containerText: containerText
    };
}



/*
	1- Press highlight icon in menu
	2- Show contentbar with edit/add term input
	3- Select word in text
	4- Send word+paragraph to edit contentbar
	5- Edit paragraph, add description/definition of the term
	6- Get tab URL
	7- Save the term. 
		- Send to background.js
		- Communicate with DB Couch from bg.js
		- Update keywords DB local when getting callback from couch (db)
		- Send new db to content-script.js and populate the term array
*/

// When word is highlighted in text, get the text. 
// Trim? 
// Get the paragraph, or surrounded text of the selection 
$(document).mouseup(function() {
	/*
	var selectedText = document.getSelection().getRangeAt(0).toString();
	if(selectedText !== '' && selectedText.length) {
		console.log(selectedText); // Print it to console. To see, left click page and select 'inspect'. Then select console tab. Log to console to be able to debug your code. 
		chrome.runtime.sendMessage({selection: selectedText}, function(response) {});		
	}
	
    var parentEl = null, sel;
    if (document.getSelection) {
        sel = document.getSelection();
        if (sel.rangeCount) {
            parentEl = sel.getRangeAt(0).commonAncestorContainer;
            if (parentEl.nodeType != 1) {
                parentEl = parentEl.parentNode;
            }
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        parentEl = sel.createRange().parentElement();
    }
	
    console.log(parentEl);	
	*/
	if(highlightMode) {
		var selectedText = "", containerText = "";
		if (typeof document.getSelection != "undefined") {
			var sel = document.getSelection();
			if (sel.rangeCount) {
				var range = sel.getRangeAt(0);
				selectedText = range.toString();
				var container = range.commonAncestorContainer;
				if (container.nodeType == 3) {
					container = container.parentNode;
				}
				containerText = container.textContent;
			}
		} else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
			var textRange = document.selection.createRange();
			selectedText = textRange.text;
			containerText = textRange.parentElement().innerText;
		}
		
		
		// If not empty, insert term and containing element text 
		if(selectedText !== '' && selectedText.length) {
			console.log(selectedText,containerText);
			
			// enable the various input fields in the edit/add contentbar $().attr("disabled", false) 
			// Populate input fields
			
			$('#media-sifter-edit-form *').filter(':input').each(function(){
				if($(this).attr('name') == 'ms-term') {
					$(this).val(selectedText);
				} else if($(this).attr('name') == 'ms-paragraph') {
					$(this).val(containerText);
				}
				$(this).attr("disabled", false);
			});			
			
		}
	}
});

$("body").on('click', '#ms-add-term-button', function(event) {
	// Pass the added information over to background.js for handling with CouchDB
	var term = $("input[name=ms-term]").val(),
		paragraph = $("textarea[name=ms-paragraph]").val(),
		note = $("textarea[name=ms-note]").val();
	
	var doc = {
		term: term,
		paragraph: paragraph,
		note: note
	};
	
	console.log(term, paragraph, note);
	chrome.runtime.sendMessage({newTerm: doc}, function(response) {
		console.log(response);
	});		
});