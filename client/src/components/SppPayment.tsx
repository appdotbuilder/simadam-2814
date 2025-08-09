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
  CreditCard, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Printer, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  SppPayment, 
  CreateSppPaymentInput, 
  PaymentStatus,
  UserRole 
} from '../../../server/src/schema';

interface SppPaymentProps {
  userRole?: UserRole;
}

// Mock data
const mockPayments: SppPayment[] = [
  {
    id: 1,
    student_id: 1,
    month: 1,
    year: 2024,
    amount: 500000,
    payment_date: new Date('2024-01-10'),
    status: 'lunas',
    notes: 'Pembayaran tepat waktu',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    student_id: 1,
    month: 2,
    year: 2024,
    amount: 500000,
    payment_date: null,
    status: 'belum_bayar',
    notes: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    student_id: 2,
    month: 1,
    year: 2024,
    amount: 500000,
    payment_date: new Date('2024-01-25'),
    status: 'terlambat',
    notes: 'Bayar terlambat 15 hari',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
];

export function SppPayment({ userRole }: SppPaymentProps) {
  const [payments, setPayments] = useState<SppPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SppPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SppPayment | null>(null);

  const [newPayment, setNewPayment] = useState<CreateSppPaymentInput>({
    student_id: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 500000,
    payment_date: null,
    status: 'belum_bayar',
    notes: null
  });

  const canEdit = userRole === 'admin';

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using mock data - in real implementation: await trpc.sppPayments.getAll.query();
      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load SPP payments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    let filtered = payments;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(payment => payment.month === parseInt(selectedMonth));
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(payment => payment.year === parseInt(selectedYear));
    }

    setFilteredPayments(filtered);
  }, [payments, selectedStatus, selectedMonth, selectedYear]);

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case 'belum_bayar':
        return 'Belum Bayar';
      case 'lunas':
        return 'Lunas';
      case 'terlambat':
        return 'Terlambat';
      default:
        return status;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'belum_bayar':
        return 'bg-red-100 text-red-800';
      case 'lunas':
        return 'bg-green-100 text-green-800';
      case 'terlambat':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'belum_bayar':
        return <AlertTriangle className="w-4 h-4" />;
      case 'lunas':
        return <CheckCircle className="w-4 h-4" />;
      case 'terlambat':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month)?.label || month.toString();
  };

  const handleAddPayment = async () => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      // Mock API call
      const payment: SppPayment = {
        id: payments.length + 1,
        ...newPayment,
        created_at: new Date(),
        updated_at: new Date()
      };
      setPayments(prev => [...prev, payment]);
      setShowAddDialog(false);
      resetNewPayment();
    } catch (error) {
      console.error('Failed to create SPP payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewPayment = () => {
    setNewPayment({
      student_id: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 500000,
      payment_date: null,
      status: 'belum_bayar',
      notes: null
    });
  };

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'lunas').length,
    unpaid: payments.filter(p => p.status === 'belum_bayar').length,
    late: payments.filter(p => p.status === 'terlambat').length,
    totalAmount: payments
      .filter(p => p.status === 'lunas' || p.status === 'terlambat')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Pembayaran SPP</h1>
          <p className="text-gray-600">Kelola pembayaran SPP siswa MA Darul Muttaqien</p>
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
                  <span>Input Pembayaran</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Input Pembayaran SPP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID Siswa</Label>
                    <Input
                      type="number"
                      value={newPayment.student_id || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPayment(prev => ({ ...prev, student_id: parseInt(e.target.value) || 0 }))
                      }
                      placeholder="ID Siswa"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bulan</Label>
                      <Select
                        value={newPayment.month.toString()}
                        onValueChange={(value) =>
                          setNewPayment(prev => ({ ...prev, month: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tahun</Label>
                      <Input
                        type="number"
                        value={newPayment.year}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPayment(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah Pembayaran</Label>
                    <Input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newPayment.status}
                      onValueChange={(value: PaymentStatus) =>
                        setNewPayment(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                        <SelectItem value="lunas">Lunas</SelectItem>
                        <SelectItem value="terlambat">Terlambat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newPayment.status !== 'belum_bayar' && (
                    <div className="space-y-2">
                      <Label>Tanggal Pembayaran</Label>
                      <Input
                        type="date"
                        value={newPayment.payment_date?.toISOString().split('T')[0] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPayment(prev => ({ 
                            ...prev, 
                            payment_date: e.target.value ? new Date(e.target.value) : null 
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Input
                      value={newPayment.notes || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPayment(prev => ({ ...prev, notes: e.target.value || null }))
                      }
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddPayment} disabled={isLoading}>
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
                <p className="text-sm text-gray-600">Total Tagihan</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Lunas</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Bayar</p>
                <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Diterima</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Pembayaran</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status Pembayaran</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="terlambat">Terlambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSelectedStatus('all');
                setSelectedMonth('all');
                setSelectedYear('2024');
              }}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran SPP ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Siswa</TableHead>
                  <TableHead>Bulan/Tahun</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Bayar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment: SppPayment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.student_id}</TableCell>
                    <TableCell>
                      {getMonthName(payment.month)} {payment.year}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {payment.payment_date 
                        ? payment.payment_date.toLocaleDateString('id-ID')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span>{getStatusLabel(payment.status)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.notes ? (
                        <span className="text-sm text-gray-600">{payment.notes}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailDialog(true);
                          }}
                        >
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
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data pembayaran yang sesuai dengan filter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pembayaran SPP</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID Pembayaran</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID Siswa</Label>
                  <p className="font-medium">{selectedPayment.student_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bulan</Label>
                  <p className="font-medium">{getMonthName(selectedPayment.month)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tahun</Label>
                  <p className="font-medium">{selectedPayment.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Jumlah Pembayaran</Label>
                  <p className="font-medium text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedPayment.status)}
                      <span>{getStatusLabel(selectedPayment.status)}</span>
                    </div>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Pembayaran</Label>
                  <p className="font-medium">
                    {selectedPayment.payment_date 
                      ? selectedPayment.payment_date.toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Input</Label>
                  <p className="font-medium">{selectedPayment.created_at.toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              {selectedPayment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                  <p className="font-medium">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}