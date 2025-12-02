import React, { useState } from 'react';
import { Plus, X, Settings as SettingsIcon, Save, Trash2 } from 'lucide-react';

interface SettingsProps {
  locations: string[];
  setLocations: (locs: string[]) => void;
  cameraTypes: string[];
  setCameraTypes: (types: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ locations, setLocations, cameraTypes, setCameraTypes }) => {
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()].sort());
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa vị trí "${loc}"?`)) {
      setLocations(locations.filter(l => l !== loc));
    }
  };

  const handleAddType = () => {
    if (newType.trim() && !cameraTypes.includes(newType.trim())) {
      setCameraTypes([...cameraTypes, newType.trim()].sort());
      setNewType('');
    }
  };

  const handleRemoveType = (type: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa loại camera "${type}"?`)) {
      setCameraTypes(cameraTypes.filter(t => t !== type));
    }
  };

  const Section = ({ title, items, newItemValue, setNewItemValue, onAdd, onRemove, placeholder }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      
      {/* Add New Item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newItemValue}
          onChange={(e) => setNewItemValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary text-gray-900"
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm
        </button>
      </div>

      {/* List Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item: string) => (
          <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200 group">
            <span className="font-medium text-gray-700">{item}</span>
            <button
              onClick={() => onRemove(item)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <p className="text-gray-400 text-sm italic">Chưa có dữ liệu.</p>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-gray-100 mr-4">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Cấu Hình Hệ Thống</h2>
            <p className="text-gray-500 text-sm">Quản lý các danh mục dùng chung cho toàn bộ hệ thống</p>
        </div>
      </div>

      <Section 
        title="Quản lý Vị Trí Lắp Đặt" 
        items={locations} 
        newItemValue={newLocation} 
        setNewItemValue={setNewLocation}
        onAdd={handleAddLocation}
        onRemove={handleRemoveLocation}
        placeholder="Nhập tên vị trí mới (ví dụ: Kho Lạnh, Cổng Phụ...)"
      />

      <Section 
        title="Quản lý Loại Camera" 
        items={cameraTypes} 
        newItemValue={newType} 
        setNewItemValue={setNewType}
        onAdd={handleAddType}
        onRemove={handleRemoveType}
        placeholder="Nhập loại camera mới (ví dụ: Thermal, Fisheye...)"
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-start">
        <div className="font-bold mr-2">Lưu ý:</div>
        <div>
          Việc xóa các danh mục đang được sử dụng bởi các Camera hiện tại sẽ không làm mất dữ liệu của Camera đó, nhưng có thể ảnh hưởng đến các bộ lọc tìm kiếm.
        </div>
      </div>
    </div>
  );
};

export default Settings;