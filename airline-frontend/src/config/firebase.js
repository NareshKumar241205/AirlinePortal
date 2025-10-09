// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'your-project-id';

// Initialize Firebase only if properly configured
let app = null;
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
  } else {
    console.warn('🚨 Firebase not configured - using demo mode for navigation testing');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

// Demo users for testing when Firebase is not configured
const DEMO_USERS = {
  'admin@demo.com': { 
    email: 'admin@demo.com', 
    role: 'super_admin', 
    firstName: 'Admin', 
    lastName: 'User',
    password: 'admin123'
  },
  'airline@demo.com': { 
    email: 'airline@demo.com', 
    role: 'airline_admin', 
    firstName: 'Airline', 
    lastName: 'Admin',
    password: 'airline123'
  },
  'crew@demo.com': { 
    email: 'crew@demo.com', 
    role: 'crew_member', 
    firstName: 'Crew', 
    lastName: 'Member',
    password: 'crew123'
  },
  'passenger@demo.com': { 
    email: 'passenger@demo.com', 
    role: 'passenger', 
    firstName: 'John', 
    lastName: 'Passenger',
    password: 'passenger123'
  }
};

// Authentication functions
export const firebaseAuth = {
  // Auth state change listener
  onAuthStateChanged: (callback) => {
    if (!isFirebaseConfigured) {
      // In demo mode, check if user was previously logged in
      const demoUser = JSON.parse(sessionStorage.getItem('demoUser') || 'null');
      setTimeout(() => callback(demoUser), 100);
      return () => {}; // Return unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
  },

  // Get current user data
  async getCurrentUserData() {
    if (!isFirebaseConfigured) {
      return JSON.parse(sessionStorage.getItem('demoUser') || 'null');
    }
    
    if (!auth.currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        return { id: auth.currentUser.uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },

  // Register new user
  async register(email, password, userData) {
    if (!isFirebaseConfigured) {
      // Demo mode registration
      console.log('🔧 Demo mode: Registration simulated for', email);
      const demoUser = {
        id: 'demo-' + Date.now(),
        email,
        ...userData,
        role: userData.role || 'passenger',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      sessionStorage.setItem('demoUser', JSON.stringify(demoUser));
      return { success: true, user: demoUser, message: 'Demo registration successful!' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      if (userData.firstName || userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
      }

      // Save additional user data to Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'customer',
        isActive: true,
        isVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return {
        success: true,
        user: {
          ...userDoc,
          id: user.uid
        }
      };
    } catch (error) {
      console.error('Firebase registration error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Login user
  async login(email, password) {
    if (!isFirebaseConfigured) {
      // Demo mode login
      console.log('🔧 Demo mode: Login attempted for', email);
      const demoUser = DEMO_USERS[email];
      
      if (demoUser && demoUser.password === password) {
        const userData = {
          id: 'demo-' + email.replace('@', '-').replace('.', '-'),
          ...demoUser,
          lastLogin: new Date().toISOString()
        };
        delete userData.password; // Remove password from stored data
        sessionStorage.setItem('demoUser', JSON.stringify(userData));
        console.log('✅ Demo login successful for', userData.role);
        return { success: true, user: userData, message: 'Demo login successful!' };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials. Try:\n- admin@demo.com / admin123\n- airline@demo.com / airline123\n- crew@demo.com / crew123\n- passenger@demo.com / passenger123' 
        };
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      let userData;
      if (userDoc.exists()) {
        userData = {
          id: user.uid,
          ...userDoc.data(),
          lastLogin: new Date().toISOString()
        };

        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        });
      } else {
        // Create user document if it doesn't exist (for existing Firebase users)
        userData = {
          id: user.uid,
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'customer',
          isActive: true,
          isVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', user.uid), userData);
      }

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Logout user
  async logout() {
    if (!isFirebaseConfigured) {
      // Demo mode logout
      sessionStorage.removeItem('demoUser');
      console.log('🔧 Demo mode: User logged out');
      return { success: true };
    }

    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Firebase logout error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Get current user data
  async getCurrentUserData() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return {
          id: user.uid,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Update Firebase Auth profile
      if (userData.firstName || userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...userData,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Change password
  async changePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Delete user account
  async deleteAccount() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete Firebase Auth user
      await deleteUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Get all users (admin function)
  async getAllUsers() {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Update user role (admin function)
  async updateUserRole(userId, newRole) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  },

  // Set up auth state listener
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Convert Firebase error codes to user-friendly messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/requires-recent-login': 'Please log in again to perform this action.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'default': 'An error occurred. Please try again.'
    };

    return errorMessages[errorCode] || errorMessages.default;
  }
};

export default app;