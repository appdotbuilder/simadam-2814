import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Printer, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  Student, 
  CreateStudentInput, 
  UpdateStudentInput, 
  UserRole, 
  Gender, 
  StudentOrigin 
} from '../../../server/src/schema';

interface StudentManagementProps {
  userRole?: UserRole;
}

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: 1,
    nis: '2024001',
    nisn: '1234567890',
    full_name: 'Ahmad Fadhil Rahman',
    gender: 'L',
    birth_place: 'Bogor',
    birth_date: new Date('2007-01-15'),
    address: 'Jl. Merdeka No. 10, Bogor',
    phone: '081234567890',
    parent_name: 'Budi Rahman',
    parent_phone: '081234567891',
    origin_school: 'smp_darul_muttaqien',
    entry_year: 2024,
    class_id: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    nis: '2024002',
    nisn: '1234567891',
    full_name: 'Siti Aisyah Putri',
    gender: 'P',
    birth_place: 'Jakarta',
    birth_date: new Date('2007-03-22'),
    address: 'Jl. Sudirman No. 25, Jakarta',
    phone: null,
    parent_name: 'Hendra Wijaya',
    parent_phone: '081234567892',
    origin_school: 'mts',
    entry_year: 2024,
    class_id: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    nis: '2024003',
    nisn: '1234567892',
    full_name: 'Muhammad Rizki Pratama',
    gender: 'L',
    birth_place: 'Bandung',
    birth_date: new Date('2006-12-10'),
    address: 'Jl. Asia Afrika No. 100, Bandung',
    phone: '081234567893',
    parent_name: 'Dedi Pratama',
    parent_phone: '081234567894',
    origin_school: 'luar_smp_darul_muttaqien',
    entry_year: 2023,
    class_id: 2,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function StudentManagement({ userRole }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const [newStudent, setNewStudent] = useState<CreateStudentInput>({
    nis: '',
    nisn: null,
    full_name: '',
    gender: 'L',
    birth_place: '',
    birth_date: new Date(),
    address: '',
    phone: null,
    parent_name: '',
    parent_phone: null,
    origin_school: 'smp_darul_muttaqien',
    entry_year: new Date().getFullYear(),
    class_id: null,
    is_active: true
  });

  const canEdit = userRole === 'admin';

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using mock data - in real implementation: await trpc.students.getAll.query();
      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.includes(searchTerm) ||
        (student.nisn && student.nisn.includes(searchTerm))
      );
    }

    if (selectedOrigin !== 'all') {
      filtered = filtered.filter(student => student.origin_school === selectedOrigin);
    }

    if (selectedGrade !== 'all') {
      const currentYear = new Date().getFullYear();
      const gradeYear = currentYear - parseInt(selectedGrade) + 1;
      filtered = filtered.filter(student => student.entry_year === gradeYear);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedOrigin, selectedGrade]);

  const handleAddStudent = async () => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      // Mock API call - in real implementation: await trpc.students.create.mutate(newStudent);
      const student: Student = {
        id: students.length + 1,
        ...newStudent,
        created_at: new Date(),
        updated_at: new Date()
      };
      setStudents(prev => [...prev, student]);
      setShowAddDialog(false);
      resetNewStudent();
    } catch (error) {
      console.error('Failed to create student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewStudent = () => {
    setNewStudent({
      nis: '',
      nisn: null,
      full_name: '',
      gender: 'L',
      birth_place: '',
      birth_date: new Date(),
      address: '',
      phone: null,
      parent_name: '',
      parent_phone: null,
      origin_school: 'smp_darul_muttaqien',
      entry_year: new Date().getFullYear(),
      class_id: null,
      is_active: true
    });
  };

  const getOriginLabel = (origin: StudentOrigin) => {
    switch (origin) {
      case 'smp_darul_muttaqien':
        return 'SMP Darul Muttaqien';
      case 'mts':
        return 'MTS';
      case 'luar_smp_darul_muttaqien':
        return 'Luar SMP Darul Muttaqien';
      default:
        return origin;
    }
  };

  const getOriginColor = (origin: StudentOrigin) => {
    switch (origin) {
      case 'smp_darul_muttaqien':
        return 'bg-blue-100 text-blue-800';
      case 'mts':
        return 'bg-green-100 text-green-800';
      case 'luar_smp_darul_muttaqien':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Data Siswa</h1>
          <p className="text-gray-600">Kelola data siswa MA Darul Muttaqien</p>
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Siswa Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nis">NIS *</Label>
                      <Input
                        id="nis"
                        value={newStudent.nis}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, nis: e.target.value }))
                        }
                        placeholder="Nomor Induk Siswa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nisn">NISN</Label>
                      <Input
                        id="nisn"
                        value={newStudent.nisn || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, nisn: e.target.value || null }))
                        }
                        placeholder="Nomor Induk Siswa Nasional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap *</Label>
                    <Input
                      id="full_name"
                      value={newStudent.full_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewStudent(prev => ({ ...prev, full_name: e.target.value }))
                      }
                      placeholder="Nama lengkap siswa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin *</Label>
                      <Select
                        value={newStudent.gender}
                        onValueChange={(value: Gender) =>
                          setNewStudent(prev => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_place">Tempat Lahir *</Label>
                      <Input
                        id="birth_place"
                        value={newStudent.birth_place}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, birth_place: e.target.value }))
                        }
                        placeholder="Tempat lahir"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={newStudent.birth_date.toISOString().split('T')[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewStudent(prev => ({ ...prev, birth_date: new Date(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat *</Label>
                    <Input
                      id="address"
                      value={newStudent.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewStudent(prev => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="Alamat lengkap"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_name">Nama Orang Tua *</Label>
                      <Input
                        id="parent_name"
                        value={newStudent.parent_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, parent_name: e.target.value }))
                        }
                        placeholder="Nama orang tua/wali"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_phone">No. HP Orang Tua</Label>
                      <Input
                        id="parent_phone"
                        value={newStudent.parent_phone || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, parent_phone: e.target.value || null }))
                        }
                        placeholder="Nomor HP orang tua"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin_school">Asal Sekolah *</Label>
                      <Select
                        value={newStudent.origin_school}
                        onValueChange={(value: StudentOrigin) =>
                          setNewStudent(prev => ({ ...prev, origin_school: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smp_darul_muttaqien">SMP Darul Muttaqien</SelectItem>
                          <SelectItem value="mts">MTS</SelectItem>
                          <SelectItem value="luar_smp_darul_muttaqien">Luar SMP Darul Muttaqien</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry_year">Tahun Masuk *</Label>
                      <Input
                        id="entry_year"
                        type="number"
                        value={newStudent.entry_year}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewStudent(prev => ({ ...prev, entry_year: parseInt(e.target.value) || new Date().getFullYear() }))
                        }
                        min="2000"
                        max="2030"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddStudent} disabled={isLoading}>
                      {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dari SMP DM</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.origin_school === 'smp_darul_muttaqien').length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dari MTS</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.origin_school === 'mts').length}
                </p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dari Luar</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.origin_school === 'luar_smp_darul_muttaqien').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter & Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama, NIS, atau NISN..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Asal Sekolah</Label>
              <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Asal Sekolah</SelectItem>
                  <SelectItem value="smp_darul_muttaqien">SMP Darul Muttaqien</SelectItem>
                  <SelectItem value="mts">MTS</SelectItem>
                  <SelectItem value="luar_smp_darul_muttaqien">Luar SMP Darul Muttaqien</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tingkat</SelectItem>
                  <SelectItem value="1">Kelas X</SelectItem>
                  <SelectItem value="2">Kelas XI</SelectItem>
                  <SelectItem value="3">Kelas XII</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedOrigin('all');
                setSelectedGrade('all');
              }}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Asal Sekolah</TableHead>
                  <TableHead>Tahun Masuk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.nis}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.nisn}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.gender === 'L' ? 'default' : 'secondary'}>
                        {student.gender === 'L' ? 'L' : 'P'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOriginColor(student.origin_school)}>
                        {getOriginLabel(student.origin_school)}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.entry_year}</TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? 'default' : 'destructive'}>
                        {student.is_active ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowEditDialog(true);
                              }}
                            >
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
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedOrigin !== 'all' || selectedGrade !== 'all' 
                ? 'Tidak ada siswa yang sesuai dengan filter'
                : 'Belum ada data siswa'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Siswa</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">NIS</Label>
                  <p className="font-medium">{selectedStudent.nis}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">NISN</Label>
                  <p className="font-medium">{selectedStudent.nisn || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                  <p className="font-medium">{selectedStudent.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Jenis Kelamin</Label>
                  <p className="font-medium">{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tempat Lahir</Label>
                  <p className="font-medium">{selectedStudent.birth_place}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Lahir</Label>
                  <p className="font-medium">{selectedStudent.birth_date.toLocaleDateString('id-ID')}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                  <p className="font-medium">{selectedStudent.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">No. HP Siswa</Label>
                  <p className="font-medium">{selectedStudent.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama Orang Tua</Label>
                  <p className="font-medium">{selectedStudent.parent_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">No. HP Orang Tua</Label>
                  <p className="font-medium">{selectedStudent.parent_phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Asal Sekolah</Label>
                  <p className="font-medium">{getOriginLabel(selectedStudent.origin_school)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tahun Masuk</Label>
                  <p className="font-medium">{selectedStudent.entry_year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className="font-medium">{selectedStudent.is_active ? 'Aktif' : 'Non-Aktif'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}