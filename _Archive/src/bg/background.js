// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//

//var test = ["bra", "braa"];
//var terms = [];

var store;

var Store = function() {
	this.db = new PouchDB('mediasifter3');
	this.externalDb = new PouchDB('http://37.48.122.183:5984/mediasifter3', {skipSetup: true}); // removed username + password for admin: havard:OlaOla123@
	// the skipSetup is to prevent PouchDB from doing any HTTP requests to the server while we're not logged in, which would cause a modal authentication popup.
	// Might remove it?
	
	this.terms = []; // Arry for holding terms from filter DB
	this.sync();
	this.reactToChanges();
	this.getDBsession();
	
	// Populate the terms array on creation 
	this.db.allDocs({include_docs: true, limit: 500}).then(function (res) {
		store.terms = res.rows.map(function (row) { return row.doc; });
	});
};

Store.prototype = {
	binarySearch: function(arr, docId) {
		var low = 0, high = arr.length, mid;
		while (low < high) {
			mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
			arr[mid]._id < docId ? low = mid + 1 : high = mid
		}
		return low;
	},	
	onDeleted: function(id) {
		var index = this.binarySearch(this.terms, id);
		var doc = this.terms[index];
		if (doc && doc._id === id) {
			this.terms.splice(index, 1);
		}		
	},
	onUpdatedOrInserted: function(newDoc) {
		var index = this.binarySearch(this.terms, newDoc._id);
		var doc = this.terms[index];
		if (doc && doc._id === newDoc._id) { // update
			this.terms[index] = newDoc;
		} else { // insert
			this.terms.splice(index, 0, newDoc);
		}
	},
	fetchInitialDocs: function() {
		return this.db.allDocs({include_docs: true, limit: 500}).then(function (res) {
			this.terms = res.rows.map(function (row) { return row.doc; });
			//console.log(this.terms.length);
		});
	},	
	reactToChanges: function() {
		var self = this;
		this.communicate("Launched react!");
		
		this.db.changes({live: true, since: 'now', include_docs: true, limit: 500}).on('change', function (change) {
		if (change.deleted) {
			// change.id holds the deleted id
			self.onDeleted(change.id);
		} else { // updated/inserted
			// change.doc holds the new doc
			self.onUpdatedOrInserted(change.doc);
		}
		}).on('error', console.log.bind(console));
	},
    getAllSitemaps: function () { // Not in use
        this.db.allDocs({include_docs: true}, function(err, response) {
            for (var i in response.rows) {
                var sitemap = response.rows[i].doc;
                this.terms.push(sitemap);
            }
            //return sitemaps;
        });
    },
	sync: function() {
		this.db.sync(this.externalDb, {live: true, retry: true}).on('error', this.syncError);		
	},
	syncError: function() {
		console.log("error syncing");
	},
	communicate: function(string) {
		chrome.tabs.query({active: true, windowType:"normal", currentWindow: true}, function(tabs){
			// This breaks sometimes. Cannot read id of undefined (tabs[0]) - unsure why
			// console.log(tabs);
			// http://stackoverflow.com/questions/28786723/why-doesnt-chrome-tabs-query-return-the-tabs-url-when-called-using-requirejs
			chrome.tabs.sendMessage(tabs[0].id, {info: string}, function(response) {});  
		});		
	},
	createHash: function (s){
	  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
	}, 
	insertTerm: function(term,paragraph,description,filter,title,url) {
		var self = this;
		var userPrefix = '',
			user;
		
		this.externalDb.getSession(function (err, response) {
		  if (err) {
			console.log("Error trying to getSession: insertTerm()"+err);
		  } else if (!response.userCtx.name) {
			console.log("No one is logged in. Log in to do changes to a database.");
		  } else {
			user = response.userCtx.name.toLowerCase();
			userPrefix = self.createHash(user);
			//var eId = new Date().toISOString();
			
			// Need to figure out how we can add multiple examples to the same doc
			// right now example will be overwritten 
			
			var doc = {
				_id: userPrefix + '_' + term,
				term: term,
				example: paragraph,
				exampleTitle: title,
				exampleUrl: url, 
				description: description,
				filter: filter,
				source: user
			}
			self.db.put(doc).then(function (response) {console.log("Success local DB", response)
			  }).then(function (err) {
				  if(err){
					console.log("Error local DB", err);
					}
			  });
		  }
		});			
	},
	createDBuser: function(user, pass, metadata) {
		this.externalDb.signup(user, pass, function (err, response) {
			console.log(response);
			if(response.ok) {
				saveOptions("accountCreated", true);
			} else {
				saveOptions("accountCreated", false);
			}			
		  if (err) {
			if (err.name === 'conflict') {
			  // "batman" already exists, choose another username
			} else if (err.name === 'forbidden') {
			  // invalid username
			} else {
			  // HTTP error, cosmic rays, etc.
			}
		  }
		});
	},
	loginDB: function(user, pass, callback) {
		this.externalDb.login(user, pass, function (err, response) {
		  if (err) {
			  return callback(err);
			if (err.name === 'unauthorized') {
			  // name or password incorrect
			  console.log("name or password incorrect");
			} else {
			  // cosmic rays, a meteor, etc.
			}
		  }
		  callback(null, response);
		});
	},
	loginDB2: function(user, pass) {
		this.externalDb.login(user, pass, function (err, response) {
			console.log(response);
			if(response.ok) {
				saveOptions("login", true);
			} else {
				saveOptions("login", false);
			}
			
		  if (err) {
			if (err.name === 'unauthorized') {
			  // name or password incorrect
			} else {
			  // cosmic rays, a meteor, etc.
			}
		  }
		});
	},	
	// Needs to be logged in as the user to change the password
	changeDBpassword: function(user,newpass) {
		this.externalDb.changePassword(user, newpass, function(err, response) {
		  if (err) {
			if (err.name === 'not_found') {
			  // typo, or you don't have the privileges to see this user
			} else {
			  // some other error
			}
		  } else {
			  console.log(response);
		  }
		});		
	},
	getDBsession: function() {
		this.externalDb.getSession(function (err, response) {
		  if (err) {
			// network error
		  } else if (!response.userCtx.name) {
			// nobody's logged in
			console.log("No one is logged in.", err, response);
			saveOptions("login", false);	
		  } else {
			  console.log(response, response.userCtx.name);
			// response.userCtx.name is the current user
		  }
		});	
	},
	logoutDB: function() {
		this.externalDb.logout(function (err, response) {
		  if (err) {
			// network error
		  } else {
			  console.log(response);
		  }
		})		
	}	
};

