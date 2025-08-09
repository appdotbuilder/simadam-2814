import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, Upload, Trash2, Eye, CheckCircle, Settings } from 'lucide-react';
import type { BackgroundSettings as BackgroundSettingsType, CreateBackgroundInput } from '../../../server/src/schema';

interface BackgroundSettingsProps {
  onBackgroundChange: () => void;
}

// Mock data
const mockBackgrounds: BackgroundSettingsType[] = [
  {
    id: 1,
    name: 'Default Gradient',
    file_path: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'Islamic Pattern',
    file_path: '/backgrounds/islamic-pattern.jpg',
    is_active: false,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'School Building',
    file_path: '/backgrounds/school-building.jpg',
    is_active: false,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const predefinedBackgrounds = [
  {
    name: 'Blue Gradient',
    path: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'Green Gradient',
    path: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
  },
  {
    name: 'Purple Gradient',
    path: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
  },
  {
    name: 'Orange Gradient',
    path: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
  },
  {
    name: 'Teal Gradient',
    path: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
  },
  {
    name: 'Pink Gradient',
    path: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
  }
];

export function BackgroundSettings({ onBackgroundChange }: BackgroundSettingsProps) {
  const [backgrounds, setBackgrounds] = useState<BackgroundSettingsType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newBackground, setNewBackground] = useState<CreateBackgroundInput>({
    name: '',
    file_path: '',
    is_active: false
  });

  const loadBackgrounds = useCallback(async () => {
    setIsLoading(true);
    try {
      setBackgrounds(mockBackgrounds);
    } catch (error) {
      console.error('Failed to load backgrounds:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackgrounds();
  }, [loadBackgrounds]);

  const handleSetActive = async (backgroundId: number) => {
    try {
      // Mock API call - in real implementation: await trpc.backgroundSettings.setActive.mutate({ id: backgroundId });
      setBackgrounds(prev => prev.map(bg => ({
        ...bg,
        is_active: bg.id === backgroundId
      })));
      onBackgroundChange();
    } catch (error) {
      console.error('Failed to set active background:', error);
    }
  };

  const handleAddBackground = async () => {
    if (!newBackground.name) return;

    setIsLoading(true);
    try {
      // Mock API call
      const background: BackgroundSettingsType = {
        id: backgrounds.length + 1,
        ...newBackground,
        created_at: new Date(),
        updated_at: new Date()
      };
      setBackgrounds(prev => [...prev, background]);
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add background:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewBackground({
      name: '',
      file_path: '',
      is_active: false
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In real implementation, upload file and get URL
      const mockUrl = `/backgrounds/${file.name}`;
      setNewBackground(prev => ({ ...prev, file_path: mockUrl }));
    }
  };

  const handlePredefinedBackground = (bg: typeof predefinedBackgrounds[0]) => {
    setNewBackground(prev => ({
      ...prev,
      name: bg.name,
      file_path: bg.path
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎨 Pengaturan Background</h1>
          <p className="text-gray-600">Kelola latar belakang animasi sekolah</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Background</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Background Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Background</Label>
                <Input
                  id="name"
                  value={newBackground.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewBackground(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Masukkan nama background"
                />
              </div>

              {/* Predefined Backgrounds */}
              <div className="space-y-3">
                <Label>Background Siap Pakai</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {predefinedBackgrounds.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => handlePredefinedBackground(bg)}
                      className="relative h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                      style={{ background: bg.path }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <span className="text-white text-xs font-medium text-center px-2">
                          {bg.name}
                        </span>
                      </div>
                      {newBackground.file_path === bg.path && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-4 h-4 text-white bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Atau Upload File Gambar</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Klik untuk memilih file atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Format: JPG, PNG, GIF (Max: 2MB)
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="mt-2"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      File terpilih: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {newBackground.file_path && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div 
                    className="h-32 rounded-lg border"
                    style={{
                      background: newBackground.file_path.startsWith('linear-gradient')
                        ? newBackground.file_path
                        : `url(${newBackground.file_path})`
                    }}
                  >
                    <div className="h-full bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">Preview Background</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddBackground} 
                  disabled={!newBackground.name || !newBackground.file_path || isLoading}
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Background'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Background</p>
                <p className="text-2xl font-bold">{backgrounds.length}</p>
              </div>
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Background Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {backgrounds.filter(bg => bg.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Background Tersedia</p>
                <p className="text-2xl font-bold text-purple-600">
                  {backgrounds.filter(bg => !bg.is_active).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Galeri Background</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backgrounds.map((background) => (
              <Card key={background.id} className="overflow-hidden">
                <div 
                  className="h-40 relative"
                  style={{
                    background: background.file_path.startsWith('linear-gradient')
                      ? background.file_path
                      : `url(${background.file_path}) center/cover`
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Preview</p>
                    </div>
                  </div>
                  {background.is_active && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aktif
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{background.name}</h3>
                      <p className="text-sm text-gray-500">
                        Dibuat: {background.created_at.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!background.is_active && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSetActive(background.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aktifkan
                        </Button>
                      )}
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {backgrounds.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Belum ada background</h3>
              <p>Tambahkan background pertama untuk memulai kustomisasi tampilan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}