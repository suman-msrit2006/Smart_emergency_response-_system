import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authService } from '../services/authService';
import socketService from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const savedProfile = localStorage.getItem('userProfile');
      
      // Merge current user with saved profile
      let mergedUser = currentUser;
      if (currentUser) {
        // Split name if it exists in currentUser
        const nameParts = currentUser.name ? currentUser.name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          mergedUser = {
            ...currentUser,
            firstName: profile.firstName,
            lastName: profile.lastName,
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
          };
        } else {
          // Initialize profile data from currentUser if no saved profile
          mergedUser = {
            ...currentUser,
            firstName: firstName,
            lastName: lastName,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            role: currentUser.role || '',
          };
        }
      }
      
      setUser(mergedUser);
      
      if (mergedUser && authService.isAuthenticated()) {
        socketService.connect();
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for profile updates from localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userProfile' && e.newValue) {
        const profile = JSON.parse(e.newValue);
        setUser(prev => ({
          ...prev,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const userData = response.data.user;
    
    // Split name for firstName and lastName
    const nameParts = userData.name ? userData.name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const enrichedUser = {
      ...userData,
      firstName,
      lastName,
      phone: userData.phone || '',
      role: userData.role || '',
    };
    
    setUser(enrichedUser);
    socketService.connect();
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const registeredUser = response.data.user;
    
    // Split name for firstName and lastName
    const nameParts = registeredUser.name ? registeredUser.name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const enrichedUser = {
      ...registeredUser,
      firstName,
      lastName,
      phone: registeredUser.phone || '',
      role: registeredUser.role || '',
    };
    
    setUser(enrichedUser);
    socketService.connect();
    return response;
  };

  const logout = () => {
    authService.logout();
    socketService.disconnect();
    setUser(null);
    // Clear profile data on logout
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
  };

  // Update user profile in state and localStorage
  const updateUserProfile = (profileData) => {
    const updatedUser = {
      ...user,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      name: `${profileData.firstName} ${profileData.lastName}`,
      email: profileData.email,
      phone: profileData.phone,
      role: profileData.role,
    };
    
    setUser(updatedUser);
    
    // Save to localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(profileData));
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
