var CHAR_COUNT = 72;
var wrapOnlySelected = false;
chrome.storage.sync.get({
	charCount: 72,
	wrapOnlySelected: false
	}, function(items) {
	CHAR_COUNT = items.charCount;
	wrapOnlySelected = items.wrapOnlySelected;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		if (key === 'charCount') {
			CHAR_COUNT = changes[key];
		} else if (key === 'wrapOnlySelected') {
			wrapOnlySelected = changes[key];
		}
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
	  wordWrapCore(CHAR_COUNT);
    }
  }
);

// Dynamic Width (Build Regex)
const wordWrap = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
);

function wordWrapTextArea(textarea, char_count) {
	textarea.focus();
	var begin = textarea.selectionStart;
	var end = textarea.selectionEnd;
	if (begin == end && !wrapOnlySelected) {
		// WordWrap the full text if no selection
		textarea.selectionStart = begin = 0;
		textarea.selectionEnd = end = textarea.value.length;
		// if(!document.execCommand('selectAll', false)) {
			// texarea.select();
		// }
	}
	var target = textarea.value.slice(begin, end);
	var finalText = wordWrap(target, char_count);
	if (!document.execCommand('insertText', false, finalText)) {
		textarea.setRangeText(finalText);
	}
}

function wordWrapCore(char_count) {
	var activeEl = document.activeElement;
	var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	
	// If the selection is an iframe, check if it has a textarea element
	if (activeElTagName == "iframe") {
		var elements = activeEl.contentDocument.getElementsByTagName("textarea");
		if (elements.length == 1) {
			activeEl = elements[0];
			activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
		} else {
			window.alert("No unambiguous textarea found inside iframe");
			return;
		}
	}
	
	if (activeElTagName == "textarea" && typeof activeEl.selectionStart == "number") {
		wordWrapTextArea(activeEl, char_count);
	} else {
		window.alert("Please choose a texarea to wordWrap!");
	}
}