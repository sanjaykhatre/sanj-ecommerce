import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Slide,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box } from "@mui/system";
import { logout, markNotificationsAsSeen } from "src/controllers/Firebase";
import { UserContext } from "src/App";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Define the fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled component for the portal text
const PortalText = styled(Typography)`
  animation: ${fadeIn} 0.5s ease-in-out;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
`;

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notificationInfo, setNotificationInfo] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.notifications?.length) {
      const unseenNoti = user.notifications.filter(
        (noti) => noti.seen !== true
      );
      setNotificationInfo(unseenNoti);
    }
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/edit-profile");
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event?.currentTarget);
    const notifications = user.notifications.map((n) => {
      n.seen = true;
      return n;
    });

    markNotificationsAsSeen(user.id, notifications); // Assuming this function updates the notifications in Firebase
    setNotificationInfo([]); // Clear the badge count after marking as seen
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationItemClick = (taskId) => {
    navigate(`/task`);
    handleNotificationClose();
  };

  const firstLetter = user?.username?.charAt(0).toUpperCase() || "";

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
          sx={{ flexGrow: 1, cursor: "pointer" }}
        >
          Smart Manager
        </Typography>

        {/* Conditionally render portal text based on user role */}
        {user?.role ? (
          <PortalText variant="h6">
            {user?.role === "admin" ? "Admin Portal" : "Student Portal"}
          </PortalText>
        ) : null}

        {user?.role !== "admin" && (
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={(e) => handleNotificationClick(e)}
          >
            <Badge badgeContent={notificationInfo?.length ?? 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            style: {
              maxHeight: 400,
              width: "350px",
              padding: "10px",
            },
          }}
          TransitionComponent={Slide}
        >
          <Typography variant="h6" sx={{ padding: "10px" }}>
            Notifications
          </Typography>
          <Divider />
          <List>
            {user?.notifications?.map((notification, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleNotificationItemClick(notification.taskId)}
                sx={{
                  backgroundColor: notification.seen ? "#f5f5f5" : "#e3f2fd",
                  transition: "background-color 0.3s",
                }}
              >
                <ListItemText
                  primary={`Assigned By: Professor ${notification.assignerName}`}
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Task ID: {notification.taskId}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          {user?.notifications?.length === 0 && (
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ padding: "10px" }}
            >
              No new notifications
            </Typography>
          )}
        </Menu>

        <Box sx={{ ml: 2 }}>
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar>{firstLetter}</Avatar>
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
