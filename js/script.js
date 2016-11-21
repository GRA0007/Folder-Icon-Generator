/**

 _____     _     _             ___                   ____                           _             
|  ___|__ | | __| | ___ _ __  |_ _|___ ___  _ __    / ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __ 
| |_ / _ \| |/ _` |/ _ \ '__|  | |/ __/ _ \| '_ \  | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
|  _| (_) | | (_| |  __/ |     | | (_| (_) | | | | | |_| |  __/ | | |  __/ | | (_| | || (_) | |   
|_|  \___/|_|\__,_|\___|_|    |___\___\___/|_| |_|  \____|\___|_| |_|\___|_|  \__,_|\__\___/|_| 

                                     Author: Benjamin Grant

Purpose: to easily generate icons that can be used to make folders that contain anime look just that little bit nicer.

**/
console.log('%cVisit %chttps://github.com/GRA0007/Folder-Icon-Generator%c if you want to help contribute! %c(and clean up my messy code)',"font-size:20px;font-family:sans-serif;","color:#FF9800;font-size:20px;font-weight:bold;text-decoration:underline;","font-size:20px;font-family:sans-serif;","color:#AAA;font-size:20px;font-family:sans-serif;");

var array = [];
var requesting = false;
var shareSheetOpen = false;
//Awesome function to replace all instances of a character
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
//Get the true length of an array
function getLength(arr) {
    return Object.keys(arr).length;
}

