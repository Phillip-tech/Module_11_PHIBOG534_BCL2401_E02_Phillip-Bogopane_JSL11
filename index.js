// TASK: import helper functions from utils
// Import helper functions from utils
import { getTasks, createNewTask, putTask, deleteTask} from './utils/taskFunctions.js';

// TASK: import initialData
// Import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
      if (typeof initialData === 'object' && initialData !== null) {
          localStorage.setItem('tasks', JSON.stringify(initialData));
          localStorage.setItem('showSideBar', 'true');
      } else {
          console.error('Invalid initialData');
      }
  } else {
      console.log('Data already exists in localStorage');
  }
}


// TASK: Get elements from the DOM
// Get elements from the DOM

const elements = {
  
  headerBoardName: document.querySelector('.header-board-name'),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  sideBarDiv: document.getElementById('side-bar-div'),
  logo:document.getElementById('logo')

}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  if (Array.isArray(tasks) && tasks.length > 0) {
      const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
      displayBoards(boards);
      if (boards.length > 0) {
          const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
          activeBoard = localStorageBoard ? localStorageBoard : boards[0];
          elements.headerBoardName.textContent = activeBoard;
          styleActiveBoard(activeBoard);
          refreshTasksUI();
      }
  } else {
      console.error('Invalid tasks');
  }
}
// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
      if (typeof board === 'string' && board.trim().length > 0) {
          const boardElement = document.createElement("button");
          boardElement.textContent = board;
          boardElement.classList.add("board-btn");
          boardElement.addEventListener('click', () => {
              elements.headerBoardName.textContent = board;
              filterAndDisplayTasksByBoard(board);
              activeBoard = board; //assigns active board
              localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
              styleActiveBoard(activeBoard);
          });
          boardsContainer.appendChild(boardElement);
      } else {
          console.error('Invalid board');
      }
  });
}

 // Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  if (Array.isArray(tasks) && tasks.length > 0) {
      const filteredTasks = tasks.filter(task => task.board === boardName);
      elements.columnDivs.forEach(column => {
          const status = column.getAttribute("data-status");
          // Reset column content while preserving the column title
          column.innerHTML = `<div class="column-head-div">
                                  <span class="dot" id="${status}-dot"></span>
                                  <h4 class="columnHeader">${status.toUpperCase()}</h4>
                              </div>`;
          const tasksContainer = document.createElement("div");
          tasksContainer.className = 'tasks-container';
          column.appendChild(tasksContainer);
          filteredTasks.filter(task => task.status === status).forEach(task => {
              if (typeof task === 'object' && task !== null && typeof task.title === 'string' && task.title.trim().length > 0) {
                  const taskElement = document.createElement("div");
                  taskElement.classList.add("task-div");
                  taskElement.textContent = task.title;
                  taskElement.setAttribute('data-task-id', task.id);
                  taskElement.addEventListener('click', () => {
          // Listen for a click event on each task and open a modal
                      openEditTaskModal(task);
                  });
                  tasksContainer.appendChild(taskElement);
              } else {
                  console.error('Invalid task');
              }
          });
      });
  } else {
      console.error('Invalid tasks');
  }
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  if (typeof boardName === 'string' && boardName.trim().length > 0) {
      document.querySelectorAll('.board-btn').forEach(btn => {
          if (btn.textContent === boardName) {
              btn.classList.add('active');
          } else {
              btn.classList.remove('active');
          }
      });
  } else {
      console.error('Invalid boardName');
  }
}


function addTaskToUI(task) {
  const columnDiv = document.querySelector(`[data-status="${task.status}"] .tasks-container`);
  if (columnDiv) {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);
      taskElement.addEventListener('click', () => {
          openEditTaskModal(task);
      });
      columnDiv.appendChild(taskElement);
  } else {
      console.error('Invalid status for task');
  }
}


function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('click', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
      toggleModal(true);
      elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
      addTask(event);
  });
}


// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  if (typeof show === 'boolean' && modal instanceof HTMLElement) {
      modal.style.display = show ? 'block' : 'none';
  } else {
      console.error('Invalid arguments');
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
      title: document.getElementById("title-input").value,
      description: document.getElementById("desc-input").value,
      status: document.getElementById("select-status").value,
      board: activeBoard,

  };
  if (typeof task === 'object' && task !== null && 
  typeof task.title === 'string' && task.title.trim().length > 0 &&
  typeof task.description === 'string' && task.description.trim().length > 0) {
      const newTask = createNewTask(task);
      if (newTask) {
          addTaskToUI(newTask);
          toggleModal(false);
          elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
          event.target.reset();
          refreshTasksUI();
      }
  } else {
      console.error('Invalid task: Title or Description cannot be empty');
  }
}



function toggleSidebar(show) {
  if (typeof show === 'boolean') {
      elements.sideBarDiv.style.display = show ? 'block' : 'none';
      localStorage.setItem('showSideBar', show);
      elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  } else {
      console.error('Invalid arguments');
  }
}



function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLightTheme = document.body.classList.contains('light-theme');
    console.log("Light theme is now", isLightTheme ? "enabled" : "disabled");
    localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
    logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
    elements.themeSwitch.checked = isLightTheme ? true : false;
    

}


/*
function createThemeToggleIndicator() {
    const themeIndicator = document.createElement('div');
    themeIndicator.id = 'theme-indicator';
    themeIndicator.textContent = document.body.classList.contains('light-theme') ? 'Light Mode' : 'Dark Mode';
    document.body.appendChild(themeIndicator);
}
  */


  function openEditTaskModal(task) {
    if (typeof task === 'object' && task !== null && typeof task.title === 'string' && task.title.trim().length > 0) {
        // Set task details in modal inputs
        document.getElementById("edit-task-title-input").value = task.title;
        document.getElementById("edit-task-desc-input").value= task.description;
        document.getElementById("edit-select-status").value = task.status;

        toggleModal(true, elements.editTaskModal); // Show the edit task modal


  // Get button elements from the task modal

  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button

  saveTaskChangesBtn.addEventListener('click', () => saveTaskChanges(task.id));


  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete this task?")) {
        deleteTask(task.id);
        toggleModal(false);
        refreshTasksUI();
    }
});

} else {
console.error('Invalid task');
}
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  let newTitle = document.getElementById("edit-task-title-input").value;
  let newDescription = document.getElementById("edit-task-desc-input").value;
  let newStatus = document.getElementById("edit-select-status").value;

  // Create an object with the updated task details
     // Create an object with the updated task details

     const updatedTask =
      {
      title: newTitle,
      description: newDescription,
      status: newStatus,
      board: activeBoard,
  
     };


    if (typeof updatedTask === 'object' && updatedTask !== null && typeof updatedTask.title === 'string' && updatedTask.title.trim().length > 0) {
    
        // Update task using a hlper function
        putTask(taskId, updatedTask);

        // Close the modal and refresh the UI to reflect the changes
        toggleModal(false);
        refreshTasksUI();
    } else {
        console.error('Invalid updatedTask');
    }
}
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
    init(); // init is called after the DOM is fully loaded
});

function init() {
    initializeData();
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);
    elements.themeSwitch.checked = isLightTheme ? true : false;
    logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
    fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
    
}



