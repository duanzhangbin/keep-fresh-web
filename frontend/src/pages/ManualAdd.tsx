import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import type { Category, Location } from '../types';

export function ManualAddPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    prodDate: '',
    expDate: '',
    category: '',
    location: '',
    shelfLifeAfterOpen: 0,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get('/categories'),
        api.get('/locations'),
      ]);
      setCategories(catRes.data);
      setLocations(locRes.data);
      
      // 默认选中第一个
      if (catRes.data.length > 0 && locRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: catRes.data[0].name,
          location: locRes.data[0].name,
        }));
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.expDate) {
      alert('请填写物品名称和过期日期');
      return;
    }
    setSaving(true);
    try {
      await api.post('/items', {
        name: formData.name,
        prodDate: formData.prodDate || undefined,
        expDate: formData.expDate,
        category: formData.category,
        location: formData.location,
        shelfLifeAfterOpen: formData.shelfLifeAfterOpen || undefined,
      });
      navigate('/');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#7A7A70' }}>加载中...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '18px', color: '#3A3A30', margin: 0 }}>手动录入</h1>
        </div>
      </header>

      <div style={{ padding: '16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
          }}
        >
          {/* 物品名称 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
              物品名称 <span style={{ color: '#F44336' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如：鲜牛奶、奥利奥饼干"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 日期 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
                生产日期
              </label>
              <input
                type="date"
                value={formData.prodDate}
                max={getToday()}
                onChange={(e) => setFormData({ ...formData, prodDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
                过期日期 <span style={{ color: '#F44336' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.expDate}
                min={getToday()}
                onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 分类和位置 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
                存放位置
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.icon} {loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 开封后保质期 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#7A7A70' }}>
              开封后保质期（天）
            </label>
            <input
              type="number"
              value={formData.shelfLifeAfterOpen || ''}
              onChange={(e) => setFormData({ ...formData, shelfLifeAfterOpen: parseInt(e.target.value) || 0 })}
              placeholder="如：7（开封后7天内食用）"
              min="0"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.expDate}
            style={{
              width: '100%',
              padding: '16px',
              background: (!formData.name || !formData.expDate) ? '#ccc' : '#5A5A40',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {saving ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                保存中...
              </>
            ) : (
              <>
                <Save size={20} />
                保存物品
              </>
            )}
          </button>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
