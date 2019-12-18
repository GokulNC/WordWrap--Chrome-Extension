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

// Dynamic Width (Build Regex)
const wordWrap = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
);

const wordWrapHTML = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1<br/>'
);

function wordWrapTextArea(textarea, char_count) {
	textarea.focus();
	var begin = textarea.selectionStart;
	var end = textarea.selectionEnd;
	if (begin == end) {
		if (wrapOnlySelected) {
			window.alert("Nothing was selected for WordWrap!");
			return;
		}
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

function selectAllHTML(container) {
    if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(container);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    } else if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(container);
        range.select();
    }
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

function replaceSelectionWithHtml(html) {
    var range;
    if (window.getSelection && window.getSelection().getRangeAt) {
        range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        var div = document.createElement("div");
        div.innerHTML = html;
        var frag = document.createDocumentFragment(), child;
        while ( (child = div.firstChild) ) {
            frag.appendChild(child);
        }
        range.insertNode(frag);
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.pasteHTML(html);
    }
}

function wordWrapContentEditable(root, char_count) {
	var sel = window.getSelection();
	if (sel.baseOffset == sel.extentOffset && sel.anchorOffset == sel.focusOffset) {
		if (wrapOnlySelected) {
			window.alert("Nothing was selected for WordWrap!");
			return;
		}
		if (!document.execCommand('selectAll', false)) {
			//selectAllHTML(root);
			window.getSelection().selectAllChildren(root);
		}
		sel = window.getSelection();
	}
	
	// Check if it contains unsupported tags
	if (root.querySelectorAll(UNSUPPORTED_TAGS).length > 0) {
		window.alert("The selected text contains one or more following unsupported elements:\n\n" + UNSUPPORTED_TAGS);
		return;
	}
	
	var target = getSelectionHtml();
	var finalHTML = wordWrapHTML(target, char_count);
	root.focus();
	
	if (!document.execCommand('insertHTML', false, finalHTML))
		replaceSelectionWithHtml(finalHTML);
}

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
		wordWrapTextArea(activeEl, char_count);
	} else if (activeEl.isContentEditable) {
		if (wrapContentEditable)
			wordWrapContentEditable(activeEl, char_count);
		else
			window.alert("ContentEditable fields wrapping support is experimental!\n(Can be enabled from extension options)");
	} else {
		window.alert("Please choose a texarea to wordWrap!");
	}
}