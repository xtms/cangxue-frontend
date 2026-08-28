import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@music-app/ui';
import { useAuthStore } from '@music-app/core';
import { apiClient } from '../lib/api';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
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
      const { user, token } = await apiClient.auth.login(identifier, password);
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Music</h1>
          <p className="mt-1 text-sm text-gray-500">登录以继续</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}
          <Input
            label="用户名或邮箱"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中…' : '登录'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600">立即注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
