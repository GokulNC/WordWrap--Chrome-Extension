// Dynamic Width (Build Regex)
const wordWrap = (s, w) => s.replace(
	new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
);

function wordWrapTextArea(textarea, char_count, wrapOnlySelected) {
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