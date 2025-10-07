import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Shield, User, ChevronLeft, Play } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { userType } = useParams<{ userType: 'staff' | 'user' }>();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const isStaff = userType === 'staff';
  const role = userType || 'user';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Redirect based on user type
        navigate(isStaff ? '/staff/dashboard' : '/user/dashboard');
      } else {
        const { error } = await signUp(email, password, role);
        if (error) throw error;
        
        // After successful signup, redirect to login
        setIsLogin(true);
        setError('Account created successfully! Please sign in.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');

    try {
      const demoCredentials = isStaff 
        ? { email: 'staff@parkmeter.com', password: 'demo123' }
        : { email: 'user@parkmeter.com', password: 'demo123' };

      // Try to sign in first
      let { error } = await signIn(demoCredentials.email, demoCredentials.password);
      
      if (error && !error.message.includes('Supabase')) {
        // If login fails (account doesn't exist), create the demo account
        const { error: signUpError } = await signUp(demoCredentials.email, demoCredentials.password, role);
        if (!signUpError) {
          // After successful signup, sign in
          const { error: signInError } = await signIn(demoCredentials.email, demoCredentials.password);
          if (signInError && !signInError.message.includes('Supabase')) {
            throw signInError;
          }
        } else if (!signUpError.message.includes('Supabase')) {
          throw signUpError;
        }
      } else if (error && error.message.includes('Supabase')) {
        // If Supabase is not configured, navigate anyway for demo purposes
        console.log('Supabase not configured, navigating to demo dashboard');
      }
      
      navigate(isStaff ? '/staff/dashboard' : '/user/dashboard');
    } catch (error: any) {
      setError(`Demo login failed: ${error.message}`);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/access-type')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Access Selection
        </button>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isStaff ? 'bg-blue-100' : 'bg-teal-100'
              }`}>
                {isStaff ? (
                  <Shield className={`${isStaff ? 'text-blue-600' : 'text-teal-600'}`} size={32} />
                ) : (
                  <User className="text-teal-600" size={32} />
                )}
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isStaff ? 'Staff' : 'User'} {isLogin ? 'Login' : 'Sign Up'}
              </h1>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <Button
                type="submit"
                variant={isStaff ? 'staff' : 'user'}
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            {/* Demo Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={handleDemoLogin}
              variant="outline"
              size="lg"
              icon={Play}
              disabled={demoLoading}
              className="w-full"
            >
              {demoLoading ? 'Logging in...' : `Try ${isStaff ? 'Staff' : 'User'} Demo`}
            </Button>

            <div className="text-center space-y-4">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};