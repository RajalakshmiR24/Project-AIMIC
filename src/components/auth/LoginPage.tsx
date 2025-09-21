import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginCredentials } from "../../api/api";
import { decodeRoleFromToken, roleToPath } from "../../utils/jwt";

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginCredentials>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const role = await login(formData); // your AuthContext now returns role string

    const roleRoot = roleToPath(role); // "/doctor" | "/employee" | "/insurance"
    const fromPath = (location.state as any)?.from?.pathname as string | undefined;

    // only use `from` if it’s inside the same portal root for this role
    const isFromAllowed = !!fromPath && fromPath.startsWith(roleRoot);
    const target = isFromAllowed ? fromPath! : roleRoot;

    navigate(target, { replace: true });
  } catch (err: any) {
    setError(err.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const handleDemoLogin = async (role: "employee" | "doctor" | "insurance") => {
    const demo: Record<typeof role, LoginCredentials> = {
      employee: { email: "employee@mediclaim.com", password: "password123" },
      doctor: { email: "doctor@mediclaim.com", password: "password123" },
      insurance: { email: "insurance@mediclaim.com", password: "password123" },
    };
    // Auto-fill + submit for convenience
    setFormData(demo[role]);
    setTimeout(() => document.getElementById("login-submit")?.dispatchEvent(new Event("click", { bubbles: true })), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="w-16 h-16 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your MediClaim AI account</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Demo Accounts</h3>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleDemoLogin("employee")} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Employee
            </button>
            <button onClick={() => handleDemoLogin("doctor")} className="text-xs bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors">
              Doctor
            </button>
            <button onClick={() => handleDemoLogin("insurance")} className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Insurance
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember" name="remember" type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Protected by enterprise-grade security</p>
          <div className="flex justify-center space-x-4 mt-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">HIPAA</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">SOC 2</span>
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">ISO 27001</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
