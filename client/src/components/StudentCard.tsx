import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IdCard, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import type { StudentCard as StudentCardType, UserRole } from '../../../server/src/schema';

interface StudentCardProps {
  userRole?: UserRole;
}

// Mock data
const mockCards: StudentCardType[] = [
  {
    id: 1,
    student_id: 1,
    card_number: 'SC2024001',
    issue_date: new Date('2024-01-15'),
    expiry_date: new Date('2025-01-15'),
    is_active: true,
    notes: 'Kartu baru untuk tahun ajaran 2024/2025',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    student_id: 2,
    card_number: 'SC2024002',
    issue_date: new Date('2024-01-20'),
    expiry_date: new Date('2025-01-20'),
    is_active: true,
    notes: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    student_id: 3,
    card_number: 'SC2023003',
    issue_date: new Date('2023-12-10'),
    expiry_date: new Date('2024-12-10'),
    is_active: false,
    notes: 'Kartu hilang, perlu penggantian',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function StudentCard({ userRole }: StudentCardProps) {
  const [cards, setCards] = useState<StudentCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      setCards(mockCards);
    } catch (error) {
      console.error('Failed to load student cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.student_id.toString().includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && card.is_active) ||
                         (selectedStatus === 'inactive' && !card.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const isExpiringSoon = (expiryDate: Date) => {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate: Date) => {
    const now = new Date();
    return expiryDate < now;
  };

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.is_active).length,
    inactive: cards.filter(c => !c.is_active).length,
    expiringSoon: cards.filter(c => c.is_active && isExpiringSoon(c.expiry_date)).length,
    expired: cards.filter(c => c.is_active && isExpired(c.expiry_date)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🆔 Kartu Pelajar</h1>
          <p className="text-gray-600">Kelola kartu pelajar siswa</p>
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
              <span>Tambah Kartu</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kartu</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <IdCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Aktif</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <IdCard className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Segera Kadaluarsa</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
                placeholder="Cari nomor kartu atau ID siswa..."
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
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
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

      {/* Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kartu Pelajar ({filteredCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Kartu</TableHead>
                  <TableHead>ID Siswa</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead>Tanggal Kadaluarsa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((card: StudentCardType) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.card_number}</TableCell>
                    <TableCell>{card.student_id}</TableCell>
                    <TableCell>{card.issue_date.toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div>
                        <p>{card.expiry_date.toLocaleDateString('id-ID')}</p>
                        {card.is_active && isExpiringSoon(card.expiry_date) && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Segera Kadaluarsa
                          </Badge>
                        )}
                        {card.is_active && isExpired(card.expiry_date) && (
                          <Badge variant="destructive" className="mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Kadaluarsa
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={card.is_active ? 'default' : 'secondary'}>
                        <div className="flex items-center space-x-1">
                          {card.is_active ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          <span>{card.is_active ? 'Aktif' : 'Non-Aktif'}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {card.notes ? (
                        <span className="text-sm text-gray-600">{card.notes}</span>
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
          {filteredCards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tidak ada kartu yang sesuai dengan filter'
                : 'Belum ada data kartu pelajar'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}