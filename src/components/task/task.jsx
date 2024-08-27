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
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { TaskContext } from "../context/TaskContext";
import { UserContext } from "src/App";
import {
  addUpdateTask,
  deleteTaskFb,
  fetchEnrolledStudentsBySubject,
  findAndUpdateTaskWithComment,
  getAllSubjectsForUser,
  getTasksForUser,
  uploadFileToFirebase,
} from "src/controllers/Firebase";
import { SubjectContext } from "../context/SubjectContext";
import { TaskStatus } from "./TaskStatus";

const TaskPage = () => {
  const { tasks, addTask, editTask, deleteTask } = useContext(TaskContext);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [file, setFile] = useState(null);

  const [currentTask, setCurrentTask] = useState({
    id: "",
    title: "",
    description: "",
    subject: [],
    assignedTo: [],
    comments: [],
    startDate: "",
    endDate: "",
    status: TaskStatus.TODO,
    completedFileUrl: "",
  });

  const { subjects, addSubject } = useContext(SubjectContext);

  useEffect(() => {
    const fetchSubjects = async () => {
      const subjects = await getAllSubjectsForUser();
      if (subjects.length) {
        subjects.forEach((subj) => addSubject(subj));
      }
    };
    fetchSubjects();
  }, [addSubject]);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchTasks = async () => {
      if (user?.id) {
        const userTasks = await getTasksForUser(user.id);
        if (userTasks?.length) {
          userTasks.forEach((tsk) => addTask(tsk));
        }
      }
    };
    fetchTasks();
  }, [user, addTask]);

  const handleOpen = (recentTask = null, isViewMode = false) => {
    if (recentTask) {
      setCurrentTask(recentTask);
      setViewMode(isViewMode);
      setEditMode(!isViewMode);
    } else {
      setCurrentTask({
        id: "",
        title: "",
        description: "",
        assignedTo: [],
        comments: [],
        startDate: "",
        endDate: "",
        status: TaskStatus.TODO,
        completedFileUrl: "",
      });
      setViewMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(false);
  };

  const handleSave = async () => {
    if (
      !currentTask?.title?.length ||
      !currentTask?.startDate?.length ||
      !currentTask?.endDate?.length
    ) {
      setError(true);
      return;
    }
    if (editMode) {
      editTask(currentTask);
      await addUpdateTask(currentTask, false, user);
    } else {
      const newTask = { ...currentTask, id: Date.now().valueOf() };
      addTask(newTask);
      await addUpdateTask(newTask, true, user);
    }
    handleClose();
  };

  const handleAddComment = () => {
    if (commentInput.trim()) {
      const newComment = {
        user: user.username,
        text: commentInput.trim(),
        date: Date.now().valueOf(),
        userId: user.id,
      };
      const updatedTask = {
        ...currentTask,
        comments: [...(currentTask.comments || []), newComment],
      };
      setCurrentTask(updatedTask);
      editTask(updatedTask);
      findAndUpdateTaskWithComment(updatedTask);
      setCommentInput("");
    }
  };

  const handleDelete = async (task) => {
    deleteTask(task.id);
    await deleteTaskFb(task.id, user);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (file) {
      const fileUrl = await uploadFileToFirebase(
        file,
        `tasks/${currentTask.id}/completedFiles`
      );
      const updatedTask = {
        ...currentTask,
        completedFileUrl: fileUrl,
      };
      setCurrentTask(updatedTask);
      editTask(updatedTask);
      await addUpdateTask(updatedTask, false, user);
      setFile(null);
    }
  };

  async function loadEnrolledStudents(newValue) {
    setLoading(true);
    const students = await fetchEnrolledStudentsBySubject(user.id, newValue.id);
    setStudents(students);
    setLoading(false);
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
              onClick={() => handleOpen(task, true)} // Open dialog in view mode
            >
              <Typography variant="h6">{task.title}</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>
                {task.description}
              </Typography>
              <Typography variant="body2" sx={{ my: 1 }}>
                Status: {task.status}
              </Typography>
              <Box sx={{ my: 1 }}>
                {task.assignedTo.map((student, index) => (
                  <Chip
                    key={index}
                    label={student.username}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <IconButton
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(task);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ position: "absolute", top: 8, right: 50 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Task Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {viewMode ? "Task Details" : editMode ? "Edit Task" : "Add Task"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={currentTask.title}
            required={true}
            disabled={viewMode}
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
            disabled={viewMode}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            required={true}
            value={currentTask.startDate}
            disabled={viewMode}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, startDate: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            required={true}
            value={currentTask.endDate}
            disabled={viewMode}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, endDate: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={currentTask.status}
              onChange={(e) =>
                setCurrentTask({ ...currentTask, status: e.target.value })
              }
              disabled={viewMode}
            >
              <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>

          {currentTask.status === TaskStatus.COMPLETED && !viewMode && (
            <>
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                Upload File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {file && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleUploadFile}
                >
                  Submit File
                </Button>
              )}
            </>
          )}

          <Autocomplete
            options={subjects}
            getOptionLabel={(option) => option?.name}
            value={currentTask?.subject}
            disabled={viewMode}
            onChange={(event, newValue) => {
              loadEnrolledStudents(newValue);
              setCurrentTask({ ...currentTask, subject: newValue });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Subject"
                placeholder="Select Subject"
              />
            )}
          />
          <Autocomplete
            multiple
            options={students || []}
            getOptionLabel={(option) => option.username || ""}
            value={currentTask.assignedTo || []}
            disabled={viewMode || !students?.length}
            onChange={(event, newValue) => {
              const updatedAssignedTo = newValue.map((student) => ({
                id: student.id,
                username: student.username,
              }));
              setCurrentTask({
                ...currentTask,
                assignedTo: updatedAssignedTo,
              });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.username}
                  {...getTagProps({ index })}
                  key={index}
                />
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

          {viewMode && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Comments</Typography>
              <Box sx={{ maxHeight: 200, overflow: "auto", my: 2 }}>
                {currentTask?.comments?.length > 0 ? (
                  currentTask.comments.map((comment, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {comment.user}:
                      </Typography>
                      <Typography variant="body2">{comment.text}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No comments yet</Typography>
                )}
              </Box>
              <TextField
                margin="dense"
                label="Add a comment"
                type="text"
                fullWidth
                multiline
                rows={2}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <Button
                onClick={handleAddComment}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Add Comment
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSave} variant="contained">
              {editMode ? "Update" : "Add"}
            </Button>
          )}
        </DialogActions>
        {error && "Complete the required fields!"}
      </Dialog>
    </Container>
  );
};

export default TaskPage;
