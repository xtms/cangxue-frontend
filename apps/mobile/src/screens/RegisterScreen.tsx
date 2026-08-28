import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useAuthStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { theme } from '../theme';
import type { AuthScreenProps } from '../navigation/types';

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const { user, token } = await apiClient.auth.register({ username, email, password });
      setAuth(user, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Music</Text>
        <Text style={styles.sub}>创建账号</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>用户名</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Text style={styles.label}>邮箱</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>密码</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? '注册中…' : '注册'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>已有账号？去登录</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brand: { fontSize: 30, fontWeight: '800', color: theme.text, textAlign: 'center' },
  sub: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, color: theme.textMuted, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, backgroundColor: theme.surface },
  btn: { backgroundColor: theme.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  link: { color: theme.primary, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
