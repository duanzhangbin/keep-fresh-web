import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, LogOut, BellOff, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import { CategoryManager } from '../components/CategoryManager';
import { subscribeToPush, unsubscribeFromPush, checkPushSubscription, isPushSupported, registerServiceWorker } from '../utils/push';
import type { Settings } from '../types';

function ChevronLeft(props: any) {
  const { size, color, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchSettings();
    initPush();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('获取设置失败:', error);
    }
  };

  const initPush = async () => {
    if (!isPushSupported()) return;
    await registerServiceWorker();
    const subscribed = await checkPushSubscription();
    setPushSubscribed(subscribed);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const updateSettings = async (data: Partial<Settings>) => {
    try {
      await api.put('/settings', data);
      fetchSettings();
    } catch (error) {
      console.error('更新设置失败:', error);
    }
  };

  const handlePushToggle = async () => {
    setLoading(true);
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush();
        setPushSubscribed(false);
        await updateSettings({ pushEnabled: false });
      } else {
        const subscription = await subscribeToPush();
        if (subscription) {
          setPushSubscribed(true);
          await updateSettings({ pushEnabled: true });
        }
      }
    } catch (error) {
      console.error('推送订阅失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', paddingBottom: '40px' }}>
      <header style={{
        background: '#fff',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(90, 90, 64, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <ChevronLeft size={24} color="#5A5A40" />
          </button>
          <h1 style={{ fontSize: '18px', color: '#3A3A30', margin: 0 }}>设置</h1>
        </div>
      </header>

      <div style={{ padding: '16px' }}>
        {/* 账号信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#5A5A40',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
            }}>
              {user?.name?.[0] || user?.phone?.[0] || '?'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '18px', color: '#3A3A30', fontWeight: 500 }}>
                {user?.name || '用户'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#7A7A70' }}>
                {user?.phone || user?.email || ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 提醒设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#3A3A30', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#5A5A40" />
            提醒设置
          </h3>

          {/* 推送开关 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {pushSubscribed ? <Bell size={18} color="#5A5A40" /> : <BellOff size={18} color="#7A7A70" />}
              <span style={{ color: '#3A3A30', fontSize: '14px' }}>推送通知</span>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={loading || !isPushSupported()}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                background: pushSubscribed ? '#5A5A40' : '#ccc',
                cursor: loading || !isPushSupported() ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: pushSubscribed ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* 提前天数 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#3A3A30', fontSize: '14px' }}>提前提醒天数</span>
            <select
              value={settings?.reminderThreshold || 7}
              onChange={(e) => updateSettings({ reminderThreshold: parseInt(e.target.value) })}
              style={{
                padding: '8px 12px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                background: '#fff',
                color: '#3A3A30',
              }}
            >
              <option value={3}>3天</option>
              <option value={7}>7天</option>
              <option value={14}>14天</option>
              <option value={30}>30天</option>
            </select>
          </div>

          {/* 提醒时间 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#5A5A40" />
              <span style={{ color: '#3A3A30', fontSize: '14px' }}>提醒时间</span>
            </div>
            <select
              value={settings?.reminderTime || '08:00'}
              onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              style={{
                padding: '8px 12px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                background: '#fff',
                color: '#3A3A30',
              }}
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* 分类管理 */}
        <CategoryManager type="category" />

        {/* 位置管理 */}
        <CategoryManager type="location" />

        {/* 关于 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#3A3A30', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={20} color="#5A5A40" />
            关于
          </h3>
          <div style={{ color: '#7A7A70', fontSize: '14px' }}>
            <p style={{ margin: '0 0 8px' }}>FreshKeep 保质期管家</p>
            <p style={{ margin: 0, opacity: 0.7 }}>版本 1.0.0</p>
          </div>
        </motion.div>

        {/* 退出登录 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(244, 67, 54, 0.1)',
            color: '#F44336',
            border: 'none',
            borderRadius: '24px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <LogOut size={20} />
          退出登录
        </motion.button>
      </div>
    </div>
  );
}
