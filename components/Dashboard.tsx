import React from 'react';
import { Camera, Recorder, CameraStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ShieldCheck, AlertTriangle, Server, Video, Activity, Calendar } from 'lucide-react';

interface DashboardProps {
  cameras: Camera[];
  recorders: Recorder[];
  onChartClick?: (type: 'status' | 'location' | 'year', value: string) => void;
}

const COLORS = ['#0f9d58', '#ea4335', '#fbbc04', '#4285f4', '#aa00ff', '#00bcd4'];

const Dashboard: React.FC<DashboardProps> = ({ cameras, recorders, onChartClick }) => {
  
  // Calculate Status Data dynamically
  const statusMap = new Map<string, number>();
  cameras.forEach(cam => {
    const status = cam.status || 'Unknown';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const statusData = Array.from(statusMap).map(([name, value]) => ({ name, value }));

  // Helper counts for top cards (assuming 'Hoạt động' is the positive status)
  const activeCount = statusMap.get('Hoạt động') || 0;
  const issueCount = cameras.length - activeCount;

  // Group by Location
  const locationMap = new Map<string, number>();
  cameras.forEach(cam => {
    const loc = cam.location || 'Unknown';
    locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
  });
  
  const locationData = Array.from(locationMap).map(([name, count]) => ({ name, count }));

  // Group by Installation Year
  const yearMap = new Map<string, number>();
  cameras.forEach(cam => {
      const year = cam.installDate ? cam.installDate.substring(0, 4) : 'Unknown';
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
  });
  const yearData = Array.from(yearMap)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));


  const Card = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card 
          title="Tổng số Camera" 
          value={cameras.length} 
          icon={Video} 
          color="bg-blue-500 text-blue-600" 
        />
        <Card 
          title="Đầu ghi hình" 
          value={recorders.length} 
          icon={Server} 
          color="bg-indigo-500 text-indigo-600" 
        />
        <Card 
          title="Đang hoạt động" 
          value={activeCount} 
          icon={ShieldCheck} 
          color="bg-green-500 text-green-600" 
        />
        <Card 
          title="Cần kiểm tra" 
          value={issueCount} 
          icon={AlertTriangle} 
          color="bg-red-500 text-red-600" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-gray-500" />
            Trạng thái hệ thống
          </h3>
          <div className="h-64 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => onChartClick && onChartClick('status', data.name)}
                  className="cursor-pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-gray-500" />
            Phân bố theo vị trí
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={locationData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={140} 
                    tick={{fontSize: 12}} 
                    interval={0} 
                />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#4285f4" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20} 
                  className="cursor-pointer"
                  onClick={(data) => onChartClick && onChartClick('location', data.name)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Installation Year Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                Thống kê theo năm lắp đặt
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={yearData} 
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar 
                          dataKey="count" 
                          fill="#0f9d58" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40} 
                          className="cursor-pointer"
                          onClick={(data) => onChartClick && onChartClick('year', data.year)}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;