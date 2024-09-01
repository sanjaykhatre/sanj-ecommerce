import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, db } from "../helpers/config";
import {
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  updateProfile as firebaseUpdateProfile,
  deleteUser as firebaseDeleteUser,
} from "firebase/auth";

export const auth = getAuth(app);

export function initFirebase(
  authenticated?: (isAuthenticated: boolean) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (authenticated !== undefined && user !== null) {
      const accessToken = await user.getIdToken();

      if (accessToken.length) {
        authenticated(true);
      } else {
        authenticated(false);
      }
    } else if (authenticated !== undefined) {
      authenticated(false);
    }
  });
}
export async function logout() {
  await signOut(auth);
}

export async function getUserInfo(id: string) {
  const userDocRef = doc(db, "users", id);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    console.log({ userData });
    return userData;
  }
}

// Task

export async function addUpdateTask(
  taskInfo: any,
  add: boolean,
  userInfo: any
) {
  console.log({ taskInfo, add, userInfo });
  try {
    // Get the current user’s document reference
    // @ts-ignore
    const userDocRef = doc(db, "users", auth.currentUser?.uid);

    if (add) {
      // Add a new task
      // @ts-ignore

      await updateDoc(userDocRef, {
        taskIds: userInfo?.taskIds?.length
          ? [...userInfo.taskIds, taskInfo.id]
          : [taskInfo.id],
      });
      if (taskInfo?.assignedTo?.length) {
        for (const index in taskInfo?.assignedTo) {
          // @ts-ignore
          const studentDocRef = doc(
            db,
            "users",
            taskInfo?.assignedTo[index].id
          );
          await updateDoc(studentDocRef, {
            notifications: arrayUnion({
              id: Date.now().valueOf(),
              seen: false,
              assignerName: userInfo.username,
              taskId: taskInfo.id,
              professorId: userInfo.id,
            }),
          });
        }
      }
    } else {
      // Update an existing task: No need to update taskIds, only update task data
      console.log("Updating existing task:", taskInfo.id);
    }

    // Create or update the task document in the 'tasks' subcollection
    const taskDocRef = doc(userDocRef, "tasks", `${taskInfo.id}`);
    await setDoc(taskDocRef, taskInfo);

    console.log(
      add ? "Task added successfully!" : "Task updated successfully!"
    );
  } catch (e) {
    console.log("Error while adding/updating task", e);
  }
}
export const fetchAllTasks = async () => {
  try {
    // Fetch all tasks from the 'tasks' collection group
    const tasksQuery = collectionGroup(db, "tasks");
    const tasksSnapshot = await getDocs(tasksQuery);

    // Map through the documents and return the data
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("ALL", { tasks });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error; // Handle error in caller function
  }
};

export const getTasksForUser = async (user) => {
  try {
    console.log("innnnnnnnnnn");
    const userId = user?.id;

    // Ensure that userId is a string
    if (typeof userId !== "string") {
      throw new Error("User ID must be a string");
    }

    // Combine task IDs from notifications and other sources
    let notificationTaskIds =
      user.notifications?.map((noti) => noti.taskId) || [];

    if (user?.taskIds?.length) {
      notificationTaskIds = [...notificationTaskIds, ...user?.taskIds];
    }

    notificationTaskIds = [...new Set(notificationTaskIds)];
    console.log({ notificationTaskIds });

    if (notificationTaskIds.length === 0) {
      return []; // No task IDs to query
    }
    console.log({ notificationTaskIds });
    // Fetch all tasks from the collection group
    const allTasks = await fetchAllTasks();

    // Filter tasks on the client-side by task IDs
    const filteredTasks = allTasks.filter((task) =>
      notificationTaskIds.includes(task.id)
    );

    return filteredTasks;
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    throw error; // Handle error in caller function
  }
};
export async function deleteTaskFb(taskId: string, userInfo: any) {
  console.log({ taskId });
  try {
    // Ensure taskId is provided
    if (!taskId) throw new Error("Task ID is required.");

    // Reference the current user's document
    // @ts-ignore
    const userDocRef = doc(db, "users", auth.currentUser?.uid);

    // Reference the specific task document in the 'tasks' subcollection
    const taskDocRef = doc(userDocRef, "tasks", `${taskId}`);

    // Delete the task document
    await deleteDoc(taskDocRef);
    console.log(
      `Task with ID ${taskId} deleted successfully from subcollection.`
    );

    // Update the user's taskIds array
    const updatedTaskIds = userInfo?.taskIds?.filter(
      (id: string) => id !== taskId
    );
    await updateDoc(userDocRef, {
      taskIds: updatedTaskIds,
    });

    console.log("User's taskIds updated successfully.");
  } catch (e) {
    console.error("Error while deleting task:", e);
  }
}

