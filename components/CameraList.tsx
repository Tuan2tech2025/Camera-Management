import React, { useState, useRef, useEffect } from 'react';
import { Camera, Recorder } from '../types';
import { Search, Edit, Trash2, Plus, Download, Server, Video, HardDrive, X, Save, MapPin, GripVertical, AlertTriangle, Tag, Activity, ArrowRight, Layers, Aperture, Move, Eye, Flame, Box as BoxIcon, CircleDot, Filter } from 'lucide-react';

interface CameraListProps {
  cameras: Camera[];
  recorders: Recorder[];
  locations: string[];
  cameraTypes: string[];
  statuses: string[];
  
  onSaveCamera: (camera: Camera) => void;
  onDeleteCamera: (id: string) => void;
  
  onSaveRecorder: (recorder: Recorder) => void;
  onDeleteRecorder: (id: string) => void;

  onSaveLocation: (oldName: string, newName: string) => void;
  onDeleteLocation: (name: string) => void;

  onSaveType: (oldName: string, newName: string) => void;
  onDeleteType: (name: string) => void;

  onSaveStatus: (oldName: string, newName: string) => void;
  onDeleteStatus: (name: string) => void;
}

type TabType = 'cameras' | 'recorders' | 'locations' | 'types' | 'statuses';

// --- Color Themes for Grid Items ---
const colorThemes = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-800' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', badge: 'bg-green-100 text-green-800' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-800' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-800' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', badge: 'bg-teal-100 text-teal-800' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-800' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'text-pink-500', badge: 'bg-pink-100 text-pink-800' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', badge: 'bg-cyan-100 text-cyan-800' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', badge: 'bg-rose-100 text-rose-800' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', badge: 'bg-violet-100 text-violet-800' },
];

const getTheme = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorThemes.length;
  return colorThemes[index];
};

