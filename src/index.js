const express = require("express");
const cors = require("cors");
const req = require("express/lib/request");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User does not exists" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  //CHECK USERNAME EXISTS
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  //VALIDATE NAME IS NOT EMPTY
  if (!name || name.legth === 0) {
    return response.status(400).json({ error: "Name is required" });
  }
  //VALIDATE USERNAME IS NOT EMPTY
  if (!username || username.legth === 0) {
    return response.status(400).json({ error: "Username is required" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
  user = request.user;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
  user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(200).json(todo);
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
  user = request.user;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  todo.done = true;

  response.status(200).json(todo);
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  user = request.user;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  response.status(204).json();
});

module.exports = app;
