// Elemente abrufen
const form = document.getElementById("form");
const textInput = document.getElementById("textInput");
const startDateInput = document.getElementById("startDateInput");
const endDateInput = document.getElementById("endDateInput");
const categoryInput = document.getElementById("categoryInput");
const subtaskInput = document.getElementById("subtaskInput");
const subtasksList = document.getElementById("subtasksList");
const addSubtaskButton = document.getElementById("addSubtask");
const urgentInput = document.getElementById("urgentInput");
const notUrgentInput = document.getElementById("notUrgentInput");
const importantInput = document.getElementById("importantInput");
const notImportantInput = document.getElementById("notImportantInput");
const msg = document.getElementById("msg");
const tasks = document.getElementById("tasks");
const searchInput = document.getElementById("searchInput");

// Event Listener für Formular-Submit hinzufügen
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formValidation();
});

// Event Listener für Subtask hinzufügen Button
addSubtaskButton.addEventListener("click", () => {
  if (subtaskInput.value.trim() !== "") {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" class="me-2" onchange="updateProgress(this)"> ${subtaskInput.value.trim()}`;
    subtasksList.appendChild(li);
    subtaskInput.value = "";
  }
});

// Event Listener für Suchleiste
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.trim().toLowerCase();
  document.querySelectorAll("#tasks > div").forEach(task => {
    const title = task.querySelector(".fw-bold").textContent.trim().toLowerCase();
    if (title.includes(searchText)) {
      task.style.display = "";
    } else {
      task.style.display = "none";
    }
  });
});

// Validierung der Formulardaten
const formValidation = () => {
  msg.innerHTML = "";

  if (textInput.value.trim() === "") {
    displayErrorMessage("Task cannot be blank");
  } else if (new Date(startDateInput.value) > new Date(endDateInput.value)) {
    displayErrorMessage("End date cannot be earlier than start date");
  } else if (subtasksList.children.length === 0) {
    displayErrorMessage("At least one subtask is required");
  } else if (!validatePrioritySelection()) {
    displayErrorMessage("You must select exactly two priority options");
  } else {
    acceptData();
    resetForm();
    add.setAttribute("data-bs-dismiss", "modal");
    add.click();
  }
};

// Funktion zum Anzeigen von Fehlermeldungen
const displayErrorMessage = (message) => {
  msg.innerHTML = message;
};

// Überprüfung der ausgewählten Prioritätsauswahlen
const validatePrioritySelection = () => {
  const urgencySelected = document.querySelector('input[name="urgency"]:checked');
  const importanceSelected = document.querySelector('input[name="importance"]:checked');
  return urgencySelected !== null && importanceSelected !== null;
};

// Daten akzeptieren und speichern
const acceptData = () => {
  const subtasks = Array.from(subtasksList.querySelectorAll("li")).map(li => ({
    text: li.textContent.trim(),
    completed: li.querySelector("input").checked,
  }));

  const priorityAction = calculatePriorityAction();

  const taskData = {
    text: textInput.value.trim(),
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    category: categoryInput.value,
    subtasks: subtasks,
    priorityAction: priorityAction,
  };

  let data = JSON.parse(localStorage.getItem("data")) || [];
  data.push(taskData);
  localStorage.setItem("data", JSON.stringify(data));

  createTasks();
};

// Prioritätsaktion berechnen
const calculatePriorityAction = () => {
  if (importantInput.checked && urgentInput.checked) {
    return "Sofort erledigen";
  } else if (importantInput.checked && !urgentInput.checked) {
    return "Einplanen und Wohlfühlen";
  } else if (!importantInput.checked && urgentInput.checked) {
    return "Gib es ab";
  } else if (!importantInput.checked && !urgentInput.checked) {
    return "Weg damit";
  }
};

// Aufgabenliste erstellen 
const createTasks = () => {
  tasks.innerHTML = "";

  const data = JSON.parse(localStorage.getItem("data")) || [];
  data.forEach((task, index) => {
    const subtasksHtml = task.subtasks.map((subtask, subIndex) =>
      `<li><input type="checkbox" class="me-2" ${subtask.completed ? "checked" : ""} onchange="updateProgress(this)"> ${subtask.text}</li>`
    ).join("");

    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    tasks.innerHTML += `
      <div id="task-${index}">
        <span class="fw-bold" style="font-size: 1.5em;">${task.text}</span>
        <span class="small text-secondary">Start: ${task.startDate}</span>
        <span class="small text-secondary">End: ${task.endDate}</span>
        <p>Kategorie: ${task.category}</p>
        <ul>${subtasksHtml}</ul>
        <p>Priorität: ${task.priorityAction}</p>
        <span class="options">
          <i onclick="editTask(${index})" data-bs-toggle="modal" data-bs-target="#form" class="fas fa-edit"></i>
          <i onclick="deleteTask(${index})" class="fas fa-trash-alt"></i>
        </span>
        <div class="progress" style="height: 30px;">
          <div class="progress-bar" role="progressbar" style="width: ${progress}%; display: flex; align-items: center; justify-content: center;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
            <span style="font-size: 0.8em;">${progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `;
  });
};

// Aufgabenfortschritt aktualisieren
const updateProgress = (checkbox) => {
  const taskDiv = checkbox.closest("div");
  const subtasks = taskDiv.querySelectorAll("ul li input");
  const completedSubtasks = Array.from(subtasks).filter(input => input.checked).length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const progressBar = taskDiv.querySelector(".progress-bar");
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress);
  progressBar.innerHTML = `<span style="font-size: 0.8em;">${progress.toFixed(0)}%</span>`;
};

// Aufgabe löschen
const deleteTask = (index) => {
  let data = JSON.parse(localStorage.getItem("data")) || [];
  data.splice(index, 1);
  localStorage.setItem("data", JSON.stringify(data));
  createTasks();
};

// Aufgabe bearbeiten
const editTask = (index) => {
  const data = JSON.parse(localStorage.getItem("data")) || [];
  const selectedTask = data[index];

  textInput.value = selectedTask.text;
  startDateInput.value = selectedTask.startDate;
  endDateInput.value = selectedTask.endDate;
  categoryInput.value = selectedTask.category;

  subtasksList.innerHTML = "";
  selectedTask.subtasks.forEach(subtask => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" class="me-2" ${subtask.completed ? "checked" : ""} onchange="updateProgress(this)"> ${subtask.text}`;
    subtasksList.appendChild(li);
  });

  const urgencyValue = calculatePriorityAction() === "Sofort erledigen" || calculatePriorityAction() === "Gib es ab" ? "Dringend" : "Nicht Dringend";
  const importanceValue = calculatePriorityAction() === "Sofort erledigen" || calculatePriorityAction() === "Einplanen und Wohlfühlen" ? "Wichtig" : "Nicht Wichtig";

  document.querySelector(`input[name="urgency"][value="${urgencyValue}"]`).checked = true;
  document.querySelector(`input[name="importance"][value="${importanceValue}"]`).checked = true;

  deleteTask(index);
};


const resetForm = () => {
  textInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  categoryInput.value = "Keines";
  subtasksList.innerHTML = "";
  document.querySelectorAll('input[name="urgency"]').forEach(input => input.checked = false);
  document.querySelectorAll('input[name="importance"]').forEach(input => input.checked = false);
};

(() => {
  createTasks();
})();
