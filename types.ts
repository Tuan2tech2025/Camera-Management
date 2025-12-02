export enum CameraStatus {
  ACTIVE = 'Hoạt động',
  INACTIVE = 'Mất tín hiệu',
  MAINTENANCE = 'Bảo trì'
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
  status: CameraStatus;
  type: string; // e.g., "PTZ", "Bullet", "Dome"
  note?: string;
}

export type ViewMode = 'dashboard' | 'list' | 'map' | 'ai';