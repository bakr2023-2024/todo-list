import { Todo, Project } from "./todo.js";
import { updateLocalStorage } from "./index.js";
import _ from "lodash";

const createTodoDialog = document.querySelector("#createTodoDialog");
const createProjectDialog = document.querySelector("#createProjectDialog");
const form = createTodoDialog.querySelector("form");
const form2 = createProjectDialog.querySelector("form");
const confirmBtn = form.querySelector("#confirmBtn");
const confirmBtn2 = form2.querySelector("#confirmBtn");
const main = document.querySelector("#main");
const sidebar = document.querySelector("#sidebar");
const header = document.querySelector("#header");
const toggleDarkModeBtn = document.createElement("button");
const dateDiv = sidebar.querySelector("#date");
const timeDiv = sidebar.querySelector("#time");
const addProjectBtn = document.createElement("button");
const sidebarOptions = document.createElement("div");
const root = document.querySelector("#root");
const divs = root.querySelectorAll("div");
const cancelBtn = form.querySelector(".cancelBtn");
const cancelBtn2 = form2.querySelector(".cancelBtn");
let todoList;
const setStructure = (list,darkMode) => {
  toggleDarkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("darkMode");
    createProjectDialog.classList.toggle("darkMode");
    createTodoDialog.classList.toggle("darkMode");
    if (toggleDarkModeBtn.textContent === "Dark Mode: Off") {
      toggleDarkModeBtn.textContent = "Dark Mode: On";
      localStorage.setItem("darkMode", true);
      divs.forEach((div) => {
        div.style.borderColor = "white";
      });
    } else {
      toggleDarkModeBtn.textContent = "Dark Mode: Off";
      localStorage.setItem("darkMode", false);
      divs.forEach((div) => {
        div.style.borderColor = "black";
      });
    }
  });
  toggleDarkModeBtn.textContent = "Dark Mode: Off";
  if (darkMode) {
    toggleDarkModeBtn.click();
  }
  todoList = list;
  if (todoList.projects.length > 0) {
    todoList.projects.forEach((project) => {
      main.appendChild(renderProject(project));
    });
  }
  header.appendChild(toggleDarkModeBtn);
  sidebarOptions.appendChild(addProjectBtn);
  sidebar.appendChild(sidebarOptions);
  addProjectBtn.textContent = "Add Project";
  addProjectBtn.addEventListener("click", () => {
    createProjectDialog.showModal();
    requestProjectFormAction("create", -1);
  });
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createTodoDialog.close(cancelBtn.value);
  });
  cancelBtn2.addEventListener("click", (e) => {
    e.preventDefault();
    createProjectDialog.close(cancelBtn2.value);
  });
  confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const title = form.querySelector("#title");
    const dueDate = form.querySelector("#dueDate");
    if (title.value === "") {
      title.setCustomValidity("Title cannot be empty");
      form.reportValidity();
      return;
    }
    title.setCustomValidity("");
    const project =
      todoList.projects[Number(form.getAttribute("data-project-id"))];
    if (dueDate.value === "") {
      dueDate.setCustomValidity("Due date cannot be empty");
      form.reportValidity();
      return;
    }
    if (project) {
      if (dueDate.value > project.dueDate) {
        dueDate.setCustomValidity(
          "Todo's due date cannot be after project's due date"
        );
        form.reportValidity();
        return;
      }
    }
    dueDate.setCustomValidity("");
    createTodoDialog.close(confirmBtn.value);
  });
  confirmBtn2.addEventListener("click", (e) => {
    e.preventDefault();
    const title = form2.querySelector("#title");
    const dueDate = form2.querySelector("#dueDate");
    if (title.value === "") {
      title.setCustomValidity("Title cannot be empty");
      form2.reportValidity();
      return;
    }
    title.setCustomValidity("");
    if (dueDate.value === "") {
      dueDate.setCustomValidity("Due date cannot be empty");
      form2.reportValidity();
      return;
    }
    const project =
      todoList.projects[Number(form2.getAttribute("data-project-id"))];
    if (project) {
      let isValid = true;
      for (let i = 0; i < project.todos.length; i++) {
        const todo = project.todos[i];
        if (todo.dueDate > dueDate.value) {
          dueDate.setCustomValidity(
            "Project's due date cannot be before a todo's due date"
          );
          form2.reportValidity();
          isValid = false;
          break;
        }
      }
      if (isValid) {
        dueDate.setCustomValidity("");
        createProjectDialog.close(confirmBtn2.value);
      }
    }
  });
  createTodoDialog.addEventListener("close", (e) => {
    if (createTodoDialog.returnValue === "create") {
      createTodo(form);
    } else if (createTodoDialog.returnValue === "edit") {
      editTodo(form);
    }
  });
  createProjectDialog.addEventListener("close", (e) => {
    if (createProjectDialog.returnValue === "create") {
      createProject(form2);
    } else if (createProjectDialog.returnValue === "edit") {
      editProject(form2);
    }
  });
  const sortingDiv = renderProjectSortingDiv();
  const searchDiv = renderSearchDiv();
  sidebar.appendChild(sortingDiv);
  sidebar.appendChild(searchDiv);
  updateDateTime();
  setInterval(updateDateTime, 1000);
};
const updateDateTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dateDiv.textContent = "Date: " + date;
  timeDiv.textContent = "Time: " + time;
};
const createTodo = (form) => {
  const projectId = Number(form.getAttribute("data-project-id"));
  const title = form.querySelector("#title").value;
  const description = form.querySelector("#description").value;
  const dueDate = form.querySelector("#dueDate").value;
  const priority = form.querySelector("#priority").value;
  const completed = form.querySelector("#completed").checked;
  const todo = new Todo(
    todoList.projects[projectId].todos.length,
    title,
    description,
    dueDate,
    priority,
    completed
  );
  todoList.projects[projectId].addTodo(todo);
  updateLocalStorage(todoList);
  const container = document.querySelector(
    `div[data-project-id="${projectId}"]`
  );
  const todos = container.querySelector(".todos");
  todos.appendChild(renderTodo(todo, todoList.projects[projectId]));
  renderProject(todoList.projects[projectId]);
};
const editTodo = (form) => {
  const projectId = Number(form.getAttribute("data-project-id"));
  const todoId = Number(form.getAttribute("data-todo-id"));
  const title = form.querySelector("#title").value;
  const description = form.querySelector("#description").value;
  const dueDate = form.querySelector("#dueDate").value;
  const priority = form.querySelector("#priority").value;
  const completed = form.querySelector("#completed").checked;
  const todoToEdit = todoList.projects[projectId].todos[todoId];
  const project = todoList.projects[projectId];
  if (title !== "" && title !== todoToEdit.title) {
    project.editTodo(todoToEdit, "title", title);
  }
  if (description !== "" && description !== todoToEdit.description) {
    project.editTodo(todoToEdit, "description", description);
  }
  if (dueDate !== "" && dueDate !== todoToEdit.dueDate) {
    project.editTodo(todoToEdit, "dueDate", dueDate);
  }
  if (priority !== "" && priority !== todoToEdit.priority) {
    project.editTodo(todoToEdit, "priority", priority);
  }
  if (completed !== todoToEdit.completed) {
    project.editTodo(todoToEdit, "completed", completed);
  }
  updateLocalStorage(todoList);
  renderTodo(todoToEdit, todoList.projects[projectId]);
  renderProject(todoList.projects[projectId]);
};
const createProject = (form) => {
  const title = form.querySelector("#title").value;
  const description = form.querySelector("#description").value;
  const dueDate = form.querySelector("#dueDate").value;
  const project = new Project(
    todoList.projects.length,
    title,
    description,
    dueDate,
    []
  );
  todoList.addProject(project);
  updateLocalStorage(todoList);
  form.reset();
  main.appendChild(renderProject(project));
};
const editProject = (form) => {
  const title = form.querySelector("#title").value;
  const description = form.querySelector("#description").value;
  const dueDate = form.querySelector("#dueDate").value;
  const projectId = Number(form.getAttribute("data-project-id"));
  const project = todoList.projects[projectId];
  if (title !== "" && title !== project.title) {
    project.editProperty("title", title);
  }
  if (description !== "" && description !== project.description) {
    project.editProperty("description", description);
  }
  if (dueDate !== "" && dueDate !== project.dueDate) {
    project.editProperty("dueDate", dueDate);
  }
  updateLocalStorage(todoList);
  renderProject(project);
};

