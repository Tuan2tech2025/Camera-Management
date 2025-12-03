import React, { useState, useEffect } from 'react';
import { ViewMode, Camera, Recorder, CameraStatus, LogEntry, SiteMapData, User } from './types';
import { INITIAL_CAMERAS, INITIAL_RECORDERS, INITIAL_LOGS, APP_VERSION, INITIAL_USERS } from './constants';
import Dashboard from './components/Dashboard';
import CameraList from './components/CameraList    
import SiteMap from './components/SiteMap';
import ChatAssistant from './components/ChatAssistant';
import ActivityLog from './components/ActivityLog';
import Login from './components/Login';
import Account from './components/Account';
import { LayoutDashboard, List, Map as MapIcon, MessageSquare, LogOut, Camera as CameraIcon, Menu, X, History, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- Auth & User Management State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  
  // Initialize users from localStorage or fallback to constants
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cammanager_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Persist users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cammanager_users', JSON.stringify(users));
  }, [users]);

  // --- App Data State ---
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [recorders, setRecorders] = useState<Recorder[]>(INITIAL_RECORDERS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  
  // Notification State
  const [notification, setNotification] = useState<{ title: string, message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  
  // Site Map State - Multiple Maps
  const [maps, setMaps] = useState<SiteMapData[]>([
    { id: 'map_main', name: 'Sơ đồ Chính', imageUrl: null }
  ]);
  
  // Positions now include mapId
  const [cameraPositions, setCameraPositions] = useState<Record<string, { x: number, y: number, mapId: string }>>({});

  // Responsive Sidebar State
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Filters passed from Dashboard to List
  const [initialListFilters, setInitialListFilters] = useState<{ type: 'status' | 'location' | 'year', value: string } | null>(null);

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

  // --- PERMISSION & ACCESS CONTROL ---
  // Filter cameras based on user's allowed locations
  const visibleCameras = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return cameras;
    }
    // For non-admin, if allowedLocations is empty, show nothing
    if (!currentUser.allowedLocations || currentUser.allowedLocations.length === 0) {
      return [];
    }
    return cameras.filter(c => currentUser.allowedLocations?.includes(c.location));
  }, [cameras, currentUser]);

  const visibleRecorders = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return recorders;
    }
    // For non-admin, if allowedLocations is empty, show nothing
    if (!currentUser.allowedLocations || currentUser.allowedLocations.length === 0) {
      return [];
    }
    return recorders.filter(r => currentUser.allowedLocations?.includes(r.location));
  }, [recorders, currentUser]);


  // --- Auth Handlers ---
  const handleLogin = (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setLoginError(undefined);
      addLog('Thêm', 'Tài Khoản', user.username, 'Đăng nhập vào hệ thống', user.username);
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
        addLog('Thêm', 'Tài Khoản', currentUser.username, 'Đăng xuất khỏi hệ thống', currentUser.username);
    }
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdatePassword = (newPass: string) => {
    if (currentUser) {
        const updatedUser = { ...currentUser, password: newPass };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        addLog('Sửa', 'Tài Khoản', currentUser.username, 'Đổi mật khẩu cá nhân');
    }
  };

  // --- User Management Handlers (Admin Only) ---
  const handleSaveUser = (user: User) => {
    const exists = users.find(u => u.id === user.id);
    if (exists) {
        setUsers(prev => prev.map(u => u.id === user.id ? user : u));
        addLog('Sửa', 'Tài Khoản', user.username, `Cập nhật thông tin/quyền hạn. Role: ${user.role}`);
    } else {
        if (users.some(u => u.username === user.username)) {
            alert('Tên đăng nhập đã tồn tại!');
            return;
        }
        setUsers(prev => [...prev, user]);
        addLog('Thêm', 'Tài Khoản', user.username, `Tạo tài khoản mới. Role: ${user.role}`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addLog('Xóa', 'Tài Khoản', user.username, 'Xóa tài khoản khỏi hệ thống');
    }
  };

  // --- Dashboard Interaction ---
  const handleDashboardClick = (type: 'status' | 'location' | 'year', value: string) => {
    setInitialListFilters({ type, value });
    setCurrentView('list');
  };

  // --- Logger Helper ---
  const addLog = (
    action: 'Thêm' | 'Sửa' | 'Xóa',
    targetType: 'Camera' | 'Đầu Ghi' | 'Vị Trí' | 'Loại Cam' | 'Trạng Thái' | 'Sơ Đồ' | 'Tài Khoản',
    targetName: string,
    details: string,
    usernameOverride?: string
  ) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}`,
      action,
      targetType,
      targetName,
      details,
      timestamp: new Date().toISOString(),
      user: usernameOverride || currentUser?.username || 'System'
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
      // Basic IP duplication check for manual add
      if (cameras.some(c => c.ip.trim().toLowerCase() === cameraData.ip.trim().toLowerCase())) {
          alert(`Cảnh báo: IP ${cameraData.ip} đã tồn tại trong hệ thống!`);
          return;
      }

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

  const handleImportCameras = (importedData: any[]) => {
    const newCameras: Camera[] = [];
    const newLocations = new Set(locations);
    const newTypes = new Set(cameraTypes);
    const newStatuses = new Set(statuses);
    
    // Set of existing IPs for deduplication (normalize to lowercase)
    const existingIps = new Set(cameras.map(c => c.ip.trim().toLowerCase()));

    let addedCount = 0;
    let skippedCount = 0;

    importedData.forEach((item) => {
      const ip = item.ip ? item.ip.toString().trim() : '';

      // Skip if IP is empty
      if (!ip) return;

      // Duplicate Check: Check against system IPs AND IPs newly processed in this batch
      if (existingIps.has(ip.toLowerCase())) {
          skippedCount++;
          return; // Skip this entry
      }

      // Find recorder ID by name
      const recorder = recorders.find(r => r.name.toLowerCase() === item.recorderName?.toLowerCase());
      const recorderId = recorder ? recorder.id : ''; // Default to empty or maybe a fallback
      
      // Auto-add new config items
      if (item.location && !newLocations.has(item.location)) newLocations.add(item.location);
      if (item.type && !newTypes.has(item.type)) newTypes.add(item.type);
      if (item.status && !newStatuses.has(item.status)) newStatuses.add(item.status);

      const newCam: Camera = {
        id: `cam_imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unnamed Camera',
        recorderId: recorderId,
        ip: ip,
        location: item.location || 'Unknown',
        installDate: item.installDate || new Date().toISOString().split('T')[0],
        status: item.status || 'Hoạt động',
        type: item.type || 'Bullet',
        note: item.note || ''
      };
      
      // Add to batch and to 'existingIps' to prevent duplicates within the same file
      newCameras.push(newCam);
      existingIps.add(ip.toLowerCase());
      addedCount++;
    });

    if (addedCount > 0) {
        // Update States
        setLocations(Array.from(newLocations).sort());
        setCameraTypes(Array.from(newTypes).sort());
        setStatuses(Array.from(newStatuses));
        setCameras(prev => [...prev, ...newCameras]);

        addLog('Thêm', 'Camera', `${addedCount} Camera`, `Nhập khẩu thành công ${addedCount} camera từ file Excel/CSV. Bỏ qua ${skippedCount} bản ghi trùng IP.`);
    }

    // Show Notification
    if (addedCount > 0) {
        setNotification({
            title: 'Kết Quả Nhập Dữ Liệu',
            message: `Đã nhập thành công: ${addedCount} camera.\nĐã bỏ qua: ${skippedCount} camera (do trùng IP).`,
            type: skippedCount > 0 ? 'warning' : 'success'
        });
    } else if (skippedCount > 0) {
         setNotification({
            title: 'Không Thể Nhập Dữ Liệu',
            message: `Tất cả ${skippedCount} bản ghi đều bị trùng IP với hệ thống hiện tại.`,
            type: 'error'
        });
    } else {
        setNotification({
            title: 'File Rỗng hoặc Lỗi',
            message: 'Không tìm thấy dữ liệu hợp lệ trong file.',
            type: 'error'
        });
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
    // Check usage
    const usedByCameras = cameras.filter(c => c.location === name).length;
    const usedByRecorders = recorders.filter(r => r.location === name).length;

    if (usedByCameras > 0 || usedByRecorders > 0) {
        setNotification({
            title: 'Không thể xóa vị trí',
            message: `Vị trí "${name}" đang được sử dụng bởi ${usedByCameras} Camera và ${usedByRecorders} Đầu ghi.\nVui lòng gỡ bỏ hoặc đổi vị trí cho các thiết bị này trước khi xóa.`,
            type: 'warning'
        });
        return;
    }

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
    // Check usage
    const usedByCameras = cameras.filter(c => c.type === name).length;
    
    if (usedByCameras > 0) {
        setNotification({
            title: 'Không thể xóa loại camera',
            message: `Loại camera "${name}" đang được gán cho ${usedByCameras} thiết bị.\nVui lòng thay đổi loại cho các camera này trước khi xóa.`,
            type: 'warning'
        });
        return;
    }

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
    // Check usage
    const usedByCameras = cameras.filter(c => c.status === name).length;

    if (usedByCameras > 0) {
        setNotification({
            title: 'Không thể xóa trạng thái',
            message: `Trạng thái "${name}" đang được gán cho ${usedByCameras} thiết bị.\nVui lòng thay đổi trạng thái cho các camera này trước khi xóa.`,
            type: 'warning'
        });
        return;
    }

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

  // --- AUTH CHECK ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

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
          <div className="pt-4 border-t border-gray-100 mt-2">
            <NavItem view="account" icon={UserCircle} label="Tài khoản" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="mb-4 text-xs text-gray-400 text-center">
            {currentUser.role === 'admin' ? 'Quyền: Toàn bộ hệ thống' : `Quyền hạn chế: ${currentUser.allowedLocations?.length || 0} vị trí`}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2 text-sm"
          >
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
             <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-gray-800">{currentUser.fullName}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{currentUser.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 uppercase">
                  {currentUser.avatar || currentUser.fullName.substring(0, 2)}
                </div>
             </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 w-full">
          {currentView === 'dashboard' && (
            <Dashboard 
                cameras={visibleCameras} 
                recorders={visibleRecorders} 
                onChartClick={handleDashboardClick}
            />
          )}
          {currentView === 'list' && (
            <CameraList 
              cameras={visibleCameras} 
              recorders={visibleRecorders}
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
              onImportCameras={handleImportCameras}
              initialFilters={initialListFilters}
            />
          )}
          {currentView === 'map' && (
            <SiteMap 
              cameras={visibleCameras} 
              maps={maps}
              onAddMap={handleAddMap}
              onDeleteMap={handleDeleteMap}
              onUpdateMapImage={handleUpdateMapImage}
              cameraPositions={cameraPositions}
              onUpdatePosition={handleUpdateMapPosition}
            />
          )}
          {currentView === 'ai' && (
            <ChatAssistant cameras={visibleCameras} recorders={visibleRecorders} />
          )}
          {currentView === 'logs' && (
            <ActivityLog logs={logs} />
          )}
          {currentView === 'account' && (
            <Account 
                currentUser={currentUser} 
                users={users} // Pass all users for admin management
                locations={locations} // Pass locations for permission assignment
                onUpdatePassword={handleUpdatePassword} 
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
            />
          )}
        </div>
      </main>

      {/* Global Notification Modal */}
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 transform transition-all animate-fade-in">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
                    notification.type === 'success' ? 'bg-green-100' : 
                    notification.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                    {notification.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {notification.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
                    {notification.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{notification.title}</h3>
                <p className="text-center text-gray-500 text-sm mb-6 whitespace-pre-line">
                    {notification.message}
                </p>
                <button 
                    onClick={() => setNotification(null)}
                    className={`w-full px-4 py-2 text-white rounded-lg shadow-sm font-medium transition-colors ${
                        notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                        notification.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    Đóng
                </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;