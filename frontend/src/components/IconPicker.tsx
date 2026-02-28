import { CATEGORY_ICONS, LOCATION_ICONS, TAG_COLORS } from '../types';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  type: 'category' | 'location';
}

export function IconPicker({ value, onChange, type }: IconPickerProps) {
  const icons = type === 'category' ? CATEGORY_ICONS : LOCATION_ICONS;

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '8px',
      WebkitOverflowScrolling: 'touch',
    }}>
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          style={{
            width: '40px',
            height: '40px',
            minWidth: '40px',
            borderRadius: '10px',
            border: value === icon ? '2px solid #5A5A40' : '1px solid #e0e0e0',
            background: value === icon ? 'rgba(90, 90, 64, 0.1)' : '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
      WebkitOverflowScrolling: 'touch',
    }}>
      {TAG_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          style={{
            width: '28px',
            height: '28px',
            minWidth: '28px',
            borderRadius: '50%',
            border: value === color.value ? '3px solid #3A3A30' : '2px solid transparent',
            background: color.value,
            cursor: 'pointer',
            boxShadow: value === color.value ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.15s',
          }}
          title={color.name}
        />
      ))}
    </div>
  );
}
