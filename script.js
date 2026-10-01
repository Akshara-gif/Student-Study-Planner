// =============================================
//   STUDENT STUDY PLANNER — JAVASCRIPT
// =============================================

// -----------------------------------------------
// 1. DISPLAY TODAY'S DATE IN THE HEADER
// -----------------------------------------------

// Get the element where we want to show the date
const todayDateEl = document.getElementById('today-date');

// Create a Date object for right now
const today = new Date();

// Format the date nicely, e.g. "Monday, 16 June 2025"
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
todayDateEl.textContent = today.toLocaleDateString('en-US', options);


// -----------------------------------------------
// 2. LOAD TASKS FROM localStorage
// -----------------------------------------------
// localStorage lets us save data in the browser so it stays even after a page refresh.
// We store the tasks as a JSON string and parse it back into an array when the page loads.

// If there are no saved tasks yet, use an empty array []
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];


// -----------------------------------------------
// 3. SAVE TASKS TO localStorage
// -----------------------------------------------
// Call this function any time the tasks array changes so it stays up to date.

function saveTasks() {
  // JSON.stringify converts the array into a string that localStorage can store
  localStorage.setItem('studyTasks', JSON.stringify(tasks));
}


// -----------------------------------------------
// 4. RENDER ALL TASKS TO THE PAGE
// -----------------------------------------------
// This function clears the task list and redraws every task from the tasks array.
// We call it on page load and after any change (add, delete, complete).

function renderTasks() {
  const taskList = document.getElementById('task-list');
  const emptyMessage = document.getElementById('empty-message');

  // Remove all existing task cards (but keep the empty message element)
  const existingItems = taskList.querySelectorAll('.task-item');
  existingItems.forEach(item => item.remove());

  // Show or hide the "No tasks yet" message
  if (tasks.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';

    // Loop through each task and create its HTML card
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      // Add the 'completed' class if the task is marked done (for strikethrough styling)
      li.className = 'task-item' + (task.completed ? ' completed' : '');

      // Choose the right badge class based on priority
      const badgeClass = 'badge badge-' + task.priority;

      // Build the inner HTML for this task card
      li.innerHTML = `
        <!-- Checkbox to mark as completed -->
        <input
          type="checkbox"
          ${task.completed ? 'checked' : ''}
          onchange="toggleComplete(${index})"
          aria-label="Mark task as completed"
        />

        <!-- Task details: name, subject, due date, priority badge -->
        <div class="task-details">
          <div class="task-name">${escapeHTML(task.name)}</div>
          <div class="task-meta">
            <span>📖 ${escapeHTML(task.subject)}</span>
            <span>📅 Due: ${formatDate(task.due)}</span>
            <span class="${badgeClass}">${task.priority}</span>
          </div>
        </div>

        <!-- Delete button -->
        <button class="btn-delete" onclick="deleteTask(${index})" aria-label="Delete task">🗑️</button>
      `;

      taskList.appendChild(li);
    });
  }

  // Update the progress bar and counts after rendering
  updateProgress();
}


// -----------------------------------------------
// 5. ADD A NEW TASK (form submission)
// -----------------------------------------------

const taskForm = document.getElementById('task-form');

// Listen for the form's submit event
taskForm.addEventListener('submit', function (event) {
  // Prevent the page from refreshing (default form behaviour)
  event.preventDefault();

  // Read the values the user typed in
  const name     = document.getElementById('task-name').value.trim();
  const subject  = document.getElementById('task-subject').value.trim();
  const due      = document.getElementById('task-due').value;
  const priority = document.getElementById('task-priority').value;

  // Safety check: don't add if any field is empty
  if (!name || !subject || !due) return;

  // Create a new task object
  const newTask = {
    name:      name,
    subject:   subject,
    due:       due,
    priority:  priority,
    completed: false    // new tasks start as not completed
  };

  // Add the new task to our tasks array
  tasks.push(newTask);

  // Save the updated array to localStorage
  saveTasks();

  // Redraw the task list to show the new task
  renderTasks();

  // Clear the form fields so the user can add another task easily
  taskForm.reset();
});


// -----------------------------------------------
// 6. TOGGLE TASK COMPLETE / INCOMPLETE
// -----------------------------------------------
// Called when the user clicks a task's checkbox.
// 'index' is the position of the task in the tasks array.

function toggleComplete(index) {
  // Flip the completed value: true becomes false, false becomes true
  tasks[index].completed = !tasks[index].completed;

  saveTasks();
  renderTasks();
}


// -----------------------------------------------
// 7. DELETE A TASK
// -----------------------------------------------
// Called when the user clicks a task's 🗑️ button.

function deleteTask(index) {
  // splice(index, 1) removes 1 element at the given position
  tasks.splice(index, 1);

  saveTasks();
  renderTasks();
}


// -----------------------------------------------
// 8. UPDATE THE PROGRESS BAR & COUNTS
// -----------------------------------------------

function updateProgress() {
  const total     = tasks.length;
  const completed = tasks.filter(task => task.completed).length;

  // Update the numbers shown in the progress section
  document.getElementById('total-count').textContent     = total;
  document.getElementById('completed-count').textContent = completed;

  // Calculate the percentage for the progress bar
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Set the bar's width using an inline style
  document.getElementById('progress-bar').style.width = percentage + '%';
}


// -----------------------------------------------
// 9. HELPER: FORMAT A DATE STRING
// -----------------------------------------------
// Converts "2025-06-20" (the value from <input type="date">)
// into a more readable format like "Jun 20, 2025".

function formatDate(dateString) {
  if (!dateString) return 'No date';
  // Add 'T00:00:00' so the date is parsed in local time, not UTC
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


// -----------------------------------------------
// 10. HELPER: ESCAPE HTML SPECIAL CHARACTERS
// -----------------------------------------------
// This prevents XSS (cross-site scripting) — if a user types HTML tags
// in a field, we show them as text instead of executing them.

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// -----------------------------------------------
// 11. INITIAL RENDER ON PAGE LOAD
// -----------------------------------------------
// When the page first loads, draw all tasks that were saved in localStorage.

renderTasks();
