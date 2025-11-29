import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VehicleRegistrationModal } from '../../components/VehicleRegistrationModal';
import { Header } from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Car, 
  CreditCard, 
  Clock, 
  Bell, 
  Calendar,
  Map,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  // local state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString();
  const ampm = (date: Date) => (date.getHours() >= 12 ? 'PM' : 'AM');

  const quickActions = [
    {
      icon: Car,
      title: 'Register Vehicle',
      description: 'Add a new vehicle to your account',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onClick: () => setShowVehicleModal(true)
    },
    {
      icon: Map,
      title: 'Parking Layout',
      description: 'View parking space availability',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      onClick: () => navigate('/parking-layout')
    },
    {
      icon: CreditCard,
      title: 'Payment History',
      description: 'View your payment history and receipts',
      color: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      onClick: () => alert('Payment history feature coming soon!')
    },
    {
      icon: Clock,
      title: 'Parking History',
      description: 'View your parking session history',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      onClick: () => alert('Parking history feature coming soon!')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your account notifications',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      onClick: () => alert('Notifications feature coming soon!')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="My Profile" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-500">👤</span>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Calendar size={18} className="text-gray-500" />
                <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  Member since
                </span>
              </div>
            </div>
          </div>

          {/* Current time card (styled) */}
          <div className="col-span-1">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg rounded-lg h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 p-2 rounded-md">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">Current time</h3>
                    <div className="text-xs text-white/70">Local</div>
                  </div>
                </div>
                <div className="text-xs text-white/80">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">{formatTime(currentTime)}</div>
                  <div className="text-sm text-white/80 mt-1">{formatDate(currentTime)}</div>
                </div>
                <div className="text-sm text-white/80 ml-4 flex flex-col items-end">
                  <div className="text-lg font-medium">{ampm(currentTime)}</div>
                  <div className="text-xs text-white/70 mt-2">Updated live</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">My Vehicles</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                <p className="text-sm text-gray-500">Registered vehicles</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Recent Sessions</h3>
                <div className="text-3xl font-bold text-teal-600 mb-2">0</div>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Parking Layout</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">Available</div>
                <p className="text-sm text-gray-500">View parking spaces</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} onClick={action.onClick} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center mx-auto mb-4`}>
                      <action.icon className={`${action.iconColor}`} size={28} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* My Vehicles Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Vehicles</h2>
            <Button variant="primary" icon={Car} size="sm">
              Add Vehicle
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles registered
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first vehicle to start using the parking system
              </p>
              <Button variant="primary" icon={Car} onClick={() => setShowVehicleModal(true)}>
                Register Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <VehicleRegistrationModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onSuccess={() => {
          alert('Vehicle registered successfully!');
        }}
      />
    </div>
  );
};