import { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@mui/material";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [dueTodoDate, setDueTodoDate] = useState(""); //creating a variable to store due date of a todo task

  useEffect(() => {
    fetch("http://localhost:3001/")
      .then((response) => response.json())
      .then((todos) => setTodos(todos));
  }, [setTodos]);
  
  function addTodo(text, date) {
    fetch("http://localhost:3001/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text, date }), //passing text and due date to the server
    })
      .then((response) => response.json())
      .then((todo) => {
        setTodos([...todos, todo]);
      });
    setNewTodoText("");
    setDueTodoDate("");
  }

  function toggleTodoCompleted(id) {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !todos.find((todo) => todo.id === id).completed,
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  function deleteTodo(id) {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    }).then(() => setTodos(todos.filter((todo) => todo.id !== id)));
  }

  //a function to filter todo task that is due for today
  function filterTodo(todos) {
    const currentDate = new Date();
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth() + 1;
    const currentDay = currentDate.getUTCDate();
    const Today = `${currentYear}-${
      currentMonth > 9 ? currentMonth : "0" + currentMonth
    }-${currentDay > 9 ? currentDay : "0" + currentDay}`;
    setTodos(todos.filter((todo) => todo.date == Today.toString()));
  }
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <TextField
              value={newTodoText}
              placeholder="my todo"
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  addTodo(newTodoText);
                }
              }}
              onChange={(event) => setNewTodoText(event.target.value)}
            />
            <TextField
              value={dueTodoDate}
              type="date"
              onChange={(event) => setDueTodoDate(event.target.value)}
            />
          </Box>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() => {
              addTodo(newTodoText, dueTodoDate); //adding a due date parameter to the addTodo() function
            }}
          >
            Add
          </Button>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>filter_list</Icon>}
            onClick={() => filterTodo(todos)}
          >
            Due Today
          </Button>
        </Box>
      </Paper>
      {todos.length > 0 && (
        <Paper className={classes.todosContainer}>
          <Box display="flex" flexDirection="column" alignItems="stretch">
            {todos.map(({ id, text, date, completed }) => (
              <Box
                key={id}
                display="flex"
                flexDirection="row"
                alignItems="center"
                className={classes.todoContainer}
              >
                <Checkbox
                  checked={completed}
                  onChange={() => toggleTodoCompleted(id)}
                ></Checkbox>
                <Box flexGrow={1}>
                  <Typography
                    className={completed ? classes.todoTextCompleted : ""}
                    variant="body1"
                  >
                    {text} <sub>{date}</sub>
                    
                  </Typography>
                </Box>
                <Button
                  className={classes.deleteTodo}
                  startIcon={<Icon>delete</Icon>}
                  onClick={() => deleteTodo(id)}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Todos;
