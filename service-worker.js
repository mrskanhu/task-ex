// Service worker for handling background tasks and notifications

chrome.alarms.onAlarm.addListener(function(alarm) {
    chrome.notifications.create(alarm.name, {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Task Reminder',
      message: `Task "${alarm.name}" time is expired!`
    });
  });
  