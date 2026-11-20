const defaultTasks = [
    {
        id: 1,
        title: "Set up Node.js & Express server with CORS middleware",
        priority: "High",
        completed: false
    },
    {
        id: 2,
        title: "Create GET and POST /api/tasks REST endpoints",
        priority: "High",
        completed: false
    },
    {
        id: 3,
        title: "Connect React frontend using fetch or Axios",
        priority: "High",
        completed: false
    },
    {
        id: 4,
        title: "Implement All, Pending, and Completed filter tabs",
        priority: "Medium",
        completed: false
    },
    {
        id: 5,
        title: "Write clear setup instructions in README.md",
        priority: "Low",
        completed: false
    }
];

let tasks;

try {
    const savedTasks = localStorage.getItem("trackerTasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : defaultTasks;
    if (!Array.isArray(tasks)) tasks = defaultTasks;
} catch {
    tasks = defaultTasks;
}

let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

// Save tasks in browser

function saveTasks() {
    localStorage.setItem("trackerTasks", JSON.stringify(tasks));
}

// Update counts and progress

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    document.getElementById("allCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;

    document.getElementById("progressText").textContent =
        `● ${completed} of ${total} tasks completed`;

    const percentage = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById("progressFill").style.width =
        percentage + "%";
}

// Display tasks

function renderTasks() {
    updateProgress();

    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchValue);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<div class="empty-message">No tasks found.</div>';
        return;
    }

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className =
            "task-item" + (task.completed ? " completed" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const priority = document.createElement("span");
        priority.className = `priority ${task.priority}`;
        priority.textContent = task.priority;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "♜";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        taskElement.append(
            checkbox,
            title,
            priority,
            deleteButton
        );

        taskList.appendChild(taskElement);
    });
}

// Add task

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) return;

    const newTask = {
        id: Date.now(),
        title: title,
        priority: taskPriority.value,
        completed: false
    };

    tasks.unshift(newTask);

    saveTasks();
    taskForm.reset();

    taskPriority.value = "Medium";

    renderTasks();
    taskTitle.focus();
});

// Complete / pending task

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete task

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// Filter tabs

document.querySelectorAll(".tab").forEach(button => {

    button.addEventListener("click", function() {

        document.querySelectorAll(".tab").forEach(tab => {
            tab.classList.remove("active");
        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        renderTasks();
    });
});

// Search tasks

searchInput.addEventListener("input", renderTasks);

// Initial render

renderTasks();