import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box } from "@mui/system";
import { logout } from "src/controllers/Firebase";
import { UserContext } from "src/App";
import { useNavigate } from "react-router-dom";
import { Logo } from "../Sidebar";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/edit-profile"); // Navigate to the edit profile page
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#ffffff", color: "#000000", marginBottom: "5px" }}
    >
      <Toolbar>
        <Typography
          onClick={() => navigate("/")}
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          Smart Manager
        </Typography>

        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
        >
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Box sx={{ ml: 2 }}>
          <IconButton onClick={handleMenu} color="inherit">
            {user && user?.username}
            <br />
            {user && user?.role}
            <Avatar
              alt="Profile Picture"
              src="https://via.placeholder.com/40"
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
