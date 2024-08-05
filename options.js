document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('clear-tasks').addEventListener('click', function() {
      chrome.storage.sync.set({ tasks: [] }, function() {
        alert('All tasks have been cleared.');
      });
    });
  
    document.getElementById('change-theme-options').addEventListener('click', function() {
      // Logic to change the default theme of the extension.
      // This could be implemented based on how themes are managed.
      // For example, you might want to store the user's theme preference in chrome.storage.
    });
  });
  