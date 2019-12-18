var CHAR_COUNT = 72;
var wrapOnlySelected = false;
var wrapContentEditable = true;
var UNSUPPORTED_TAGS = "blockquote,table";

chrome.storage.sync.get({
	charCount: 72,
	wrapOnlySelected: false,
	wrapContentEditable: true
	}, function(items) {
	CHAR_COUNT = items.charCount;
	wrapOnlySelected = items.wrapOnlySelected;
	wrapContentEditable = items.wrapContentEditable;
});

// TODO: Save all global vars as a single JSON
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		if (key === 'charCount') CHAR_COUNT = changes[key];
		else if (key === 'wrapOnlySelected') wrapOnlySelected = changes[key];
		else if (key === 'wrapContentEditable') wrapContentEditable = changes[key];
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
	  wordWrapCore(CHAR_COUNT);
    }
  }
);

function wordWrapCore(char_count) {
	var activeEl = document.activeElement;
	var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	
	// If the selection is an iframe, check if it has an editable element
	if (activeElTagName == "iframe") {
		var elements = activeEl.contentDocument.getElementsByTagName("textarea");
		if (elements.length == 1) {
			activeEl = elements[0];
			activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
		} else {
			elements = activeEl.contentDocument.querySelector('[contenteditable]');
			if (elements.length == 1) {
				activeEl = elements[0];
				activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
			}
			else {
				window.alert("No unambiguous textarea found inside iframe");
				return;
			}
		}
	}
	
	if (activeElTagName == "textarea" && typeof activeEl.selectionStart == "number") {
		wordWrapTextArea(activeEl, char_count, wrapOnlySelected);
	} else if (activeEl.isContentEditable) {
		if (wrapContentEditable)
			wordWrapContentEditable(activeEl, char_count, wrapOnlySelected);
		else
			window.alert("ContentEditable fields wrapping support is experimental!\n(Can be enabled from extension options)");
	} else {
		window.alert("Please choose a texarea to wordWrap!");
	}
}