const CameraList: React.FC<CameraListProps> = ({ 
  cameras, 
  recorders, 
  locations,
  cameraTypes,
  statuses,
  onSaveCamera, 
  onDeleteCamera,
  onSaveRecorder, 
  onDeleteRecorder,
  onSaveLocation, 
  onDeleteLocation,
  onSaveType,
  onDeleteType,
  onSaveStatus,
  onDeleteStatus
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cameras');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false); // Mobile filter toggle
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRecorder, setFilterRecorder] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Modal States
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [editingRecorder, setEditingRecorder] = useState<Recorder | null>(null);
  const [editingSimpleItem, setEditingSimpleItem] = useState<{ oldName: string, newName: string } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TabType | null>(null); 

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'camera' | 'recorder' | 'location' | 'type' | 'status', id: string, name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // HDD Options
  const hddOptions = ['1TB', '2TB', '4TB', '6TB', '8TB', '10TB', '12TB'];

  // --- Column Resizing State ---
  // Optimized defaults for single screen view
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    // Camera Columns
    cam_name: 180,
    cam_ip: 130,
    cam_type: 90,
    cam_rec: 100,
    cam_loc: 110,
    cam_date: 100,
    cam_status: 120,
    cam_action: 80,
    // Recorder Columns
    rec_name: 180,
    rec_ip: 140,
    rec_hdd: 90,
    rec_loc: 120,
    rec_note: 150,
    rec_action: 80
  });

  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  // Resize Handlers
  const startResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    resizingRef.current = {
      key,
      startX: e.pageX,
      startWidth: colWidths[key] || 150
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { key, startX, startWidth } = resizingRef.current;
    const diff = e.pageX - startX;
    const newWidth = Math.max(50, startWidth + diff); // Min width 50px
    setColWidths(prev => ({ ...prev, [key]: newWidth }));
  };

  const handleMouseUp = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Helper component for Resizable Header
  const ResizableTh = ({ label, widthKey, align = 'left' }: { label: string, widthKey: string, align?: 'left' | 'right' | 'center' }) => (
    <th 
      className={`px-3 py-3 font-semibold text-gray-700 text-sm relative bg-gray-50 border-b border-gray-200 text-${align} group select-none`}
      style={{ width: colWidths[widthKey] }}
    >
      <div className="flex items-center justify-between h-full">
        <span className="truncate">{label}</span>
        {/* Visual Grip Icon */}
        <GripVertical className="w-3 h-3 text-gray-300 ml-1 flex-shrink-0 opacity-50 group-hover:opacity-100" />
      </div>
      
      {/* Interactive Handle Area */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-10 flex justify-center hover:bg-blue-100 transition-colors opacity-0 hover:opacity-50"
        onMouseDown={(e) => startResize(e, widthKey)}
        title="Kéo để thay đổi độ rộng"
      >
          <div className="w-[1px] h-full bg-blue-300"></div>
      </div>
    </th>
  );

  const getRecorderName = (id: string) => recorders.find(r => r.id === id)?.name || 'Unknown';

  // --- Icon Helper ---
  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('dome')) return Aperture;
    if (t.includes('ptz') || t.includes('quay')) return Move;
    if (t.includes('fisheye') || t.includes('360')) return Eye;
    if (t.includes('thermal') || t.includes('nhiệt')) return Flame;
    if (t.includes('box')) return BoxIcon;
    if (t.includes('bullet') || t.includes('thân')) return Video;
    return CircleDot; // Default
  };

  // --- Filtering Logic ---
  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cam.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cam.status === filterStatus;
    const matchesRecorder = filterRecorder === 'all' || cam.recorderId === filterRecorder;
    const matchesType = filterType === 'all' || cam.type === filterType;
    const matchesLocation = filterLocation === 'all' || cam.location === filterLocation;
    return matchesSearch && matchesStatus && matchesRecorder && matchesType && matchesLocation;
  });

  const filteredRecorders = recorders.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || rec.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const filteredLocations = locations.filter(loc => 
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredTypes = cameraTypes.filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStatuses = statuses.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Navigation Handler for Detail Buttons ---
  const handleFilterNavigation = (field: 'location' | 'type' | 'status', value: string) => {
    setFilterLocation('all');
    setFilterType('all');
    setFilterStatus('all');
    setFilterRecorder('all');
    setSearchTerm('');
    
    if (field === 'location') setFilterLocation(value);
    if (field === 'type') setFilterType(value);
    if (field === 'status') setFilterStatus(value);
    
    setActiveTab('cameras');
  };

  // --- Actions ---
  const handleAddCameraClick = () => {
    setEditingCamera({
      id: `cam_${Date.now()}`,
      name: '',
      recorderId: recorders[0]?.id || '',
      ip: '',
      location: locations[0] || '',
      installDate: new Date().toISOString().split('T')[0],
      status: statuses[0] || 'Hoạt động',
      type: cameraTypes[0] || 'Bullet',
      note: ''
    });
    setModalType('cameras');
    setIsModalOpen(true);
  };

  const handleEditCameraClick = (cam: Camera) => {
    setEditingCamera({ ...cam });
    setModalType('cameras');
    setIsModalOpen(true);
  };

  const handleDeleteCameraClick = (cam: Camera) => {
    setDeleteTarget({ type: 'camera', id: cam.id, name: cam.name });
    setIsDeleteModalOpen(true);
  };

  const handleAddRecorderClick = () => {
    setEditingRecorder({
      id: `rec_${Date.now()}`,
      name: '',
      ip: '',
      port: 80,
      username: 'admin',
      location: locations[0] || '',
      hddCapacity: '4TB',
      note: ''
    });
    setModalType('recorders');
    setIsModalOpen(true);
  };

  const handleEditRecorderClick = (rec: Recorder) => {
    setEditingRecorder({ ...rec });
    setModalType('recorders');
    setIsModalOpen(true);
  };

  const handleDeleteRecorderClick = (rec: Recorder) => {
    setDeleteTarget({ type: 'recorder', id: rec.id, name: rec.name });
    setIsDeleteModalOpen(true);
  };

  // Generic handler for Locations, Types, Statuses
  const handleAddSimpleItemClick = (type: TabType) => {
    setEditingSimpleItem({ oldName: '', newName: '' });
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEditSimpleItemClick = (item: string, type: TabType) => {
    setEditingSimpleItem({ oldName: item, newName: item });
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleDeleteSimpleItemClick = (item: string, type: TabType) => {
    let t: 'location' | 'type' | 'status' = 'location';
    if (type === 'types') t = 'type';
    if (type === 'statuses') t = 'status';
    setDeleteTarget({ type: t, id: item, name: item });
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Action
  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'camera') {
      onDeleteCamera(deleteTarget.id);
    } else if (deleteTarget.type === 'recorder') {
      onDeleteRecorder(deleteTarget.id);
    } else if (deleteTarget.type === 'location') {
      onDeleteLocation(deleteTarget.id);
    } else if (deleteTarget.type === 'type') {
      onDeleteType(deleteTarget.id);
    } else if (deleteTarget.type === 'status') {
      onDeleteStatus(deleteTarget.id);
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };


  const handleModalSave = () => {
    if (modalType === 'cameras' && editingCamera) {
      if (!editingCamera.name || !editingCamera.ip) {
        alert('Vui lòng nhập Tên và IP');
        return;
      }
      onSaveCamera(editingCamera);
    } else if (modalType === 'recorders' && editingRecorder) {
      if (!editingRecorder.name || !editingRecorder.ip) {
        alert('Vui lòng nhập Tên và IP');
        return;
      }
      onSaveRecorder(editingRecorder);
    } else if (editingSimpleItem && modalType) {
        if (!editingSimpleItem.newName) {
            alert('Vui lòng nhập tên');
            return;
        }
        if (modalType === 'locations') onSaveLocation(editingSimpleItem.oldName, editingSimpleItem.newName);
        if (modalType === 'types') onSaveType(editingSimpleItem.oldName, editingSimpleItem.newName);
        if (modalType === 'statuses') onSaveStatus(editingSimpleItem.oldName, editingSimpleItem.newName);
    }
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    let csvContent = "";
    
    if (activeTab === 'cameras') {
        csvContent += "ID,Tên Camera,IP,Loại,Đầu Ghi,Vị Trí,Ngày Lắp,Trạng Thái,Ghi Chú\n";
        filteredCameras.forEach(cam => {
            const row = [
                cam.id, cam.name, cam.ip, cam.type, 
                getRecorderName(cam.recorderId), cam.location, 
                cam.installDate, cam.status, cam.note || ''
            ].join(",");
            csvContent += row + "\n";
        });
    } else if (activeTab === 'recorders') {
        csvContent += "ID,Tên Đầu Ghi,IP,Port,HDD,Vị Trí,Ghi Chú\n";
        filteredRecorders.forEach(rec => {
             const row = [
                rec.id, rec.name, rec.ip, rec.port, rec.hddCapacity || '',
                rec.location, rec.note || ''
             ].join(",");
             csvContent += row + "\n";
        });
    }

    // Add Byte Order Mark (BOM) for UTF-8 compatibility in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cammanager_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TabButton = ({ id, label, icon: Icon, count }: { id: TabType, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-3 md:px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 flex items-center whitespace-nowrap ${
        activeTab === id 
          ? 'border-primary text-primary bg-green-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-primary' : 'text-gray-400'}`} />
      {label}
      {count !== undefined && (
        <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );

  // --- Grid Item Card Component ---
  const GridItemCard = ({ label, count, icon: Icon, onEdit, onDelete, onClick, type }: any) => {
    // Get theme based on label
    const theme = getTheme(label);
    
    return (
      <div 
        className={`${theme.bg} ${theme.border} border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group relative`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg bg-white/60 ${theme.icon}`}>
               <Icon className="w-6 h-6" />
            </div>
            <span className={`${theme.badge} text-xs font-bold px-2 py-1 rounded-full`}>
                {count} Camera
            </span>
        </div>
        
        <div>
            <h3 className={`font-bold text-lg ${theme.text} mb-1 truncate`}>{label}</h3>
            <div className="flex items-center text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Xem danh sách <ArrowRight className="w-3 h-3 ml-1" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 bg-white text-blue-600 rounded shadow-sm hover:bg-blue-50"
             >
                 <Edit className="w-3 h-3" />
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 bg-white text-red-600 rounded shadow-sm hover:bg-red-50"
             >
                 <Trash2 className="w-3 h-3" />
             </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full animate-fade-in">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto custom-scroll no-scrollbar">
        <TabButton id="cameras" label="Camera" icon={Video} count={cameras.length} />
        <TabButton id="recorders" label="Đầu Ghi" icon={Server} count={recorders.length} />
        <TabButton id="locations" label="Vị Trí" icon={MapPin} count={locations.length} />
        <TabButton id="types" label="Loại Cam" icon={Tag} count={cameraTypes.length} />
        <TabButton id="statuses" label="Trạng Thái" icon={Activity} count={statuses.length} />
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex flex-col gap-3">
            {/* Top Row: Search + Mobile Filter Toggle + Add Button */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    />
                </div>
                
                {activeTab === 'cameras' && (
                    <button 
                        className="md:hidden p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                )}

                <div className="flex gap-2">
                     {(activeTab === 'cameras' || activeTab === 'recorders') && (
                        <button 
                            onClick={exportToExcel}
                            className="hidden md:flex items-center px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Xuất Excel
                        </button>
                    )}
                    <button 
                    onClick={() => {
                        if (activeTab === 'cameras') handleAddCameraClick();
                        else if (activeTab === 'recorders') handleAddRecorderClick();
                        else handleAddSimpleItemClick(activeTab);
                    }}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    {activeTab === 'cameras' ? 'Thêm Cam' : 
                     activeTab === 'recorders' ? 'Thêm Đ.Ghi' : 
                     activeTab === 'locations' ? 'Thêm Vị Trí' :
                     activeTab === 'types' ? 'Thêm Loại' : 'Thêm TT'}
                    </button>
                </div>
            </div>
            
            {/* Bottom Row: Filters (Collapsible on Mobile) */}
            {activeTab === 'cameras' && (
                <div className={`${isFiltersOpen ? 'grid' : 'hidden'} md:flex grid-cols-2 md:flex-row gap-2 md:items-center`}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Tất cả loại</option>
                        {cameraTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Tất cả vị trí</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    <button 
                        onClick={exportToExcel}
                        className="md:hidden flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 col-span-2"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scroll bg-gray-50/50 p-4">
        {/* Camera Table */}
        {activeTab === 'cameras' && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <ResizableTh label="Tên Camera" widthKey="cam_name" />
                            <ResizableTh label="IP / Kênh" widthKey="cam_ip" />
                            <ResizableTh label="Loại" widthKey="cam_type" />
                            <ResizableTh label="Đầu Ghi" widthKey="cam_rec" />
                            <ResizableTh label="Vị Trí" widthKey="cam_loc" />
                            <ResizableTh label="Ngày Lắp" widthKey="cam_date" />
                            <ResizableTh label="Trạng Thái" widthKey="cam_status" />
                            <ResizableTh label="Thao tác" widthKey="cam_action" align="center" />
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCameras.map((cam) => (
                            <tr key={cam.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                            <td className="px-3 py-2" title={cam.name}>
                                <div className="font-semibold text-gray-900 text-sm truncate">{cam.name}</div>
                                {cam.note && <div className="text-xs text-gray-400 mt-0.5 italic max-w-xs truncate" title={cam.note}>{cam.note}</div>}
                            </td>
                            <td className="px-3 py-2 font-mono text-gray-600 text-sm truncate" title={cam.ip}>{cam.ip}</td>
                            <td className="px-3 py-2">
                                <span 
                                    onClick={() => handleFilterNavigation('type', cam.type)}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 cursor-pointer transition-colors truncate block w-max"
                                    title={cam.type}
                                >
                                    {cam.type}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-sm truncate" title={getRecorderName(cam.recorderId)}>{getRecorderName(cam.recorderId)}</td>
                            <td className="px-3 py-2">
                                <span 
                                    onClick={() => handleFilterNavigation('location', cam.location)}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 cursor-pointer transition-colors truncate block w-max"
                                    title={cam.location}
                                >
                                    {cam.location}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-sm truncate">
                                {new Date(cam.installDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-3 py-2">
                                <span 
                                    onClick={() => handleFilterNavigation('status', cam.status)}
                                    className={`px-3 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity truncate block w-max ${
                                    cam.status === 'Hoạt động' ? 'bg-green-100 text-green-700' :
                                    cam.status === 'Mất tín hiệu' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-800'
                                    }`}
                                    title={cam.status}
                                >
                                {cam.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                <button onClick={() => handleEditCameraClick(cam)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCameraClick(cam)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        {filteredCameras.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-400 italic text-sm">Không tìm thấy camera nào.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Recorder Table */}
        {activeTab === 'recorders' && (
             <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <ResizableTh label="Tên Đầu Ghi" widthKey="rec_name" />
                            <ResizableTh label="IP Address" widthKey="rec_ip" />
                            <ResizableTh label="HDD" widthKey="rec_hdd" />
                            <ResizableTh label="Vị Trí" widthKey="rec_loc" />
                            <ResizableTh label="Ghi Chú" widthKey="rec_note" />
                            <ResizableTh label="Thao tác" widthKey="rec_action" align="center" />
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRecorders.map((rec) => (
                            <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                            <td className="px-3 py-2 font-semibold text-gray-900 text-sm uppercase truncate" title={rec.name}>{rec.name}</td>
                            <td className="px-3 py-2 font-mono text-gray-600 text-sm truncate" title={`${rec.ip}:${rec.port}`}>{rec.ip}:{rec.port}</td>
                            <td className="px-3 py-2 text-gray-600 text-sm flex items-center">
                                <HardDrive className="w-4 h-4 mr-2 text-gray-400" />
                                {rec.hddCapacity || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-sm truncate" title={rec.location}>{rec.location}</td>
                            <td className="px-3 py-2 text-gray-500 text-sm italic truncate" title={rec.note}>{rec.note}</td>
                            <td className="px-3 py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                <button onClick={() => handleEditRecorderClick(rec)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteRecorderClick(rec)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>
                            </tr>
                        ))}
                         {filteredRecorders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 italic text-sm">Không tìm thấy đầu ghi nào.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Location Grid View */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLocations.map(loc => {
                const count = cameras.filter(c => c.location === loc).length;
                return (
                    <GridItemCard 
                        key={loc}
                        label={loc}
                        count={count}
                        icon={MapPin}
                        onClick={() => handleFilterNavigation('location', loc)}
                        onEdit={() => handleEditSimpleItemClick(loc, 'locations')}
                        onDelete={() => handleDeleteSimpleItemClick(loc, 'locations')}
                        type="location"
                    />
                );
            })}
          </div>
        )}

        {/* Camera Types Grid View */}
        {activeTab === 'types' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTypes.map(t => {
                const count = cameras.filter(c => c.type === t).length;
                return (
                    <GridItemCard 
                        key={t}
                        label={t}
                        count={count}
                        icon={getTypeIcon(t)}
                        onClick={() => handleFilterNavigation('type', t)}
                        onEdit={() => handleEditSimpleItemClick(t, 'types')}
                        onDelete={() => handleDeleteSimpleItemClick(t, 'types')}
                        type="type"
                    />
                );
            })}
          </div>
        )}

        {/* Statuses Grid View */}
        {activeTab === 'statuses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStatuses.map(s => {
                const count = cameras.filter(c => c.status === s).length;
                return (
                    <GridItemCard 
                        key={s}
                        label={s}
                        count={count}
                        icon={Activity}
                        onClick={() => handleFilterNavigation('status', s)}
                        onEdit={() => handleEditSimpleItemClick(s, 'statuses')}
                        onDelete={() => handleDeleteSimpleItemClick(s, 'statuses')}
                        type="status"
                    />
                );
            })}
          </div>
        )}
      </div>

      {/* Modal - Unified */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {modalType === 'cameras' ? (editingCamera?.id.includes(new Date().toISOString().split('T')[0]) ? 'Thêm Mới Camera' : 'Sửa Camera') : 
                 modalType === 'recorders' ? (editingRecorder?.id.includes(new Date().toISOString().split('T')[0]) ? 'Thêm Đầu Ghi' : 'Sửa Đầu Ghi') :
                 modalType === 'locations' ? 'Vị Trí Lắp Đặt' :
                 modalType === 'types' ? 'Loại Camera' : 'Trạng Thái'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
                {/* CAMERA FORM */}
                {modalType === 'cameras' && editingCamera && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Tên Camera <span className="text-red-500">*</span></label>
                             <input 
                                type="text" 
                                value={editingCamera.name} 
                                onChange={(e) => setEditingCamera({...editingCamera, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                placeholder="Ví dụ: Cam Cổng Chính"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">IP / Kênh <span className="text-red-500">*</span></label>
                             <input 
                                type="text" 
                                value={editingCamera.ip} 
                                onChange={(e) => setEditingCamera({...editingCamera, ip: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                placeholder="192.168.1.10:1"
                             />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Loại Camera</label>
                             <select 
                                value={editingCamera.type}
                                onChange={(e) => setEditingCamera({...editingCamera, type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {cameraTypes.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Đầu Ghi</label>
                             <select 
                                value={editingCamera.recorderId}
                                onChange={(e) => setEditingCamera({...editingCamera, recorderId: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {recorders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                             </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Vị Trí Lắp Đặt</label>
                             <select 
                                value={editingCamera.location}
                                onChange={(e) => setEditingCamera({...editingCamera, location: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {locations.map(l => <option key={l} value={l}>{l}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                             <select 
                                value={editingCamera.status}
                                onChange={(e) => setEditingCamera({...editingCamera, status: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Lắp</label>
                             <input 
                                type="date" 
                                value={editingCamera.installDate} 
                                onChange={(e) => setEditingCamera({...editingCamera, installDate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                             <textarea 
                                value={editingCamera.note || ''} 
                                onChange={(e) => setEditingCamera({...editingCamera, note: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 h-20"
                                placeholder="Thông tin thêm..."
                             />
                        </div>
                    </div>
                )}

                {/* RECORDER FORM */}
                {modalType === 'recorders' && editingRecorder && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Tên Đầu Ghi <span className="text-red-500">*</span></label>
                             <input 
                                type="text" 
                                value={editingRecorder.name} 
                                onChange={(e) => setEditingRecorder({...editingRecorder, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">IP Address <span className="text-red-500">*</span></label>
                             <input 
                                type="text" 
                                value={editingRecorder.ip} 
                                onChange={(e) => setEditingRecorder({...editingRecorder, ip: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                             <input 
                                type="number" 
                                value={editingRecorder.port} 
                                onChange={(e) => setEditingRecorder({...editingRecorder, port: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Vị Trí</label>
                             <select 
                                value={editingRecorder.location}
                                onChange={(e) => setEditingRecorder({...editingRecorder, location: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {locations.map(l => <option key={l} value={l}>{l}</option>)}
                             </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Dung lượng HDD</label>
                             <select 
                                value={editingRecorder.hddCapacity || '4TB'} 
                                onChange={(e) => setEditingRecorder({...editingRecorder, hddCapacity: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                             >
                                {hddOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                             <textarea 
                                value={editingRecorder.note || ''} 
                                onChange={(e) => setEditingRecorder({...editingRecorder, note: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 h-20"
                             />
                        </div>
                    </div>
                )}

                {/* SIMPLE FORM (Locations, Types, Statuses) */}
                {['locations', 'types', 'statuses'].includes(modalType || '') && editingSimpleItem && (
                    <div className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                                {modalType === 'locations' ? 'Tên Vị Trí' : modalType === 'types' ? 'Tên Loại' : 'Tên Trạng Thái'}
                                <span className="text-red-500">*</span>
                             </label>
                             <input 
                                type="text" 
                                value={editingSimpleItem.newName} 
                                onChange={(e) => setEditingSimpleItem({...editingSimpleItem, newName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                autoFocus
                             />
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 flex items-start">
                             <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                             <p>
                                {editingSimpleItem.oldName ? 
                                    'Lưu ý: Việc đổi tên sẽ tự động cập nhật thông tin này trên tất cả các Camera và Đầu ghi liên quan.' :
                                    'Thêm mới danh mục vào hệ thống.'
                                }
                             </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleModalSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Xác nhận xóa</h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Bạn có chắc chắn muốn xóa <strong>{deleteTarget.name}</strong> không? <br/>
                    Hành động này không thể hoàn tác.
                </p>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                    >
                        Xóa Vĩnh Viễn
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default CameraList;