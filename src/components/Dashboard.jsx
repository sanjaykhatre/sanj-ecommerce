import React from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import TaskOverview from "./TaskOverview";
import TaskDetail from "./TaskDetail";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Sidebar />
      <TaskOverview />
      <TaskDetail />
    </DashboardContainer>
  );
};

export default Dashboard;
