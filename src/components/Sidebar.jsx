import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import TaskIcon from "@mui/icons-material/Assignment";
import ChessIcon from "@mui/icons-material/SportsEsports";
import HelpIcon from "@mui/icons-material/HelpOutline";

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled component for the sidebar container with animations
const SidebarContainer = styled.div`
  width: 250px;
  background: linear-gradient(180deg, #ff9800, #ffc107, #ffeb3b);
  padding: 1rem;
  height: 100vh;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export const Logo = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #007bff;
`;

// Styled button with animation and hover effects
const MenuButton = styled(Button)`
  justify-content: flex-start;
  text-transform: none;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1rem;
  background-color: transparent;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const HelpCenter = styled.div`
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  height: auto;
  text-align: center;
  margin-top: auto;
`;

const HelpButton = styled(Button)`
  background-color: #007bff;
  color: white;
  margin-top: 0.5rem;
  &:hover {
    background-color: #0056b3;
  }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <SidebarContainer>
        <Logo>Smart Manager</Logo>
        <List>
          <ListItem button onClick={() => navigate("/task")}>
            <TaskIcon sx={{ marginRight: 2, color: "#ffffff" }} />
            <ListItemText primary="Task" />
          </ListItem>
          <ListItem button onClick={() => navigate("/chess")}>
            <ChessIcon sx={{ marginRight: 2, color: "#ffffff" }} />
            <ListItemText primary="Chess" />
          </ListItem>
          <ListItem button onClick={() => navigate("/settings")}>
            <SettingsIcon sx={{ marginRight: 2, color: "#ffffff" }} />
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <Divider sx={{ margin: "1rem 0", borderColor: "#ffffff" }} />
        <HelpCenter>
          <HelpIcon
            sx={{ fontSize: 40, color: "#007bff", marginBottom: "0.5rem" }}
          />
          <p>Help Center</p>
          <p>Having trouble? Contact us for more information.</p>
          <HelpButton variant="contained" onClick={handleClickOpen}>
            Go To Help Center
          </HelpButton>
        </HelpCenter>
      </SidebarContainer>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Contact Help Desk"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            For assistance, please contact the Victoria University, Sydney help
            desk.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
