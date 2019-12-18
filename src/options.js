// Saves options to chrome.storage
function save_options() {
  var charCount = document.getElementById('charCount').value;
  charCount = parseInt(charCount);
  if (isNaN(charCount)) {
	  alert('Please enter a proper integer');
	  return;
  }
  chrome.storage.sync.set({
    charCount: charCount
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default values if not found
  chrome.storage.sync.get({
    charCount: 72
  }, function(items) {
    document.getElementById('charCount').value = items.charCount;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);