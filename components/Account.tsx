import React, { useState } from 'react';
import { User, Shield, Key, Save, UserCircle, Users, Plus, Trash2, Edit, AlertCircle, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types';

interface AccountProps {
  currentUser: UserType;
  users?: UserType[];
  locations?: string[];
  onUpdatePassword: (password: string) => void;
  onSaveUser?: (user: UserType) => void;
  onDeleteUser?: (userId: string) => void;
}

const Account: React.FC<AccountProps> = ({ 
    currentUser, 
    onUpdatePassword, 
    users = [], 
    locations = [], 
    onSaveUser, 
    onDeleteUser 
}) => {
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // User Management State (Admin)
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);

  // Validation Error Modal State
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (newPassword.length < 3) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 3 ký tự.' });
      return;
    }

    onUpdatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
    
    setTimeout(() => setMessage(null), 3000);
  };

  // --- User Management Handlers ---
  const handleAddUserClick = () => {
      setEditUser({
          id: `usr_${Date.now()}`,
          username: '',
          password: '',
          fullName: '',
          role: 'user',
          allowedLocations: []
      });
      setIsEditingUser(true);
  };

  const handleEditUserClick = (user: UserType) => {
      setEditUser({ ...user });
      setIsEditingUser(true);
  };

  const handleSaveUserSubmit = () => {
      if (editUser && onSaveUser) {
          // 1. Check Mandatory Fields
          if (!editUser.username.trim() || !editUser.fullName.trim()) {
              setErrorPopup("Vui lòng nhập đầy đủ các thông tin bắt buộc (*).");
              return;
          }

          // 2. Check Password for New Users
          const isNewUser = !users.find(u => u.id === editUser.id);
          if (isNewUser && (!editUser.password || !editUser.password.trim())) {
              setErrorPopup("Vui lòng nhập mật khẩu cho người dùng mới.");
              return;
          }

          // 3. Check Spaces in Username
          if (/\s/.test(editUser.username)) {
              setErrorPopup("Tên đăng nhập không được chứa khoảng trắng.");
              return;
          }

          onSaveUser(editUser);
          setIsEditingUser(false);
          setEditUser(null);
      }
  };

  const toggleLocationPermission = (loc: string) => {
      if (!editUser) return;
      const currentLocs = editUser.allowedLocations || [];
      if (currentLocs.includes(loc)) {
          setEditUser({ ...editUser, allowedLocations: currentLocs.filter(l => l !== loc) });
      } else {
          setEditUser({ ...editUser, allowedLocations: [...currentLocs, loc] });
      }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
            <UserCircle className="w-8 h-8 text-blue-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Quản Lý Tài Khoản</h2>
            <p className="text-gray-500 text-sm">Thông tin cá nhân và bảo mật</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary text-3xl font-bold">
                {currentUser.avatar || currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{currentUser.fullName}</h3>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mt-2 capitalize">
                {currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </span>
            <div className="w-full mt-6 border-t border-gray-100 pt-4 text-left space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-medium text-gray-900">{currentUser.username}</span>
                </div>
            </div>
        </div>

        {/* Change Password */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-6 pb-2 border-b border-gray-100">
                <Shield className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Đổi Mật Khẩu</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {message && (
                    <div className={`p-3 rounded-lg text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <User className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                        {message.text}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <div className="relative">
                        <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                            placeholder="Nhập mật khẩu mới"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                    <div className="relative">
                        <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu Thay Đổi
                    </button>
                </div>
            </form>
        </div>
      </div>

      {/* ADMIN SECTION: USER MANAGEMENT */}
      {currentUser.role === 'admin' && onSaveUser && onDeleteUser && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Quản Lý Người Dùng Hệ Thống</h3>
                </div>
                <button 
                    onClick={handleAddUserClick}
                    className="flex items-center px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-green-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Thêm User
                </button>
              </div>

              {/* User List Table */}
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                          <tr>
                              <th className="p-3 text-gray-600">Username</th>
                              <th className="p-3 text-gray-600">Họ Tên</th>
                              <th className="p-3 text-gray-600">Vai Trò</th>
                              <th className="p-3 text-gray-600">Quyền Hạn (Vị trí)</th>
                              <th className="p-3 text-gray-600 text-center">Thao Tác</th>
                          </tr>
                      </thead>
                      <tbody>
                          {users.map(u => (
                              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                  <td className="p-3 font-medium text-gray-900">{u.username}</td>
                                  <td className="p-3 text-gray-600">{u.fullName}</td>
                                  <td className="p-3">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                          {u.role.toUpperCase()}
                                      </span>
                                  </td>
                                  <td className="p-3 text-gray-500">
                                      {u.role === 'admin' ? (
                                          <span className="text-purple-600 italic">Toàn quyền</span>
                                      ) : (
                                          <div className="flex flex-wrap gap-1">
                                              {u.allowedLocations && u.allowedLocations.length > 0 ? (
                                                  u.allowedLocations.map(loc => (
                                                      <span key={loc} className="px-2 py-0.5 bg-gray-100 border rounded text-xs">{loc}</span>
                                                  ))
                                              ) : (
                                                  <span className="text-red-500 text-xs">Chưa cấp quyền</span>
                                              )}
                                          </div>
                                      )}
                                  </td>
                                  <td className="p-3 text-center">
                                      {u.id !== currentUser.id && (
                                          <div className="flex justify-center space-x-2">
                                              <button onClick={() => handleEditUserClick(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                                              <button onClick={() => onDeleteUser(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditingUser && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    {editUser.id.includes('usr_') && !users?.find(u => u.id === editUser.id) ? 'Thêm Người Dùng Mới' : 'Cập Nhật Người Dùng'}
                </h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={editUser.username}
                                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                                disabled={!!users?.find(u => u.id === editUser.id)} // Cannot change username of existing
                                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100 bg-white text-gray-900"
                                placeholder="Không dấu cách..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và Tên <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={editUser.fullName}
                                onChange={(e) => setEditUser({...editUser, fullName: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu 
                            {users?.find(u => u.id === editUser.id) ? (
                                <span className="text-gray-400 font-normal ml-1">(Bỏ trống nếu không đổi)</span>
                            ) : (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                        <input 
                            type="password" 
                            value={editUser.password || ''}
                            onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select 
                            value={editUser.role}
                            onChange={(e) => setEditUser({...editUser, role: e.target.value as 'admin' | 'user'})}
                            className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                        >
                            <option value="user">Người dùng (User)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                    </div>

                    {editUser.role === 'user' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phân quyền theo Vị trí</label>
                            <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50 grid grid-cols-2 gap-2">
                                {locations.map(loc => {
                                    const isSelected = editUser.allowedLocations?.includes(loc);
                                    return (
                                        <div 
                                            key={loc} 
                                            onClick={() => toggleLocationPermission(loc)}
                                            className={`flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-200 ${isSelected ? 'bg-blue-50 border border-blue-200' : ''}`}
                                        >
                                            {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                                            <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>{loc}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Người dùng chỉ có thể xem camera/đầu ghi thuộc các vị trí đã chọn.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button 
                        onClick={() => setIsEditingUser(false)}
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSaveUserSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700"
                    >
                        Lưu Thông Tin
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* VALIDATION ERROR POPUP */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in border-l-4 border-red-500">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-bold text-gray-900">Thông tin không hợp lệ</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {errorPopup}
                            </p>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setErrorPopup(null)}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default Account;