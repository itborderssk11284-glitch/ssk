import React from 'react';
import { HospitalLogo } from './HospitalLogo';
import {
  Calendar,
  Clock,
  Moon,
  Sun,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Share2,
  Glasses,
} from 'lucide-react';
import { ShiftType, DisplayThemeMode } from '../types/staffing';
import { SHIFT_NAMES } from '../data/defaults';

interface HeaderProps {
  currentTab: 'dashboard' | 'entry' | 'departments' | 'reports' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'entry' | 'departments' | 'reports' | 'settings') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: ShiftType;
  setSelectedShift: (shift: ShiftType) => void;
  themeMode?: DisplayThemeMode;
  setThemeMode?: (val: DisplayThemeMode) => void;
  onOpenDataEntry: () => void;
  onOpenMobileShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
  themeMode = 'eyecare',
  setThemeMode,
  onOpenDataEntry,
  onOpenMobileShare,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Zone Contract */}
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark with Hospital Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => setCurrentTab('dashboard')}
          >
            <HospitalLogo size={44} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-400 tracking-tight whitespace-nowrap">
                รพ.สังขละบุรี
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
                ระบบคำนวณค่างานและอัตรากำลังพยาบาล
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              ภาพรวม Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('departments')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'departments'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              เกณฑ์ 4 แผนกหลัก
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'reports'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              รายงาน & ส่งออก
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'settings'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              เกณฑ์มาตรฐาน
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Share to Mobile / LINE */}
            <button
              onClick={onOpenMobileShare}
              title="ส่งสรุปรายงานทางเบอร์มือถือ / LINE"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">ส่งสรุปมือถือ</span>
            </button>

            {/* Eye-care & Night Mode Toggle */}
            <button
              onClick={() => {
                if (setThemeMode) {
                  setThemeMode(themeMode === 'eyecare' ? 'night' : themeMode === 'night' ? 'normal' : 'eyecare');
                }
              }}
              title={themeMode === 'eyecare' ? 'โหมดถนอมสายตา (คลิกเพื่อเปลี่ยน)' : themeMode === 'night' ? 'โหมดมืดกลางคืน' : 'โหมดปกติ'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {themeMode === 'eyecare' ? <Glasses className="w-4 h-4 text-amber-600" /> : themeMode === 'night' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenDataEntry}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกค่างาน</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Date & Shift Selection Bar */}
        <div className="py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Picker & Quick Select */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-500 dark:text-slate-400">วันที่:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 font-medium focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs transition-colors"
            >
              วันนี้
            </button>
          </div>

          {/* Shift Segmented Control (Functional Buttons) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 px-1.5 text-[11px] font-medium hidden sm:inline">
              <Clock className="w-3 h-3 inline mr-1" />
              ช่วงเวลา:
            </span>
            {(['morning', 'afternoon', 'night', 'daily_total'] as ShiftType[]).map((shiftKey) => {
              const labelMap: Record<ShiftType, string> = {
                morning: 'เวรเช้า',
                afternoon: 'เวรบ่าย',
                night: 'เวรดึก',
                daily_total: 'สรุป 24 ชม.',
              };
              const isActive = selectedShift === shiftKey;
              return (
                <button
                  key={shiftKey}
                  onClick={() => setSelectedShift(shiftKey)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {labelMap[shiftKey]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
