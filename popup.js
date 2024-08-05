document.addEventListener('DOMContentLoaded', function() {
  const taskForm = document.getElementById('task-form');
  const incompleteTaskList = document.getElementById('incomplete-task-list');
  const completedTaskList = document.getElementById('completed-task-list');
  const showMoreIncomplete = document.getElementById('show-more-incomplete');
  const showMoreCompleted = document.getElementById('show-more-completed');
  const showNotesCheckbox = document.getElementById('show-notes');
  const notesInput = document.getElementById('task-notes');
  const stopwatchElement = document.getElementById('stopwatch-time');
  const setTimerButton = document.getElementById('set-timer');
  const resetTimerButton = document.getElementById('reset-timer');
  const taskProgressGraph = document.getElementById('task-progress-graph');
  let tasks = [];
  let countdownInterval;
  let countdownTimeout;

  function loadTasks() {
    chrome.storage.local.get(['tasks'], function(result) {
      tasks = result.tasks || [];
      updateTaskList();
      updateTaskProgressGraph();
    });
  }

  function saveTasks() {
    chrome.storage.local.set({ tasks: tasks });
  }

  function updateTaskList() {
    incompleteTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const incompleteTasks = tasks.filter(task => task.status === 'incomplete').sort((a, b) => b.priority.localeCompare(a.priority));
    const completedTasks = tasks.filter(task => task.status === 'completed');

    incompleteTasks.slice(0, 2).forEach(task => appendTask(incompleteTaskList, task));
    completedTasks.slice(0, 2).forEach(task => appendTask(completedTaskList, task));

    showMoreIncomplete.style.display = incompleteTasks.length > 2 ? 'block' : 'none';
    showMoreCompleted.style.display = completedTasks.length > 2 ? 'block' : 'none';

    showMoreIncomplete.onclick = () => toggleTaskList(incompleteTaskList, incompleteTasks, 'incomplete');
    showMoreCompleted.onclick = () => toggleTaskList(completedTaskList, completedTasks, 'completed');
  }

  function toggleTaskList(container, tasks, status) {
    container.innerHTML = '';
    const isExpanded = container.dataset.expanded === 'true';
    const visibleTasks = isExpanded ? tasks.slice(0, 2) : tasks;
    visibleTasks.forEach(task => appendTask(container, task));
    container.dataset.expanded = isExpanded ? 'false' : 'true';
  }

  function appendTask(container, task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
      <div>
        <strong>${task.name}</strong><br>
        ${showNotesCheckbox.checked ? `<p>${task.notes}</p>` : ''}
        <span>Deadline: ${task.deadline}</span><br>
        <span>Priority: ${task.priority}</span><br>
        <span>Status: ${task.status}</span><br>
      </div>
      <button class="complete-btn"><img src="images/check-icon.png" alt="Complete"></button>
    `;
    container.appendChild(taskItem);

    taskItem.querySelector('.complete-btn').addEventListener('click', function() {
      task.status = 'completed';
      updateTaskList();
      saveTasks();
      updateTaskProgressGraph();
    });

    if (task.deadline) {
      const deadline = new Date(task.deadline).getTime();
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance > 0) {
        if (countdownTimeout) clearTimeout(countdownTimeout);

        countdownInterval = setInterval(() => {
          const now = new Date().getTime();
          const distance = deadline - now;

          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          stopwatchElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          if (distance < 0) {
            clearInterval(countdownInterval);
            countdownTimeout = setTimeout(() => alert(`Task ${task.name} expired!`), 0);
          }
        }, 1000);
      }
    }
  }

  taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newTask = {
      name: document.getElementById('task-name').value,
      deadline: document.getElementById('task-deadline').value,
      priority: document.getElementById('task-priority').value,
      notes: document.getElementById('task-notes').value,
      status: 'incomplete',
      created: new Date().toLocaleString()
    };
    tasks.push(newTask);
    updateTaskList();
    saveTasks();
    updateTaskProgressGraph();
    taskForm.reset();
  });

  showNotesCheckbox.addEventListener('change', function() {
    notesInput.style.display = showNotesCheckbox.checked ? 'block' : 'none';
  });

  document.getElementById('change-theme').addEventListener('click', function() {
    const currentTheme = document.getElementById('theme-stylesheet').getAttribute('href');
    const newTheme = currentTheme.includes('light-theme') ? 'styles/dark-theme.css' : 'styles/light-theme.css';
    document.getElementById('theme-stylesheet').setAttribute('href', newTheme);
  });

  document.getElementById('download-summary').addEventListener('click', function() {
    const data = tasks.map(task => ({
      Name: task.name,
      Deadline: task.deadline,
      Priority: task.priority,
      Notes: task.notes,
      Status: task.status,
      Created: task.created
    }));

    const csvContent = "data:text/csv;charset=utf-8," + [
      ["Name", "Deadline", "Priority", "Notes", "Status", "Created"],
      ...data.map(item => [item.Name, item.Deadline, item.Priority, item.Notes, item.Status, item.Created])
    ].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  setTimerButton.addEventListener('click', function() {
    const deadline = new Date(document.getElementById('task-deadline').value).getTime();
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance > 0) {
      clearInterval(countdownInterval); // Clear any existing interval
      countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = deadline - now;

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        stopwatchElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (distance < 0) {
          clearInterval(countdownInterval);
          alert('Time is up!');
        }
      }, 1000);
    }
  });

  resetTimerButton.addEventListener('click', function() {
    clearInterval(countdownInterval);
    stopwatchElement.textContent = '00:00:00';
  });

  function updateTaskProgressGraph() {
    const incompleteTasks = tasks.filter(task => task.status === 'incomplete').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;

    if (totalTasks > 0) {
      const incompletePercentage = (incompleteTasks / totalTasks) * 100;
      const completedPercentage = (completedTasks / totalTasks) * 100;

      taskProgressGraph.innerHTML = `
        <div style="background-color: #4caf50; width: ${completedPercentage}%; height: 20px;"></div>
        <div style="background-color: #f44336; width: ${incompletePercentage}%; height: 20px;"></div>
      `;
      taskProgressGraph.innerHTML += `<p>Completed: ${completedPercentage.toFixed(2)}% | Incomplete: ${incompletePercentage.toFixed(2)}%</p>`;
    } else {
      taskProgressGraph.innerHTML = '<p>No tasks available.</p>';
    }
  }

  loadTasks();
});