// Add/change a specific value
function saveOptions(optionField, optionValue) {
	var save = {};
	save[optionField] = optionValue;	
	console.log(save);
	
	// Save it using the Chrome extension storage API.
	chrome.storage.sync.set(save, function() {
		// Notify that we saved.
		console.log('Settings saved', save);
	});
}

// Event listener for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
					'Old value was "%s", new value is "%s".',
					key,
					namespace,
					storageChange.oldValue,
					storageChange.newValue);
	}
});

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		//console.log("chrome.runtime.onMessage", request);
		
		store = new Store();
		if (request.n || request.n == 0) {
			var s;
			//console.log(request.n);
			s = String(request.n);
			if(request.n == 0) s = "0";
			//sendResponse({farewell: request.n});
			
			
			/*
			var s = String(tabId);
			chrome.storage.sync.get(s, function(res) {
				console.log(res.s);
				chrome.browserAction.setBadgeText({text:res.s});
			});	
			*/
			chrome.browserAction.setBadgeText({text:s});
			
			// Save this count for the specific tab?
			var tabId = String(sender.tab.id);
			saveOptions(tabId, request.matches);
			
		} else if(request.selection) {
			console.log(request.selection);
			var t = request.selection;
			sendResponse("Recived selection");
		} else if(request.newTerm) {
			//console.log(sender.tab.id, sender.tab.url, sender.tab.title, store); 
			// Insert new term in couchDB
			// request.newTerm	
			store.insertTerm(request.newTerm.term, request.newTerm.paragraph, request.newTerm.note, request.newTerm.filter, sender.tab.title, sender.tab.url);
			//sendResponse("Term inserted successfully");
		} else if(request.createAccount) {
			console.log("Account creation");
			store.createDBuser(request.createAccount.username, request.createAccount.password, request.createAccount);
			sendResponse("Recived account creation info");
		} else if(request.login) {
			/*
			var s = store.loginDB(request.login.username, request.login.password).then(function(response) {
				console.log("Success", response);
				//return store.loginDB(request.login.username, request.login.password);
				return true;
			}).catch(function(error) {
				console.log('oh no', error);
				return false;
			});
			*/
			
			/*
			store.loginDB(request.login.username, request.login.password, function(callback) {
				console.log(callback);
				sendResponse(callback);
				return false;
				//return "ran";
			});
			console.log(t);
			*/
			
			store.loginDB2(request.login.username, request.login.password);
			console.log('Loging in');
		} else if(request.accountStatus) {
			store.getDBsession();
			sendResponse("Recived account status check");
		}
	}
);

