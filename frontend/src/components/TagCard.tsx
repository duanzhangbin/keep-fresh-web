import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';
import type { Category, Location } from '../types';

interface TagCardProps {
  data: Category | Location;
  onClick: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function TagCard({ data, onClick, onDelete: _onDelete, canDelete: _canDelete = true }: TagCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        background: `${data.color}15`,
        borderRadius: '16px',
        cursor: 'pointer',
        minWidth: '72px',
        position: 'relative',
        border: '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '28px', marginBottom: '4px' }}>{data.icon}</span>
      <span style={{ fontSize: '12px', color: '#3A3A30', textAlign: 'center' }}>
        {data.name}
      </span>
      {data.itemCount !== undefined && data.itemCount > 0 && (
        <span style={{ 
          fontSize: '10px', 
          color: '#7A7A70',
          marginTop: '2px' 
        }}>
          {data.itemCount}件
        </span>
      )}
    </motion.div>
  );
}

interface AddCardProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddTagCard({ onClick, disabled }: AddCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        background: disabled ? '#f5f5f5' : '#fff',
        borderRadius: '16px',
        border: '1px dashed #ccc',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '72px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Plus size={24} color={disabled ? '#ccc' : '#5A5A40'} />
      <span style={{ fontSize: '12px', color: disabled ? '#ccc' : '#7A7A70', marginTop: '4px' }}>
        添加
      </span>
    </motion.div>
  );
}

interface TagListProps {
  type: 'category' | 'location';
  items: (Category | Location)[];
  onEdit: (item: Category | Location) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function TagList({ type, items, onEdit, onAdd, onDelete }: TagListProps) {
  const canAdd = items.length < 10;

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      {items.map((item) => (
        <div key={item.id} style={{ position: 'relative' }}>
          <TagCard
            data={item}
            onClick={() => onEdit(item)}
            canDelete={items.length > 1}
          />
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定要删除「${item.name}」${type === 'category' ? '分类' : '位置'}吗？`)) {
                  onDelete(item.id);
                }
              }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#F44336',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={10} color="#fff" />
            </button>
          )}
        </div>
      ))}
      <AddTagCard onClick={onAdd} disabled={!canAdd} />
    </div>
  );
}
