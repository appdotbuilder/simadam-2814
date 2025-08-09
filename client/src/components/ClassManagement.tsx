import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye } from 'lucide-react';
import type { Class, UserRole } from '../../../server/src/schema';

interface ClassManagementProps {
  userRole?: UserRole;
}

// Mock data
const mockClasses: Class[] = [
  {
    id: 1,
    name: 'X IPA 1',
    grade: 1,
    academic_year: '2024/2025',
    homeroom_teacher_id: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'X IPA 2',
    grade: 1,
    academic_year: '2024/2025',
    homeroom_teacher_id: 2,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'XI IPA 1',
    grade: 2,
    academic_year: '2024/2025',
    homeroom_teacher_id: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function ClassManagement({ userRole }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      setClasses(mockClasses);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.academic_year.includes(searchTerm)
  );

  const getGradeName = (grade: number) => {
    switch (grade) {
      case 1: return 'Kelas X';
      case 2: return 'Kelas XI';
      case 3: return 'Kelas XII';
      default: return `Kelas ${grade}`;
    }
  };

  const stats = {
    total: classes.length,
    grade1: classes.filter(c => c.grade === 1).length,
    grade2: classes.filter(c => c.grade === 2).length,
    grade3: classes.filter(c => c.grade === 3).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏫 Penempatan Kelas</h1>
          <p className="text-gray-600">Kelola kelas dan penempatan siswa</p>
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
              <span>Tambah Kelas</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kelas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kelas X</p>
                <p className="text-2xl font-bold text-green-600">{stats.grade1}</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kelas XI</p>
                <p className="text-2xl font-bold text-purple-600">{stats.grade2}</p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kelas XII</p>
                <p className="text-2xl font-bold text-orange-600">{stats.grade3}</p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama kelas atau tahun ajaran..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas ({filteredClasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls: Class) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getGradeName(cls.grade)}
                      </Badge>
                    </TableCell>
                    <TableCell>{cls.academic_year}</TableCell>
                    <TableCell>
                      {cls.homeroom_teacher_id ? (
                        <span className="text-blue-600">Guru #{cls.homeroom_teacher_id}</span>
                      ) : (
                        <span className="text-gray-400">Belum ditentukan</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.is_active ? 'default' : 'destructive'}>
                        {cls.is_active ? 'Aktif' : 'Non-Aktif'}
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
          {filteredClasses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Tidak ada kelas yang sesuai dengan pencarian' : 'Belum ada data kelas'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}