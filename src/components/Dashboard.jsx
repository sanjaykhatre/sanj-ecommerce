import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import TaskOverview from "./TaskOverview";
import TaskDetail from "./TaskDetail";
import { getTasksForUser } from "src/controllers/Firebase";
import { UserContext } from "src/App";
import { TaskContext } from "./context/TaskContext";
import { ClipLoader } from "react-spinners";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;

  @media (max-width: 768px) {
    height: 100%;
    padding: 2rem;
  }
`;

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { tasks, addTask } = useContext(TaskContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (user?.id) {
        setLoading(true);
        const userTasks = await getTasksForUser(user);
        if (userTasks?.length) {
          userTasks.forEach((tsk) => addTask(tsk));
        }
        setLoading(false); // Set loading to false after tasks are fetched
      }
    };
    fetchTasks();
  }, [user, addTask]);

  // If loading, display the loading spinner
  if (loading) {
    return (
      <LoadingContainer>
        <ClipLoader color={"#007bff"} loading={loading} size={150} />
      </LoadingContainer>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar />
      <TaskOverview />
      <TaskDetail />
    </DashboardContainer>
  );
};

export default Dashboard;
