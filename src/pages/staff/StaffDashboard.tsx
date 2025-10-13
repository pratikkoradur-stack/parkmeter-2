import React, { useState, useEffect } from 'react';
import { CameraScanner } from '../../components/CameraScanner';
import { VehicleRegistrationModal } from '../../components/VehicleRegistrationModal';
import { Header } from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  Car, 
  Users, 
  Shield,
  BarChart3,
  Database,
  Layout,
  Bell
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScanText, setLastScanText] = useState('');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [initialPlate, setInitialPlate] = useState<string | undefined>(undefined);

  const quickActions = [
    { icon: Plus, label: 'Add Vehicle', color: 'bg-blue-600 hover:bg-blue-700', onClick: () => {} },
    { icon: Search, label: 'Scan Number Plate', color: 'bg-green-500 hover:bg-green-600', onClick: () => setScannerOpen(true) },
    { icon: FileText, label: 'Generate Report', color: 'bg-purple-600 hover:bg-purple-700', onClick: () => {} },
    { icon: AlertTriangle, label: 'View Violations', color: 'bg-orange-600 hover:bg-orange-700', onClick: () => {} }
  ];

  const managementCards = [
    {
      icon: Car,
      title: 'Vehicle Registration',
      description: 'Register new vehicles and manage existing registrations',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users, staff, and access permissions',
      color: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      icon: Shield,
      title: 'Security & Monitoring',
      description: 'Monitor parking lot security and violations',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'View parking statistics and generate reports',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const toolCards = [
    {
      icon: Search,
      title: 'Number Plate Scanner',
      description: 'Scan and verify vehicle number plates',
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Database,
      title: 'Database Management',
      description: 'Manage vehicle database and records',
      color: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      icon: Layout,
      title: 'Parking Layout',
      description: 'View and manage parking space layout',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage alerts and system notifications',
      color: 'bg-teal-50',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Staff Dashboard" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Staff Portal
            </h1>
            <p className="text-gray-600 text-lg">
              Comprehensive parking management system with full administrative access
            </p>
          </div>
          
          {/* Current Time Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-1">Current Time (IST)</div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(currentTime)}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Last Scan Result */}
        {lastScanText && (
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Last Scan Result</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{lastScanText}</pre>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="lg"
                icon={action.icon}
                className={`${action.color} text-white justify-start p-4 h-auto`}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {managementCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className={`${card.iconColor}`} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {toolCards.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mx-auto mb-4`}>
                  <tool.icon className={`${tool.iconColor}`} size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <CameraScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onResult={({ raw, plate }) => {
          setLastScanText(raw);
          setScannerOpen(false);
          if (plate) {
            setInitialPlate(plate);
            setVehicleModalOpen(true);
          } else {
            alert('Scanned text:\n' + raw + '\n\nCould not confidently extract a plate.');
          }
        }}
      />

      <VehicleRegistrationModal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        initialPlate={initialPlate}
        onSuccess={() => {
          alert('Vehicle registered from scan!');
        }}
      />
    </div>
  );
};
