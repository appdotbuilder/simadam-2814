import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { RunningText } from '@/components/RunningText';
import { Dashboard } from '@/components/Dashboard';
import { SchoolProfile } from '@/components/SchoolProfile';
import { StudentManagement } from '@/components/StudentManagement';
import { SppPayment } from '@/components/SppPayment';
import { TeacherManagement } from '@/components/TeacherManagement';
import { ClassManagement } from '@/components/ClassManagement';
import { LetterManagement } from '@/components/LetterManagement';
import { CertificatePickup } from '@/components/CertificatePickup';
import { StudentTransfer } from '@/components/StudentTransfer';
import { StudentCard } from '@/components/StudentCard';
import { BackgroundSettings } from '@/components/BackgroundSettings';
import { Login } from '@/components/Login';
import { trpc } from '@/utils/trpc';
import type { User, BackgroundSettings as Background } from '../../server/src/schema';

type Module = 
  | 'dashboard'
  | 'profile'
  | 'students'
  | 'spp-payment'
  | 'teachers'
  | 'classes'
  | 'letters'
  | 'certificate-pickup'
  | 'student-transfer'
  | 'student-card'
  | 'background-settings';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function App() {
  const [currentModule, setCurrentModule] = useState<Module>('dashboard');
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeBackground, setActiveBackground] = useState<Background | null>(null);

  // Load active background
  const loadActiveBackground = useCallback(async () => {
    try {
      const background = await trpc.backgroundSettings.getActive.query();
      setActiveBackground(background);
    } catch (error) {
      console.error('Failed to load active background:', error);
    }
  }, []);

  useEffect(() => {
    loadActiveBackground();
  }, [loadActiveBackground]);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
  };

  const handleLogout = async () => {
    try {
      await trpc.auth.logout.mutate();
      setAuth({ user: null, isAuthenticated: false });
      setCurrentModule('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleModuleChange = (module: Module) => {
    setCurrentModule(module);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <SchoolProfile userRole={auth.user?.role} />;
      case 'students':
        return <StudentManagement userRole={auth.user?.role} />;
      case 'spp-payment':
        return <SppPayment userRole={auth.user?.role} />;
      case 'teachers':
        return <TeacherManagement userRole={auth.user?.role} />;
      case 'classes':
        return <ClassManagement userRole={auth.user?.role} />;
      case 'letters':
        return <LetterManagement userRole={auth.user?.role} />;
      case 'certificate-pickup':
        return <CertificatePickup userRole={auth.user?.role} />;
      case 'student-transfer':
        return <StudentTransfer userRole={auth.user?.role} />;
      case 'student-card':
        return <StudentCard userRole={auth.user?.role} />;
      case 'background-settings':
        return auth.user?.role === 'admin' ? (
          <BackgroundSettings onBackgroundChange={loadActiveBackground} />
        ) : (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600">Akses Ditolak</h2>
            <p className="text-gray-600 mt-2">Anda tidak memiliki izin untuk mengakses pengaturan ini.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: activeBackground?.file_path 
            ? `url(${activeBackground.file_path})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: activeBackground?.file_path 
          ? `url(${activeBackground.file_path})` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      
      <div className="relative z-10">
        {/* Running Text */}
        <RunningText />
        
        {/* Header */}
        <Header 
          user={auth.user} 
          onLogout={handleLogout} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            currentModule={currentModule}
            setCurrentModule={handleModuleChange}
            userRole={auth.user?.role}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          
          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-4`}>
            <div className="container mx-auto px-6 py-6">
              {renderModule()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;