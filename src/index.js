const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user)=> user.username === username);

  if(!user){
    return response.status(400).send({error:"Usuário não encontrado!"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
  const checkExistsUser = users.find((user)=> user.username === username);
  if(checkExistsUser){
    return response.status(400).send({error: "User already exists!"});
  }

  users.push(user);

  response.status(201).send(user);
});

app.get('/users',checksExistsUserAccount ,( request, response)=>{
  response.status(200).send(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).send(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const userTodos = request.user.todos;


  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userTodos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = request.user.todos.find((todo)=> todo.id === id);

  if(!todo){
    return response.status(404).send({error: "Task not found!"});
  }

  todo.title = title;
  todo.deadline  = new Date(deadline);

  return response.status(200).send(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find((todo)=> todo.id === id);

  if(!todo){
    return response.status(404).send({error: "Task not found!"});
  }
  todo.done = true;

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  
  const todo = request.user.todos.find((todo)=> todo.id === id);

  if(!todo){
    return response.status(404).send({error: "Task not found!"});
  }

  request.user.todos.splice(todo,1);

  return response.status(204).send({message: "Task successfully deleted!"});
});

module.exports = app;