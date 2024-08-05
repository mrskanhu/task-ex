chrome.runtime.onInstalled.addListener(() => {
    console.log('Task Manager Extension Installed');
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'taskDeadline') {
      chrome.notifications.create('', {
        title: 'Task Deadline',
        message: 'A task deadline has passed!',
        iconUrl: 'images/icon48.png',
        type: 'basic'
      });
    }
  });
  