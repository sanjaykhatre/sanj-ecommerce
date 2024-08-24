import React from "react";
import styled from "styled-components";

const TaskOverviewContainer = styled.div`
  flex: 2;
  padding: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 1rem;
`;

const Progress = styled.div`
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  height: 8px;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width};
  background-color: #007bff;
`;

const TaskOverview = () => {
  const tasks = [
    {
      name: "Designing Landing Page",
      members: 4,
      progress: "60%",
      status: "In Progress",
      timeLeft: "2 Days",
    },
    {
      name: "Setting Up Analytics",
      members: 6,
      progress: "100%",
      status: "Completed",
      timeLeft: "3 Hours",
    },
    // Add more tasks as needed
  ];

  return (
    <TaskOverviewContainer>
      <Title>Upcoming Task Overview</Title>
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
          {tasks.map((task, index) => (
            <TableRow key={index}>
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.members}</TableCell>
              <TableCell>
                <Progress>
                  <ProgressBar width={task.progress} />
                </Progress>
              </TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.timeLeft}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </TaskTable>
    </TaskOverviewContainer>
  );
};

export default TaskOverview;
