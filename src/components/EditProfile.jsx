import React, { useContext, useState } from "react";
import { UserContext } from "src/App";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { updateProfile, resetPassword } from "src/controllers/Firebase"; // Ensure resetPassword is implemented correctly
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async () => {
    try {
      console.log({ username, phone });
      await updateProfile({ username, phone });
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleOpenReset = () => {
    setResetOpen(true);
  };

  const handleCloseReset = () => {
    setResetOpen(false);
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user.email, oldPassword, newPassword);
      console.log("Password reset successfully!");
      handleCloseReset();
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Phone"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          sx={{ mt: 2 }}
        >
          Update Profile
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleOpenReset}
          sx={{ mt: 2 }}
        >
          Reset Password
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleOpenConfirm}
          sx={{ mt: 2 }}
        >
          Delete Account
        </Button>
      </Box>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onClose={handleCloseReset}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your old password and new password to reset your password.
          </DialogContentText>
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReset} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetPassword} color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Account Deletion */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              /* Add your delete account logic here */
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditProfile;
