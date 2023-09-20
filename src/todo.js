
class Todo {
  static sortByTitle(todos, ascending = true) {
    const sortedTodos = todos.slice().sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return ascending
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    });
    return sortedTodos;
  }

  static sortById(todos, ascending = true) {
    const sortedTodos = todos.slice().sort((a, b) => {
      return ascending ? a.id - b.id : b.id - a.id;
    });
    return sortedTodos;
  }

  static sortByDueDate(todos, ascending = true) {
    const sortedTodos = todos.slice().sort((a, b) => {
      return ascending
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    });
    return sortedTodos;
  }

  static sortByPriority(todos, ascending = true) {
    const priorityOrder = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const sortedTodos = todos.slice().sort((a, b) => {
      const priorityA = priorityOrder[a.priority];
      const priorityB = priorityOrder[b.priority];
      return ascending ? priorityA - priorityB : priorityB - priorityA;
    });
    return sortedTodos;
  }

  static sortByCompleted(todos, ascending = true) {
    const sortedTodos = todos.slice().sort((a, b) => {
      return ascending ? a.completed - b.completed : b.completed - a.completed;
    });
    return sortedTodos;
  }
  constructor(id, title, description, dueDate, priority, completed) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = completed;
  }
  editProperty = (property, value) => {
    let oldValue;
    switch (property) {
      case "title":
        oldValue = this.title;
        this.title = value;
        break;
      case "description":
        oldValue = this.description;
        this.description = value;
        break;
      case "dueDate":
        oldValue = this.dueDate;
        this.dueDate = value;
        break;
      case "priority":
        oldValue = this.priority;
        this.priority = value;
        break;
      case "completed":
        oldValue = this.completed;
        this.completed = value;
        break;
      default:
        break;
    }
    return `${property}: ${oldValue} -> ${value}`;
  };
}
class Project {
  static sortByTitle(projects, ascending = true) {
    const sortedProjects = projects.slice().sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return ascending
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    });
    return sortedProjects;
  }

  static sortByDueDate(projects, ascending = true) {
    const sortedProjects = projects.slice().sort((a, b) => {
      return ascending
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    });
    return sortedProjects;
  }

  static sortByModifiedDate(projects, ascending = true) {
    const sortedProjects = projects.slice().sort((a, b) => {
      return ascending
        ? new Date(a.modifiedDate) - new Date(b.modifiedDate)
        : new Date(b.modifiedDate) - new Date(a.modifiedDate);
    });
    return sortedProjects;
  }

  static sortByCreateDate(projects, ascending = true) {
    const sortedProjects = projects.slice().sort((a, b) => {
      return ascending
        ? new Date(a.createDate) - new Date(b.createDate)
        : new Date(b.createDate) - new Date(a.createDate);
    });
    return sortedProjects;
  }
  constructor(id, title, description, dueDate, todos) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.todos = todos;
    this.dueDate = dueDate;
    this.createDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    this.modifiedDate = this.createDate;
    this.lastModification = "created";
  }
  addTodo = (todo) => {
    this.todos.push(todo);
    this.modifiedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    this.lastModification = `added ${todo.title}`;
  };
  removeTodo = (todo) => {
    this.todos = this.todos.filter((t) => t.id !== todo.id);
    this.modifiedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    this.lastModification = `removed ${todo.title}`;
  };
  editTodo = (todo, property, value) => {
    const modification = todo.editProperty(property, value);
    this.modifiedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    this.lastModification = `modified ${todo.title}: ${modification}`;
  };
  editProperty = (property, value) => {
    let oldValue;
    switch (property) {
      case "title":
        oldValue = this.title;
        this.title = value;
        break;
      case "description":
        oldValue = this.description;
        this.description = value;
        break;
      case "dueDate":
        oldValue = this.dueDate;
        this.dueDate = value;
        break;
      default:
        break;
    }
    this.modifiedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    this.lastModification = `modified ${property}: ${oldValue} -> ${value}`;
  };
}
class TodoList {
  constructor(projects) {
    this.projects = projects;
  }
  addProject = (project) => {
    this.projects.push(project);
  };
  removeProject = (project) => {
    this.projects = this.projects.filter((p) => p.id !== project.id);
  };
}
export { Todo, Project, TodoList };
