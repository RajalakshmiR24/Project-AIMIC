import Cookies from 'js-cookie';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

const API_BASE_URL = 'https://api.mediclaim-ai.com'; // Replace with your actual API URL

class AuthService {
  private tokenKey = 'mediclaim_token';
  private userKey = 'mediclaim_user';

  // Simulate API calls - replace with actual API endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - replace with actual API call
    if (credentials.email === 'admin@mediclaim.com' && credentials.password === 'admin123') {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: credentials.email,
          name: 'John Doe',
          role: 'employee',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        expiresIn: 3600
      };
      return mockResponse;
    }
    
    // Role-based mock users
    const mockUsers = {
      'employee@aimic.com': { role: 'employee', name: 'Surendhar' },
      'hospital@aimic.com': { role: 'hospital', name: 'AIMIC Hospital' },
      'insurance@aimic.com': { role: 'insurance', name: 'AIMIC Insurance' }
    };
    
    const mockUser = mockUsers[credentials.email as keyof typeof mockUsers];
    if (mockUser && credentials.password === 'password123') {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: credentials.email,
          name: mockUser.name,
          role: mockUser.role as any,
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        expiresIn: 3600
      };
      return mockResponse;
    }
    
    throw new Error('Invalid email or password');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration - replace with actual API call
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      expiresIn: 3600
    };
    
    return mockResponse;
  }

  setToken(token: string): void {
    Cookies.set(this.tokenKey, token, { expires: 1 }); // 1 day
  }

  getToken(): string | null {
    return Cookies.get(this.tokenKey) || null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  removeToken(): void {
    Cookies.remove(this.tokenKey);
  }

  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // In a real app, you'd validate the JWT token
    // For now, just check if it exists
    return true;
  }
}

export const authService = new AuthService();