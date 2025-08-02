import { format } from "date-fns";
import { nanoid } from "nanoid";
import "./styles.css";
let projects = [];
const Priority = { high: 3, medium: 2, low: 1 };
class Todo {
  constructor(projectId, title, details, dueDate, priority) {
    this.projectId = projectId;
    this.id = nanoid();
    this.title = title;
    this.details = details;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = false;
  }
}
class Project {
  constructor(title) {
    this.id = nanoid();
    this.title = title;
    this.todos = [];
  }
  addTodo(todo) {
    this.todos.push(todo);
  }
  removeTodo(todoId) {
    this.todos.splice(
      this.todos.findIndex((todo) => todo.id == todoId),
      1
    );
  }
  sortTodos() {
    this.todos.sort((a, b) => Priority[b.priority] - Priority[a.priority]);
  }
}
const UI = () => {
  const projectsDiv = document.getElementById("projects");
  const projectDialog = document.getElementById("project-dialog");
  const todoDialog = document.getElementById("todo-dialog");
  const projectTitleInput = document.getElementById("project-title-input");
  const todoProjectInput = document.getElementById("todo-project-input");
  const todoTitleInput = document.getElementById("todo-title-input");
  const todoDetailsInput = document.getElementById("todo-details-input");
  const todoDueDateInput = document.getElementById("todo-due-date-input");
  const todoPriorityInput = document.getElementById("todo-priority-input");
  const getTodoHtml = ({
    id,
    projectId,
    title,
    details,
    dueDate,
    priority,
    completed,
  }) => `
  <div class="todo todo-${priority} ${completed ? "done" : ""}" id="${id}">
    <div class="todo-header">
      <h3 class="todo-title">${title}</h3>
      <div class="todo-actions">
        <input type="checkbox" class="todo-completed" ${
          completed ? "checked" : ""
        } data-todoid="${id}" data-projectid="${projectId}" title="Mark as done"/>
        <button type="button" class="toggle-todo-btn" data-todoid="${id}" data-projectid="${projectId}">🛈</button>
        <button type="button" class="remove-todo-btn" data-todoid="${id}" data-projectid="${projectId}">🗑️</button>
      </div>
    </div>
    <div class="todo-body">
      <p class="todo-details">${details}</p>
      <p class="todo-due-date">📅 ${dueDate}</p>
      <p class="todo-priority">${priority}</p>
    </div>
  </div>
`;

  const getProjectHtml = ({ id, title, todos }) => `
  <section id="${id}" class="project">
    <div class="project-header">
      <h2 class="project-title">${title}</h2>
      <div class="project-actions">
        <button type="button" class="toggle-project-btn" data-projectid="${id}">⮟</button>
        <button type="button" class="remove-project-btn" data-projectid="${id}">🗑️</button>
        <button type="button" class="add-todo-btn" data-projectid="${id}">＋</button>
        <button type="button" class="sort-todos-btn" data-projectid="${id}">⇅</button>
      </div>
    </div>
    <div class="project-todos">${todos.map(getTodoHtml).join("")}</div>
  </section>
`;

  const getTodoInputs = () => {
    return {
      projectId: todoProjectInput.value,
      title: todoTitleInput.value,
      details: todoDetailsInput.value,
      priority: todoPriorityInput.value,
      dueDate: format(new Date(todoDueDateInput.value), "PPpp"),
    };
  };
  const getProjectInputs = () => {
    return {
      title: projectTitleInput.value,
    };
  };
  const clearTodoInputs = () => {
    todoTitleInput.value = "";
    todoDetailsInput.value = "";
    todoDueDateInput.value = "";
    showTodoDialog(false);
  };
  const clearProjectInputs = () => {
    projectTitleInput.value = "";
    showProjectDialog(false);
  };
  const setProjectIdInput = (projectId) => {
    todoProjectInput.value = projectId;
  };
  const renderTodo = (todo) => {
    const todosDiv = document.querySelector(
      `#${todo.projectId} .project-todos`
    );
    todosDiv.innerHTML += getTodoHtml(todo);
  };
  const renderTodos = (project) => {
    document.querySelector(`#${project.id} .project-todos`).innerHTML =
      project.todos.map(getTodoHtml).join("");
  };
  const renderProject = (project) => {
    projectsDiv.innerHTML += getProjectHtml(project);
  };
  const showTodoDialog = (show) => {
    if (show) todoDialog.showModal();
    else todoDialog.close();
  };
  const showProjectDialog = (show) => {
    if (show) projectDialog.showModal();
    else projectDialog.close();
  };
  const removeProjectHtml = (projectId) => {
    document.getElementById(projectId).remove();
  };
  const removeTodoHtml = (todoId) => {
    document.getElementById(todoId).remove();
  };
  const addEventDelegation = (delegate) => {
    document.getElementById("content").addEventListener("click", delegate);
  };
  const toggleTodoCompleted = (todoId) => {
    document.getElementById(todoId).classList.toggle("done");
  };
  const toggleProjectView = (projectId) => {
    const projectDiv = document.getElementById(projectId);
    projectDiv.querySelector(".project-todos").classList.toggle("hide");
  };
  const toggleTodoView = (todoId) => {
    const todoDiv = document.getElementById(todoId);
    todoDiv.querySelector(".todo-details").classList.toggle("hide");
    todoDiv.querySelector(".todo-priority").classList.toggle("hide");
  };
  return {
    toggleTodoCompleted,
    toggleTodoView,
    renderTodos,
    toggleProjectView,
    getTodoInputs,
    getProjectInputs,
    setProjectIdInput,
    clearTodoInputs,
    clearProjectInputs,
    removeTodoHtml,
    removeProjectHtml,
    renderTodo,
    renderProject,
    addEventDelegation,
    showProjectDialog,
    showTodoDialog,
  };
};
const Controller = (UI) => {
  const loadProjects = () => {
    const str = localStorage.getItem("projects");
    projects = str
      ? JSON.parse(str).map((p) => Object.assign(new Project(""), p))
      : [];
    projects.forEach(UI.renderProject);
  };
  const saveProjects = () => {
    localStorage.setItem("projects", JSON.stringify(projects));
  };
  const createTodo = ({ projectId, title, details, priority, dueDate }) => {
    UI.clearTodoInputs();
    const todo = new Todo(projectId, title, details, dueDate, priority);
    const project = projects.find((project) => project.id == projectId);
    project.addTodo(todo);
    saveProjects();
    UI.renderTodo(todo);
  };
  const createProject = ({ title }) => {
    UI.clearProjectInputs();
    const project = new Project(title);
    projects.push(project);
    saveProjects();
    UI.renderProject(project);
  };
  const removeTodo = ({ projectId, todoId }) => {
    projects.find((project) => project.id === projectId).removeTodo(todoId);
    saveProjects();
    UI.removeTodoHtml(todoId);
  };
  const removeProject = (projectId) => {
    projects.splice(
      projects.findIndex((project) => project.id == projectId),
      1
    );
    saveProjects();
    UI.removeProjectHtml(projectId);
  };
  const toggleTodoCompleted = ({ projectId, todoId }) => {
    const todo = projects
      .find((p) => p.id == projectId)
      .todos.find((t) => t.id == todoId);
    todo.completed = !todo.completed;
    saveProjects();
    UI.toggleTodoCompleted(todoId);
  };
  const eventDelegation = (e) => {
    if (e.target.matches(".add-todo-btn")) {
      UI.setProjectIdInput(e.target.dataset.projectid);
      UI.showTodoDialog(true);
    } else if (e.target.matches("#add-project-btn")) UI.showProjectDialog(true);
    else if (e.target.matches("#cancel-todo-btn")) UI.showTodoDialog(false);
    else if (e.target.matches("#cancel-project-btn"))
      UI.showProjectDialog(false);
    else if (e.target.matches(".remove-todo-btn")) {
      const todoId = e.target.dataset.todoid;
      removeTodo({
        projectId: e.target.dataset.projectid,
        todoId: e.target.dataset.todoid,
      });
    } else if (e.target.matches(".remove-project-btn")) {
      const projectId = e.target.dataset.projectid;
      removeProject(e.target.dataset.projectid);
    } else if (e.target.matches("#submit-todo-btn")) {
      e.preventDefault();
      createTodo(UI.getTodoInputs());
    } else if (e.target.matches("#submit-project-btn")) {
      e.preventDefault();
      createProject(UI.getProjectInputs());
    } else if (e.target.matches(".toggle-todo-btn")) {
      UI.toggleTodoView(e.target.dataset.todoid);
    } else if (e.target.matches(".toggle-project-btn")) {
      UI.toggleProjectView(e.target.dataset.projectid);
    } else if (e.target.matches(".todo-completed")) {
      const projectId = e.target.dataset.projectid;
      const todoId = e.target.dataset.todoid;
      toggleTodoCompleted({ projectId, todoId });
    } else if (e.target.matches(".sort-todos-btn")) {
      const project = projects.find((p) => p.id == e.target.dataset.projectid);
      project.sortTodos();
      UI.renderTodos(project);
    }
  };
  const start = () => {
    loadProjects();
    UI.addEventDelegation(eventDelegation);
  };
  return { start };
};
Controller(UI()).start();
