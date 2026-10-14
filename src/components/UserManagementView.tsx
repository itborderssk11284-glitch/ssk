import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SystemUser, UserRole, DepartmentId } from '../types/staffing';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Sparkles,
  Stethoscope,
  UserCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    allUsers,
    userProfile,
    isAdmin,
    updateUserRole,
    updateUserStatus,
    deleteUserAccount,
    createNewUserAccount,
    quickLoginAsDemoRole,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('department_head');
  const [newDept, setNewDept] = useState<DepartmentId | 'ALL'>('ER');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || user.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setSubmitting(true);
    try {
      await createNewUserAccount({
        displayName: newName,
        email: newEmail,
        role: newRole,
        department: newDept,
        phone: newPhone,
        status: 'active',
      });
      setActionNotice(`เพิ่มผู้ใช้งาน "${newName}" เรียบร้อยแล้ว`);
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    try {
      await updateUserRole(userId, targetRole);
      setActionNotice('ปรับเปลี่ยนสิทธิผู้ใช้งานเรียบร้อยแล้ว');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถแก้ไขสิทธิได้');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(userId, nextStatus);
      setActionNotice(
        `เปลี่ยนสถานะเป็น ${nextStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} สำเร็จ`
      );
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${name}" ออกจากระบบ?`)) {
      try {
        await deleteUserAccount(userId);
        setActionNotice(`ลบบัญชีผู้ใช้ "${name}" เรียบร้อยแล้ว`);
        setTimeout(() => setActionNotice(null), 3000);
      } catch (err: any) {
        alert(err.message || 'ไม่สามารถลบผู้ใช้ได้');
      }
    }
  };

  // If user is not Admin, display restriction card with demo switch option
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            เมนูจัดการผู้ใช้งานในระบบ (จำกัดเฉพาะสิทธิ Admin)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6">
            บัญชีปัจจุบันของคุณ (<strong>{userProfile?.displayName}</strong>) มีระดับสิทธิเป็น{' '}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {userProfile?.role === 'head_nurse'
                ? '2. หัวหน้าพยาบาล (ดูได้อย่างเดียว)'
                : '3. หัวหน้าฝ่าย (บันทึก/แก้ไข/พิมพ์งาน/เพิ่มกิจกรรม)'}
            </span>{' '}
            จึงไม่สามารถเข้าถึงหน้าจัดการผู้ใช้ได้ตามนโยบายความปลอดภัย
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left mb-6">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              ต้องการทดสอบเมนูจัดการผู้ใช้งานหรือไม่?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              คุณสามารถสลับไปใช้บัญชี <strong>Admin</strong> เพื่อทดสอบการจัดการ เพิ่ม ลบ และเปลี่ยนสิทธิผู้ใช้งานได้ทันที
            </p>
            <button
              onClick={() => quickLoginAsDemoRole('admin')}
              className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition shadow flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              สลับเป็นสิทธิ Admin (ผู้ดูแลระบบ)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminCount = allUsers.filter((u) => u.role === 'admin').length;
  const headNurseCount = allUsers.filter((u) => u.role === 'head_nurse').length;
  const deptHeadCount = allUsers.filter((u) => u.role === 'department_head').length;
  const activeCount = allUsers.filter((u) => u.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  ระบบจัดการผู้ใช้งานในระบบ (User Management)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                กำหนดระดับสิทธิการเข้าถึง 3 ระดับ: 1. Admin (เต็มสิทธิ), 2. หัวหน้าพยาบาล (ดูได้อย่างเดียว), 3. หัวหน้าฝ่าย (บันทึก/แก้ไข/พิมพ์/เพิ่มกิจกรรม)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              เพิ่มผู้ใช้งานใหม่ (Add User)
            </button>
          </div>
        </div>

        {/* Quick Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ผู้ใช้ทั้งหมด</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {allUsers.length}{' '}
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                ({activeCount} ใช้งานอยู่)
              </span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
            <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 1. Admin (ผู้ดูแล)
            </div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mt-0.5">
              {adminCount} บัญชี
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> 2. หัวหน้าพยาบาล (ดูอย่างเดียว)
            </div>
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
              {headNurseCount} บัญชี
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-900/60">
            <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" /> 3. หัวหน้าฝ่าย (บันทึก/แก้ไข)
            </div>
            <div className="text-lg font-bold text-teal-900 dark:text-teal-200 mt-0.5">
              {deptHeadCount} บัญชี
            </div>
          </div>
        </div>
      </div>

      {/* Role Matrix Comparison Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ตารางเปรียบเทียบสิทธิการเข้าถึงของแต่ละระดับ (Role Permissions Matrix)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">ฟังก์ชั่น / ความสามารถในระบบ</th>
                <th className="py-2.5 px-3 text-center bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  1. Admin (ผู้ดูแลระบบ)
                </th>
                <th className="py-2.5 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  2. หัวหน้าพยาบาล (ดูอย่างเดียว)
                </th>
                <th className="py-2.5 px-3 text-center bg-teal-50/50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                  3. หัวหน้าฝ่าย
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">จัดการผู้ใช้งานในระบบ (เพิ่ม/ลบ/เปลี่ยนสิทธิ)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 dark:text-rose-400 font-bold">
                  <X className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 dark:text-rose-400 font-bold">
                  <X className="w-4 h-4 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">ตั้งค่าน้ำหนักเวลามาตรฐานและสูตรคำนวณ (Staffing Parameters)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">ดูได้อย่างเดียว</span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">ดูได้อย่างเดียว</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">บันทึกภาระงานประจำวัน (Daily Log Entry / แก้ไข / ลบ)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 dark:text-rose-400 font-bold">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-semibold">
                    ห้ามบันทึก/แก้ไข
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">
                  <strong>เพิ่มรายการกิจกรรมใหม่ (Add Activity Catalog)</strong>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 dark:text-rose-400 font-bold">
                  <X className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">ระบบรายงานและการส่งออกข้อมูล / พิมพ์งาน (Print & Export)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    ดูรายงานได้
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">หน้าแดชบอร์ดภาพรวมและการวิเคราะห์ (Dashboard)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Search & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>กรองตามสิทธิ:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">ทุกระดับสิทธิ</option>
            <option value="admin">1. Admin (ผู้ดูแลระบบ)</option>
            <option value="head_nurse">2. หัวหน้าพยาบาล (ดูอย่างเดียว)</option>
            <option value="department_head">3. หัวหน้าฝ่าย (บันทึก/แก้ไข)</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">ทุกแผนก</option>
            <option value="ER">ER (ฉุกเฉิน)</option>
            <option value="OPD">OPD (ผู้ป่วยนอก)</option>
            <option value="IPD1">IPD 1 (ผู้ป่วยใน 1)</option>
            <option value="IPD2">IPD 2 (ผู้ป่วยใน 2)</option>
            <option value="LR">LR (ห้องคลอด)</option>
          </select>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">ผู้ใช้งาน (User Profile)</th>
                <th className="py-3 px-4">แผนกประจำการ</th>
                <th className="py-3 px-4">ระดับสิทธิการเข้าถึง (Access Role)</th>
                <th className="py-3 px-4 text-center">สถานะบัญชี</th>
                <th className="py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="py-3 px-4 text-right">การจัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = userProfile?.uid === user.uid;

                  return (
                    <tr
                      key={user.uid}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                            {user.displayName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              {user.displayName}
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  (คุณ)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          <Building className="w-3 h-3 text-slate-400" />
                          {user.department === 'ALL'
                            ? 'ทุกแผนก (Hospital-wide)'
                            : user.department}
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 focus:ring-indigo-500'
                                : user.role === 'head_nurse'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 focus:ring-emerald-500'
                                : 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 focus:ring-teal-500'
                            }`}
                          >
                            <option value="admin">1. Admin (ผู้ดูแลระบบ)</option>
                            <option value="head_nurse">2. หัวหน้าพยาบาล (ดูอย่างเดียว)</option>
                            <option value="department_head">3. หัวหน้าฝ่าย (บันทึก/แก้ไข/เพิ่มกิจกรรม)</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(user.uid, user.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              ใช้งานอยู่
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              ระงับใช้งาน
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'ยังไม่เคยเข้าสู่ระบบ'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => quickLoginAsDemoRole(user.role)}
                            title="สลับเข้าใช้งานด้วยสิทธินี้ทันที"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(user.uid, user.displayName)}
                              title="ลบบัญชีผู้ใช้"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">เพิ่มผู้ใช้งานใหม่ในระบบ</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อ-นามสกุล / ตำแหน่ง
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น พว. วิภาดา สุขใจ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@hospital.go.th"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ระดับสิทธิ (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="admin">1. Admin (สิทธิเต็ม)</option>
                    <option value="head_nurse">2. หัวหน้าพยาบาล (ดูอย่างเดียว)</option>
                    <option value="department_head">3. หัวหน้าฝ่าย (บันทึก/แก้ไข)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    แผนกประจำการ
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="ALL">ทุกแผนก (ALL)</option>
                    <option value="ER">ER (ฉุกเฉิน)</option>
                    <option value="OPD">OPD (ผู้ป่วยนอก)</option>
                    <option value="IPD1">IPD 1 (ผู้ป่วยใน 1)</option>
                    <option value="IPD2">IPD 2 (ผู้ป่วยใน 2)</option>
                    <option value="LR">LR (ห้องคลอด)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เบอร์โทรศัพท์ (ถ้ามี)
                </label>
                <input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้ใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
