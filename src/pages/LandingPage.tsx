import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Car, Shield, CheckCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [demoLoading, setDemoLoading] = React.useState<'staff' | 'user' | null>(null);

  const handleDemoLogin = async (userType: 'staff' | 'user') => {
    setDemoLoading(userType);

    try {
      const demoCredentials = userType === 'staff' 
        ? { email: 'staff@parkmeter.com', password: 'demo123' }
        : { email: 'user@parkmeter.com', password: 'demo123' };

      const { error } = await signIn(demoCredentials.email, demoCredentials.password);
      if (error) {
        // If demo account doesn't exist, create it
        const { error: signUpError } = await signUp(demoCredentials.email, demoCredentials.password, userType);
        if (!signUpError) {
          await signIn(demoCredentials.email, demoCredentials.password);
        }
      }
      navigate(userType === 'staff' ? '/staff/dashboard' : '/user/dashboard');
    } catch (error: any) {
      console.error('Demo login failed:', error);
    } finally {
      setDemoLoading(null);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-gray-900">Park</span>
            <span className="text-blue-600">meter</span>
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <Shield size={16} />
              <span>Secure Parking Management</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Park<span className="text-blue-600">meter</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Smart parking registration and verification system. Ensure registered vehicles get priority access while managing unauthorized parking efficiently.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                icon={Car}
                onClick={() => navigate('/access-type')}
                className="text-base px-8 py-4"
              >
                Get Started
              </Button>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="md"
                  icon={Play}
                  onClick={() => handleDemoLogin('staff')}
                  disabled={demoLoading === 'staff'}
                  className="flex-1"
                >
                  {demoLoading === 'staff' ? 'Loading...' : 'Staff Demo'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={Play}
                  onClick={() => handleDemoLogin('user')}
                  disabled={demoLoading === 'user'}
                  className="flex-1"
                >
                  {demoLoading === 'user' ? 'Loading...' : 'User Demo'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern parking garage"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              
              {/* Overlay Badge */}
              <Card className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">100%</div>
                      <div className="text-sm text-gray-600">Verified Access</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Registration</h3>
              </div>
              <p className="text-gray-600">Register your vehicles and manage parking access with ease.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Real-time Verification</h3>
              </div>
              <p className="text-gray-600">Instant verification of registered vehicles for seamless access.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Management</h3>
              </div>
              <p className="text-gray-600">Monitor and manage parking lot security with comprehensive oversight.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};