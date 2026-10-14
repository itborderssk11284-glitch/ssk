import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, DepartmentId } from '../types/staffing';
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    quickLoginAsDemoRole,
    userProfile,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('department_head');
  const [department, setDepartment] = useState<DepartmentId | 'ALL'>('ER');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoadingAction(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('เข้าสู่ระบบด้วย Google สำเร็จ');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setErrorMsg(null);
    setLoadingAction(true);
    try {
      await signInWithEmail(email, password);
      setSuccessMsg('เข้าสู่ระบบสำเร็จ');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setErrorMsg(null);
    setLoadingAction(true);
    try {
      await signUpWithEmail(email, password, displayName, role, department, phone);
      setSuccessMsg('ลงทะเบียนผู้ใช้สำเร็จและเข้าสู่ระบบเรียบร้อยแล้ว');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSelectDemo = (selectedRole: UserRole) => {
    quickLoginAsDemoRole(selectedRole);
    setSuccessMsg(
      `สลับเข้าใช้งานในฐานะ: ${
        selectedRole === 'admin'
          ? 'Admin (ผู้ดูแลระบบ)'
          : selectedRole === 'head_nurse'
          ? 'หัวหน้าพยาบาล (ดูได้อย่างเดียว)'
          : 'หัวหน้าฝ่าย (บันทึก/แก้ไข/พิมพ์งาน/เพิ่มกิจกรรม)'
      }`
    );
    setTimeout(() => onClose(), 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <Lock className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ระบบยืนยันตัวตนและจัดการสิทธิการใช้งาน</h3>
                <p className="text-xs text-emerald-200">
                  ระบบคำนวณและจัดสรรอัตรากำลังพยาบาลตามภาระงานจริง
                </p>
              </div>
            </div>
            {userProfile && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              เข้าสู่ระบบ (Login)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              สมัครใช้งาน (Sign Up)
            </button>
            <button
              onClick={() => {
                setMode('switch');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 ${
                mode === 'switch'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              ทดลองเปลี่ยนสิทธิ์ (3 ระดับ)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loadingAction}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-slate-700 dark:text-slate-200 text-xs shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google Account (Hospital SSO)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[11px]">หรือเข้าสู่ระบบด้วยอีเมล</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมลประจำตัว (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="เช่น itborder.ssk11284@gmail.com หรือ nurse@hospital.go.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loadingAction ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </form>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อ-นามสกุล / ตำแหน่ง
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น พว. ปรียาภรณ์ ใจดี"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมลสำหรับเข้าสู่ระบบ
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="nurse@hospital.go.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  เลือกระดับสิทธิการเข้าถึง (Access Level)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Admin */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      role === 'admin'
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> 1. Admin
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'admin'}
                          onChange={() => setRole('admin')}
                          className="accent-indigo-600"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        สิทธิเข้าถึงทุกฟังก์ชั่น (จัดการผู้ใช้, กำหนดสูตร, น้ำหนักเวลา)
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Head Nurse */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      role === 'head_nurse'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> 2. หัวหน้าพยาบาล
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'head_nurse'}
                          onChange={() => setRole('head_nurse')}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ดูได้อย่างเดียว ไม่สามารถบันทึก แก้ไข หรือลบข้อมูลได้
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Department Head */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      role === 'department_head'
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" /> 3. หัวหน้าฝ่าย
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'department_head'}
                          onChange={() => setRole('department_head')}
                          className="accent-teal-600"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        บันทึก ลบ แก้ไข พิมพ์งาน และเพิ่มรายการกิจกรรมใหม่ได้
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Department Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  แผนกประจำการ (Department)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">ทุกแผนก / ภาพรวมโรงพยาบาล (Hospital-wide)</option>
                    <option value="ER">อุบัติเหตุและฉุกเฉิน (ER)</option>
                    <option value="OPD">ผู้ป่วยนอก (OPD)</option>
                    <option value="IPD1">ผู้ป่วยใน 1 (IPD 1)</option>
                    <option value="IPD2">ผู้ป่วยใน 2 (IPD 2)</option>
                    <option value="LR">ห้องคลอด (LR)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loadingAction ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครและเข้าสู่ระบบ'}
              </button>
            </form>
          )}

          {/* MODE: QUICK ROLE SWITCHER FOR DEMO / TEST */}
          {mode === 'switch' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                💡 <strong>โหมดทดสอบบทบาทด่วน:</strong>{' '}
                ท่านสามารถคลิกสลับเพื่อทดสอบการทำงานของระบบตามข้อกำหนดทั้ง 3 ระดับได้ทันที
              </div>

              <div className="space-y-2.5">
                {/* 1. Admin */}
                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                          1. Admin (ผู้ดูแลระบบ)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 font-medium">
                          สิทธิเต็ม 100%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        เข้าถึงทุกฟังก์ชั่น • จัดการผู้ใช้งานในระบบ • กำหนดค่าน้ำหนักเวลาและสูตร • บันทึก/ลบข้อมูล
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectDemo('admin')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    ใช้งานสิทธินี้
                  </button>
                </div>

                {/* 2. Head Nurse */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                          2. หัวหน้าพยาบาล (Head Nurse)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium">
                          ดูได้อย่างเดียว (View-Only)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        ดูแดชบอร์ด รายงาน ภาระงาน •{' '}
                        <strong className="text-rose-600 dark:text-rose-400">
                          ไม่สามารถ บันทึก แก้ไข หรือเปลี่ยนแปลงข้อมูลได้
                        </strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectDemo('head_nurse')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    ใช้งานสิทธินี้
                  </button>
                </div>

                {/* 3. Department Head */}
                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-teal-900 dark:text-teal-200">
                          3. หัวหน้าฝ่าย (Department Head)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 font-medium">
                          สิทธิจัดการประจำฝ่าย
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        บันทึก ลบ แก้ไข • พิมพ์งานและส่งออก •{' '}
                        <strong className="text-teal-700 dark:text-teal-300">
                          เพิ่มรายการกิจกรรมใหม่
                        </strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectDemo('department_head')}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    ใช้งานสิทธินี้
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Logged in badge */}
          {userProfile && (
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>
                  เข้าใช้งานอยู่:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {userProfile.displayName}
                  </strong>{' '}
                  ({userProfile.email})
                </span>
              </div>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {userProfile.role === 'admin'
                  ? 'Admin'
                  : userProfile.role === 'head_nurse'
                  ? 'หัวหน้าพยาบาล'
                  : 'หัวหน้าฝ่าย'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
