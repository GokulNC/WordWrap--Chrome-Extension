var UNSUPPORTED_TAGS = "blockquote,table";

// TODO: Too naive, may corrupt the HTML tags
const wordWrapHTML = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1<br/>'
);

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

function wordWrapContentEditable(root, char_count, wrapOnlySelected) {
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