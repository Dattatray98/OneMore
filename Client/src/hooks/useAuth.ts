import { useState } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth, logout, user, token } = useAuthStore();

    const login = async (credentials: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.login(credentials);
            setAuth(data.token, data.user);
            return data;
        } catch (err: any) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.register(userData);
            // Optionally auto-login after register, but for now we just return
            return data;
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        register,
        logout,
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        error
    };
};
