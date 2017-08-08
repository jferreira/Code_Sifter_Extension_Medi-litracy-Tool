/*

function click(e) {
  chrome.tabs.executeScript(null,
      {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
  //window.close();
  chrome.runtime.sendMessage({clicked : true});
  //chrome.runtime.sendMessage({n: wordMatches.length}, function(response) {});		
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});
*/

/*
TODO: 
- Check if the user selected remember me on sign in
- Remove signup/login if the user is signed in.  (boolean variable check)
- 
*/

// Add/change a specific value
function saveOptions(optionField, optionValue) {
	if (!optionValue) {
		console.log('Error: No value specified');
		return;
	}
	
	var save = {};
	save[optionField] = optionValue;	
	console.log(save);
	
	// Save it using the Chrome extension storage API.
	chrome.storage.sync.set(save, function() {
		// Notify that we saved.
		console.log('Settings saved', save);
	});
}

function validateLogin() {
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	if (username == null || username == "") {
		console.log("Please enter a username.");
		return false;
	}
	if (password == null || password == "") {
		console.log("Please enter a password.");
		return false;
	}
	//loginDB(username,password);
	var accountInformation = {
		username: username,
		password: password		
	}
	/*
	chrome.runtime.sendMessage({login : accountInformation}, function(response) {
		console.log(response);
	});		
	*/
	return false;
}	

function validateAccount() {
	var u = document.getElementById("ausername").value,
		p = document.getElementById("apassword").value,
		n = document.getElementById("aname").value, 
		pp = document.getElementById("aprofession").value,
		b = document.getElementById("abirth").value,
		g = document.getElementById("agender").value,  
		e = document.getElementById("aemail").value;
		
	if (username == null || username == "") {
		console.log("Please enter a username.");
		return false;
	}
	if (password == null || password == "") {
		console.log("Please enter a password.");
		return false;
	}
	//loginDB(username,password);
	var accountInformation = {
		username: u,
		password: p,
		name: n, 
		profession: pp,
		birth: b,
		gender: g,
		email: e
	}
	chrome.runtime.sendMessage({createAccount : accountInformation}, function(response) {
		console.log(response);
	});			
	return false;
}	
/*
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.login) {
        console.log(message.login);
    }
});
*/

chrome.storage.sync.get('login', function(res) {
	console.log(res);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
					'Old value was "%s", new value is "%s".',
					key,
					namespace,
					storageChange.oldValue,
					storageChange.newValue);
		if(key == 'login' && storageChange.newValue == true) {
			console.log("Logged in, change screen.");
			$("#loginform").hide();
			$("#loggedin").show();
		} else if(key == 'accountCreated' && storageChange.newValue == true) {
			console.log("Account created, change screen.");
			$("#accountCreateForm").hide();
			$("#accountCreated").show();			
		}
	}
});

$(function(){
	$("a#aSignUp").click(function (event) {
		//event.preventDefault();
		$("#intro").hide();
		$("#signup").show();
	});
	
	$("a#aLogin").click(function (event) {
		//event.preventDefault();
		$("#intro").hide();
		$("#login").show();
	});	
	
	$("a#back1").click(function (event) {
		//event.preventDefault();
		$("#intro").show();
		$("#signup").hide();
	});	
	
	$("a#back2").click(function (event) {
		//event.preventDefault();
		$("#intro").show();
		$("#login").hide();
	});		
	
	$("#submitLogin").click(function (event) {
		validateLogin();
		// If successful, show login successfull (callback from validate?)
	});
	
	$("#submitAccount").click(function (event) {
		validateAccount();
	});	
	
	$("#checkStatus").click(function (event) {
		chrome.runtime.sendMessage({accountStatus : true}, function(response) {
			console.log(response);
		});			
	});

	// Call save option from here
    $('input:checkbox').change(function() {
		var optionId = $(this).attr("name");		
        if($(this).is(":checked")) {
			saveOptions(optionId,2);
        } else {
			saveOptions(optionId,1);
		}
    });	
	
});