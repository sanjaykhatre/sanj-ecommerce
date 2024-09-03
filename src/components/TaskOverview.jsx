import React, { useContext } from "react";
import styled from "styled-components";
import { TaskContext } from "./context/TaskContext";
import { formatDistanceToNow } from "date-fns";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const primaryColor = "#007bff"; // Consistent primary color
const secondaryColor = "#ffc107"; // Secondary color
const successColor = "#28a745"; // Success color
const backgroundColor = "#f0f4f8"; // Soft background color for consistency
const whiteColor = "#ffffff"; // White color for cards and backgrounds

const TaskOverviewContainer = styled.div`
  flex: 2;
  padding: 2rem;
  background: ${backgroundColor};
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 1rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: center;
`;

const Progress = styled.div`
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  height: 8px;
  width: 100px;
  margin: 0 auto;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width};
  background-color: ${(props) =>
    props.status === "Completed"
      ? successColor
      : props.status === "In Progress"
      ? secondaryColor
      : primaryColor};
`;

const AnalyticsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const AnalyticsBox = styled.div`
  background-color: ${whiteColor};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  flex: 1;
  margin: 1rem;
  min-width: 250px;
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const TaskOverview = () => {
  const { tasks } = useContext(TaskContext);

  // Calculate task progress for analytics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((task) => task.status === "To Do").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const barData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks",
        data: [todoTasks, inProgressTasks, completedTasks],
        backgroundColor: [primaryColor, secondaryColor, successColor],
      },
    ],
  };

  const pieData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks",
        data: [todoTasks, inProgressTasks, completedTasks],
        backgroundColor: [primaryColor, secondaryColor, successColor],
      },
    ],
  };

  return (
    <TaskOverviewContainer>
      <Title>Task Overview</Title>
      <TaskTable>
        <thead>
          <TableRow>
            <th>Task</th>
            <th>Members</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Time Left</th>
          </TableRow>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            let progress = "0%";
            if (task.status === "In Progress") progress = "50%";
            if (task.status === "Completed") progress = "100%";

            // Parse the endDate string into a valid Date object
            const endDate = new Date(task.endDate);
            const timeLeft = isNaN(endDate)
              ? "Invalid date"
              : formatDistanceToNow(endDate, { addSuffix: true });

            const members =
              task.assignedTo?.map((member) => member.username).join(", ") ||
              "N/A";

            return (
              <TableRow key={index}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{members}</TableCell>
                <TableCell>
                  <Progress>
                    <ProgressBar width={progress} status={task.status} />
                  </Progress>
                </TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{timeLeft}</TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </TaskTable>

      <AnalyticsContainer>
        <AnalyticsBox>
          <h4>Task Distribution (Bar Chart)</h4>
          <Bar data={barData} />
        </AnalyticsBox>
        <AnalyticsBox>
          <h4>Task Distribution (Pie Chart)</h4>
          <Pie data={pieData} />
        </AnalyticsBox>
      </AnalyticsContainer>
    </TaskOverviewContainer>
  );
};

export default TaskOverview;
