import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from localStorage
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('aponkhoj_user');
            const savedToken = localStorage.getItem('aponkhoj_token');
            
            console.log('📂 AuthContext: Loading from storage...');
            
            if (savedUser && savedToken) {
                const parsedUser = JSON.parse(savedUser);
                console.log('✅ AuthContext: User restored:', parsedUser);
                setUser(parsedUser);
                setToken(savedToken);
            } else {
                console.log('⚠️ AuthContext: No saved data found');
            }
        } catch (error) {
            console.error('❌ AuthContext Error:', error);
            localStorage.removeItem('aponkhoj_user');
            localStorage.removeItem('aponkhoj_token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, authToken) => {
        console.log('🔐 AuthContext: Login called with:', userData);

        const normalizedDistrict = userData.district || userData.location || '';
        const normalizedLocation = userData.location || normalizedDistrict;
        
        const userWithRole = {
            role: userData.role || 'user',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            district: normalizedDistrict,
            location: normalizedLocation,
            avatarUrl: userData.avatarUrl || '',
            id: userData.id,
            ...userData
        };
        
        console.log('💾 AuthContext: Storing user:', userWithRole);
        setUser(userWithRole);
        setToken(authToken);
        localStorage.setItem('aponkhoj_user', JSON.stringify(userWithRole));
        localStorage.setItem('aponkhoj_token', authToken);
        console.log('✅ AuthContext: User saved to localStorage');
    };

    const logout = () => {
        console.log('🚪 AuthContext: Logout called');
        setUser(null);
        setToken(null);
        localStorage.removeItem('aponkhoj_user');
        localStorage.removeItem('aponkhoj_token');
    };

    const updateUser = (partial) => {
        setUser(prev => {
            const updated = { ...prev, ...partial };
            localStorage.setItem('aponkhoj_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin',
            login,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}