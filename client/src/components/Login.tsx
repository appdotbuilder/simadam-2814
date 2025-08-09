import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UserCircle, Lock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { User, LoginInput } from '../../../server/src/schema';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState<LoginInput>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, create a mock user based on username
      // In real implementation, this would validate against the database
      const mockUser: User = {
        id: 1,
        username: formData.username,
        email: `${formData.username}@madm.sch.id`,
        password_hash: '',
        full_name: formData.username === 'admin' ? 'Administrator SIMADAM' : 'Guru SIMADAM',
        role: formData.username === 'admin' ? 'admin' : 'guru',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Simple validation for demo
      if (formData.username && formData.password.length >= 3) {
        onLogin(mockUser);
      } else {
        throw new Error('Username dan password harus diisi dengan benar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mock reset password functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Link reset password telah dikirim ke email Anda');
      setShowResetForm(false);
      setResetEmail('');
    } catch (err) {
      setError('Reset password gagal');
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Reset Password</CardTitle>
          <CardDescription>Masukkan email Anda untuk reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="nama@madm.sch.id"
                value={resetEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12"
              onClick={() => setShowResetForm(false)}
            >
              Kembali ke Login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border-0">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <UserCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Masuk ke SIMADAM</CardTitle>
        <CardDescription>Sistem Informasi MA Darul Muttaqien</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData((prev: LoginInput) => ({ ...prev, username: e.target.value }))
              }
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData((prev: LoginInput) => ({ ...prev, password: e.target.value }))
                }
                required
                className="h-12 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
            {isLoading ? 'Masuk...' : 'Masuk'}
          </Button>

          <div className="text-center">
            <Button 
              type="button" 
              variant="link" 
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setShowResetForm(true)}
            >
              Lupa password?
            </Button>
          </div>
        </form>

        {/* Demo credentials info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Demo Login:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Admin:</strong> username: admin, password: admin</p>
            <p><strong>Guru:</strong> username: guru, password: guru</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}