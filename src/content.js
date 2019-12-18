var CHAR_COUNT = 72;
chrome.storage.sync.get({
	charCount: 72
	}, function(items) {
	CHAR_COUNT = items.charCount;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
	  if (key === 'charCount') {
		CHAR_COUNT = changes[key];
	  }
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
	  wordWrapTextArea();
    }
  }
);

// Dynamic Width (Build Regex)
const wordWrap = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
);

function wordWrapTextArea() {
	alert('test');
	var activeEl = document.activeElement;
	var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	
	// If the selection is an iframe, check if it has a textarea element
	if (activeElTagName == "iframe") {
		var elements = activeEl.contentDocument.getElementsByTagName("textarea");
		if (elements.length == 1) {
			activeEl = elements[0];
			activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
		} else {
			alert("No unambiguous textarea found inside iframe");
			return;
		}
	}
	
	if (activeElTagName == "textarea" && typeof activeEl.selectionStart == "number") {
		var fullText = activeEl.value;
        var startStr = fullText.slice(0, activeEl.selectionStart);
        var text = fullText.slice(activeEl.selectionStart, activeEl.selectionEnd);
        var endStr = fullText.slice(activeEl.selectionEnd, fullText.length);
		var result = wordWrap(text, CHAR_COUNT);
		activeEl.value = startStr + result + endStr;
	} else {
		alert("Please choose a texarea to wordWrap!");
	}
}