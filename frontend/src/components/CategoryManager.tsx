import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tags, MapPin } from 'lucide-react';
import { api } from '../utils/api';
import { TagList } from './TagCard';
import { TagEditModal } from './TagEditModal';
import type { Category, Location } from '../types';

interface TagManagerProps {
  type: 'category' | 'location';
}

export function CategoryManager({ type }: TagManagerProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Location | undefined>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const endpoint = type === 'category' ? '/categories' : '/locations';
      const response = await api.get(endpoint);
      setItems(response.data);
    } catch (error) {
      console.error(`获取${type}失败:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setModalVisible(true);
  };

  const handleEdit = (item: Category | Location) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSave = async (data: { name: string; icon: string; color: string }) => {
    try {
      const endpoint = type === 'category' ? '/categories' : '/locations';
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, data);
      } else {
        await api.post(endpoint, data);
      }
      fetchItems();
      setModalVisible(false);
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const endpoint = type === 'category' ? '/categories' : '/locations';
      await api.delete(`${endpoint}/${id}`);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const icon = type === 'category' ? <Tags size={20} color="#5A5A40" /> : <MapPin size={20} color="#5A5A40" />;
  const label = type === 'category' ? '分类管理' : '位置管理';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: type === 'category' ? 0.1 : 0.2 }}
      style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 4px 20px rgba(90, 90, 64, 0.08)',
      }}
    >
      <h3 style={{ 
        margin: '0 0 16px', 
        fontSize: '16px', 
        color: '#3A3A30', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        {icon}
        {label}
        <span style={{ fontSize: '12px', color: '#7A7A70', fontWeight: 'normal', marginLeft: 'auto' }}>
          {items.length}/10
        </span>
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#7A7A70' }}>加载中...</div>
      ) : (
        <TagList
          type={type}
          items={items}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      )}

      <TagEditModal
        visible={modalVisible}
        type={type}
        data={editingItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={() => {
          if (editingItem) {
            handleDelete(editingItem.id);
            setModalVisible(false);
          }
        }}
        canDelete={items.length > 1}
      />
    </motion.div>
  );
}
