import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Building, MapPin, Phone, Mail, Globe, User, Calendar, Eye, Save, Edit } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { SchoolProfile as SchoolProfileType, UpdateSchoolProfileInput, UserRole } from '../../../server/src/schema';

interface SchoolProfileProps {
  userRole?: UserRole;
}

export function SchoolProfile({ userRole }: SchoolProfileProps) {
  const [profile, setProfile] = useState<SchoolProfileType>({
    id: 1,
    school_name: 'MA Darul Muttaqien',
    address: 'Jl. Raya Bogor No. 123, Bogor, Jawa Barat 16151',
    phone: '(0251) 123-4567',
    email: 'info@madm.sch.id',
    website: 'https://www.madm.sch.id',
    headmaster_name: 'Dr. H. Ahmad Solihin, M.Pd.',
    logo_path: null,
    description: 'MA Darul Muttaqien adalah lembaga pendidikan Islam yang berkomitmen untuk menghasilkan generasi yang berakhlak mulia, berilmu, dan berkarakter.',
    vision: 'Menjadi madrasah aliyah terdepan dalam menghasilkan lulusan yang beriman, bertakwa, berilmu, dan berakhlak mulia.',
    mission: 'Menyelenggarakan pendidikan Islam yang berkualitas, mengembangkan potensi siswa secara optimal, dan membangun karakter yang kuat berdasarkan nilai-nilai Islam.',
    established_year: 1995,
    created_at: new Date(),
    updated_at: new Date()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userRole === 'admin';

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsLoading(true);
    try {
      // Mock save - in real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      // In real implementation: await trpc.schoolProfile.update.mutate(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values - in real implementation, refetch from server
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏫 Profil Sekolah</h1>
          <p className="text-gray-600">Informasi lengkap tentang MA Darul Muttaqien</p>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Informasi Dasar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school_name">Nama Sekolah</Label>
              {isEditing ? (
                <Input
                  id="school_name"
                  value={profile.school_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile(prev => ({ ...prev, school_name: e.target.value }))
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{profile.school_name}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="headmaster_name">Nama Kepala Sekolah</Label>
              {isEditing ? (
                <Input
                  id="headmaster_name"
                  value={profile.headmaster_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile(prev => ({ ...prev, headmaster_name: e.target.value }))
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <p>{profile.headmaster_name}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="established_year">Tahun Didirikan</Label>
              {isEditing ? (
                <Input
                  id="established_year"
                  type="number"
                  value={profile.established_year || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile(prev => ({ ...prev, established_year: parseInt(e.target.value) || null }))
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <p>{profile.established_year}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setProfile(prev => ({ ...prev, address: e.target.value }))
                  }
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                  <p>{profile.address}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProfile(prev => ({ ...prev, phone: e.target.value || null }))
                    }
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <p>{profile.phone}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProfile(prev => ({ ...prev, email: e.target.value || null }))
                    }
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <p>{profile.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProfile(prev => ({ ...prev, website: e.target.value || null }))
                    }
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-500" />
                    <p>{profile.website}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <span>Visi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={profile.vision || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setProfile(prev => ({ ...prev, vision: e.target.value || null }))
                }
                rows={4}
                placeholder="Masukkan visi sekolah..."
              />
            ) : (
              <div className="p-4 bg-purple-50 rounded-md">
                <p className="text-gray-700 leading-relaxed">{profile.vision}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span>Misi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={profile.mission || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setProfile(prev => ({ ...prev, mission: e.target.value || null }))
                }
                rows={4}
                placeholder="Masukkan misi sekolah..."
              />
            ) : (
              <div className="p-4 bg-green-50 rounded-md">
                <p className="text-gray-700 leading-relaxed">{profile.mission}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={profile.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProfile(prev => ({ ...prev, description: e.target.value || null }))
              }
              rows={5}
              placeholder="Masukkan deskripsi sekolah..."
            />
          ) : (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}