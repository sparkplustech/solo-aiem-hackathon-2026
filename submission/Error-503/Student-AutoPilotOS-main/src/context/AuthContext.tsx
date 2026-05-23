import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "../services/firebase";

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  streak: number;
  focusScore: number;
  totalStudyHours: number;
  lastActive?: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileStats: (hours: number, focusScoreInc: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Authenticate and sync with Firestore User doc
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            // Check streak logic (if last active is more than 1 day ago)
            let currentStreak = data.streak || 0;
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() - 1);
            
            // Basic streak incrementer if day changes
            if (data.lastActive) {
              const lastActiveDate = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
              const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 3600 * 24));
              if (diffDays === 1) {
                currentStreak += 1;
              } else if (diffDays > 1) {
                currentStreak = 1; // reset streak if missed a day
              }
            } else {
              currentStreak = 1;
            }

            const updatedProfile = {
              ...data,
              streak: currentStreak,
              lastActive: serverTimestamp()
            };

            await updateDoc(userDocRef, {
              streak: currentStreak,
              lastActive: serverTimestamp()
            });

            setProfile({
              ...updatedProfile,
              lastActive: now,
            });
          } else {
            // Create user document
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Innovator Student",
              photoURL: currentUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
              streak: 1,
              focusScore: 100,
              totalStudyHours: 0,
            };
            
            await setDoc(userDocRef, {
              ...newProfile,
              lastActive: serverTimestamp()
            });
            
            setProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Auth Error:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (error) {
      console.error("Sign Out Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileStats = async (hours: number, focusScoreInc: number) => {
    if (!user || !profile) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const newHours = Number((profile.totalStudyHours + hours).toFixed(2));
      const newFocus = Math.max(0, Math.min(100, profile.focusScore + focusScoreInc));
      
      await updateDoc(userDocRef, {
        totalStudyHours: newHours,
        focusScore: newFocus,
        lastActive: serverTimestamp()
      });

      setProfile(prev => prev ? {
        ...prev,
        totalStudyHours: newHours,
        focusScore: newFocus
      } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, updateProfileStats }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
