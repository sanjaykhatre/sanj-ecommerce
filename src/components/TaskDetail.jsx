import React, { useContext, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { TaskContext } from "./context/TaskContext";
import { formatDistanceToNow, isToday, isFuture } from "date-fns";
import { useNavigate } from "react-router-dom";

// Define animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const TaskDetailContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  border-left: 1px solid #ddd;
  animation: ${slideIn} 0.5s ease-in-out;
`;

const TaskDetailBox = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border-left: 5px solid ${(props) => (props.isToday ? "#28a745" : "#007bff")};
  animation: ${slideIn} 0.5s ease-in-out;
`;

const NoTaskBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-in-out;
`;

const Button = styled.button`
  margin-top: 1rem;
  background: #007bff;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;
const TaskProgress = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const TaskDetail = () => {
  const { tasks } = useContext(TaskContext);
  const [nearestTask, setNearestTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Filter out tasks with past start dates and sort the remaining tasks
      const upcomingTasks = tasks
        .filter(
          (task) =>
            isToday(new Date(task.startDate)) ||
            isFuture(new Date(task.startDate))
        )
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setNearestTask(upcomingTasks[0]); // The first task is the nearest future task or today's task
    }
  }, [tasks]);

  if (!nearestTask) {
    return (
      <TaskDetailContainer>
        <NoTaskBox>
          <h3>No Upcoming Tasks</h3>
          <p>You have no tasks scheduled for today or in the near future.</p>
          <Button onClick={() => navigate("/task")}>View All Tasks</Button>
        </NoTaskBox>
      </TaskDetailContainer>
    );
  }

  const isTaskToday = isToday(new Date(nearestTask.startDate));

  return (
    <TaskDetailContainer>
      <TaskDetailBox isToday={isTaskToday}>
        <h3>Hot Task</h3>
        <h4>{nearestTask.title}</h4>
        <p>{nearestTask.description}</p>
        <TaskProgress>
          <span>
            Start Date:{" "}
            {isTaskToday
              ? "Today"
              : formatDistanceToNow(new Date(nearestTask.startDate), {
                  addSuffix: true,
                })}
          </span>
          <span>Status: {nearestTask.status}</span>
        </TaskProgress>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <div>{nearestTask.subject?.name || "No Subject"}</div>
          <Button
            onClick={() => {
              // Handle "Go To Detail" click event
              // Navigate to the task detail page or show more details
            }}
          >
            Go To Detail
          </Button>
        </div>
      </TaskDetailBox>
    </TaskDetailContainer>
  );
};

export default TaskDetail;
