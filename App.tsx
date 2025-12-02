import React, { useState } from 'react';
import { ViewMode, Camera, Recorder, CameraStatus } from './types';
import { INITIAL_CAMERAS, INITIAL_RECORDERS } from './constants';
import Dashboard from './components/Dashboard';
import CameraList from './components/CameraList';
import SiteMap from './components/SiteMap';
import ChatAssistant from './components/ChatAssistant';
import Settings from './components/Settings';
import { LayoutDashboard, List, Map as MapIcon, MessageSquare, Settings as SettingsIcon, LogOut, Camera as CameraIcon, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode | 'settings'>('dashboard');
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [recorders] = useState<Recorder[]>(INITIAL_RECORDERS);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Global Config Lists (Derived from initial data + user edits)
  const [locations, setLocations] = useState<string[]>(
    Array.from(new Set(INITIAL_CAMERAS.map(c => c.location))).sort()
  );
  const [cameraTypes, setCameraTypes] = useState<string[]>(
    Array.from(new Set(INITIAL_CAMERAS.map(c => c.type))).sort()
  );

  // Simple Mock Add/Delete functions
  const handleAddCamera = () => {
    // In a real app, this would open a modal form
    const newCam: Camera = {
      id: `new_${Date.now()}`,
      name: 'Camera Mới',
      recorderId: 'rec_1',
      ip: '192.168.1.100',
      location: locations[0] || 'Chưa xác định',
      installDate: new Date().toISOString().split('T')[0],
      status: CameraStatus.ACTIVE,
      type: cameraTypes[0] || 'Dome'
    };
    setCameras([...cameras, newCam]);
    alert('Đã thêm camera demo. Vui lòng nhấn nút Edit để cập nhật thông tin.');
  };

  const handleUpdateCamera = (updatedCamera: Camera) => {
    setCameras(prevCameras => 
      prevCameras.map(cam => cam.id === updatedCamera.id ? updatedCamera : cam)
    );
  };

  const handleDeleteCamera = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa camera này?')) {
      setCameras(cameras.filter(c => c.id !== id));
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewMode | 'settings', icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-green-50 text-primary font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 -ml-4'
        } bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col fixed h-full z-20 md:relative`}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
          <div className="bg-primary p-2 rounded-lg">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">CamManager</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Tổng Quan" />
          <NavItem view="list" icon={List} label="Danh sách Camera" />
          <NavItem view="map" icon={MapIcon} label="Sơ đồ Giám sát" />
          <NavItem view="ai" icon={MessageSquare} label="Trợ lý AI" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavItem view="settings" icon={SettingsIcon} label="Cài đặt" />
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-4">
             <div className="text-sm text-gray-500 hidden sm:block">
                Dữ liệu cập nhật: {new Date().toLocaleDateString('vi-VN')}
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
               AD
             </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-auto p-6">
          {currentView === 'dashboard' && (
            <Dashboard cameras={cameras} recorders={recorders} />
          )}
          {currentView === 'list' && (
            <CameraList 
              cameras={cameras} 
              recorders={recorders}
              locations={locations}
              cameraTypes={cameraTypes}
              onAddCamera={handleAddCamera}
              onUpdateCamera={handleUpdateCamera}
              onDeleteCamera={handleDeleteCamera}
            />
          )}
          {currentView === 'map' && (
            <SiteMap cameras={cameras} />
          )}
          {currentView === 'ai' && (
            <ChatAssistant cameras={cameras} recorders={recorders} />
          )}
          {currentView === 'settings' && (
            <Settings 
              locations={locations} 
              setLocations={setLocations}
              cameraTypes={cameraTypes}
              setCameraTypes={setCameraTypes}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;