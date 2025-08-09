import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, GraduationCap, School, TrendingUp } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { DashboardStats } from '../../../server/src/schema';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    students_from_smp: 0,
    students_from_mts: 0,
    students_from_other: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      // Using mock data for demo since we don't have actual database
      const mockStats: DashboardStats = {
        total_students: 485,
        total_teachers: 32,
        students_from_smp: 180,
        students_from_mts: 165,
        students_from_other: 140
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      title: 'Total Siswa',
      value: stats.total_students,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Guru',
      value: stats.total_teachers,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Siswa dari SMP Darul Muttaqien',
      value: stats.students_from_smp,
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Siswa dari MTS',
      value: stats.students_from_mts,
      icon: School,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Siswa dari Sekolah Lain',
      value: stats.students_from_other,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
          <p className="text-gray-600">Ringkasan informasi sekolah MA Darul Muttaqien</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard SIMADAM</h1>
        <p className="text-gray-600">Ringkasan informasi sekolah MA Darul Muttaqien</p>
        <div className="mt-4 text-sm text-gray-500">
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} ${card.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Aktivitas Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Siswa baru terdaftar</p>
                  <p className="text-xs text-gray-500">5 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pembayaran SPP diterima</p>
                  <p className="text-xs text-gray-500">15 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Surat masuk baru</p>
                  <p className="text-xs text-gray-500">1 jam yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <School className="w-5 h-5 text-green-600" />
              <span>Informasi Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tahun Ajaran</span>
                <span className="text-sm font-medium">2024/2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Semester</span>
                <span className="text-sm font-medium">Ganjil</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status Sistem</span>
                <span className="text-sm font-medium text-green-600">🟢 Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Versi SIMADAM</span>
                <span className="text-sm font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">Hari ini, 00:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🏫 Selamat Datang di SIMADAM
            </h2>
            <p className="text-gray-600 mb-4">
              Sistem Informasi MA Darul Muttaqien - Platform digital untuk manajemen sekolah yang modern dan efisien
            </p>
            <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
              <p className="text-sm text-gray-700">
                "Pendidikan adalah senjata paling ampuh yang dapat Anda gunakan untuk mengubah dunia"
              </p>
              <p className="text-xs text-gray-500 mt-2">- Nelson Mandela</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}