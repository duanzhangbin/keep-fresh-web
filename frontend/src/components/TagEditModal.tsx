import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { IconPicker, ColorPicker } from './IconPicker';
import type { Category, Location } from '../types';

interface TagEditModalProps {
  visible: boolean;
  type: 'category' | 'location';
  data?: Category | Location;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string }) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function TagEditModal({ 
  visible, 
  type, 
  data, 
  onClose, 
  onSave, 
  onDelete,
  canDelete = true 
}: TagEditModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setIcon(data.icon || '');
      setColor(data.color || '');
    } else {
      setName('');
      setIcon(type === 'category' ? '📦' : '📍');
      setColor('#4CAF50');
    }
  }, [data, type, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          
          {/* 弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '340px',
              maxHeight: '90vh',
              background: '#fff',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            {/* 顶部栏 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px 16px 12px',
              borderBottom: '1px solid #f0f0f0',
              flexShrink: 0,
            }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#3A3A30', fontWeight: 500 }}>
                {data ? '编辑' : '添加'}{type === 'category' ? '分类' : '位置'}
              </h3>
              <button 
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#7A7A70" />
              </button>
            </div>

            {/* 可滚动内容 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              WebkitOverflowScrolling: 'touch',
            }}>
              {/* 名称 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#7A7A70' }}>
                  名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`输入${type === 'category' ? '分类' : '位置'}名称`}
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 图标 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#7A7A70' }}>
                  图标
                </label>
                <IconPicker value={icon} onChange={setIcon} type={type} />
              </div>

              {/* 颜色 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#7A7A70' }}>
                  颜色
                </label>
                <ColorPicker value={color} onChange={setColor} />
              </div>

              {/* 预览 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px',
                background: `${color}15`,
                borderRadius: '10px',
              }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ fontSize: '14px', color: '#3A3A30' }}>{name || `${type === 'category' ? '分类' : '位置'}名称`}</span>
              </div>

              {/* 删除确认 */}
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, color: '#F44336', fontSize: '13px' }}>
                    确定要删除吗？删除后该分类下的物品将变为「其它」
                  </p>
                </motion.div>
              )}
            </div>

            {/* 底部按钮栏 */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '12px 16px',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
              borderTop: '1px solid #f0f0f0',
              flexShrink: 0,
            }}>
              {data && canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: showDeleteConfirm ? '#F44336' : 'rgba(244, 67, 54, 0.1)',
                    color: showDeleteConfirm ? '#fff' : '#F44336',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {showDeleteConfirm ? '确认删除' : '删除'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#f5f5f0',
                  color: '#3A3A30',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim()}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: name.trim() ? '#5A5A40' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                保存
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
