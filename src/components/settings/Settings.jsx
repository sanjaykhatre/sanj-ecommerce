// src/components/SettingsPage.js
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { SubjectContext } from "../context/SubjectContext";
import {
  addOrUpdateSubjectInFirestore,
  deleteSubjectFromFirestore,
  getAllSubjectsForUser,
} from "src/controllers/Firebase";

const SettingsPage = () => {
  const { subjects, addSubject, editSubject, deleteSubject } =
    useContext(SubjectContext);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({ name: "", description: "" });
  async function allSubjects() {
    const subjects = await getAllSubjectsForUser();
    console.log({ subjects });
    if (subjects.length) {
      subjects.map((subj) => {
        addSubject(subj);
      });
    }
  }

  useEffect(() => {
    allSubjects();
  }, []);
  const handleOpen = (subject = null) => {
    if (subject) {
      setCurrentSubject(subject);
      setEditMode(true);
    } else {
      setCurrentSubject({ id: "", name: "", description: "" });
      setEditMode(false);
    }
    setErrors({ name: "", description: "" });
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

  const handleDelete = async (id) => {
    deleteSubject(id);
    await deleteSubjectFromFirestore(id);
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Manage Subjects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Subject
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <List>
            {subjects.map((subject) => (
              <ListItem
                style={{ border: "1px solid gray ", marginBottom: "15px" }}
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

      {/* Dialog for Adding/Editing Subjects */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? "Edit Subject" : "Add Subject"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            type="text"
            fullWidth
            value={currentSubject.name}
            onChange={(e) =>
              setCurrentSubject({ ...currentSubject, name: e.target.value })
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
