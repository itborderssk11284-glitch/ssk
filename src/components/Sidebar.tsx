import React from 'react';
import { HospitalLogo } from './HospitalLogo';
import { DepartmentId, DisplayThemeMode, NavigationTab } from '../types/staffing';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Sliders,
  Moon,
  Sun,
  Share2,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  X,
  Glasses,
  Users,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  LogOut,
  Sparkles,
  Eye,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedDeptId: DepartmentId;
  onSelectDeptId: (id: DepartmentId) => void;
  themeMode: DisplayThemeMode;
  setThemeMode: (mode: DisplayThemeMode) => void;
  onOpenDataEntry: () => void;
  onOpenMobileShare: () => void;
  onOpenAuthModal: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  onOpenVercelDeploy?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  themeMode,
  setThemeMode,
  onOpenDataEntry,
  onOpenMobileShare,
  onOpenAuthModal,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  onOpenVercelDeploy,
}) => {
  const { userProfile, isAdmin, isHeadNurse, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'ภาพรวม Dashboard',
      subtitle: 'สถานะอัตรากำลัง Real-time',
      icon: LayoutDashboard,
    },
    {
      id: 'departments' as NavigationTab,
      label: 'เกณฑ์คำนวณ 4 แผนก',
      subtitle: 'ER · OPD · IPD 1/2 · LR',
      icon: Building2,
    },
    {
      id: 'reports' as NavigationTab,
      label: 'รายงาน & พิมพ์ PDF',
      subtitle: 'ส่งออก Excel / รายเดือน/ปี',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'ตั้งค่าเกณฑ์มาตรฐาน',
      subtitle: 'ปรับชั่วโมงงานและสูตร',
      icon: Sliders,
    },
    {
      id: 'users' as NavigationTab,
      label: 'จัดการผู้ใช้งานในระบบ',
      subtitle: 'แบ่งระดับ 3 สิทธิการเข้าถึง',
      icon: Users,
      badge: 'Admin',
    },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    setCurrentTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Hospital Identity & Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <HospitalLogo size={42} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 tracking-tight leading-snug">
                รพ.สังขละบุรี
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                ระบบคำนวณค่างานพยาบาล
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle: Primary Navigation & User Role Badge */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Quick Action Button */}
          <div className="px-1">
            {isHeadNurse ? (
              <button
                onClick={() => {
                  onOpenDataEntry();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full inline-flex items-center justify-between px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all"
                title="สิทธิหัวหน้าพยาบาล: เปิดดูข้อมูลค่างาน (โหมดดูอย่างเดียว)"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>ดูค่างานเวรนี้</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-normal">
                  ดูอย่างเดียว
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenDataEntry();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>บันทึกค่างานเวรนี้</span>
              </button>
            )}
          </div>

          {/* Main Navigation Menu */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              เมนูหลัก (Main Menu)
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors relative ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <div className="flex-1 truncate">
                    <div className="text-xs flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && !isAdmin && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-normal">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">
                      {item.subtitle}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* User Profile & Role Card in Sidebar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ผู้ใช้งานในระบบ
              </span>
              <button
                onClick={onOpenAuthModal}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                title="สลับสิทธิหรือเข้าสู่ระบบ"
              >
                <Sparkles className="w-3 h-3" />
                สลับสิทธิ
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 ${
                  userProfile?.role === 'admin'
                    ? 'bg-indigo-600'
                    : userProfile?.role === 'head_nurse'
                    ? 'bg-emerald-600'
                    : 'bg-teal-600'
                }`}
              >
                {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {userProfile?.displayName || 'ผู้ใช้งานระบบ'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userProfile?.email || 'hospital@ssk.go.th'}
                </div>
              </div>
            </div>

            {/* Current Role Badge */}
            <div
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between border ${
                userProfile?.role === 'admin'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-900/60 dark:text-indigo-300'
                  : userProfile?.role === 'head_nurse'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300'
                  : 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/60 dark:border-teal-900/60 dark:text-teal-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {userProfile?.role === 'admin' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : userProfile?.role === 'head_nurse' ? (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                )}
                <span>
                  {userProfile?.role === 'admin'
                    ? '1. Admin (สิทธิเต็ม)'
                    : userProfile?.role === 'head_nurse'
                    ? '2. หัวหน้าพยาบาล'
                    : '3. หัวหน้าฝ่าย'}
                </span>
              </div>
              <span className="text-[10px] font-normal opacity-80">
                {userProfile?.role === 'head_nurse'
                  ? 'ดูอย่างเดียว'
                  : userProfile?.role === 'department_head'
                  ? 'บันทึก/แก้ไข'
                  : 'จัดการทั้งหมด'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onOpenAuthModal}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                เข้าสู่ระบบ/สมัคร
              </button>
              <button
                onClick={logout}
                className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3 h-3" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Controls: Theme & Mobile Share */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          {/* Vercel Deploy Guide Button */}
          {onOpenVercelDeploy && (
            <button
              onClick={() => {
                onOpenVercelDeploy();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg transition-colors shadow-2xs border border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 76 65">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span>นำขึ้นเว็ปไซต์ Vercel</span>
              </div>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                พร้อม 100%
              </span>
            </button>
          )}

          {/* Quick Notification Share Button */}
          <button
            onClick={() => {
              onOpenMobileShare();
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ส่งสรุปรายงานมือถือ</span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              SMS/LINE
            </span>
          </button>

          {/* Eye Care & Night Dark Mode Controls (ปรับเป็นโหมดถนอมสายตา / โหมดมืดกลางคืน) */}
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Glasses className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>โหมดหน้าจอถนอมสายตา</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {themeMode === 'eyecare' ? 'โทนอุ่น' : themeMode === 'night' ? 'เวรดึก' : 'ปกติ'}
              </span>
            </div>

            {/* Segmented Mode Selector Buttons */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-750 rounded-lg">
              <button
                type="button"
                onClick={() => setThemeMode('eyecare')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all ${
                  themeMode === 'eyecare'
                    ? 'bg-amber-100/95 text-amber-900 font-bold shadow-2xs border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="โหมดถนอมสายตา: ตัดแสงสีฟ้า โทนอุ่นสบายตา เหมาะสำหรับทำงานต่อเนื่อง"
              >
                <Glasses className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>ถนอมสายตา</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('night')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all ${
                  themeMode === 'night'
                    ? 'bg-slate-800 text-slate-100 font-bold shadow-2xs border border-slate-600 dark:bg-slate-700 dark:text-emerald-300 dark:border-emerald-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="โหมดมืดกลางคืน: สำหรับเวรดึก ป้องกันแสงสะท้อนรบกวนในหอผู้ป่วย"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>มืดกลางคืน</span>
              </button>
            </div>

            {/* Standard Mode option */}
            {themeMode !== 'normal' ? (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setThemeMode('normal')}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline decoration-slate-300 flex items-center gap-1"
                >
                  <Sun className="w-2.5 h-2.5 text-slate-400" />
                  <span>ใช้โหมดปกติ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
                <span className="flex items-center gap-1 text-slate-500">
                  <Sun className="w-2.5 h-2.5 text-amber-500" /> โหมดปกติ
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">กดเลือกด้านบนเพื่อถนอมสายตา</span>
              </div>
            )}
          </div>

          {/* Hospital accreditation footnote */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>กลุ่มงานการพยาบาล รพ.สังขละบุรี</span>
          </div>
        </div>
      </aside>
    </>
  );
};
