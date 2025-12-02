import React from 'react';
import { LogEntry } from '../types';
import { History, PlusCircle, Edit, Trash2, Clock } from 'lucide-react';

interface ActivityLogProps {
  logs: LogEntry[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  // Sort logs by newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Thêm': return <PlusCircle className="w-4 h-4 text-green-600" />;
      case 'Sửa': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'Xóa': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionStyle = (action: string) => {
     switch (action) {
      case 'Thêm': return 'bg-green-50 text-green-700 border-green-200';
      case 'Sửa': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Xóa': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <History className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nhật Ký Hoạt Động</h2>
            <p className="text-sm text-gray-500">Theo dõi lịch sử thay đổi của hệ thống</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
           Tổng số: {logs.length} bản ghi
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scroll p-6">
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm w-48">Thời Gian</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-32">Hành Động</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-32">Đối Tượng</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Chi Tiết</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-24">Người Dùng</th>
                </tr>
            </thead>
            <tbody>
                {sortedLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 text-sm">
                    {new Date(log.timestamp).toLocaleString('vi-VN', { 
                        year: 'numeric', month: '2-digit', day: '2-digit', 
                        hour: '2-digit', minute: '2-digit' 
                    })}
                    </td>
                    <td className="p-4">
                    <span className={`flex items-center w-max px-3 py-1 rounded-full text-xs font-medium border ${getActionStyle(log.action)}`}>
                        <span className="mr-2">{getActionIcon(log.action)}</span>
                        {log.action}
                    </span>
                    </td>
                    <td className="p-4 text-gray-800 font-medium text-sm">
                        {log.targetType}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                        <span className="font-medium text-gray-900 mr-2">{log.targetName}:</span>
                        {log.details}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                            {log.user}
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {sortedLogs.length === 0 && (
                <div className="p-8 text-center text-gray-400 italic text-sm">
                    Chưa có hoạt động nào được ghi lại.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;