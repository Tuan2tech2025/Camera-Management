import React, { useState } from 'react';
import { Plus, Settings as SettingsIcon, Trash2, Edit2, Check, X } from 'lucide-react';

interface SettingsProps {
  locations: string[];
  onAddLocation: (name: string) => void;
  onRemoveLocation: (name: string) => void;
  onRenameLocation: (oldName: string, newName: string) => void;

  cameraTypes: string[];
  onAddType: (name: string) => void;
  onRemoveType: (name: string) => void;
  onRenameType: (oldType: string, newType: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  locations, 
  onAddLocation,
  onRemoveLocation,
  onRenameLocation,
  cameraTypes, 
  onAddType,
  onRemoveType,
  onRenameType
}) => {
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('');

  // Editing State
  const [editingItem, setEditingItem] = useState<{ type: 'location' | 'type', original: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddLocClick = () => {
    const val = newLocation.trim();
    if (!val) return;
    if (locations.includes(val)) {
        alert("Vị trí này đã tồn tại!");
        return;
    }
    onAddLocation(val);
    setNewLocation('');
  };

  const handleAddTypeClick = () => {
    const val = newType.trim();
    if (!val) return;
    if (cameraTypes.includes(val)) {
        alert("Loại camera này đã tồn tại!");
        return;
    }
    onAddType(val);
    setNewType('');
  };

  const handleRemove = (val: string, type: 'location' | 'type') => {
    if (window.confirm(`Bạn có chắc muốn xóa "${val}"?`)) {
        if (type === 'location') onRemoveLocation(val);
        else onRemoveType(val);
    }
  };

  // Edit Handlers
  const startEditing = (type: 'location' | 'type', value: string) => {
    setEditingItem({ type, original: value });
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const saveEditing = () => {
    if (!editingItem || !editValue.trim()) return;

    if (editingItem.type === 'location') {
      if (editValue.trim() !== editingItem.original) {
        onRenameLocation(editingItem.original, editValue.trim());
      }
    } else {
      if (editValue.trim() !== editingItem.original) {
        onRenameType(editingItem.original, editValue.trim());
      }
    }
    setEditingItem(null);
    setEditValue('');
  };

  const EditableItem = ({ item, type }: { item: string, type: 'location' | 'type' }) => {
    const isEditing = editingItem?.type === type && editingItem?.original === item;

    return (
      <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 group transition-all hover:shadow-md">
        {isEditing ? (
          <div className="flex items-center w-full space-x-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEditing();
                if (e.key === 'Escape') cancelEditing();
              }}
            />
            <button onClick={saveEditing} className="p-2 text-green-600 hover:bg-green-100 rounded">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={cancelEditing} className="p-2 text-red-500 hover:bg-red-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="font-medium text-gray-800">{item}</span>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEditing(type, item)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                title="Đổi tên"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRemove(item, type)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const Section = ({ title, items, inputValue, setInputValue, onAdd, type, placeholder }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">{title}</h3>
      
      {/* Add New Item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm
        </button>
      </div>

      {/* List Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item: string) => (
          <EditableItem 
            key={item} 
            item={item} 
            type={type} 
          />
        ))}
      </div>
      
      {items.length === 0 && (
        <p className="text-gray-400 text-sm italic py-4 text-center">Chưa có dữ liệu.</p>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-gray-100 mr-4 border border-gray-200">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Cấu Hình Hệ Thống</h2>
            <p className="text-gray-500 text-sm">Thêm, Sửa, Xóa các danh mục dùng chung (Vị trí, Loại camera)</p>
        </div>
      </div>

      <Section 
        title="Quản lý Vị Trí Lắp Đặt" 
        items={locations} 
        inputValue={newLocation} 
        setInputValue={setNewLocation}
        onAdd={handleAddLocClick}
        type="location"
        placeholder="Nhập tên vị trí mới (ví dụ: Kho Lạnh, Cổng Phụ...)"
      />

      <Section 
        title="Quản lý Loại Camera" 
        items={cameraTypes} 
        inputValue={newType} 
        setInputValue={setNewType}
        onAdd={handleAddTypeClick}
        type="type"
        placeholder="Nhập loại camera mới (ví dụ: Thermal, Fisheye...)"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start">
        <div className="font-bold mr-2 whitespace-nowrap">Mẹo:</div>
        <div>
          Khi bạn <strong>đổi tên</strong> một Vị trí hoặc Loại camera tại đây, tất cả Camera và Đầu ghi đang sử dụng thông tin cũ sẽ được <strong>tự động cập nhật</strong> theo tên mới.
        </div>
      </div>
    </div>
  );
};

export default Settings;