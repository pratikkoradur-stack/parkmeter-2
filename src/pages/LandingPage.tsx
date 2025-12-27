import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Car, Shield, CheckCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

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

      const { error: signInError } = await signIn(demoCredentials.email, demoCredentials.password);

      if (signInError) {
        const { error: signUpError } = await signUp(demoCredentials.email, demoCredentials.password, userType);
        if (!signUpError) {
          await signIn(demoCredentials.email, demoCredentials.password);
        }
      }

      navigate(userType === 'staff' ? '/staff/dashboard' : '/user/dashboard');
    } catch {
      navigate(userType === 'staff' ? '/staff/dashboard' : '/user/dashboard');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-700 to-purple-700 text-white">
      
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-wide"
          >
            Park<span className="text-yellow-300">meter</span>
          </motion.h1>

          <motion.button
            onClick={() => navigate('/access-type')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold shadow-xl hover:shadow-2xl transition"
          >
            Get Started
          </motion.button>
        </div>
      </header>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full text-sm">
              <Shield size={18} />
              <span>Secure Parking Management</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Smart & Modern
              <span className="block text-yellow-300">
                Parking Experience 🚗
              </span>
            </h1>

            <p className="text-lg text-white/80">
              Register vehicles. Verify access. Manage security.
              Everything in one smooth dashboard.
            </p>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                icon={Car}
                onClick={() => navigate('/access-type')}
                className="text-base px-8 py-4 bg-white text-gray-900 hover:scale-105 transition shadow-lg"
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
                  className="flex-1 bg-white/20 backdrop-blur-md border-white/40 hover:bg-white/30"
                >
                  {demoLoading === 'staff' ? 'Loading...' : 'Staff Demo'}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  icon={Play}
                  onClick={() => handleDemoLogin('user')}
                  disabled={demoLoading === 'user'}
                  className="flex-1 bg-white/20 backdrop-blur-md border-white/40 hover:bg-white/30"
                >
                  {demoLoading === 'user' ? 'Loading...' : 'User Demo'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=800"
              className="rounded-2xl shadow-2xl border border-white/20"
            />

            <Card className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md">
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
          </motion.div>
        </div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          <Card className="bg-white/10 border-white/20 text-white hover:scale-105 transition shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Car size={24} />
                </div>
                <h3 className="text-lg font-semibold">Vehicle Registration</h3>
              </div>
              <p className="text-white/80">
                Register your vehicles and manage access seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white hover:scale-105 transition shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold">Real-time Verification</h3>
              </div>
              <p className="text-white/80">
                Instant verification for seamless parking flow.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white hover:scale-105 transition shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-semibold">Security Management</h3>
              </div>
              <p className="text-white/80">
                Smart insights + secure monitoring = peace of mind.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
