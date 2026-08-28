import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@music-app/ui';
import { useAuthStore } from '@music-app/core';
import { apiClient } from '../lib/api';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await apiClient.auth.register({ username, email, password });
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Music</h1>
          <p className="mt-1 text-sm text-gray-500">创建账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}
          <Input label="用户名" type="text" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} required />
          <Input label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中…' : '注册'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600">去登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
