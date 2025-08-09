import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Download, Upload, Printer, Edit, Trash2, Eye, ArrowDown, ArrowUp } from 'lucide-react';
import type { Letter, UserRole, LetterType } from '../../../server/src/schema';

interface LetterManagementProps {
  userRole?: UserRole;
}

// Mock data
const mockLetters: Letter[] = [
  {
    id: 1,
    letter_number: 'SM.001/III/2024',
    letter_type: 'masuk',
    subject: 'Undangan Rapat Koordinasi Pendidikan',
    sender: 'Dinas Pendidikan Kota Bogor',
    recipient: null,
    letter_date: new Date('2024-03-01'),
    received_date: new Date('2024-03-02'),
    description: 'Undangan untuk menghadiri rapat koordinasi pendidikan tingkat kota',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    letter_number: 'SK.002/III/2024',
    letter_type: 'keluar',
    subject: 'Permohonan Izin Kegiatan Study Tour',
    sender: null,
    recipient: 'Dinas Pendidikan Provinsi Jawa Barat',
    letter_date: new Date('2024-03-10'),
    received_date: null,
    description: 'Permohonan izin untuk melaksanakan kegiatan study tour siswa kelas XII',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export function LetterManagement({ userRole }: LetterManagementProps) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const loadLetters = useCallback(async () => {
    setIsLoading(true);
    try {
      setLetters(mockLetters);
    } catch (error) {
      console.error('Failed to load letters:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = letter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         letter.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (letter.sender && letter.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (letter.recipient && letter.recipient.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || letter.letter_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: LetterType) => {
    return type === 'masuk' ? 'Surat Masuk' : 'Surat Keluar';
  };

  const getTypeColor = (type: LetterType) => {
    return type === 'masuk' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getTypeIcon = (type: LetterType) => {
    return type === 'masuk' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />;
  };

  const stats = {
    total: letters.length,
    masuk: letters.filter(l => l.letter_type === 'masuk').length,
    keluar: letters.filter(l => l.letter_type === 'keluar').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Surat Keluar Masuk</h1>
          <p className="text-gray-600">Kelola surat masuk dan surat keluar sekolah</p>
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
              <span>Tambah Surat</span>
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
                <p className="text-sm text-gray-600">Total Surat</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Surat Masuk</p>
                <p className="text-2xl font-bold text-green-600">{stats.masuk}</p>
              </div>
              <ArrowDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Surat Keluar</p>
                <p className="text-2xl font-bold text-blue-600">{stats.keluar}</p>
              </div>
              <ArrowUp className="w-8 h-8 text-blue-600" />
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
                placeholder="Cari nomor surat, perihal, atau pengirim..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Semua Jenis Surat</option>
                <option value="masuk">Surat Masuk</option>
                <option value="keluar">Surat Keluar</option>
              </select>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
            }}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Letters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Surat ({filteredLetters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Surat</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Pengirim/Penerima</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.map((letter: Letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="font-medium">{letter.letter_number}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(letter.letter_type)}>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(letter.letter_type)}
                          <span>{getTypeLabel(letter.letter_type)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{letter.subject}</p>
                        {letter.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {letter.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {letter.letter_type === 'masuk' ? (
                        <span className="text-green-600">{letter.sender}</span>
                      ) : (
                        <span className="text-blue-600">{letter.recipient}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          Tgl Surat: {letter.letter_date.toLocaleDateString('id-ID')}
                        </p>
                        {letter.received_date && (
                          <p className="text-xs text-gray-500">
                            Diterima: {letter.received_date.toLocaleDateString('id-ID')}
                          </p>
                        )}
                      </div>
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
          {filteredLetters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedType !== 'all' 
                ? 'Tidak ada surat yang sesuai dengan filter'
                : 'Belum ada data surat'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}