//Load the image from the MAL cdn
function loadImg(src, index, current, callback) {
	var img = document.createElement('img');
	img.crossOrigin = "Anonymous";
	img.onload = function() {
		callback(index, img, current);
	};
	img.src = src;
}
//Send the data to the php
function request() {
	//Get all the settings
	var setting_coverImage = $('#coverImage').prop('checked');
	var setting_coverHeight = $('#coverHeight').val();
	var setting_coverRotation = $('#coverRotation').val();
	var setting_coverX = $('#coverX').val();
	var setting_coverY = $('#coverY').val();
	var setting_sizes = [];
	if ($('#16px').prop('checked') == true)
		setting_sizes.push([16, 16]);
	if ($('#32px').prop('checked') == true)
		setting_sizes.push([32, 32]);
	if ($('#48px').prop('checked') == true)
		setting_sizes.push([48, 48]);
	if ($('#64px').prop('checked') == true)
		setting_sizes.push([64, 64]);
	if ($('#128px').prop('checked') == true)
		setting_sizes.push([128, 128]);
	if ($('#256px').prop('checked') == true)
		setting_sizes.push([256, 256]);
	
	setting_sizes = btoa(JSON.stringify(setting_sizes));
	
	//TODO: Error checking
	if (setting_sizes.length = 0)
		alert("No sizes checked");

	//console.log(array);
	//console.log(JSON.stringify(array));
	$.ajax({
		url: './php/batch.php',
		data: {images: btoa(JSON.stringify(array)), coverEnabled: setting_coverImage, coverHeight: setting_coverHeight, rotation: setting_coverRotation, coverX: setting_coverX, coverY: setting_coverY, sizes: setting_sizes},
		dataType: 'text',
		method: 'POST',
		error: function(xhr, status, error) {
			console.log('ERROR!!!    xhr:' + xhr + ',    status:' + status + ',    error:' + error);
			error('Javascript error. xhr:' + xhr + ', status:' + status + ', error:' + error);
		},
		success: function(data, status, xhr) {
			var regexFile = /\|([^|]+)\|/;
			var regexSize = /\*([^\*]+)\*/;
			var file = regexFile.exec(data);
			var size = regexSize.exec(data);
			if (file != null) {
				//console.log(data);
				console.log('Filename: ' + file[1]);
				$('.step-three').removeClass('current');
				$('.step-four').addClass('current');
				$('.progress-step.four').addClass('active');
				$('#downloadButton').prop('href', 'temp/' + file[1]);
				$('#downloadButton').html(function(index,html){
					return html.replace('$', size[1]);
				});
			} else {
				error('PHP error. data:' + data + ', status:' + status + ', xhr:' + xhr);
			}
		}
	});
}
function textAreaAdjust(o) {
  o.style.height = "1px";
  o.style.height = (5+o.scrollHeight)+"px";
}
function start() {
	requesting = false;
	$('.step-two').removeClass('current');
	$('.step-three').addClass('current');
	$('.progress-step.three').addClass('active');

	var images = array; //I'm not going to fix this, I accidentally used the wrong variable somewhere else.
	//Use the large size for images
	for (var i = 0; i < images.length; i++) {
		var s = images[i];
		//Edge case where images prefixed with /1/ on the mal cdn don't have a large format
		if (s.indexOf('/1/') == -1) {
			images[i] = s.replace(/\.jpg$/, 'l.jpg');
		}
	}
	array = [];
	for (var i = 0; i < images.length; i++) {
		var current = images[i].split('|');
		
		//Replace illegal characters
		current[0] = current[0].replaceAll("<", "‹");
		current[0] = current[0].replaceAll(">", "›");
		current[0] = current[0].replaceAll(":", ";");
		current[0] = current[0].replaceAll('"', "'");
		current[0] = current[0].replaceAll("/", "");
		current[0] = current[0].replaceAll("\\", "");
		current[0] = current[0].replaceAll("?", "");
		current[0] = current[0].replaceAll("*", "");
		current[0] = current[0].replace(/[^\x00-\x7F]/g, ""); //Any other characters that are not ascii
		
		//console.log(current);
		loadImg('https://foldericons-corsproxy.herokuapp.com/' + current[1], i, current, function(i, img, current) {
			var vibrant = new Vibrant(img);
			var swatches = vibrant.swatches();
			
			//Get the colour from the image (occaisionally there is no vibrant colour, so we use the muted, and a grey colour as an absolute fallback)
			var red = 50;
			var green = 50;
			var blue = 50;
			if (swatches['Vibrant'] != undefined) {
				red = swatches['Vibrant']['rgb'][0];
				green = swatches['Vibrant']['rgb'][1];
				blue = swatches['Vibrant']['rgb'][2];
			} else if (swatches['Muted'] != undefined) {
				red = swatches['Muted']['rgb'][0];
				green = swatches['Muted']['rgb'][1];
				blue = swatches['Muted']['rgb'][2];
			}
			
			array[i] = {image: current[1], red: red, green: green, blue: blue, title: current[0]};
			//If it's all done, then send the request to the php
			if (getLength(array) == images.length) {
				//console.log(array.length);
				//console.log(images.length);
				//Failsafe in case something terrible happens
				if (!requesting) {
					request();
					requesting = true;
				}
			}
		});
	}
}
//Go to page 2
function settings() {
	if (array.length > 0) {
		$('.step-one').removeClass('current');
		$('.step-two').addClass('current');
		$('.progress-step.two').addClass('active');
	} else {
		//TODO: Nicer looking error
		alert('Don\'t forget to add an anime!');
	}
}
//Go back to page 1 from page 2
function back() {
	$('.step-one').addClass('current');
	$('.step-two').removeClass('current');
	$('.progress-step.two').removeClass('active');
}
//Reset all values on page 2 to default
function resetValues() {
	if ($('#coverImage').prop('checked') == false)
		$('#coverImage').click();
	$('#coverHeight').val(460);
	$('#coverRotation').val(-3);
	$('#coverX').val(170);
	$('#coverY').val(50);
	if ($('#16px').prop('checked') == false)
		$('#16px').click();
	if ($('#32px').prop('checked') == false)
		$('#32px').click();
	if ($('#48px').prop('checked') == false)
		$('#48px').click();
	if ($('#64px').prop('checked') == false)
		$('#64px').click();
	if ($('#128px').prop('checked') == false)
		$('#128px').click();
	if ($('#256px').prop('checked') == false)
		$('#256px').click();
}
//Go to the error page and display the data
function error(data) {
	$('.step-one').removeClass('current');
	$('.step-two').removeClass('current');
	$('.step-three').removeClass('current');
	$('.progress-step.three').text('!');
	$('.progress-step.four').css('display', 'none');
	$('.error').addClass('current');
	$('.info.errorData').html(data);
}

