import React, { useState, useEffect } from 'react';
import { ViewMode, Camera, Recorder, CameraStatus, LogEntry, SiteMapData } from './types';
import { INITIAL_CAMERAS, INITIAL_RECORDERS, INITIAL_LOGS, APP_VERSION } from './constants';
import Dashboard from './components/Dashboard';
import CameraList from './components/CameraList';
import SiteMap from './components/SiteMap';
import ChatAssistant from './components/ChatAssistant';
import ActivityLog from './components/ActivityLog';
import { LayoutDashboard, List, Map as MapIcon, MessageSquare, LogOut, Camera as CameraIcon, Menu, X, History } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [recorders, setRecorders] = useState<Recorder[]>(INITIAL_RECORDERS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  
  // Site Map State - Multiple Maps
  const [maps, setMaps] = useState<SiteMapData[]>([
    { id: 'map_main', name: 'Sơ đồ Chính', imageUrl: null }
  ]);
  
  // Positions now include mapId
  const [cameraPositions, setCameraPositions] = useState<Record<string, { x: number, y: number, mapId: string }>>({});

  // Responsive Sidebar State
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Config Lists
  const [locations, setLocations] = useState<string[]>(
    Array.from(new Set([
      ...INITIAL_CAMERAS.map(c => c.location),
      ...INITIAL_RECORDERS.map(r => r.location)
    ])).sort()
  );
  
  const [cameraTypes, setCameraTypes] = useState<string[]>(
    ['Bullet', 'Dome', 'PTZ', 'Fisheye', 'Thermal', 'Box']
  );

  const [statuses, setStatuses] = useState<string[]>(
    ['Hoạt động', 'Mất tín hiệu', 'Bảo trì']
  );

  // --- Logger Helper ---
  const addLog = (
    action: 'Thêm' | 'Sửa' | 'Xóa',
    targetType: 'Camera' | 'Đầu Ghi' | 'Vị Trí' | 'Loại Cam' | 'Trạng Thái' | 'Sơ Đồ',
    targetName: string,
    details: string
  ) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}`,
      action,
      targetType,
      targetName,
      details,
      timestamp: new Date().toISOString(),
      user: 'AD'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- Map Handlers ---
  const handleUpdateMapPosition = (id: string, x: number, y: number, mapId: string) => {
    setCameraPositions(prev => ({
      ...prev,
      [id]: { x, y, mapId }
    }));
  };

  const handleAddMap = (name: string) => {
    const newMap: SiteMapData = {
        id: `map_${Date.now()}`,
        name: name,
        imageUrl: null
    };
    setMaps(prev => [...prev, newMap]);
    addLog('Thêm', 'Sơ Đồ', name, 'Tạo sơ đồ giám sát mới');
  };

  const handleDeleteMap = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    if (!map) return;
    
    setMaps(prev => prev.filter(m => m.id !== mapId));
    
    // Remove positions associated with this map
    const newPositions = { ...cameraPositions };
    Object.keys(newPositions).forEach(key => {
        if (newPositions[key].mapId === mapId) {
            delete newPositions[key];
        }
    });
    setCameraPositions(newPositions);
    
    addLog('Xóa', 'Sơ Đồ', map.name, 'Xóa sơ đồ và reset vị trí các camera liên quan');
  };

  const handleUpdateMapImage = (mapId: string, imageUrl: string | null) => {
      setMaps(prev => prev.map(m => m.id === mapId ? { ...m, imageUrl } : m));
  };

  // --- Camera Handlers ---
  const handleSaveCamera = (cameraData: Camera) => {
    const existingCam = cameras.find(c => c.id === cameraData.id);

    if (existingCam) {
      const changes: string[] = [];
      if (existingCam.name !== cameraData.name) changes.push(`Tên: "${existingCam.name}" -> "${cameraData.name}"`);
      if (existingCam.ip !== cameraData.ip) changes.push(`IP: ${existingCam.ip} -> ${cameraData.ip}`);
      if (existingCam.location !== cameraData.location) changes.push(`Vị trí: ${existingCam.location} -> ${cameraData.location}`);
      if (existingCam.status !== cameraData.status) changes.push(`Trạng thái: ${existingCam.status} -> ${cameraData.status}`);
      if (existingCam.type !== cameraData.type) changes.push(`Loại: ${existingCam.type} -> ${cameraData.type}`);
      if (existingCam.recorderId !== cameraData.recorderId) changes.push(`Đổi đầu ghi`);
      if (existingCam.installDate !== cameraData.installDate) changes.push(`Ngày lắp: ${existingCam.installDate} -> ${cameraData.installDate}`);
      if (existingCam.note !== cameraData.note) changes.push(`Ghi chú thay đổi`);

      const logDetail = changes.length > 0 ? changes.join('; ') : 'Cập nhật (không có thay đổi dữ liệu)';
      addLog('Sửa', 'Camera', cameraData.name, logDetail);

      setCameras(prev => prev.map(c => c.id === cameraData.id ? cameraData : c));
    } else {
      addLog('Thêm', 'Camera', cameraData.name, `Thêm mới camera tại ${cameraData.location}. IP: ${cameraData.ip}`);
      setCameras(prev => [...prev, cameraData]);
    }
  };

  const handleDeleteCamera = (id: string) => {
    const cam = cameras.find(c => c.id === id);
    if (cam) {
      setCameras(cameras.filter(c => c.id !== id));
      // Remove from map positions if exists
      const { [id]: removed, ...rest } = cameraPositions;
      setCameraPositions(rest);
      addLog('Xóa', 'Camera', cam.name, `Đã xóa camera IP: ${cam.ip}`);
    }
  };

  // --- Recorder Handlers ---
  const handleSaveRecorder = (recorderData: Recorder) => {
    const existingRec = recorders.find(r => r.id === recorderData.id);

    if (existingRec) {
       const changes: string[] = [];
       if (existingRec.name !== recorderData.name) changes.push(`Tên: "${existingRec.name}" -> "${recorderData.name}"`);
       if (existingRec.ip !== recorderData.ip) changes.push(`IP: ${existingRec.ip} -> ${recorderData.ip}`);
       if (existingRec.port !== recorderData.port) changes.push(`Port: ${existingRec.port} -> ${recorderData.port}`);
       if (existingRec.hddCapacity !== recorderData.hddCapacity) changes.push(`HDD: ${existingRec.hddCapacity} -> ${recorderData.hddCapacity}`);
       if (existingRec.location !== recorderData.location) changes.push(`Vị trí: ${existingRec.location} -> ${recorderData.location}`);
       if (existingRec.note !== recorderData.note) changes.push(`Ghi chú thay đổi`);

       const logDetail = changes.length > 0 ? changes.join('; ') : 'Cập nhật (không có thay đổi dữ liệu)';
       addLog('Sửa', 'Đầu Ghi', recorderData.name, logDetail);

       setRecorders(prev => prev.map(r => r.id === recorderData.id ? recorderData : r));
    } else {
      addLog('Thêm', 'Đầu Ghi', recorderData.name, `Thêm mới đầu ghi IP: ${recorderData.ip}, HDD: ${recorderData.hddCapacity}`);
      setRecorders(prev => [...prev, recorderData]);
    }
  };

  const handleDeleteRecorder = (id: string) => {
    const rec = recorders.find(r => r.id === id);
    if (rec) {
      setRecorders(recorders.filter(r => r.id !== id));
      addLog('Xóa', 'Đầu Ghi', rec.name, `Đã xóa đầu ghi IP: ${rec.ip}`);
    }
  };

  // --- Location Handlers ---
  const handleSaveLocation = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    
    if (locations.some(l => l.toLowerCase() === newName.toLowerCase() && l !== oldName)) {
        alert('Vị trí này đã tồn tại!');
        return;
    }

    if (oldName === '') {
        setLocations(prev => [...prev, newName].sort());
        addLog('Thêm', 'Vị Trí', newName, 'Tạo vị trí lắp đặt mới');
    } else {
        setLocations(prev => prev.map(l => l === oldName ? newName : l).sort());
        setCameras(prev => prev.map(c => c.location === oldName ? { ...c, location: newName } : c));
        setRecorders(prev => prev.map(r => r.location === oldName ? { ...r, location: newName } : r));
        addLog('Sửa', 'Vị Trí', oldName, `Đổi tên thành "${newName}". Cập nhật tham chiếu cho các thiết bị liên quan.`);
    }
  };

  const handleDeleteLocation = (name: string) => {
    setLocations(locations.filter(l => l !== name));
    addLog('Xóa', 'Vị Trí', name, 'Xóa vị trí khỏi danh mục');
  };

  // --- Type Handlers ---
  const handleSaveType = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    
    if (cameraTypes.some(t => t.toLowerCase() === newName.toLowerCase() && t !== oldName)) {
        alert('Loại camera này đã tồn tại!');
        return;
    }

    if (oldName === '') {
        setCameraTypes(prev => [...prev, newName].sort());
        addLog('Thêm', 'Loại Cam', newName, 'Tạo loại camera mới');
    } else {
        setCameraTypes(prev => prev.map(t => t === oldName ? newName : t).sort());
        setCameras(prev => prev.map(c => c.type === oldName ? { ...c, type: newName } : c));
        addLog('Sửa', 'Loại Cam', oldName, `Đổi tên thành "${newName}". Cập nhật tham chiếu.`);
    }
  };

  const handleDeleteType = (name: string) => {
    setCameraTypes(cameraTypes.filter(t => t !== name));
    addLog('Xóa', 'Loại Cam', name, 'Xóa loại camera khỏi danh mục');
  };

  // --- Status Handlers ---
  const handleSaveStatus = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    
    if (statuses.some(s => s.toLowerCase() === newName.toLowerCase() && s !== oldName)) {
        alert('Trạng thái này đã tồn tại!');
        return;
    }

    if (oldName === '') {
        setStatuses(prev => [...prev, newName]);
        addLog('Thêm', 'Trạng Thái', newName, 'Tạo trạng thái mới');
    } else {
        setStatuses(prev => prev.map(s => s === oldName ? newName : s));
        setCameras(prev => prev.map(c => c.status === oldName ? { ...c, status: newName } : c));
        addLog('Sửa', 'Trạng Thái', oldName, `Đổi tên thành "${newName}". Cập nhật tham chiếu.`);
    }
  };

  const handleDeleteStatus = (name: string) => {
    setStatuses(statuses.filter(s => s !== name));
    addLog('Xóa', 'Trạng Thái', name, 'Xóa trạng thái khỏi danh mục');
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 768) setSidebarOpen(false); // Auto close on mobile
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm ${
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
    <div className="h-screen bg-[#f8f9fa] flex overflow-hidden text-sm">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100 flex-shrink-0">
          <div className="bg-primary p-2 rounded-lg">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">CamManager</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Tổng Quan" />
          <NavItem view="list" icon={List} label="Danh sách Camera" />
          <NavItem view="map" icon={MapIcon} label="Sơ đồ Giám sát" />
          <NavItem view="ai" icon={MessageSquare} label="Trợ lý AI" />
          <NavItem view="logs" icon={History} label="Nhật Ký" />
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2 text-sm">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:block"></div>

          <div className="flex items-center space-x-4">
             <div className="text-sm text-gray-500 hidden sm:flex items-center">
                Dữ liệu cập nhật: {new Date().toLocaleDateString('vi-VN')}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-500 border border-gray-200">
                  v{APP_VERSION}
                </span>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
               AD
             </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 w-full">
          {currentView === 'dashboard' && (
            <Dashboard cameras={cameras} recorders={recorders} />
          )}
          {currentView === 'list' && (
            <CameraList 
              cameras={cameras} 
              recorders={recorders}
              locations={locations}
              cameraTypes={cameraTypes}
              statuses={statuses}
              onSaveCamera={handleSaveCamera}
              onDeleteCamera={handleDeleteCamera}
              onSaveRecorder={handleSaveRecorder}
              onDeleteRecorder={handleDeleteRecorder}
              onSaveLocation={handleSaveLocation}
              onDeleteLocation={handleDeleteLocation}
              onSaveType={handleSaveType}
              onDeleteType={handleDeleteType}
              onSaveStatus={handleSaveStatus}
              onDeleteStatus={handleDeleteStatus}
            />
          )}
          {currentView === 'map' && (
            <SiteMap 
              cameras={cameras} 
              maps={maps}
              onAddMap={handleAddMap}
              onDeleteMap={handleDeleteMap}
              onUpdateMapImage={handleUpdateMapImage}
              cameraPositions={cameraPositions}
              onUpdatePosition={handleUpdateMapPosition}
            />
          )}
          {currentView === 'ai' && (
            <ChatAssistant cameras={cameras} recorders={recorders} />
          )}
          {currentView === 'logs' && (
            <ActivityLog logs={logs} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;