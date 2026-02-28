import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Settings, Package, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { api } from '../utils/api';
import type { Item } from '../types';
import { CATEGORIES, STATUS_LABELS } from '../types';
import logo from '../assets/project.jpg';

function getDaysUntilExpiry(expDate?: string): number | null {
  if (!expDate) return null;
  const exp = new Date(expDate);
  const now = new Date();
  const diff = exp.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusColor(days: number | null): { bg: string; text: string } {
  if (days === null) return { bg: 'rgba(122, 122, 112, 0.15)', text: '#7A7A70' };
  if (days < 0) return { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' };
  if (days <= 7) return { bg: 'rgba(255, 152, 0, 0.15)', text: '#FF9800' };
  if (days <= 30) return { bg: 'rgba(76, 175, 80, 0.15)', text: '#4CAF50' };
  return { bg: 'rgba(76, 175, 80, 0.15)', text: '#4CAF50' };
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('全部');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('获取物品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await api.post(`/items/${id}/status`, { status });
      fetchItems();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const filteredItems = category === '全部' 
    ? items 
    : items.filter(item => item.category === category);

  const expiringCount = items.filter(item => {
    const days = getDaysUntilExpiry(item.expDate);
    return days !== null && days <= 7 && item.status < 2;
  }).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f0',
      paddingBottom: '100px',
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(90, 90, 64, 0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '24px',
            color: '#5A5A40',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <img src={logo} alt="FreshKeep" style={{ width: 28, height: 28, borderRadius: '8px' }} />
            FreshKeep
          </h1>
          <button 
            onClick={() => navigate('/settings')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <Settings size={24} color="#5A5A40" />
          </button>
        </div>
      </header>

      {/* 过期提醒横幅 */}
      {expiringCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 152, 0, 0.15)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={18} color="#FF9800" />
          <span style={{ color: '#FF9800', fontSize: '14px' }}>
            您有 {expiringCount} 件物品即将过期
          </span>
        </motion.div>
      )}

      {/* 分类筛选 */}
      <div style={{
        padding: '16px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {['全部', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: category === cat ? '#5A5A40' : '#fff',
              color: category === cat ? '#fff' : '#3A3A30',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(90, 90, 64, 0.08)',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 物品列表 */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7A7A70' }}>
            加载中...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7A70' }}>
            <Package size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p>还没有物品，点击下方按钮添加</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const days = getDaysUntilExpiry(item.expDate);
              const statusColors = getStatusColor(days);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#3A3A30' }}>
                        {item.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'rgba(90, 90, 64, 0.1)',
                          color: '#5A5A40',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}>
                          {item.location}
                        </span>
                        <span style={{
                          background: STATUS_LABELS[item.status]?.color === 'info' ? 'rgba(33, 150, 243, 0.15)' :
                                      STATUS_LABELS[item.status]?.color === 'success' ? 'rgba(76, 175, 80, 0.15)' :
                                      'rgba(122, 122, 112, 0.15)',
                          color: STATUS_LABELS[item.status]?.color === 'info' ? '#2196F3' :
                                 STATUS_LABELS[item.status]?.color === 'success' ? '#4CAF50' : '#7A7A70',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}>
                          {STATUS_LABELS[item.status]?.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.expDate && (
                        <div style={{
                          background: statusColors.bg,
                          color: statusColors.text,
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}>
                          {days !== null && days < 0 
                            ? `已过期${Math.abs(days)}天` 
                            : days === 0 
                              ? '今天过期'
                              : `${days}天后过期`
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 快捷操作 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0',
                  }}>
                    {item.status === 0 && (
                      <button
                        onClick={() => handleStatusChange(item.id, 1)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'rgba(33, 150, 243, 0.15)',
                          color: '#2196F3',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle size={14} /> 已开封
                      </button>
                    )}
                    {item.status === 1 && (
                      <button
                        onClick={() => handleStatusChange(item.id, 2)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'rgba(76, 175, 80, 0.15)',
                          color: '#4CAF50',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle size={14} /> 已消耗
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(244, 67, 54, 0.15)',
                        color: '#F44336',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <XCircle size={14} /> 删除
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 底部导航 */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: '12px 0',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(90, 90, 64, 0.06)',
        zIndex: 100,
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#5A5A40' }}>
          <Package size={24} />
          <span style={{ fontSize: '12px', marginTop: '4px' }}>物品</span>
        </button>
        
        {/* 添加按钮 - 点击弹出选择 */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              const choice = confirm('选择录入方式？\n\n确定: 拍照识别\n取消: 手动录入');
              if (choice) {
                navigate('/camera');
              } else {
                navigate('/manual');
              }
            }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#5A5A40',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(90, 90, 64, 0.3)',
              marginTop: '-20px',
            }}
          >
            <Plus size={28} color="#fff" />
          </button>
        </div>
        
        <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7A7A70' }}>
          <Settings size={24} />
          <span style={{ fontSize: '12px', marginTop: '4px' }}>设置</span>
        </button>
      </nav>
    </div>
  );
}