// Profile

export const updateProfile = async ({ username, phone, password }) => {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "users", user.uid);

    if (username || phone) {
      await updateDoc(userDocRef, { username, phone });
    }

    if (password.length >= 5) {
      // @ts-ignore
      await user.updatePassword(password);
    }

    if (username) {
      await firebaseUpdateProfile(user, { displayName: username });
    }
  }
};

export const deleteUser = async () => {
  const user = auth.currentUser;
  if (user) {
    await firebaseDeleteUser(user);
  }
};
export const resetPassword = async (email, oldPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently logged in.");

  // Re-authenticate the user with the old password
  const credential = EmailAuthProvider.credential(email, oldPassword);
  await reauthenticateWithCredential(user, credential);

  // Update the password to the new password
  await updatePassword(user, newPassword);
};
export const addOrUpdateSubjectInFirestore = async (subject, editMode) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently logged in.");

    // Reference to the user's document
    const userDocRef = doc(db, "users", user.uid);

    // Reference to the 'subjects' subcollection
    const subjectsCollectionRef = collection(userDocRef, "subjects");

    // Reference to the specific subject document
    const subjectDocRef = doc(subjectsCollectionRef, `${subject.id}`); // For editing, reference the existing document
    // For adding, create a new document

    // Prepare the subject data
    const subjectData = {
      ...subject,
      professorId: user.uid,
      students: subject.students || [], // Ensure students is an array
    };

    // Update or add the subject in the 'subjects' subcollection
    if (editMode) {
      await updateDoc(subjectDocRef, subjectData);

      // If the subject ID changed, update it in the user's document
      await updateDoc(userDocRef, {
        subjectIds: arrayUnion(subject.id),
      });
    } else {
      // Add the new subject document and update the user's document with the new subject ID
      const newSubjectId = subjectDocRef.id;
      await setDoc(subjectDocRef, { ...subjectData, id: newSubjectId });

      await updateDoc(userDocRef, {
        subjectIds: arrayUnion(newSubjectId),
      });
    }

    console.log(
      editMode ? "Subject updated successfully" : "Subject added successfully",
      subjectDocRef.id
    );
  } catch (error) {
    console.error("Error saving subject:", error);
  }
};

export const deleteSubjectFromFirestore = async (subjectId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently logged in.");

    // Reference to the user's document
    const userDocRef = doc(db, "users", user.uid);

    // Reference to the specific subject document in the 'subjects' subcollection
    const subjectDocRef = doc(userDocRef, "subjects", subjectId);

    // Delete the subject document from the 'subjects' subcollection
    await deleteDoc(subjectDocRef);

    // Remove the subject ID from the user's 'subjectIds' array
    await updateDoc(userDocRef, {
      subjectIds: arrayRemove(subjectId),
    });

    console.log("Subject deleted successfully:", subjectId);
  } catch (error) {
    console.error("Error deleting subject:", error);
  }
};

export const getAllSubjectsForUser = async () => {
  try {
    const user = auth.currentUser;
    console.log("heee", { user });
    if (!user) throw new Error("No user is currently logged in.");

    // Reference to the 'subjects' subcollection within the user's document
    const subjectsCollectionRef = collection(db, "users", user.uid, "subjects");

    // Get all documents in the 'subjects' subcollection
    const querySnapshot = await getDocs(subjectsCollectionRef);

    // Map through the documents and return the data
    const subjects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log({ subjects }, "ss");
    return subjects;
  } catch (error) {
    console.error("Error getting subjects:", error);
    throw error;
  }
};

