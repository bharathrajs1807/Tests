import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserCredential } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBy8GW5wZq3WIRQUcOw6aCZAWWe7iiXCfA",
  authDomain: "sns-project-5c.firebaseapp.com",
  projectId: "sns-project-5c",
  storageBucket: "sns-project-5c.appspot.com",
  messagingSenderId: "7133005075",
  appId: "1:7133005075:web:87b0ca100ad211e31a46e6",
  measurementId: "G-4PZYV5KMGW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { db };

const actionCodeSettings = {
  url: "http://localhost:5173/login",
  handleCodeInApp: true,
};

// Create user with username
export async function createUserWithUsername(
  email: string,
  password: string,
  username: string
): Promise<UserCredential | null> {
  try {
    // Check if username already exists
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (usernameDoc.exists()) {
      throw new Error("Username already taken.");
    }
    // Create user
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Set displayName in Firebase Auth
    await updateProfile(userCredentials.user, { displayName: username });
    // Store username -> email mapping in Firestore
    await setDoc(doc(db, "usernames", username), { email });
    console.log("✅ Signed up:", userCredentials.user);
    return userCredentials;
  } catch (error: any) {
    console.error("❌ Signup error:", error.message);
    return null;
  }
}

// Get email by username
export async function getEmailByUsername(username: string): Promise<string | null> {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (usernameDoc.exists()) {
      return usernameDoc.data().email;
    }
    return null;
  } catch (error: any) {
    console.error("❌ Username lookup error:", error.message);
    return null;
  }
}

// Login user (by email)
export async function login(
  email: string,
  password: string
): Promise<UserCredential | null> {
  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("✅ Logged in:", userCredentials.user);
    return userCredentials;
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    return null;
  }
}

export async function sendLoginLink(email: string) {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email); // store to complete sign-in later
    console.log("✅ Email link sent!");
  } catch (error: any) {
    console.error("❌ Failed to send email link:", error.message);
  }
}

export async function completeLogin() {
  const email = window.localStorage.getItem("emailForSignIn");
  if (email && isSignInWithEmailLink(auth, window.location.href)) {
    try {
      const userCredentials = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      console.log("✅ Signed in:", userCredentials.user);
      return userCredentials;
    } catch (error: any) {
      console.error("❌ Sign-in error:", error.message);
    }
  }
}
