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
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { SubjectContext } from "../context/SubjectContext";
import {
  addOrUpdateSubjectInFirestore,
  addSubjectToUser,
  addUserToSubject,
  deleteSubjectFromFirestore,
  fetchAvailableSubjects,
  getAllSubjectsForUser,
  loadEnrolledSubjects,
  removeSubjectFromUser,
} from "src/controllers/Firebase";
import { UserContext } from "src/App";

const SettingsPage = () => {
  const { subjects, addSubject, editSubject, deleteSubject } =
    useContext(SubjectContext);
  const { user } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSubject, setCurrentSubject] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  useEffect(() => {
    if (user?.enrolledSubjects) {
      loadEnrolledSubjects(user.enrolledSubjects, setEnrolledSubjects).finally(
        () => {
          setLoading(false);
        }
      );
    } else {
      allSubjects();
    }
    if (user.role === "student" && !subjects?.length) {
      fetchAvailableSubjects(setAvailableSubjects).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    setLoading(false);
  }, []);

  async function allSubjects() {
    const subjects = await getAllSubjectsForUser();
    if (subjects.length) {
      subjects.map((subj) => {
        addSubject(subj);
      });
    }
  }

  const handleOpen = (subject = null) => {
    if (user.role === "student") {
      setSelectedSubjects([]); // Clear the selected subjects for students
    } else {
      if (subject) {
        setCurrentSubject(subject);
        setEditMode(true);
      } else {
        setCurrentSubject({ id: "", name: "", description: "" });
        setEditMode(false);
      }
      setErrors({ name: "", description: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setErrors({ name: "", description: "" });
    setOpen(false);
  };

  const handleSave = () => {
    const { name, description } = currentSubject;
    const newErrors = {
      name: name.trim() === "" ? "Subject name is required." : "",
      description:
        description.trim() === "" ? "Subject description is required." : "",
    };

    if (newErrors.name || newErrors.description) {
      setErrors(newErrors);
      return;
    }

    if (editMode) {
      editSubject(currentSubject);
      addOrUpdateSubjectInFirestore(currentSubject, true);
    } else {
      const subj = { ...currentSubject, id: Date.now().valueOf() };
      addSubject(subj);
      addOrUpdateSubjectInFirestore(subj, false);
    }
    handleClose();
  };

  const handleEnroll = async () => {
    if (selectedSubjects.length === 0) {
      setErrors("Please select at least one subject.");
      return;
    }

    try {
      for (const subject of selectedSubjects) {
        await addUserToSubject(subject, user);
        await addSubjectToUser(user.id, {
          id: subject.id,
          name: subject.name,
          professorName: subject.professorName,
          professorId: subject.professorId,
          enrolledDate: Date.now().valueOf(),
          description: subject.description,
        });
      }
      const ids = selectedSubjects.map((subj) => subj.id);

      console.log("Enrollment successful");
      loadEnrolledSubjects(ids, setEnrolledSubjects); // Refresh enrolled subjects after enrollment
      handleClose();
    } catch (error) {
      console.error("Error during enrollment:", error);
    }
  };

  const handleUnenroll = async (subjectt) => {
    try {
      await removeSubjectFromUser(user.id, subjectt); // Remove subject from user's enrolled subjects
      setEnrolledSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== subjectt.id)
      );
    } catch (error) {
      console.error("Error during unenrollment:", error);
    }
  };

  const handleDelete = async (id) => {
    deleteSubject(id);
    await deleteSubjectFromFirestore(id);
  };

  const handleToggle = (subject) => {
    const currentIndex = selectedSubjects.findIndex(
      (selected) => selected.id === subject.id
    );
    const newChecked = [...selectedSubjects];

    if (currentIndex === -1) {
      newChecked.push(subject);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedSubjects(newChecked);
  };

  const filteredSubjects = availableSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log({ enrolledSubjects });

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">
          {user.role === "student" ? "Enrolled Subjects" : "Manage Subjects"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {user.role === "student" ? "Enroll in Subject" : "Add Subject"}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List>
              {user.role === "student"
                ? enrolledSubjects.map((subject) => (
                    <ListItem
                      style={{ border: "1px solid gray", marginBottom: "15px" }}
                      key={subject.id}
                    >
                      <ListItemText
                        primary={subject.name}
                        secondary={subject.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleUnenroll(subject)}
                          sx={{ marginLeft: 2 }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                : subjects.map((subject) => (
                    <ListItem
                      style={{ border: "1px solid gray", marginBottom: "15px" }}
                      key={subject.id}
                    >
                      <ListItemText
                        primary={subject.name}
                        secondary={subject.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpen(subject)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(subject.id)}
                          sx={{ marginLeft: 2 }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
            </List>
          </Grid>
        </Grid>
      )}

      {/* Dialog for Adding/Editing Subjects or Enrolling */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {user.role === "student"
            ? "Enroll in Subject"
            : editMode
            ? "Edit Subject"
            : "Add Subject"}
        </DialogTitle>
        <DialogContent>
          {user.role === "student" ? (
            <>
              <TextField
                label="Search Subjects"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              <List>
                {filteredSubjects.map((subject) => (
                  <ListItem
                    key={subject.id}
                    button
                    onClick={() => handleToggle(subject)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedSubjects.some(
                        (selected) => selected.id === subject.id
                      )}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={subject.name}
                      secondary={`Professor: ${subject.professorName}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Subject Name"
                type="text"
                fullWidth
                value={currentSubject.name}
                onChange={(e) =>
                  setCurrentSubject({
                    ...currentSubject,
                    name: e.target.value,
                  })
                }
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                margin="dense"
                label="Subject Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentSubject.description}
                onChange={(e) =>
                  setCurrentSubject({
                    ...currentSubject,
                    description: e.target.value,
                  })
                }
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {user.role === "student" ? (
            <Button onClick={handleEnroll} variant="contained">
              Enroll
            </Button>
          ) : (
            <Button onClick={handleSave} variant="contained">
              {editMode ? "Update" : "Add"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