export const fetchAvailableSubjects = async (setAvailableSubjects) => {
  try {
    const querySnapshot = await getDocs(collectionGroup(db, "subjects"));
    const fetchedSubjects = [];

    for (const subjectDoc of querySnapshot.docs) {
      const subjectData = subjectDoc.data();
      const professorDocRef = doc(db, "users", subjectData.professorId);
      const professorDoc = await getDoc(professorDocRef);

      const professorName = professorDoc.exists()
        ? professorDoc.data().username
        : "Unknown";
      // @ts-ignore
      fetchedSubjects.push({
        id: subjectDoc.id,
        ...subjectData,
        professorName,
      });
    }

    setAvailableSubjects(fetchedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }
};
export const addSubjectToUser = async (userId, subject) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      enrolledSubjects: arrayUnion(subject.id),
    });
    console.log(`Subject ${subject.id} added to user ${userId}`);
  } catch (error) {
    console.error("Error adding subject to user:", error);
  }
};
export const addUserToSubject = async (subject, user) => {
  console.log({ subject, user });
  try {
    const subjectDocRef = doc(
      db,
      "users",
      subject.professorId,
      "subjects",
      subject.id
    );
    await updateDoc(subjectDocRef, {
      students: arrayUnion(user.id),
    });
    console.log(`User ${user} added to subject ${subject.id}`);
  } catch (error) {
    console.error("Error adding user to subject:", error);
  }
};
export const removeSubjectFromUser = async (userId, subject) => {
  try {
    // Remove the subject from the user's enrolledSubjects array
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      enrolledSubjects: arrayRemove(subject.id),
    });

    // Remove the user from the subject's students array
    const subjectDocRef = doc(
      db,
      "users",
      subject.professorId,
      "subjects",
      subject.id
    );
    await updateDoc(subjectDocRef, {
      students: arrayRemove(userId),
    });

    console.log(`Subject ${subject} removed from user ${userId}`);
    console.log(`User ${userId} removed from subject ${subject}`);
  } catch (error) {
    console.error("Error removing subject or student:", error);
  }
};

export async function loadEnrolledSubjects(
  enrolledSubjectIds,
  setEnrolledSubjects
) {
  try {
    if (enrolledSubjectIds.length === 0) {
      setEnrolledSubjects([]);
      return;
    }

    // Query the subjects collection group to find the subjects with matching IDs
    const subjectsQuery = query(
      collectionGroup(db, "subjects"),
      where("id", "in", enrolledSubjectIds)
    );

    const querySnapshot = await getDocs(subjectsQuery);

    const enrolledSubjectsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log({ enrolledSubjectIds });
    // Set the enrolled subjects data in state
    setEnrolledSubjects(enrolledSubjectsData);
  } catch (error) {
    console.error("Error loading enrolled subjects:", error);
  }
}

export async function findAndUpdateTaskWithComment(task) {
  try {
    // Query the collection group to find the document with the given taskId
    const q = query(collectionGroup(db, "tasks"), where("id", "==", task.id));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]; // Get the first document only

      // Update the document with the new comment
      await updateDoc(doc.ref, {
        comments: task.comments,
      });

      console.log("Comment added successfully");
    } else {
      console.log("No task found with the provided ID");
    }
  } catch (error) {
    console.error("Error updating task with comment: ", error);
  }
}
export async function fetchEnrolledStudentsBySubject(userId, subjectId) {
  try {
    // Step 1: Reference the specific subject document
    const subjectRef = doc(db, `users/${userId}/subjects`, subjectId);

    // Step 2: Get the subject document
    const subjectSnapshot = await getDoc(subjectRef);

    if (!subjectSnapshot.exists()) {
      console.log("Subject not found.");
      return [];
    }

    // Step 3: Retrieve enrolled student IDs from the subject document
    const subjectData = subjectSnapshot.data();
    const enrolledStudentIds = subjectData.students || []; // Default to an empty array if none
    console.log({ enrolledStudentIds });

    // Step 4: Fetch data for each enrolled student
    const studentsData = [];
    if (enrolledStudentIds.length > 0) {
      const studentsRef = collection(db, "users");
      const q = query(studentsRef, where("id", "in", enrolledStudentIds));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // @ts-ignore
        studentsData.push(doc.data());
      });
    }

    console.log({ studentsData });
    return studentsData;
  } catch (error) {
    console.error("Error fetching enrolled students: ", error);
    throw error;
  }
}
export async function uploadFileToFirebase(file, path) {
  const storage = getStorage();
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);
  const fileUrl = await getDownloadURL(fileRef);

  return fileUrl;
}

export async function markNotificationsAsSeen(userId, notifications) {
  const userDocRef = doc(db, "users", userId);

  await updateDoc(userDocRef, {
    notifications: notifications,
  });
}
