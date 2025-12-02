import React, { useRef, useState, useEffect } from 'react';
import { Camera, SiteMapData } from '../types';
import { Video, AlertCircle, Upload, Image, Move, Plus, Trash2, Map as MapIcon, X } from 'lucide-react';

interface SiteMapProps {
  cameras: Camera[];
  maps: SiteMapData[];
  onAddMap: (name: string) => void;
  onDeleteMap: (id: string) => void;
  onUpdateMapImage: (id: string, img: string | null) => void;
  
  cameraPositions: Record<string, { x: number, y: number, mapId: string }>;
  onUpdatePosition: (id: string, x: number, y: number, mapId: string) => void;
}

// Extract CamIcon outside to prevent re-mounting issues during drag
const CamIcon = ({ cam, onDragStart, className, style }: { cam: Camera, onDragStart: (e: React.DragEvent, id: string) => void, className?: string, style?: React.CSSProperties }) => {
  const isActive = cam.status === 'Hoạt động';
  const colorClass = isActive ? 'text-green-600' : 'text-red-500';
  const bgClass = isActive ? 'bg-white' : 'bg-red-50';
  const textClass = 'text-gray-900';
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, cam.id)}
      className={`flex flex-col items-center justify-center p-1.5 rounded shadow-sm border border-gray-300 z-10 ${bgClass} cursor-move hover:shadow-md transition-shadow select-none w-20 ${className}`}
      style={style}
      title={cam.name}
    >
      <Video className={`w-5 h-5 mb-0.5 ${colorClass}`} />
      <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${textClass}`}>{cam.name}</span>
      {!isActive && <AlertCircle className="w-3 h-3 text-red-500 absolute top-0 right-0 -mt-1 -mr-1 bg-white rounded-full" />}
    </div>
  );
};

const SiteMap: React.FC<SiteMapProps> = ({ 
    cameras, 
    maps,
    onAddMap,
    onDeleteMap,
    onUpdateMapImage,
    cameraPositions, 
    onUpdatePosition 
}) => {
  const [activeMapId, setActiveMapId] = useState<string>(maps[0]?.id || '');
  const [isAddingMap, setIsAddingMap] = useState(false);
  const [newMapName, setNewMapName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Ensure active map is valid
  useEffect(() => {
    if (!maps.find(m => m.id === activeMapId) && maps.length > 0) {
        setActiveMapId(maps[0].id);
    }
  }, [maps, activeMapId]);

  const activeMap = maps.find(m => m.id === activeMapId);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activeMap) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdateMapImage(activeMapId, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMapSubmit = () => {
      if (newMapName.trim()) {
          onAddMap(newMapName.trim());
          setNewMapName('');
          setIsAddingMap(false);
      }
  };

  const handleDeleteActiveMap = () => {
      if (confirm(`Bạn có chắc muốn xóa sơ đồ "${activeMap?.name}"?`)) {
          onDeleteMap(activeMapId);
      }
  };

  const handleDragStart = (e: React.DragEvent, camId: string) => {
    e.dataTransfer.setData('text/plain', camId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const camId = e.dataTransfer.getData('text/plain');
    
    if (!camId || !mapContainerRef.current || !activeMapId) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate Percentage to be responsive
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Constrain to 0-100%
    const safeX = Math.max(0, Math.min(100, xPercent));
    const safeY = Math.max(0, Math.min(100, yPercent));

    onUpdatePosition(camId, safeX, safeY, activeMapId);
  };

  // Filter cameras:
  // 1. Not placed on ANY map (completely unplaced)
  // OR
  // 2. Placed on CURRENT map (to allow moving them) - wait, standard logic is unplaced are in sidebar.
  // Sidebar should show cameras that are NOT on ANY map.
  const unplacedCameras = cameras.filter(cam => {
      const pos = cameraPositions[cam.id];
      const isUnplaced = !pos; 
      const matchesLocation = filterLocation === 'all' || cam.location === filterLocation;
      return isUnplaced && matchesLocation;
  });

  // Get unique locations for the dropdown
  const uniqueLocations = Array.from(new Set(cameras.map(c => c.location))).sort();

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4">
      {/* MAP TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto custom-scroll pb-2">
         {maps.map(map => (
             <button
                key={map.id}
                onClick={() => setActiveMapId(map.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                    activeMapId === map.id 
                    ? 'bg-white border-primary text-primary shadow-sm' 
                    : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'
                }`}
             >
                <MapIcon className="w-4 h-4 mr-2" />
                {map.name}
             </button>
         ))}
         
         {isAddingMap ? (
             <div className="flex items-center bg-white border border-blue-300 rounded-lg px-2 py-1 shadow-sm">
                 <input 
                    type="text" 
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="Tên sơ đồ..."
                    className="text-sm px-2 py-1 outline-none w-32 bg-white text-gray-900 placeholder-gray-400"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMapSubmit()}
                 />
                 <button onClick={handleAddMapSubmit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Plus className="w-4 h-4"/></button>
                 <button onClick={() => setIsAddingMap(false)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4"/></button>
             </div>
         ) : (
             <button 
                onClick={() => setIsAddingMap(true)}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-primary hover:bg-green-50 transition-colors border border-dashed border-gray-300"
             >
                <Plus className="w-4 h-4 mr-1" /> Thêm Sơ Đồ
             </button>
         )}
      </div>

      <div className="flex flex-col lg:flex-row h-full gap-6 flex-1 min-h-0">
        {/* LEFT: Map Area */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
            {activeMap ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <Move className="w-5 h-5 mr-2 text-primary" />
                            {activeMap.name}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors border border-gray-300"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {activeMap.imageUrl ? 'Đổi Ảnh' : 'Tải Sơ Đồ'}
                            </button>
                            {maps.length > 1 && (
                                <button 
                                    onClick={handleDeleteActiveMap}
                                    className="flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm transition-colors border border-red-100"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded border-2 border-dashed border-gray-300 relative overflow-hidden flex items-center justify-center">
                        {activeMap.imageUrl ? (
                            <div 
                                ref={mapContainerRef}
                                className="relative w-full h-full"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <img 
                                    src={activeMap.imageUrl} 
                                    alt="Site Map" 
                                    className="w-full h-full object-contain pointer-events-none select-none opacity-90" 
                                />
                                
                                {/* Render Placed Cameras for Active Map Only */}
                                {Object.entries(cameraPositions).map(([id, pos]) => {
                                    if (pos.mapId !== activeMapId) return null; // Only show cams on this map
                                    
                                    const cam = cameras.find(c => c.id === id);
                                    if (!cam) return null;
                                    return (
                                        <div
                                            key={id}
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                        >
                                            <CamIcon cam={cam} onDragStart={handleDragStart} />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Image className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                <p>Chưa có hình ảnh cho sơ đồ này.</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 text-blue-500 hover:underline text-sm"
                                >
                                    Tải ảnh sơ đồ lên ngay
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                        <span>* Kéo thả camera từ danh sách bên phải vào bản đồ</span>
                        <div className="flex space-x-4">
                            <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>Hoạt động</span>
                            <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>Lỗi</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Vui lòng chọn hoặc tạo mới một sơ đồ.
                </div>
            )}
        </div>

        {/* RIGHT: Unplaced Cameras Sidebar */}
        <div className="w-full lg:w-64 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Danh sách Camera</h3>
            
            {/* Location Filter */}
            <div className="mb-3">
                <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">Tất cả vị trí</option>
                    {uniqueLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll pr-2">
                {unplacedCameras.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {unplacedCameras.map(cam => (
                            <CamIcon key={cam.id} cam={cam} onDragStart={handleDragStart} className="w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        {cameras.length === 0 ? 'Chưa có camera nào.' : 
                        filterLocation !== 'all' ? 'Không có camera nào tại vị trí này chưa được đặt.' :
                        'Tất cả camera đã được đặt trên bản đồ.'}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMap;