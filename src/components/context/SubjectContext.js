// src/contexts/SubjectContext.js
import React, { createContext, useState } from "react";

export const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  const addSubject = (subject) => {
    const existingTask = subjects.find((s) => s.id === subject.id);
    if (existingTask) {
      console.error("Task ID already exists. Please use a unique ID.");
      return;
    }
    setSubjects([...subjects, { ...subject, id: subject.id }]);
  };

  const editSubject = (updatedSubject) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter((subject) => subject.id !== id));
  };

  return (
    <SubjectContext.Provider
      value={{ subjects, addSubject, editSubject, deleteSubject }}
    >
      {children}
    </SubjectContext.Provider>
  );
};
