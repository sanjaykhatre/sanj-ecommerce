import React from "react";
import styled from "styled-components";

const TaskDetailContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  border-left: 1px solid #ddd;
`;

const TaskDetailBox = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const TaskProgress = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const TaskDetail = () => {
  return (
    <TaskDetailContainer>
      <TaskDetailBox>
        <h4>Task Today</h4>
        <p>Creating Awesome Mobile Apps</p>
        <TaskProgress>
          <span>Progress: 90%</span>
          <span>1 Hour</span>
        </TaskProgress>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <div>UI/UX Designer</div>
          <button
            style={{
              background: "#007bff",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Go To Detail
          </button>
        </div>
      </TaskDetailBox>
    </TaskDetailContainer>
  );
};

export default TaskDetail;