chrome.browserAction.onClicked.addListener(function(tab) {
	// Communicate with content-script.js to toggle the Media Sifter menu
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", id: tabs[0].id, show : tabs[0].id});
	});	
});

// Get the current tab, whenever a tab is clicked or created
// Use this to be able to update the number of terms hits when navigation between tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
	//console.log(activeInfo);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log(tabs[0].id, tabs[0].title, tabs[0].url); // Gets the currently selected tab, will fire each time tab is changed. 
		chrome.tabs.sendMessage(tabs[0].id, {tabId: tabs[0].id, tabUrl: tabs[0].url, tabTitle: tabs[0].title}, function(response) {});
	});
});

// Fetch CouchDB here, and pass on to content script? 
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		store = new Store();
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			// This breaks sometimes. Cannot read id of undefined (tabs[0]) - unsure why
			// console.log(tabs);
			// http://stackoverflow.com/questions/28786723/why-doesnt-chrome-tabs-query-return-the-tabs-url-when-called-using-requirejs
			chrome.tabs.sendMessage(tabs[0].id, {db: store.terms}, function(response) {});
		});
	}
	
	// Fires when a new tab is created, or when a new url is loaded
	chrome.tabs.getSelected(null, function(tab) {
		console.log(tab.id, tab.url);
		chrome.tabs.sendMessage(tab.id, {tabId: tab.id, tabUrl: tab.url}, function(response) {});
	});	
	
});

// Fetch the external database and copy it to a local pouch DB
chrome.runtime.onStartup.addListener(function() {
	//var db = new PouchDB('test2');
	//var externalDb = new PouchDB('http://37.48.122.183:5984/test2', {skipSetup: true}); 
	
	store = new Store();
	
	store.db.info().then(function (info) {
		console.log(JSON.stringify(info));
	});	
	
	//store.fetchInitialDocs().then(store.reactToChanges()).catch(console.log.bind(console));
	//store.sync();
	chrome.browserAction.setBadgeBackgroundColor({color:"#333"});
	chrome.browserAction.setBadgeText({text:"0"});

});

/*
chrome.windows.onCreated.addListener(function() {
    chrome.windows.getAll(function(windows) {
        if (windows.length == 1) {
            // Do stuff here
			store = new Store();
			store.fetchInitialDocs().then(store.reactToChanges).catch(console.log.bind(console));
			
			chrome.browserAction.setBadgeText({text:"start"});			
        }
    });
});

// Get all windows
chrome.windows.getAll(function(windows) {
    console.log(windows.length);
});
*/

/*
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
         chrome.tabs.sendMessage(tabs[0].id, {dom: "dom finished"}, function(response) {});  
      });
	});
*/