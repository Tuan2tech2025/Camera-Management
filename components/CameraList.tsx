import React, { useState, useEffect } from 'react';
import { Camera, Recorder, CameraStatus } from '../types';
import { Search, Filter, Edit, Trash2, Plus, Download, Server, Video, HardDrive, X, Save } from 'lucide-react';

interface CameraListProps {
  cameras: Camera[];
  recorders: Recorder[];
  locations: string[];
  cameraTypes: string[];
  onAddCamera: () => void;
  onUpdateCamera: (camera: Camera) => void;
  onDeleteCamera: (id: string) => void;
}

type TabType = 'cameras' | 'recorders';

const CameraList: React.FC<CameraListProps> = ({ 
  cameras, 
  recorders, 
  locations,
  cameraTypes,
  onAddCamera, 
  onUpdateCamera, 
  onDeleteCamera 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cameras');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Camera Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRecorder, setFilterRecorder] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Recorder Filters
  const [filterRecLocation, setFilterRecLocation] = useState<string>('all');

  // Editing State
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  // Helper to get unique values for dropdowns (merge defined lists with any legacy data existing in items)
  // Although we have props, we also want to show actual data if it's not in the list
  const uniqueRecLocations = Array.from(new Set(recorders.map(r => r.location))).sort();

  const getRecorderName = (id: string) => recorders.find(r => r.id === id)?.name || 'Unknown';

  // Filter Logic for Cameras
  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cam.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cam.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cam.status === filterStatus;
    const matchesRecorder = filterRecorder === 'all' || cam.recorderId === filterRecorder;
    const matchesType = filterType === 'all' || cam.type === filterType;
    const matchesLocation = filterLocation === 'all' || cam.location === filterLocation;

    return matchesSearch && matchesStatus && matchesRecorder && matchesType && matchesLocation;
  });

  // Filter Logic for Recorders
  const filteredRecorders = recorders.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterRecLocation === 'all' || rec.location === filterRecLocation;
    return matchesSearch && matchesLocation;
  });

  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = '';

    if (activeTab === 'cameras') {
      headers = ["Tên", "IP", "Đầu Ghi", "Vị Trí", "Loại", "Trạng Thái", "Ngày Lắp", "Ghi Chú"];
      rows = filteredCameras.map(c => [
        c.name,
        c.ip,
        getRecorderName(c.recorderId),
        c.location,
        c.type,
        c.status,
        c.installDate,
        c.note || ''
      ]);
      filename = "danh_sach_camera.csv";
    } else {
      headers = ["Tên Đầu Ghi", "IP", "Port", "Vị Trí", "HDD", "User", "Ghi Chú"];
      rows = filteredRecorders.map(r => [
        r.name,
        r.ip,
        r.port,
        r.location,
        r.hddCapacity || 'N/A',
        r.username,
        r.note || ''
      ]);
      filename = "danh_sach_dau_ghi.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (cam: Camera) => {
    setEditingCamera({ ...cam });
  };

  const handleSaveEdit = () => {
    if (editingCamera) {
      onUpdateCamera(editingCamera);
      setEditingCamera(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCamera(null);
  };

  const handleInputChange = (field: keyof Camera, value: string) => {
    if (editingCamera) {
      setEditingCamera({ ...editingCamera, [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => { setActiveTab('cameras'); setSearchTerm(''); }}
          className={`flex items-center px-6 py-4 text-sm font-medium focus:outline-none transition-colors ${
            activeTab === 'cameras' 
              ? 'text-primary border-b-2 border-primary bg-green-50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Video className="w-4 h-4 mr-2" />
          Camera ({cameras.length})
        </button>
        <button
          onClick={() => { setActiveTab('recorders'); setSearchTerm(''); }}
          className={`flex items-center px-6 py-4 text-sm font-medium focus:outline-none transition-colors ${
            activeTab === 'recorders' 
              ? 'text-secondary border-b-2 border-secondary bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Server className="w-4 h-4 mr-2" />
          Đầu Ghi ({recorders.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={`Tìm kiếm ${activeTab === 'cameras' ? 'camera' : 'đầu ghi'}...`} 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            {activeTab === 'cameras' ? (
              <>
                <select 
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value={CameraStatus.ACTIVE}>Hoạt động</option>
                  <option value={CameraStatus.INACTIVE}>Mất tín hiệu</option>
                  <option value={CameraStatus.MAINTENANCE}>Bảo trì</option>
                </select>

                <select 
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 max-w-[150px]"
                  value={filterRecorder}
                  onChange={(e) => setFilterRecorder(e.target.value)}
                >
                  <option value="all">Tất cả đầu ghi</option>
                  {recorders.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>

                <select 
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tất cả loại</option>
                  {cameraTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select 
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 max-w-[150px]"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="all">Tất cả vị trí</option>
                  {locations.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </>
            ) : (
              // Recorder Filters
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-gray-900"
                value={filterRecLocation}
                onChange={(e) => setFilterRecLocation(e.target.value)}
              >
                <option value="all">Tất cả vị trí</option>
                {uniqueRecLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 shrink-0">
          <button 
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
          {activeTab === 'cameras' && (
            <button 
              onClick={onAddCamera}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm Cam
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-auto flex-1 custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            {activeTab === 'cameras' ? (
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-0">
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Tên Camera</th>
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">IP / Kênh</th>
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Loại</th>
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Đầu Ghi</th>
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Vị Trí</th>
                <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Trạng Thái</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right whitespace-nowrap">Thao tác</th>
              </tr>
            ) : (
              <tr className="bg-blue-50 border-b border-blue-100 sticky top-0 z-0">
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">Tên Đầu Ghi</th>
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">IP Address</th>
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">Port</th>
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">HDD</th>
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">Vị Trí</th>
                <th className="p-4 font-semibold text-blue-800 text-sm whitespace-nowrap">Ghi Chú</th>
                <th className="p-4 font-semibold text-blue-800 text-sm text-right whitespace-nowrap">Thao tác</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'cameras' ? (
              filteredCameras.length > 0 ? (
                filteredCameras.map((cam) => (
                  <tr key={cam.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors group">
                    <td className="p-4 font-medium text-gray-800">{cam.name}</td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{cam.ip}</td>
                    <td className="p-4 text-gray-600 text-sm">{cam.type}</td>
                    <td className="p-4 text-gray-600 text-sm">{getRecorderName(cam.recorderId)}</td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 border border-gray-200 whitespace-nowrap">
                        {cam.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${cam.status === CameraStatus.ACTIVE ? 'bg-green-100 text-green-800' : 
                          cam.status === CameraStatus.INACTIVE ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cam.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(cam)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteCamera(cam.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy camera nào khớp với bộ lọc.
                  </td>
                </tr>
              )
            ) : (
              // Recorder Rows
              filteredRecorders.length > 0 ? (
                filteredRecorders.map((rec) => (
                  <tr key={rec.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors group">
                    <td className="p-4 font-medium text-gray-800">{rec.name}</td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{rec.ip}</td>
                    <td className="p-4 text-gray-600 text-sm">{rec.port}</td>
                    <td className="p-4 text-gray-600 text-sm">
                        <div className="flex items-center text-blue-600">
                            <HardDrive className="w-3 h-3 mr-1" />
                            {rec.hddCapacity || 'N/A'}
                        </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 border border-gray-200 whitespace-nowrap">
                        {rec.location}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm italic">{rec.note}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy đầu ghi nào khớp với bộ lọc.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Chỉnh Sửa Camera</h3>
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Camera</label>
                  <input 
                    type="text" 
                    value={editingCamera.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP / Kênh</label>
                  <input 
                    type="text" 
                    value={editingCamera.ip}
                    onChange={(e) => handleInputChange('ip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Loại Camera</label>
                   <select
                      value={editingCamera.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary bg-white text-gray-900"
                    >
                      {cameraTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đầu Ghi</label>
                  <select 
                    value={editingCamera.recorderId}
                    onChange={(e) => handleInputChange('recorderId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary bg-white text-gray-900"
                  >
                    {recorders.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị Trí Lắp Đặt</label>
                <select 
                  value={editingCamera.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary bg-white text-gray-900"
                >
                   {locations.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                  <select 
                    value={editingCamera.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary bg-white text-gray-900"
                  >
                    <option value={CameraStatus.ACTIVE}>Hoạt động</option>
                    <option value={CameraStatus.INACTIVE}>Mất tín hiệu</option>
                    <option value={CameraStatus.MAINTENANCE}>Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Lắp Đặt</label>
                  <input 
                    type="date" 
                    value={editingCamera.installDate}
                    onChange={(e) => handleInputChange('installDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <textarea 
                  value={editingCamera.note || ''}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-2">
              <button 
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraList;