import { Camera, CameraStatus, Recorder, LogEntry, User } from './types';

export const APP_VERSION = '1.0.40';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    username: 'admin',
    password: '123', // In a real app, this would be hashed
    fullName: 'Administrator',
    role: 'admin',
    allowedLocations: [] // Admin sees all
  },
  {
    id: 'usr_2',
    username: 'staff',
    password: '123',
    fullName: 'Nhân Viên Kho',
    role: 'user',
    allowedLocations: ['Kho KT', 'Bãi'] // Can only see cameras in these locations
  }
];

export const INITIAL_RECORDERS: Recorder[] = [
  { id: 'rec_1', name: 'Bãi', ip: '192.168.11.236', port: 236, username: 'admin', location: 'Khu Bãi', hddCapacity: '8TB', note: 'Phongit@2025' },
  { id: 'rec_2', name: 'Cổng', ip: '192.168.11.237', port: 237, username: 'admin', location: 'Khu Cổng', hddCapacity: '4TB', note: 'Phongit@2019' },
  { id: 'rec_3', name: 'Tòa nhà', ip: '192.168.44.150', port: 80, username: 'admin', location: 'Tòa nhà chính', hddCapacity: '10TB', note: 'adbc1234' },
  { id: 'rec_4', name: 'KHO KĨ THUẬT', ip: '192.168.11.248', port: 248, username: 'admin', location: 'Kho KT', hddCapacity: '6TB', note: 'Phongit@2019' },
  { id: 'rec_5', name: 'TẦNG 6 - SMD', ip: '192.168.116.10', port: 266, username: 'admin', location: 'Tầng 6', hddCapacity: '2TB', note: 'abcd2025' },
];

export const INITIAL_CAMERAS: Camera[] = [
  // Cổng / Gate Cameras (Based on "Sơ đồ cam cổng")
  { id: 'cam_1', name: 'Cam Làn Vào 1', recorderId: 'rec_2', ip: '192.168.11.237:1', location: 'Làn Vào 1', installDate: '2023-05-10', status: CameraStatus.ACTIVE, type: 'Bullet' },
  { id: 'cam_2', name: 'Cam Làn Vào 2', recorderId: 'rec_2', ip: '192.168.11.237:2', location: 'Làn Vào 2', installDate: '2023-05-10', status: CameraStatus.ACTIVE, type: 'Bullet' },
  { id: 'cam_3', name: 'Cam Cabin', recorderId: 'rec_2', ip: '192.168.11.237:3', location: 'Cabin', installDate: '2023-06-15', status: CameraStatus.ACTIVE, type: 'Dome' },
  { id: 'cam_4', name: 'Soi Nóc', recorderId: 'rec_2', ip: '192.168.11.237:4', location: 'Làn Vào', installDate: '2023-02-20', status: CameraStatus.ACTIVE, type: 'Bullet' },
  { id: 'cam_5', name: 'Soi Sườn', recorderId: 'rec_2', ip: '192.168.11.237:5', location: 'Làn Vào', installDate: '2023-02-20', status: CameraStatus.ACTIVE, type: 'Bullet' },
  { id: 'cam_6', name: 'Cam Làn Ra 1', recorderId: 'rec_2', ip: '192.168.11.237:6', location: 'Làn Ra 1', installDate: '2023-05-12', status: CameraStatus.ACTIVE, type: 'Bullet' },
  { id: 'cam_7', name: 'Cam Làn Ra 2', recorderId: 'rec_2', ip: '192.168.11.237:7', location: 'Làn Ra 2', installDate: '2023-05-12', status: CameraStatus.ACTIVE, type: 'Bullet' },
  
  // Tòa nhà / Building
  { id: 'cam_8', name: 'Sảnh Tầng 1', recorderId: 'rec_3', ip: '192.168.44.150:1', location: 'Tòa nhà', installDate: '2024-01-10', status: CameraStatus.ACTIVE, type: 'Dome' },
  { id: 'cam_9', name: 'Thang Máy', recorderId: 'rec_3', ip: '192.168.44.150:2', location: 'Tòa nhà', installDate: '2024-01-10', status: CameraStatus.INACTIVE, type: 'Dome', note: 'Đứt dây' },
  
  // Kho / Warehouse
  { id: 'cam_10', name: 'Cửa Kho KT', recorderId: 'rec_4', ip: '192.168.11.248:1', location: 'Kho KT', installDate: '2025-07-16', status: CameraStatus.ACTIVE, type: 'Bullet', note: 'Cam kĩ thuật mới' },
  { id: 'cam_11', name: 'Xưởng KT', recorderId: 'rec_4', ip: '192.168.11.248:2', location: 'Kho KT', installDate: '2025-07-16', status: CameraStatus.MAINTENANCE, type: 'Bullet' },
  
  // Bãi / Yard
  { id: 'cam_12', name: 'Hạ Lưu', recorderId: 'rec_1', ip: '192.168.11.236:1', location: 'Bãi', installDate: '2022-11-01', status: CameraStatus.ACTIVE, type: 'PTZ' },
  { id: 'cam_13', name: 'Thượng Lưu', recorderId: 'rec_1', ip: '192.168.11.236:2', location: 'Bãi', installDate: '2022-11-01', status: CameraStatus.ACTIVE, type: 'PTZ' },
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log_1',
    action: 'Thêm',
    targetType: 'Camera',
    targetName: 'Cửa Kho KT',
    details: 'Thêm mới camera Bullet vào Kho KT',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    user: 'admin'
  },
  {
    id: 'log_2',
    action: 'Sửa',
    targetType: 'Đầu Ghi',
    targetName: 'Tòa nhà',
    details: 'Cập nhật dung lượng HDD lên 10TB',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    user: 'admin'
  },
  {
    id: 'log_3',
    action: 'Xóa',
    targetType: 'Camera',
    targetName: 'Cam Cũ Hỏng',
    details: 'Xóa camera không còn sử dụng',
    timestamp: new Date().toISOString(),
    user: 'admin'
  }
];