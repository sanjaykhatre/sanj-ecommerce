import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { app, db } from "../helpers/config";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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
  try {
    console.log({ taskInfo, add, userInfo });

    // Get the current user’s document reference
    // @ts-ignore
    const userDocRef = doc(db, "users", auth.currentUser?.uid);

    if (add) {
      // Add a new task
      await updateDoc(userDocRef, {
        taskIds: userInfo?.taskIds?.length
          ? [...userInfo.taskIds, taskInfo.id]
          : [taskInfo.id],
      });
    } else {
      // Update an existing task: No need to update taskIds, only update task data
      console.log("Updating existing task:", taskInfo.id);
    }

    // Create or update the task document in the 'tasks' subcollection
    const taskDocRef = doc(userDocRef, "tasks", `${taskInfo.id}`);
    await setDoc(
      taskDocRef,
      { ...taskInfo, professorId: userInfo.id },
      { merge: true }
    );

    console.log(
      add ? "Task added successfully!" : "Task updated successfully!"
    );
  } catch (e) {
    console.log("Error while adding/updating task", e);
  }
}

export const getTasksForUser = async (userId) => {
  try {
    // Ensure that userId is a string
    if (typeof userId !== "string") {
      throw new Error("User ID must be a string");
    }

    // Reference the 'tasks' subcollection under the user's document
    const tasksSubcollectionRef = collection(db, "users", userId, "tasks");

    // Get all the documents in the 'tasks' subcollection
    const querySnapshot = await getDocs(tasksSubcollectionRef);

    // Map through the documents and return the data
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tasks;
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    throw error; // You can handle this error in the caller function
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
    const subjectDocRef = editMode
      ? doc(subjectsCollectionRef, subject.id) // For editing, reference the existing document
      : doc(subjectsCollectionRef); // For adding, create a new document

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
