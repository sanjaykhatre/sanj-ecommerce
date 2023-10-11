import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { app } from "../helpers/config";

const functions = getFunctions(app);
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
