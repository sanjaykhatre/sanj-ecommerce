// src/components/TaskPage.js
import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Autocomplete,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { TaskContext } from "../context/TaskContext";
import { UserContext } from "src/App";
import {
  addUpdateTask,
  deleteTaskFb,
  getTasksForUser,
} from "src/controllers/Firebase";

const students = ["John Doe", "Jane Smith", "Tom Johnson"]; // Replace with your student list

const TaskPage = () => {
  const { tasks, addTask, editTask, deleteTask } = useContext(TaskContext);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: "",
    title: "",
    description: "",
    assignedTo: [],
  });

  const { user } = useContext(UserContext);
  async function getTask() {
    const userCreatedTask = await getTasksForUser(user.id);
    if (userCreatedTask?.length) {
      userCreatedTask.map((tsk) => {
        addTask(tsk);
      });
    }
  }

  useEffect(() => {
    if (user.id) {
      getTask();
      // @ts-ignore
    }
  }, []);

  console.log({ user });
  const handleOpen = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setEditMode(true);
    } else {
      setCurrentTask({ id: "", title: "", description: "", assignedTo: [] });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(false);
  };

  const handleSave = async () => {
    if (!currentTask?.title?.length) {
      setError(true);
      return;
    }
    if (editMode) {
      editTask(currentTask);

      handleClose();
      await addUpdateTask(currentTask, false, user);
    } else {
      const task = { ...currentTask, id: Date.now().valueOf() };
      addTask(task);
      handleClose();
      await addUpdateTask(task, true, user);
    }
  };

  async function handleDelete(task) {
    deleteTask(task.id);

    await deleteTaskFb(task.id, user);
  }

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Task Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Task
        </Button>
      </Box>
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Box
              sx={{
                padding: 2,
                border: "1px solid #ddd",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <Typography variant="h6">{task.title}</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>
                {task.description}
              </Typography>
              <Box sx={{ my: 1 }}>
                {task.assignedTo.map((student, index) => (
                  <Chip key={index} label={student} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
              <IconButton
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => handleOpen(task)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ position: "absolute", top: 8, right: 50 }}
                onClick={() => handleDelete(task)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Task Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? "Edit Task" : "Add Task"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={currentTask.title}
            required={true}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentTask.description}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, description: e.target.value })
            }
          />
          <Autocomplete
            multiple
            options={students}
            getOptionLabel={(option) => option}
            value={currentTask.assignedTo}
            onChange={(event, newValue) =>
              setCurrentTask({ ...currentTask, assignedTo: newValue })
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={index} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Assign to"
                placeholder="Select students"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? "Update" : "Add"}
          </Button>
          <br />
        </DialogActions>
        {error && "Complete the required fields!"}
      </Dialog>
    </Container>
  );
};

export default TaskPage;
