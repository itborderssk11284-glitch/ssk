import React from 'react';
import { ShiftType, DisplayThemeMode, NavigationTab } from '../types/staffing';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Calendar,
  PlusCircle,
  Share2,
  Glasses,
  Moon,
  Sun,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Eye,
  Sparkles,
  Cloud,
  CloudCheck,
} from 'lucide-react';

interface TopBarProps {
  currentTab: NavigationTab;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: ShiftType;
  setSelectedShift: (shift: ShiftType) => void;
  onOpenDataEntry: () => void;
  onOpenMobileShare: () => void;
  onOpenAuthModal: () => void;
  onToggleMobileSidebar: () => void;
  themeMode: DisplayThemeMode;
  setThemeMode: (mode: DisplayThemeMode) => void;
  isFirestoreConnected?: boolean;
  isFirestoreSyncing?: boolean;
  onOpenVercelDeploy?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
  onOpenDataEntry,
  onOpenMobileShare,
  onOpenAuthModal,
  onToggleMobileSidebar,
  themeMode,
  setThemeMode,
  isFirestoreConnected = true,
  isFirestoreSyncing = false,
  onOpenVercelDeploy,
}) => {
  const { userProfile, isHeadNurse } = useAuth();

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'ภาพรวมค่างานและอัตรากำลังพยาบาล';
      case 'departments':
        return 'สูตรและเกณฑ์การคำนวณ 4 แผนกหลัก';
      case 'reports':
        return 'รายงานสรุปค่างานและพิมพ์เอกสาร PDF';
      case 'settings':
        return 'ตั้งค่าน้ำหนักเวลาและเกณฑ์มาตรฐาน';
      case 'users':
        return 'จัดการผู้ใช้งานในระบบและสิทธิการเข้าถึง';
      default:
        return 'ระบบคำนวณค่างานและอัตรากำลังพยาบาล';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            title="เปิดเมนูด้านซ้าย"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span>รพ.สังขละบุรี</span>
              <span>/</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {getTabTitle()}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {getTabTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side: Date Picker, Shift Selector, User Chip & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Firestore Database Connection Badge */}
          <div
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-2xs"
            title="เชื่อมต่อฐานข้อมูล Firebase Firestore อัตโนมัติ (Live Cloud Database)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFirestoreSyncing
                  ? 'bg-amber-500 animate-ping'
                  : isFirestoreConnected
                  ? 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              {isFirestoreSyncing ? 'กำลังซิงค์ Cloud...' : 'Firestore Live'}
            </span>
          </div>

          {/* User Profile Chip Button */}
          <button
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition shadow-2xs text-left"
            title="คลิกเพื่อสลับสิทธิผู้ใช้งาน หรือ เข้าสู่ระบบ/สมัครใช้งาน"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                userProfile?.role === 'admin'
                  ? 'bg-indigo-600'
                  : userProfile?.role === 'head_nurse'
                  ? 'bg-emerald-600'
                  : 'bg-teal-600'
              }`}
            >
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {userProfile?.displayName || 'ผู้ใช้งาน'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 leading-none">
                {userProfile?.role === 'admin' ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                    <ShieldAlert className="w-2.5 h-2.5" /> 1. Admin
                  </span>
                ) : userProfile?.role === 'head_nurse' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <UserCheck className="w-2.5 h-2.5" /> 2. หน.พยาบาล (ดูอย่างเดียว)
                  </span>
                ) : (
                  <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                    <Stethoscope className="w-2.5 h-2.5" /> 3. หน.ฝ่าย
                  </span>
                )}
              </div>
            </div>
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          </button>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-medium focus:outline-none cursor-pointer text-xs"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold ml-1"
            >
              วันนี้
            </button>
          </div>

          {/* Shift Segmented Selector */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            {(['morning', 'afternoon', 'night', 'daily_total'] as ShiftType[]).map((shiftKey) => {
              const labelMap: Record<ShiftType, string> = {
                morning: 'เวรเช้า',
                afternoon: 'เวรบ่าย',
                night: 'เวรดึก',
                daily_total: '24 ชม.',
              };
              const isActive = selectedShift === shiftKey;
              return (
                <button
                  key={shiftKey}
                  onClick={() => setSelectedShift(shiftKey)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {labelMap[shiftKey]}
                </button>
              );
            })}
          </div>

          {/* Vercel Deploy Guide Button */}
          {onOpenVercelDeploy && (
            <button
              onClick={onOpenVercelDeploy}
              title="คู่มือนำระบบขึ้นเว็ปไซต์ Vercel (ไฟล์ vercel.json พร้อม 100%)"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 hidden sm:flex items-center gap-1.5 text-xs shadow-2xs font-semibold"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 76 65">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span className="hidden xl:inline">นำขึ้น Vercel</span>
            </button>
          )}

          {/* Share to Mobile Button */}
          <button
            onClick={onOpenMobileShare}
            title="แจ้งเตือนส่งเวรทางมือถือ / LINE"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hidden sm:flex items-center gap-1.5 text-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xl:inline">ส่งสรุปมือถือ</span>
          </button>

          {/* Eye-Care & Night Mode Quick Switcher */}
          <button
            onClick={() => {
              if (themeMode === 'eyecare') setThemeMode('night');
              else if (themeMode === 'night') setThemeMode('normal');
              else setThemeMode('eyecare');
            }}
            title={
              themeMode === 'eyecare'
                ? 'โหมดถนอมสายตา (คลิกเพื่อเปลี่ยนเป็นโหมดมืดกลางคืน)'
                : themeMode === 'night'
                ? 'โหมดมืดกลางคืน (คลิกเพื่อเปลี่ยนเป็นโหมดปกติ)'
                : 'โหมดปกติ (คลิกเพื่อเปิดโหมดถนอมสายตา)'
            }
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs shadow-2xs ${
              themeMode === 'eyecare'
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 font-bold dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                : themeMode === 'night'
                ? 'bg-slate-800 text-emerald-300 border-slate-700 font-bold dark:bg-slate-750 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            {themeMode === 'eyecare' ? (
              <>
                <Glasses className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden md:inline text-[11px]">ถนอมสายตา</span>
              </>
            ) : themeMode === 'night' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden md:inline text-[11px]">มืดกลางคืน</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden md:inline text-[11px]">โหมดปกติ</span>
              </>
            )}
          </button>

          {/* Primary Action Button (Aware of Head Nurse View-Only Role) */}
          {isHeadNurse ? (
            <button
              onClick={onOpenDataEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all whitespace-nowrap"
              title="สิทธิหัวหน้าพยาบาล: ดูได้อย่างเดียว ไม่สามารถบันทึกหรือแก้ไขได้"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ดูข้อมูลเวรนี้ (ดูอย่างเดียว)</span>
            </button>
          ) : (
            <button
              onClick={onOpenDataEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>บันทึกค่างาน</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
