import { cn } from './utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  User, 
  Users, 
  CreditCard, 
  UserCheck, 
  FileText, 
  GraduationCap, 
  UsersIcon,
  Building,
  FileMinus,
  IdCard,
  Palette,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { UserRole } from '../../../server/src/schema';

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

interface SidebarProps {
  currentModule: Module;
  setCurrentModule: (module: Module) => void;
  userRole?: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Beranda', icon: Home, adminOnly: false },
  { id: 'profile', label: 'Profil Sekolah', icon: Building, adminOnly: false },
  { id: 'students', label: 'Data Siswa', icon: Users, adminOnly: false },
  { id: 'spp-payment', label: 'Pembayaran SPP', icon: CreditCard, adminOnly: false },
  { id: 'teachers', label: 'Data Guru', icon: UsersIcon, adminOnly: false },
  { id: 'classes', label: 'Penempatan Kelas', icon: UserCheck, adminOnly: false },
  { id: 'letters', label: 'Surat Keluar Masuk', icon: FileText, adminOnly: false },
  { id: 'certificate-pickup', label: 'Pengambilan Ijazah', icon: GraduationCap, adminOnly: false },
  { id: 'student-transfer', label: 'Surat Mutasi', icon: FileMinus, adminOnly: false },
  { id: 'student-card', label: 'Kartu Pelajar', icon: IdCard, adminOnly: false },
  { id: 'background-settings', label: 'Ganti Background', icon: Palette, adminOnly: true },
];

export function Sidebar({ currentModule, setCurrentModule, userRole, isOpen, setIsOpen }: SidebarProps) {
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-20 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          variant="outline"
          className="rounded-full w-6 h-6 p-0 bg-white shadow-md border-gray-300"
        >
          {isOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        {isOpen ? (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Menu Navigasi</h2>
            <p className="text-xs text-gray-600 mt-1">SIMADAM</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  !isOpen && "justify-center px-0"
                )}
                onClick={() => setCurrentModule(item.id as Module)}
              >
                <Icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                {isOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">MA Darul Muttaqien</p>
            <p className="text-xs text-gray-400 mt-1">© 2024 SIMADAM</p>
          </div>
        </div>
      )}
    </div>
  );
}