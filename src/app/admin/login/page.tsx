'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // استخدام Firebase Authentication
      const result = await login(email, password);
      
      if (result && result.userData) {
        // التحقق من أن المستخدم admin
        if (result.userData.accountType === 'admin') {
          setMessage('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...');
          setTimeout(() => {
            router.push('/dashboard/admin');
          }, 1500);
        } else {
          setMessage('❌ ليس لديك صلاحيات إدارية');
        }
      } else {
        setMessage('❌ فشل في تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ بيانات الدخول غير صحيحة');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#667eea',
          marginBottom: '1rem'
        }}>
          🏆 أكاديمية الحلم
        </div>
        
        <h1 style={{
          color: '#333',
          marginBottom: '2rem',
          fontSize: '1.5rem'
        }}>
          تسجيل دخول الإدارة
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              البريد الإلكتروني:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل بريدك الإلكتروني"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              كلمة المرور:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        {message && (
          <div style={{
            marginTop: '1rem',
            fontSize: '14px',
            color: message.includes('✅') ? '#27ae60' : '#e74c3c'
          }}>
            {message}
          </div>
        )}
        
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            fontWeight: '500',
            color: '#333',
            margin: '0 0 0.5rem'
          }}>
            بيانات الدخول الافتراضية:
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#666',
            margin: '0'
          }}>
            admin@el7lm.com / Admin123!@#
          </p>
        </div>
      </div>
    </div>
  );
}