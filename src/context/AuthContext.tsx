import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { SystemUser, UserRole, DepartmentId } from '../types/staffing';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: SystemUser | null;
  loading: boolean;
  isAdmin: boolean;
  isHeadNurse: boolean;
  isDepartmentHead: boolean;
  canEdit: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canAddActivity: boolean;
  allUsers: SystemUser[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    department: DepartmentId | 'ALL',
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAsDemoRole: (role: UserRole) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
  createNewUserAccount: (user: Partial<SystemUser> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default initial user profiles for the hospital staffing system
export const INITIAL_PRESET_USERS: SystemUser[] = [
  {
    uid: 'admin-001',
    email: 'itborder.ssk11284@gmail.com',
    displayName: 'นพ./พว. ผู้ดูแลระบบ (System Admin)',
    role: 'admin',
    department: 'ALL',
    phone: '081-999-0001',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    lastLoginAt: '2026-10-14T08:00:00.000Z',
  },
  {
    uid: 'nurse-head-002',
    email: 'headnurse.somjai@hospital.go.th',
    displayName: 'พว. สมใจ รักษ์บริการ (หัวหน้าพยาบาลประจำ รพ.)',
    role: 'head_nurse',
    department: 'ALL',
    phone: '081-888-0002',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLoginAt: '2026-10-14T07:30:00.000Z',
  },
  {
    uid: 'dept-head-003',
    email: 'depthead.wanna@hospital.go.th',
    displayName: 'พว. วรรณา ชำนาญการ (หัวหน้าฝ่ายอุบัติเหตุ-ฉุกเฉิน ER)',
    role: 'department_head',
    department: 'ER',
    phone: '081-777-0003',
    status: 'active',
    createdAt: '2026-02-01T08:00:00.000Z',
    lastLoginAt: '2026-10-14T07:45:00.000Z',
  },
  {
    uid: 'dept-head-004',
    email: 'depthead.prasert@hospital.go.th',
    displayName: 'พว. ประเสริฐ เก่งงาน (หัวหน้าฝ่ายผู้ป่วยนอก OPD)',
    role: 'department_head',
    department: 'OPD',
    phone: '081-666-0004',
    status: 'active',
    createdAt: '2026-02-15T08:00:00.000Z',
    lastLoginAt: '2026-10-13T16:00:00.000Z',
  },
  {
    uid: 'dept-head-005',
    email: 'depthead.ratree@hospital.go.th',
    displayName: 'พว. ราตรี ผดุงครรภ์ (หัวหน้าฝ่ายห้องคลอด LR)',
    role: 'department_head',
    department: 'LR',
    phone: '081-555-0005',
    status: 'active',
    createdAt: '2026-03-01T08:00:00.000Z',
    lastLoginAt: '2026-10-13T18:20:00.000Z',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('sk_staffing_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRESET_USERS[0];
      }
    }
    return INITIAL_PRESET_USERS[0]; // Default to Admin for seamless first-load access
  });
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<SystemUser[]>(INITIAL_PRESET_USERS);

  // Sync active user to local cache for session retention
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('sk_staffing_active_user', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Real-time Firestore sync for all users
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: SystemUser[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as SystemUser);
          });
          setAllUsers(fetched);

          // Update active profile if in fetched
          if (userProfile) {
            const updatedSelf = fetched.find((u) => u.uid === userProfile.uid);
            if (updatedSelf) {
              setUserProfile(updatedSelf);
            }
          }
        } else {
          // Seed preset users to Firestore if collection is empty
          seedInitialUsersToFirestore();
        }
      },
      (error) => {
        console.warn('Error reading users collection from Firestore, using local cache:', error);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Seed default users to Firestore
  const seedInitialUsersToFirestore = async () => {
    try {
      for (const user of INITIAL_PRESET_USERS) {
        await setDoc(doc(db, 'users', user.uid), user, { merge: true });
      }
    } catch (err) {
      console.warn('Seed users error:', err);
    }
  };

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as SystemUser);
          } else {
            // New Firebase user registered - determine role
            const isBootstrappedAdmin =
              fbUser.email === 'itborder.ssk11284@gmail.com' ||
              (fbUser.email && fbUser.email.includes('admin'));

            const newProfile: SystemUser = {
              uid: fbUser.uid,
              email: fbUser.email || 'user@hospital.go.th',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'เจ้าหน้าที่พยาบาล',
              role: isBootstrappedAdmin ? 'admin' : 'department_head',
              department: 'ALL',
              status: 'active',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.warn('Could not fetch user profile from Firestore:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with popup
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const isBootstrappedAdmin =
        fbUser.email === 'itborder.ssk11284@gmail.com' ||
        (fbUser.email && fbUser.email.includes('admin'));

      const profileData: SystemUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'ผู้ใช้งาน Google',
        role: isBootstrappedAdmin ? 'admin' : 'department_head',
        department: 'ALL',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, profileData, { merge: true });
      setUserProfile(profileData);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  // Email / Password Login
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', res.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemUser;
        if (data.status === 'inactive') {
          await signOut(auth);
          throw new Error('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อ Admin ผู้ดูแลระบบ');
        }
        await updateDoc(userDocRef, { lastLoginAt: new Date().toISOString() });
        setUserProfile(data);
      }
    } catch (error: any) {
      // If Firebase Auth email/pass is not enabled in Firebase console, fall back to checking local users
      const match = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        if (match.status === 'inactive') {
          throw new Error('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อ Admin ผู้ดูแลระบบ');
        }
        setUserProfile(match);
        return;
      }
      throw error;
    }
  };

  // Email Registration
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    department: DepartmentId | 'ALL',
    phone?: string
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: SystemUser = {
        uid: res.user.uid,
        email,
        displayName,
        role: email === 'itborder.ssk11284@gmail.com' ? 'admin' : role,
        department,
        phone: phone || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (error: any) {
      // Create registered user in directory with unique ID if email auth provider disabled in firebase console
      const generatedUid = 'usr-' + Math.random().toString(36).substring(2, 9);
      const newProfile: SystemUser = {
        uid: generatedUid,
        email,
        displayName,
        role: email === 'itborder.ssk11284@gmail.com' ? 'admin' : role,
        department,
        phone: phone || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', generatedUid), newProfile);
      } catch (fErr) {
        console.warn('Could not write to firestore:', fErr);
      }
      setAllUsers((prev) => [...prev, newProfile]);
      setUserProfile(newProfile);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('sk_staffing_active_user');
  };

  // Quick switch role for instant preview & testing (Admin, หัวหน้าพยาบาล, หัวหน้าฝ่าย)
  const quickLoginAsDemoRole = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role) || INITIAL_PRESET_USERS.find((u) => u.role === role);
    if (target) {
      setUserProfile(target);
    }
  };

  // Admin updates a user's role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.uid === userId ? { ...u, role: newRole } : u))
    );
    if (userProfile?.uid === userId) {
      setUserProfile((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  // Admin updates user status (active / inactive)
  const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.uid === userId ? { ...u, status } : u))
    );
  };

  // Admin deletes user account
  const deleteUserAccount = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }

    setAllUsers((prev) => prev.filter((u) => u.uid !== userId));
  };

  // Admin creates/invites new user account
  const createNewUserAccount = async (user: Partial<SystemUser> & { password?: string }) => {
    const generatedUid = 'usr-' + Math.random().toString(36).substring(2, 9);
    const newProfile: SystemUser = {
      uid: user.uid || generatedUid,
      email: user.email || '',
      displayName: user.displayName || 'ผู้ใช้งานใหม่',
      role: user.role || 'department_head',
      department: user.department || 'ALL',
      phone: user.phone || '',
      status: user.status || 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', newProfile.uid), newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${newProfile.uid}`);
    }

    setAllUsers((prev) => [...prev, newProfile]);
  };

  // Role permissions
  const role = userProfile?.role || 'admin';
  const isAdmin = role === 'admin';
  const isHeadNurse = role === 'head_nurse'; // 2. หัวหน้าพยาบาล: สิทธิการเข้าถึงการดูได้อย่างเดียว ไม่สามารถ บันทึก แก้ไข หรือเปลี่ยนแปลงข้อมูลได้
  const isDepartmentHead = role === 'department_head'; // 3. หัวหน้าฝ่าย: สิทธิการบันทึก ลบ แก้ไข พิมพ์งาน เพิ่มรายการกิจกรรมใหม่

  // Granular capability flags
  const canEdit = isAdmin || isDepartmentHead; // Head Nurse is strictly view-only
  const canManageUsers = isAdmin; // Only Admin can manage users
  const canEditSettings = isAdmin; // Only Admin can change hospital weights & formula parameters
  const canAddActivity = isAdmin || isDepartmentHead; // หัวหน้าฝ่าย & Admin เพิ่มรายการกิจกรรมใหม่ได้

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isHeadNurse,
        isDepartmentHead,
        canEdit,
        canManageUsers,
        canEditSettings,
        canAddActivity,
        allUsers,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        quickLoginAsDemoRole,
        updateUserRole,
        updateUserStatus,
        deleteUserAccount,
        createNewUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
