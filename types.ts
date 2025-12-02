export enum CameraStatus {
  ACTIVE = 'Hoạt động',
  INACTIVE = 'Mất tín hiệu',
  MAINTENANCE = 'Bảo trì'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for security when passing around
  fullName: string;
  role: 'admin' | 'user';
  avatar?: string;
  allowedLocations?: string[]; // List of locations this user can access. Empty/Undefined = All (Admin)
}

export interface Recorder {
  id: string;
  name: string;
  ip: string;
  port: number;
  username: string;
  password?: string;
  location: string;
  hddCapacity?: string; // New field for HDD Capacity
  note?: string;
}

export interface Camera {
  id: string;
  name: string;
  recorderId: string; // Links to Recorder
  ip: string; // The specific IP or Channel
  location: string; // e.g., "Làn vào 1", "Kho CFS"
  installDate: string;
  status: string; // Changed from Enum to string for dynamic management
  type: string; // e.g., "PTZ", "Bullet", "Dome"
  note?: string;
}

export interface SiteMapData {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface LogEntry {
  id: string;
  action: 'Thêm' | 'Sửa' | 'Xóa';
  targetType: 'Camera' | 'Đầu Ghi' | 'Vị Trí' | 'Loại Cam' | 'Trạng Thái' | 'Sơ Đồ' | 'Tài Khoản';
  targetName: string;
  details: string;
  timestamp: string;
  user: string;
}

export type ViewMode = 'dashboard' | 'list' | 'map' | 'ai' | 'logs' | 'account';