const requestTodoFormAction = (method, projectId, todoId) => {
  const confirmBtn = createTodoDialog.querySelector("#confirmBtn");
  form.setAttribute("data-project-id", projectId);
  form.setAttribute("data-todo-id", todoId);
  confirmBtn.value = method;
  if (method === "edit") {
    const todo = todoList.projects[projectId].todos[todoId];
    form.querySelector("#title").value = todo.title;
    form.querySelector("#description").value = todo.description;
    form.querySelector("#dueDate").value = todo.dueDate;
    form.querySelector("#priority").value = todo.priority;
    form.querySelector("#completed").checked = todo.completed;
  } else {
    form.reset();
  }
};
const requestProjectFormAction = (method, projectId) => {
  const confirmBtn = createProjectDialog.querySelector("#confirmBtn");
  form2.setAttribute("data-project-id", projectId);
  confirmBtn.value = method;
  if (method === "edit") {
    const project = todoList.projects[projectId];
    form2.querySelector("#title").value = project.title;
    form2.querySelector("#description").value = project.description;
    form2.querySelector("#dueDate").value = project.dueDate;
  } else {
    form2.reset();
  }
};
const renderTodoSortingDiv = (project) => {
  const sortingDiv = document.createElement("div");
  const sortingMethodLabel = document.createElement("label");
  sortingMethodLabel.textContent = "Sort by: ";
  const sortingMethod = document.createElement("select");
  const sortingMethodPlaceholderOption = document.createElement("option");
  sortingMethodPlaceholderOption.textContent = "Choose";
  sortingMethodPlaceholderOption.disabled = true;
  sortingMethodPlaceholderOption.selected = true;
  sortingMethod.appendChild(sortingMethodPlaceholderOption);
  const sortingMethods = [
    "Title",
    "Creation Date",
    "Due Date",
    "Priority",
    "Completed",
  ];
  for (const method of sortingMethods) {
    const option = document.createElement("option");
    option.textContent = method;
    sortingMethod.appendChild(option);
  }
  const sortingOrder = document.createElement("select");
  const sortingOrderPlaceholderOption = document.createElement("option");
  sortingOrderPlaceholderOption.textContent = "Order";
  sortingOrderPlaceholderOption.disabled = true;
  sortingOrderPlaceholderOption.selected = true;
  sortingOrder.appendChild(sortingOrderPlaceholderOption);
  const sortingOrders = ["ASC", "DESC"];
  for (const order of sortingOrders) {
    const option = document.createElement("option");
    option.textContent = order;
    sortingOrder.appendChild(option);
  }
  sortingDiv.appendChild(sortingMethodLabel);
  sortingDiv.appendChild(sortingMethod);
  sortingDiv.appendChild(sortingOrder);
  const listener = () => {
    const method = sortingMethod.value;
    const order = sortingOrder.value;

    if (method === "Choose" || order === "Choose") return;
    switch (method) {
      case "Title":
        project.todos = Todo.sortByTitle(project.todos, order === "ASC");
        break;
      case "Creation Date":
        project.todos = Todo.sortById(project.todos, order === "ASC");
        break;
      case "Due Date":
        project.todos = Todo.sortByDueDate(project.todos, order === "ASC");
        break;
      case "Priority":
        project.todos = Todo.sortByPriority(project.todos, order === "ASC");
        break;
      case "Completed":
        project.todos = Todo.sortByCompleted(project.todos, order === "ASC");
        break;
      default:
        break;
    }
    const container = main.querySelector(`[data-project-id="${project.id}"]`);
    const todos = container.querySelector(".todos");
    todos.innerHTML = "";
    project.todos.forEach((todo) => {
      todos.appendChild(renderTodo(todo, project));
    });
  };
  sortingOrder.addEventListener("change", listener);
  sortingMethod.addEventListener("change", listener);
  return sortingDiv;
};
const renderProjectSortingDiv = () => {
  const sortingDiv = document.createElement("div");
  sortingDiv.classList.add("projectSortingDiv");
  const sortingMethodLabel = document.createElement("label");
  sortingMethodLabel.textContent = "Sort by: ";
  const sortingMethod = document.createElement("select");
  const sortingMethodPlaceholderOption = document.createElement("option");
  sortingMethodPlaceholderOption.textContent = "Choose";
  sortingMethodPlaceholderOption.disabled = true;
  sortingMethodPlaceholderOption.selected = true;
  sortingMethod.appendChild(sortingMethodPlaceholderOption);
  const sortingMethods = [
    "Title",
    "Creation Date",
    "Due Date",
    "Modifcation Date",
  ];
  for (const method of sortingMethods) {
    const option = document.createElement("option");
    option.textContent = method;
    sortingMethod.appendChild(option);
  }
  const sortingOrder = document.createElement("select");
  const sortingOrderPlaceholderOption = document.createElement("option");
  sortingOrderPlaceholderOption.textContent = "Order";
  sortingOrderPlaceholderOption.disabled = true;
  sortingOrderPlaceholderOption.selected = true;
  sortingOrder.appendChild(sortingOrderPlaceholderOption);
  const sortingOrders = ["ASC", "DESC"];
  for (const order of sortingOrders) {
    const option = document.createElement("option");
    option.textContent = order;
    sortingOrder.appendChild(option);
  }
  sortingDiv.appendChild(sortingMethodLabel);
  sortingDiv.appendChild(sortingMethod);
  sortingDiv.appendChild(sortingOrder);
  const listener = () => {
    const method = sortingMethod.value;
    const order = sortingOrder.value;
    if (method === "Choose" || order === "Order") return;
    const projectDivs = main.querySelectorAll(".project");
    let projects = [];
    projectDivs.forEach((projectDiv) => {
      const projectId = Number(projectDiv.getAttribute("data-project-id"));
      projects.push(todoList.projects[projectId]);
    });
    switch (method) {
      case "Title":
        projects = Project.sortByTitle(projects, order === "ASC");
        break;
      case "Creation Date":
        projects = Project.sortByCreateDate(projects, order === "ASC");
        break;
      case "Due Date":
        projects = Project.sortByDueDate(projects, order === "ASC");
        break;
      case "Modification Date":
        projects = Project.sortByModificationDate(projects, order === "ASC");
        break;
      default:
        break;
    }
    main.innerHTML = "";
    projects.forEach((project) => {
      main.appendChild(renderProject(project));
    });
  };
  sortingOrder.addEventListener("change", listener);
  sortingMethod.addEventListener("change", listener);
  return sortingDiv;
};
const renderSearchDiv = () => {
  const searchDiv = document.createElement("div");
  searchDiv.classList.add("searchDiv");
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search";
  let queryResults;
  const debouncedSearch = _.debounce(() => {
    const searchValue = searchInput.value;
    if (searchValue === "") queryResults = todoList.projects;
    else {
      const regex = new RegExp(`.*${searchValue}.*`, "gi");
      queryResults = todoList.projects.filter((project) => {
        return regex.test(project.title);
      });
    }
    main.innerHTML = "";
    queryResults.forEach((project) => {
      main.appendChild(renderProject(project));
    });
  }, 500);
  searchInput.addEventListener("input", debouncedSearch);
  searchDiv.appendChild(searchInput);
  return searchDiv;
};

