import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, User, ChevronLeft, Settings, Users, Eye, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AccessTypePage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [demoLoading, setDemoLoading] = React.useState<'staff' | 'user' | null>(null);

  const handleDemoLogin = async (userType: 'staff' | 'user') => {
    setDemoLoading(userType);

    try {
      const demoCredentials = userType === 'staff' 
        ? { email: 'staff@parkmeter.com', password: 'demo123' }
        : { email: 'user@parkmeter.com', password: 'demo123' };

      // Try to sign in first
      let { error } = await signIn(demoCredentials.email, demoCredentials.password);
      
      if (error && !error.message.includes('Supabase')) {
        // If login fails (account doesn't exist), create the demo account
        const { error: signUpError } = await signUp(demoCredentials.email, demoCredentials.password, userType);
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
      
      navigate(userType === 'staff' ? '/staff/dashboard' : '/user/dashboard');
    } catch (error: any) {
      console.error('Demo login failed:', error.message);
    } finally {
      setDemoLoading(null);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-blue-600">Access Type</span>
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        {/* Access Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Staff Login */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Shield className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">Staff Login</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Access administrative dashboard to manage parking registrations, verify vehicles, and monitor parking lot status.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <Settings size={16} className="text-blue-500" />
                    <span>Manage parking spaces</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users size={16} className="text-blue-500" />
                    <span>Verify registrations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Eye size={16} className="text-blue-500" />
                    <span>Security oversight</span>
                  </div>
                </div>

                <Button
                  variant="staff"
                  size="lg"
                  icon={Shield}
                  onClick={() => navigate('/auth/staff')}
                  className="w-full"
                >
                  Staff Access
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Play}
                  onClick={() => handleDemoLogin('staff')}
                  disabled={demoLoading === 'staff'}
                  className="w-full mt-2"
                >
                  {demoLoading === 'staff' ? 'Logging in...' : 'Try Staff Demo'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Login */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center">
                    <User className="text-teal-600" size={32} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">User Login</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Register your vehicle, check parking availability, and manage your parking registration details.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-teal-500" />
                    <span>Vehicle registration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Eye size={16} className="text-teal-500" />
                    <span>Check parking status</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings size={16} className="text-teal-500" />
                    <span>Manage profile</span>
                  </div>
                </div>

                <Button
                  variant="user"
                  size="lg"
                  icon={User}
                  onClick={() => navigate('/auth/user')}
                  className="w-full"
                >
                  User Access
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Play}
                  onClick={() => handleDemoLogin('user')}
                  disabled={demoLoading === 'user'}
                  className="w-full mt-2"
                >
                  {demoLoading === 'user' ? 'Logging in...' : 'Try User Demo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};