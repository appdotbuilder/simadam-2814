import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import type { CertificatePickup, UserRole } from '../../../server/src/schema';

interface CertificatePickupProps {
  userRole?: UserRole;
}

// Mock data
const mockPickups: CertificatePickup[] = [
  {
    id: 1,
    student_id: 1,
    certificate_type: 'Ijazah MA',
    pickup_date: new Date('2024-03-15'),
    picked_by: 'Ahmad Fadhil Rahman',
    relationship: 'Siswa yang bersangkutan',
    id_card_number: '3271012345678901',
    notes: 'Diambil langsung oleh siswa',
    is_picked_up: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    student_id: 2,
    certificate_type: 'SKHUN',
    pickup_date: null,
    picked_by: null,
    relationship: null,
    id_card_number: null,
    notes: null,
    is_picked_up: false,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function CertificatePickup({ userRole }: CertificatePickupProps) {
  const [pickups, setPickups] = useState<CertificatePickup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadPickups = useCallback(async () => {
    setIsLoading(true);
    try {
      setPickups(mockPickups);
    } catch (error) {
      console.error('Failed to load certificate pickups:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = pickup.certificate_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pickup.picked_by && pickup.picked_by.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'picked' && pickup.is_picked_up) ||
                         (selectedStatus === 'not_picked' && !pickup.is_picked_up);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pickups.length,
    picked: pickups.filter(p => p.is_picked_up).length,
    notPicked: pickups.filter(p => !p.is_picked_up).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Pengambilan Ijazah</h1>
          <p className="text-gray-600">Kelola data pengambilan ijazah dan sertifikat</p>
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
              <span>Tambah Data</span>
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
                <p className="text-sm text-gray-600">Total Data</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Diambil</p>
                <p className="text-2xl font-bold text-green-600">{stats.picked}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Diambil</p>
                <p className="text-2xl font-bold text-orange-600">{stats.notPicked}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari jenis sertifikat atau nama pengambil..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="picked">Sudah Diambil</option>
                <option value="not_picked">Belum Diambil</option>
              </select>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
            }}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pickups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengambilan Ijazah ({filteredPickups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Siswa</TableHead>
                  <TableHead>Jenis Sertifikat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Ambil</TableHead>
                  <TableHead>Pengambil</TableHead>
                  <TableHead>Hubungan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPickups.map((pickup: CertificatePickup) => (
                  <TableRow key={pickup.id}>
                    <TableCell className="font-medium">{pickup.student_id}</TableCell>
                    <TableCell>{pickup.certificate_type}</TableCell>
                    <TableCell>
                      <Badge variant={pickup.is_picked_up ? 'default' : 'secondary'}>
                        <div className="flex items-center space-x-1">
                          {pickup.is_picked_up ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span>{pickup.is_picked_up ? 'Sudah Diambil' : 'Belum Diambil'}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pickup.pickup_date 
                        ? pickup.pickup_date.toLocaleDateString('id-ID')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{pickup.picked_by || '-'}</TableCell>
                    <TableCell>{pickup.relationship || '-'}</TableCell>
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
          {filteredPickups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Belum ada data pengambilan ijazah'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}