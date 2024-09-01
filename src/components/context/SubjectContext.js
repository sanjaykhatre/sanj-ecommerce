// src/contexts/SubjectContext.js
import React, { createContext, useState } from "react";

export const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  const addSubject = (newSubject) => {
    setSubjects((prevSubjects) => {
      // Ensure the subject is not a duplicate (based on id)
      if (prevSubjects.find((subject) => subject.id === newSubject.id)) {
        return prevSubjects; // If duplicate, return previous subjects without adding
      }
      return [...prevSubjects, newSubject]; // Append new subject to the existing state
    });
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
