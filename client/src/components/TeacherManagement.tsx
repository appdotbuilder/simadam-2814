import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye } from 'lucide-react';
import type { Teacher, UserRole } from '../../../server/src/schema';

interface TeacherManagementProps {
  userRole?: UserRole;
}

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: 1,
    nip: '19850101123456',
    full_name: 'Dr. Ahmad Solihin, M.Pd.',
    gender: 'L',
    birth_place: 'Jakarta',
    birth_date: new Date('1985-01-01'),
    address: 'Jl. Pendidikan No. 1, Bogor',
    phone: '081234567890',
    email: 'ahmad.solihin@madm.sch.id',
    subject: 'Bahasa Arab',
    user_id: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    nip: '19870315234567',
    full_name: 'Siti Nurhalimah, S.Pd.',
    gender: 'P',
    birth_place: 'Bandung',
    birth_date: new Date('1987-03-15'),
    address: 'Jl. Guru No. 15, Bogor',
    phone: '081234567891',
    email: 'siti.nurhalimah@madm.sch.id',
    subject: 'Matematika',
    user_id: 2,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function TeacherManagement({ userRole }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.nip && teacher.nip.includes(searchTerm)) ||
    (teacher.subject && teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍🏫 Data Guru</h1>
          <p className="text-gray-600">Kelola data guru MA Darul Muttaqien</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
          {canEdit && (
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Guru</p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Guru Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {teachers.filter(t => t.is_active).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Punya Akun User</p>
                <p className="text-2xl font-bold text-purple-600">
                  {teachers.filter(t => t.user_id).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian Guru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, NIP, atau mata pelajaran..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Guru ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher: Teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.nip}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{teacher.full_name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.gender === 'L' ? 'default' : 'secondary'}>
                        {teacher.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{teacher.subject || '-'}</TableCell>
                    <TableCell>{teacher.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.is_active ? 'default' : 'destructive'}>
                        {teacher.is_active ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Tidak ada guru yang sesuai dengan pencarian' : 'Belum ada data guru'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}