import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileMinus, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye } from 'lucide-react';
import type { StudentTransfer, UserRole } from '../../../server/src/schema';

interface StudentTransferProps {
  userRole?: UserRole;
}

// Mock data
const mockTransfers: StudentTransfer[] = [
  {
    id: 1,
    student_id: 1,
    transfer_date: new Date('2024-02-15'),
    destination_school: 'SMAN 1 Jakarta',
    transfer_reason: 'Pindah domisili orang tua',
    letter_number: 'SM.003/II/2024',
    notes: 'Siswa pindah karena orang tua mutasi kerja',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    student_id: 3,
    transfer_date: new Date('2024-01-20'),
    destination_school: 'MAN 2 Bandung',
    transfer_reason: 'Alasan keluarga',
    letter_number: 'SM.001/I/2024',
    notes: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function StudentTransfer({ userRole }: StudentTransferProps) {
  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      setTransfers(mockTransfers);
    } catch (error) {
      console.error('Failed to load student transfers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const filteredTransfers = transfers.filter(transfer =>
    transfer.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destination_school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.transfer_reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: transfers.length,
    thisMonth: transfers.filter(t => {
      const now = new Date();
      return t.transfer_date.getMonth() === now.getMonth() && 
             t.transfer_date.getFullYear() === now.getFullYear();
    }).length,
    thisYear: transfers.filter(t => {
      const now = new Date();
      return t.transfer_date.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Surat Mutasi</h1>
          <p className="text-gray-600">Kelola data mutasi siswa</p>
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
                <p className="text-sm text-gray-600">Total Mutasi</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileMinus className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-orange-600">{stats.thisMonth}</p>
              </div>
              <FileMinus className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tahun Ini</p>
                <p className="text-2xl font-bold text-green-600">{stats.thisYear}</p>
              </div>
              <FileMinus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian Surat Mutasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari no. surat, sekolah tujuan, atau alasan..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Surat Mutasi ({filteredTransfers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Surat</TableHead>
                  <TableHead>ID Siswa</TableHead>
                  <TableHead>Tanggal Mutasi</TableHead>
                  <TableHead>Sekolah Tujuan</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer: StudentTransfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.letter_number}</TableCell>
                    <TableCell>{transfer.student_id}</TableCell>
                    <TableCell>{transfer.transfer_date.toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.destination_school}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{transfer.transfer_reason}</span>
                    </TableCell>
                    <TableCell>
                      {transfer.notes ? (
                        <span className="text-sm text-gray-600">{transfer.notes}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
          {filteredTransfers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? 'Tidak ada surat mutasi yang sesuai dengan pencarian'
                : 'Belum ada data surat mutasi'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}