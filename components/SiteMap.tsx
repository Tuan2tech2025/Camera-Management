import React from 'react';
import { Camera, CameraStatus } from '../types';
import { Video, AlertCircle } from 'lucide-react';

interface SiteMapProps {
  cameras: Camera[];
}

const SiteMap: React.FC<SiteMapProps> = ({ cameras }) => {
  // Helper to find camera by vague name match (for demo purposes based on screenshot labels)
  const getCamStatus = (search: string) => {
    const cam = cameras.find(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()));
    if (!cam) return null;
    return {
      status: cam.status,
      active: cam.status === CameraStatus.ACTIVE
    };
  };

  const CamIcon = ({ label, searchKey, className }: { label: string, searchKey: string, className?: string }) => {
    const info = getCamStatus(searchKey);
    const colorClass = !info ? 'text-gray-300' : info.active ? 'text-green-600' : 'text-red-500';
    const bgClass = !info ? 'bg-gray-100' : info.active ? 'bg-white' : 'bg-red-50';
    
    return (
      <div className={`flex flex-col items-center justify-center p-2 rounded shadow-sm border border-gray-200 z-10 ${bgClass} ${className} w-24`}>
        <Video className={`w-6 h-6 mb-1 ${colorClass}`} />
        <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
        {info && !info.active && <AlertCircle className="w-3 h-3 text-red-500 absolute top-1 right-1" />}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">SƠ ĐỒ CAMERA GATE</h2>
        <div className="flex space-x-4 text-sm">
           <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>Hoạt động</div>
           <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Lỗi</div>
        </div>
      </div>

      {/* Diagram Container - approximating the layout with Grid/Flex */}
      <div className="relative w-full max-w-4xl mx-auto h-[600px] border-2 border-gray-300 rounded bg-gray-50 p-8">
        
        {/* Main Structure Lines */}
        <div className="absolute inset-8 border-l-4 border-r-4 border-gray-400 opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-8 right-8 h-32 bg-gray-200 opacity-30 transform -translate-y-1/2 pointer-events-none border-y-2 border-gray-300"></div>

        {/* Labels */}
        <div className="absolute top-10 left-10 bg-yellow-400 px-3 py-1 rounded font-bold text-gray-800 shadow">LÀN RA 2</div>
        <div className="absolute top-10 left-48 bg-yellow-400 px-3 py-1 rounded font-bold text-gray-800 shadow">LÀN RA 1</div>
        <div className="absolute bottom-10 right-48 bg-yellow-400 px-3 py-1 rounded font-bold text-gray-800 shadow">LÀN VÀO 2</div>
        <div className="absolute bottom-10 right-10 bg-yellow-400 px-3 py-1 rounded font-bold text-gray-800 shadow">LÀN VÀO 1</div>

        {/* Center Cabin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-64 bg-slate-800 rounded flex flex-col items-center justify-center text-white z-0">
             <div className="text-xs text-gray-400 mb-2 rotate-90">CABIN</div>
             <div className="w-full h-full border border-gray-600 opacity-50"></div>
        </div>

        {/* Cameras Placed Absolute */}
        
        {/* Left Side (Exit) */}
        <CamIcon label="Cam Ra 2" searchKey="Làn Ra 2" className="absolute top-32 left-12" />
        <CamIcon label="Cam Ra 1" searchKey="Làn Ra 1" className="absolute top-32 left-48" />
        
        <CamIcon label="Soi Sườn" searchKey="Sườn" className="absolute top-1/2 left-24 transform -translate-y-1/2" />
        <CamIcon label="Soi Nóc" searchKey="Nóc" className="absolute top-1/2 left-56 transform -translate-y-1/2" />

        {/* Cabin Cams */}
        <CamIcon label="Cabin Cam" searchKey="Cabin" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-12" />

        {/* Right Side (Entry) */}
        <CamIcon label="Cam Vào 2" searchKey="Làn Vào 2" className="absolute bottom-32 right-48" />
        <CamIcon label="Cam Vào 1" searchKey="Làn Vào 1" className="absolute bottom-32 right-12" />

        {/* Technical Indicators (Arrows) */}
        <div className="absolute top-20 left-20 text-red-500 text-4xl animate-pulse">⬇</div>
        <div className="absolute bottom-20 right-20 text-red-500 text-4xl animate-pulse">⬆</div>

        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
            * Sơ đồ mô phỏng vị trí lắp đặt thực tế
        </div>
      </div>
    </div>
  );
};

export default SiteMap;
