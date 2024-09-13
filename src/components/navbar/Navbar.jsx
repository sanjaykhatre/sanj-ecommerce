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
import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/system";
import { logout, markNotificationsAsSeen } from "src/controllers/Firebase";
import { UserContext } from "src/App";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

// Styled component for the portal text
const PortalText = styled(Typography)`
  animation: ${fadeIn} 0.5s ease-in-out;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  color: ${(props) => (props.isAdmin ? "#ff5722" : "#03a9f4")};
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Styled AppBar with gradient background
const StyledAppBar = styled(AppBar)`
  background: linear-gradient(90deg, #ff5722, #ff9800, #ffc107);
  color: white;
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const NavbarContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const RightSection = styled(Box)`
  display: flex;
  align-items: center;
`;

const AnimatedIconButton = styled(IconButton)`
  animation: ${slideIn} 0.5s ease-in-out;
`;

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notificationInfo, setNotificationInfo] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("called", { user });
    if (user?.notifications?.length) {
      const unseenNoti = user.notifications.filter(
        (noti) => noti.seen !== true
      );
      console.log({ unseenNoti });
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

    if (user?.notifications?.length) {
      // Create a shallow copy of the notifications array
      const notifications = user.notifications.map((n) => ({
        ...n,
        seen: true, // Mark as seen
      }));

      // Update the notifications in Firebase (assuming this works)
      markNotificationsAsSeen(user.id, notifications);
    } else {
      // No notifications present, handle accordingly
      setNotificationInfo([]);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
    setNotificationInfo([]);
  };

  const handleNotificationItemClick = (taskId) => {
    navigate("/task");
    handleNotificationClose();
  };

  const firstLetter = user?.username?.charAt(0).toUpperCase() || "";

  const renderNotificationList = () => {
    if (!notificationInfo?.length) {
      return (
        <ListItem>
          <ListItemText primary="No new notifications" />
        </ListItem>
      );
    }

    return notificationInfo.map((notification) => (
      <ListItem
        style={{ backgroundColor: "bisque" }}
        key={notification.id}
        onClick={() => handleNotificationItemClick(notification.taskId)}
      >
        <ListItemText
          primary={`You have one notification form ${notification?.assignerName}`}
        />
        <br />
        <ListItemText secondary={`TASK ID: ${notification?.taskId}`} />
      </ListItem>
    ));
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <NavbarContainer>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: "none" } }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            onClick={() => navigate("/")}
            variant="h6"
            component="div"
            sx={{ cursor: "pointer" }}
          >
            Smart Manager
          </Typography>

          {/* Conditionally render portal text based on user role */}
          {user?.role ? (
            <PortalText isAdmin={user?.role === "admin"} variant="h6">
              {user?.role === "admin" ? "Admin Portal" : "Student Portal"}
            </PortalText>
          ) : null}

          <RightSection>
            {user?.role !== "admin" && (
              <AnimatedIconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                onClick={(e) => handleNotificationClick(e)}
              >
                <Badge
                  badgeContent={notificationInfo?.length ?? 0}
                  color="error"
                >
                  <NotificationsIcon />
                </Badge>
              </AnimatedIconButton>
            )}

            <AnimatedIconButton onClick={handleMenu} color="inherit">
              <Avatar>{firstLetter}</Avatar>
            </AnimatedIconButton>
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

            {/* Notification Menu */}
            <Menu
              anchorEl={notificationAnchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
            >
              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                {renderNotificationList()}
              </List>
            </Menu>
          </RightSection>
        </NavbarContainer>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