const renderProject = (project) => {
  let container = main.querySelector(`[data-project-id="${project.id}"]`);
  if (container) {
    const toggleCollapseBtn = container.querySelector(".toggleCollapseBtn2");
    const title = container.querySelector("p:nth-of-type(1)");
    const description = container.querySelector("p:nth-of-type(2)");
    const dueDate = container.querySelector("p:nth-of-type(3)");
    const createDate = container.querySelector("p:nth-of-type(4)");
    const modifiedDate = container.querySelector("p:nth-of-type(5)");
    const lastModification = container.querySelector("p:nth-of-type(6)");
    if (toggleCollapseBtn.textContent === "Collapse") {
      title.textContent = "Title: " + project.title;
      description.textContent = "Description: " + project.description;
      dueDate.textContent = "Due Date: " + project.dueDate;
      createDate.textContent = "Created: " + project.createDate;
      modifiedDate.textContent = "Last Modified: " + project.modifiedDate;
      lastModification.textContent =
        "Last Modification: " + project.lastModification;
    } else {
      title.textContent = project.title;
      description.textContent = project.description;
      dueDate.textContent = project.dueDate;
      createDate.textContent = project.createDate;
      const modifiedDate = document.createElement("p");
      modifiedDate.textContent = project.modifiedDate;
      const lastModification = document.createElement("p");
      lastModification.textContent = project.lastModification;
    }
    return container;
  }
  container = document.createElement("div");
  container.setAttribute("data-project-id", project.id);
  container.classList.add("project");
  const title = document.createElement("p");
  title.textContent = project.title;
  const description = document.createElement("p");
  description.textContent = project.description;
  const dueDate = document.createElement("p");
  dueDate.textContent = project.dueDate;
  const createDate = document.createElement("p");
  createDate.textContent = project.createDate;
  const modifiedDate = document.createElement("p");
  modifiedDate.textContent = project.modifiedDate;
  const lastModification = document.createElement("p");
  lastModification.textContent = project.lastModification;
  const todos = document.createElement("div");
  todos.classList.add("todos");
  project.todos.forEach((todo) => {
    const todoDiv = renderTodo(todo, project);
    todos.appendChild(todoDiv);
  });
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(dueDate);
  container.appendChild(createDate);
  container.appendChild(modifiedDate);
  container.appendChild(lastModification);
  todos.classList.add("invisible");
  description.classList.add("invisible");
  createDate.classList.add("invisible");
  modifiedDate.classList.add("invisible");
  lastModification.classList.add("invisible");
  const toggleCollapseBtn = document.createElement("button");
  toggleCollapseBtn.classList.add("toggleCollapseBtn2");
  toggleCollapseBtn.textContent = "Expand";
  toggleCollapseBtn.addEventListener("click", () => {
    todos.classList.toggle("invisible");
    description.classList.toggle("invisible");
    createDate.classList.toggle("invisible");
    modifiedDate.classList.toggle("invisible");
    lastModification.classList.toggle("invisible");
    if (toggleCollapseBtn.textContent === "Expand") {
      title.textContent = "Title: " + project.title;
      description.textContent = "Description: " + project.description;
      dueDate.textContent = "Due Date: " + project.dueDate;
      createDate.textContent = "Created: " + project.createDate;
      modifiedDate.textContent = "Last Modified: " + project.modifiedDate;
      lastModification.textContent =
        "Last Modification: " + project.lastModification;
      toggleCollapseBtn.textContent = "Collapse";
    } else {
      title.textContent = project.title;
      description.textContent = project.description;
      dueDate.textContent = project.dueDate;
      createDate.textContent = project.createDate;
      const modifiedDate = document.createElement("p");
      modifiedDate.textContent = project.modifiedDate;
      const lastModification = document.createElement("p");
      lastModification.textContent = project.lastModification;
      toggleCollapseBtn.textContent = "Expand";
    }
  });
  const options = document.createElement("div");
  const addTodoBtn = document.createElement("button");
  addTodoBtn.textContent = "Add Todo";
  addTodoBtn.addEventListener("click", () => {
    createTodoDialog.showModal();
    requestTodoFormAction("create", project.id, -1);
  });
  const sortingDiv = renderTodoSortingDiv(project);
  const removeProjectBtn = document.createElement("button");
  removeProjectBtn.textContent = "Remove Project";
  removeProjectBtn.addEventListener("click", () => {
    todoList.removeProject(project);
    updateLocalStorage(todoList);
    container.remove();
  });
  const editProjectBtn = document.createElement("button");
  editProjectBtn.textContent = "Edit Project";
  editProjectBtn.addEventListener("click", () => {
    createProjectDialog.showModal();
    requestProjectFormAction("edit", project.id);
  });
  options.classList.add("projectOptions");
  options.appendChild(toggleCollapseBtn);
  options.appendChild(addTodoBtn);
  options.appendChild(removeProjectBtn);
  options.appendChild(editProjectBtn);
  options.appendChild(sortingDiv);
  container.appendChild(todos);
  container.appendChild(options);
  return container;
};
const renderTodo = (todo, project) => {
  const main = document.querySelector("#main");
  const projectDiv = main.querySelector(`div[data-project-id="${project.id}"]`);
  if (projectDiv) {
    const container = projectDiv.querySelector(
      `div[data-todo-id="${todo.id}"]`
    );
    if (container) {
      const toggleCollapseBtn = container.querySelector(".toggleCollapseBtn");
      const title = container.querySelector("p:nth-of-type(1)");
      const description = container.querySelector("p:nth-of-type(2)");
      const dueDate = container.querySelector("p:nth-of-type(3)");
      const priority = container.querySelector("p:nth-of-type(4)");
      const completed = container.querySelector("input");
      if (toggleCollapseBtn.textContent === "Collapse") {
        title.textContent = "Title: " + todo.title;
        description.textContent = "Description: " + todo.description;
        dueDate.textContent = "Due Date: " + todo.dueDate;
        priority.textContent = "Priority: " + todo.priority;
      } else {
        title.textContent = todo.title;
        description.textContent = todo.description;
        dueDate.textContent = todo.dueDate;
        priority.textContent = todo.priority;
      }
      completed.checked = todo.completed;
      if (completed.checked) {
        container.classList.add("completed");
      } else {
        container.classList.remove("completed");
      }
      return container;
    }
  }
  const container = document.createElement("div");
  container.setAttribute("data-todo-id", todo.id);
  container.classList.add("todo");
  const title = document.createElement("p");
  const description = document.createElement("p");
  const dueDate = document.createElement("p");
  const priority = document.createElement("p");
  const completed = document.createElement("input");
  const options = document.createElement("div");
  completed.type = "checkbox";
  title.textContent = todo.title;
  description.textContent = todo.description;
  dueDate.textContent = todo.dueDate;
  priority.textContent = todo.priority;
  completed.checked = todo.completed;
  if (completed.checked) {
    container.classList.add("completed");
  } else {
    container.classList.remove("completed");
  }
  completed.addEventListener("change", () => {
    project.editTodo(todo, "completed", completed.checked);
    updateLocalStorage(todoList);
    renderProject(project);
    if (completed.checked) {
      container.classList.add("completed");
    } else {
      container.classList.remove("completed");
    }
  });
  description.classList.add("invisible");
  const toggleCollapseBtn = document.createElement("button");
  toggleCollapseBtn.classList.add("toggleCollapseBtn");
  const removeTodoBtn = document.createElement("button");
  const editTodoBtn = document.createElement("button");
  toggleCollapseBtn.textContent = "Expand";
  toggleCollapseBtn.addEventListener("click", () => {
    description.classList.toggle("invisible");
    container.classList.toggle("expanded");
    if (toggleCollapseBtn.textContent === "Expand") {
      toggleCollapseBtn.textContent = "Collapse";
      title.textContent = "Title: " + todo.title;
      description.textContent = "Description: " + todo.description;
      dueDate.textContent = "Due Date: " + todo.dueDate;
      priority.textContent = "Priority: " + todo.priority;
    } else {
      toggleCollapseBtn.textContent = "Expand";
      title.textContent = todo.title;
      description.textContent = todo.description;
      dueDate.textContent = todo.dueDate;
      priority.textContent = todo.priority;
    }
  });
  removeTodoBtn.textContent = "Remove";
  removeTodoBtn.addEventListener("click", () => {
    project.removeTodo(todo);
    updateLocalStorage(todoList);
    renderProject(project);
    container.remove();
  });
  editTodoBtn.textContent = "Edit";
  editTodoBtn.addEventListener("click", () => {
    createTodoDialog.showModal();
    requestTodoFormAction("edit", project.id, todo.id);
  });
  options.classList.add("todoOptions");
  options.appendChild(toggleCollapseBtn);
  options.appendChild(editTodoBtn);
  options.appendChild(removeTodoBtn);
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(dueDate);
  container.appendChild(priority);
  container.appendChild(completed);
  container.appendChild(options);
  return container;
};
export { setStructure };