//Add an anime to the array and the gui
function addToList(label, value) {
	if (array.indexOf(label + '|' + value) == -1) {
		$('#anime_list').append('<span class="anime-item" data-id="' + value + '" title="Remove from list" onclick="removeFromList(this);">' + label + '</span>');
		array.push(label + '|' + value);
	} else {
		console.log('Already added!');
	}
}
//Remove an anime from the array and the gui
function removeFromList(e) {
	var index = array.indexOf($(e).text() + '|' + $(e).attr('data-id'));
	array.splice(index, 1);
	$(e).remove();
}

//Function used to filter the array when importing from a MAL list
function filterByStatus(arr) {
	if (this[0] == "all" || this[0] == arr[2]) {
		return true;
	} else {
		return false;
	}
}
//EXPERIMENTAL: Import animes in bulk from a MAL list (can only be called from the console atm)
function importFromMAL(username, status = "watching") {
	//status can be: "watching", "plan to watch", "on-hold", "completed", "dropped"
	var ajax = new XMLHttpRequest();
	ajax.open("GET", "https://foldericons-corsproxy.herokuapp.com/" + "http://myanimelistrt.azurewebsites.net/2.1/animelist/" + username, true);
	ajax.onload = function() {
		$('.loader').css('display', 'none');
		var tempp = JSON.parse(ajax.responseText);
		var list = tempp.anime;

		names = list.map(function(i) {
			return [i.title, i.image_url, i.watched_status];
		});

		names = names.filter(filterByStatus, [status]);
		//console.log(names);

		for (var i = 0; i < names.length; i++) {
			addToList(names[i][0], names[i][1]);
		}
	};
	ajax.send();
	$('.loader').css('display', 'block');
}

function copyToClipboard(elem) {
	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    
    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    
    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}

function toggleShareSheet() {
	if (shareSheetOpen) {
		$('#share-sheet').removeClass('open');
		shareSheetOpen = false;
	} else {
		$('#share-sheet').addClass('open');
		shareSheetOpen = true;
	}
}

//Depending inputs: hide the cover options if cover is switched off entirely
$(document).ready(function() {
	$('#coverHeight').dependsOn({
		'#coverImage': {
			checked: true
		}
	});
	$('#coverRotation').dependsOn({
		'#coverImage': {
			checked: true
		}
	});
	$('#coverX').dependsOn({
		'#coverImage': {
			checked: true
		}
	});
	$('#coverY').dependsOn({
		'#coverImage': {
			checked: true
		}
	});


	var list = [];

	//Awesomplete
	//https://myanimelist.net/search/prefix.json?type=anime&keyword=
	var autocomplete = new Awesomplete(document.getElementById('anime_input'), {
		minChars: 3,
		maxItems: 10
	});

	function search(keyword) {
		var ajax = new XMLHttpRequest();
		//ajax.open("GET", "https://crossorigin.me/" + "https://myanimelist.net/search/prefix.json?type=anime&keyword=" + keyword, true);
		ajax.open("GET", "https://foldericons-corsproxy.herokuapp.com/" + "http://myanimelistrt.azurewebsites.net/2.1/anime/search?q=" + keyword, true);
		ajax.onload = function() {
			$('.loader').css('display', 'none');
			var list = JSON.parse(ajax.responseText);
			/*names = list.map(function(i) {
				return [i.title, i.id];
			});*/
			names = list.map(function(i) {
				return [i.title, i.image_url];
			});
			//console.log(names);

			autocomplete.list = names;
			autocomplete.evaluate();
		};
		ajax.send();
		$('.loader').css('display', 'block');
	}
	
	$('#anime_input').keypress(function(e) {
		if ($('#anime_input').val() != '' && $('#anime_input').val().length >= 3 && e.which >= 32 && e.which <= 127) {
			search($('#anime_input').val());
		}
	});
	
	document.getElementById('anime_input').addEventListener('awesomplete-selectcomplete', function (e) {
		addToList(e.text, e.target.value);
		this.selected = e.target.value;
		e.target.value = null;
	}, false);
});