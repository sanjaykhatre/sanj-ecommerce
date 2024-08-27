// src/contexts/TaskContext.js
import React, { createContext, useState } from "react";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    setTasks((prevTasks) => {
      const existingTask = prevTasks.find((t) => t.id === task.id);
      if (existingTask) {
        console.error("Task ID already exists. Please use a unique ID.");
        return prevTasks; // Return the previous state without any changes
      }
      return [...prevTasks, { ...task, id: task.id }]; // Append the new task
    });
  };

  const editTask = (updatedTask) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
