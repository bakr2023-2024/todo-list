import { Todo,Project,TodoList } from "./todo.js";
import { setStructure } from "./render.js";
import style from "./style.css";
const parseTodoList = () => {
    const list= JSON.parse(localStorage.getItem("todoList"));
    if (!list) return new TodoList([]);
    let semiParsed = list;
    const todoList = new TodoList([]);
    if (semiParsed.projects) {
      semiParsed.projects.forEach((project) => {
        const todos = [];
        project.todos.forEach((todo) => {
          todos.push(
            new Todo(
              todo.id,
              todo.title,
              todo.description,
              todo.dueDate,
              todo.priority,
              todo.completed
            )
          );
        });
        todoList.addProject(
          new Project(
            project.id,
            project.title,
            project.description,
            project.dueDate,
            todos
          )
        );
      });
    }
    return todoList;
  };
setStructure(parseTodoList(),JSON.parse(localStorage.getItem("darkMode")));
const updateLocalStorage = (list) => {
  localStorage.setItem("todoList", JSON.stringify(list));
};
export { updateLocalStorage };
