import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, ChevronLeft, Save, Keyboard } from 'lucide-react';
import { api } from '../utils/api';
import type { ItemRecognition, Category, Location } from '../types';

export function CameraPage() {
  const [image, setImage] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState<ItemRecognition | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    fetchUserTags();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('无法访问相机:', error);
    }
  };

  const fetchUserTags = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get('/categories'),
        api.get('/locations'),
      ]);
      setCategories(catRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error('获取分类和位置失败:', error);
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      setImage(base64);
      recognizeImage(base64);
    }
  };

  const recognizeImage = async (base64: string) => {
    setRecognizing(true);
    try {
      const response = await api.post('/recognize', { image: base64 });
      setResult(response.data);
    } catch (error) {
      console.error('识别失败:', error);
      alert('识别失败，请重试');
    } finally {
      setRecognizing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(base64);
        recognizeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    prodDate: '',
    expDate: '',
    category: '',
    location: '',
    shelfLifeAfterOpen: 0,
  });

  useEffect(() => {
    if (result && categories.length > 0 && locations.length > 0) {
      setFormData({
        name: result.name || '',
        prodDate: result.prod_date || '',
        expDate: result.exp_date || '',
        category: result.category || categories[0].name,
        location: locations[0].name,
        shelfLifeAfterOpen: result.shelf_life_after_open || 0,
      });
    }
  }, [result, categories, locations]);

  const handleSave = async () => {
    if (!formData.name || !formData.expDate) {
      alert('请填写物品名称和过期日期');
      return;
    }
    setSaving(true);
    try {
      await api.post('/items', {
        name: formData.name,
        prodDate: formData.prodDate,
        expDate: formData.expDate,
        category: formData.category,
        location: formData.location,
        shelfLifeAfterOpen: formData.shelfLifeAfterOpen || undefined,
        imagePath: image ? `data:image/jpeg;base64,${image}` : undefined,
      });
      navigate('/');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setFormData({
      name: '',
      prodDate: '',
      expDate: '',
      category: categories[0]?.name || '',
      location: locations[0]?.name || '',
      shelfLifeAfterOpen: 0,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
      {/* Header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <ChevronLeft size={28} color="#fff" />
        </button>
        <span style={{ color: '#fff', fontSize: '16px' }}>拍照识别</span>
        <div style={{ width: '44px' }} />
      </header>

      {/* 相机/图片预览 */}
      <div style={{ aspectRatio: '3/4', maxHeight: '60vh', position: 'relative' }}>
        {image ? (
          <img 
            src={`data:image/jpeg;base64,${image}`} 
            alt="Captured" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        )}

        {/* 辅助对齐线 */}
        {!image && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '30%',
            border: '2px dashed rgba(255,255,255,0.5)',
            borderRadius: '12px',
            pointerEvents: 'none',
          }} />
        )}

        {/* 识别中 */}
        {recognizing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <Loader2 size={40} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#fff', fontSize: '16px' }}>AI 识别中...</span>
          </div>
        )}
      </div>

      {/* 识别结果表单 */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#fff',
              borderRadius: '24px 24px 0 0',
              padding: '24px',
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#3A3A30' }}>确认物品信息</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7A7A70' }}>物品名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7A7A70' }}>生产日期</label>
                <input
                  type="date"
                  value={formData.prodDate}
                  onChange={(e) => setFormData({ ...formData, prodDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7A7A70' }}>过期日期</label>
                <input
                  type="date"
                  value={formData.expDate}
                  onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7A7A70' }}>分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7A7A70' }}>存放位置</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                  }}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.icon} {loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f5f5f0',
                  color: '#3A3A30',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                重拍
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: '#5A5A40',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {saving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                保存物品
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作栏 */}
      {!result && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
        }}>
          <button 
            onClick={() => navigate('/manual')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Keyboard size={24} color="#fff" />
            </div>
            <span style={{ color: '#fff', fontSize: '12px' }}>手动</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={capture}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid #5A5A40',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#5A5A40',
            }} />
          </motion.button>

          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: 'none' }} />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Upload size={24} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontSize: '12px' }}>相册</span>
            </div>
          </label>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
