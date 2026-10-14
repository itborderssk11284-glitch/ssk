import React, { useState } from 'react';
import {
  DepartmentCalculationResult,
  DepartmentDailyLog,
  DepartmentId,
  HospitalDailySummary,
  ShiftType,
} from '../types/staffing';
import { DEPARTMENT_CONFIG, SHIFT_NAMES } from '../data/defaults';
import { HospitalLogo } from './HospitalLogo';
import {
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BedDouble,
  HeartPulse,
  Stethoscope,
  PlusCircle,
  Share2,
  ShieldAlert,
  PieChart,
  BarChart3,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Wifi,
  Battery,
  Eye,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface DashboardProps {
  summary: HospitalDailySummary;
  logs: DepartmentDailyLog[];
  selectedDate: string;
  selectedShift: ShiftType;
  onOpenDataEntryForDept: (deptId: DepartmentId) => void;
  onSelectDepartment: (deptId: DepartmentId) => void;
  onOpenMobileShare: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  logs,
  selectedDate,
  selectedShift,
  onOpenDataEntryForDept,
  onSelectDepartment,
  onOpenMobileShare,
}) => {
  const deptList: DepartmentId[] = ['ER', 'OPD', 'IPD1', 'IPD2', 'LR'];
  const [hoveredDept, setHoveredDept] = useState<DepartmentId | null>(null);

  // Device View Mode: 'desktop' | 'tablet' | 'mobile'
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Modern department icons
  const deptIcons: Record<DepartmentId, React.ReactNode> = {
    ER: <Activity className="w-5 h-5 text-rose-500" />,
    OPD: <Users className="w-5 h-5 text-blue-500" />,
    IPD1: <BedDouble className="w-5 h-5 text-emerald-500" />,
    IPD2: <Stethoscope className="w-5 h-5 text-teal-500" />,
    LR: <HeartPulse className="w-5 h-5 text-purple-500" />,
  };

  const deptColors: Record<
    DepartmentId,
    { bg: string; stroke: string; lightBg: string; text: string }
  > = {
    ER: {
      bg: 'bg-rose-500',
      stroke: '#f43f5e',
      lightBg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
    OPD: {
      bg: 'bg-blue-500',
      stroke: '#3b82f6',
      lightBg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    IPD1: {
      bg: 'bg-emerald-500',
      stroke: '#10b981',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    IPD2: {
      bg: 'bg-teal-500',
      stroke: '#14b8a6',
      lightBg: 'bg-teal-50 dark:bg-teal-950/30',
      text: 'text-teal-600 dark:text-teal-400',
    },
    LR: {
      bg: 'bg-purple-500',
      stroke: '#a855f7',
      lightBg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  // Status Styling Badge
  const getStatusBadge = (status: 'deficit' | 'balanced' | 'surplus', balance: number) => {
    if (status === 'deficit') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          ขาด {Math.abs(balance).toFixed(1)} อัตรา
        </span>
      );
    }
    if (status === 'surplus') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          เพียงพอ (+{balance.toFixed(1)})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        สมดุลตามเกณฑ์
      </span>
    );
  };

  // Grouped Bar Chart Scale
  const maxStaffValue = Math.max(
    ...deptList.map((d) => Math.max(summary.departments[d].actualRN, summary.departments[d].requiredRN)),
    8
  );
  const chartHeightPx = deviceView === 'mobile' ? 140 : 180;

  // Donut Chart Segment Math
  const totalHours = Math.max(summary.totalWorkloadHours, 0.001);
  const donutCircumference = 2 * Math.PI * 60; // radius = 60
  let cumulativePercent = 0;

  const donutSegments = deptList.map((dId) => {
    const hours = summary.departments[dId].totalWorkloadHours;
    const percent = totalHours > 0 ? (hours / totalHours) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * donutCircumference);
    cumulativePercent += percent;
    return {
      deptId: dId,
      hours,
      percent: Math.round(percent),
      strokeDasharray,
      strokeDashoffset,
      color: deptColors[dId].stroke,
    };
  });

  // Inner Content of Dashboard
  const renderDashboardBody = (isMobile: boolean, isTablet: boolean) => (
    <div className="space-y-5">
      {/* 4 Modern Top Metrics KPI Cards */}
      <div
        className={`grid ${
          isMobile ? 'grid-cols-2 gap-2.5' : isTablet ? 'grid-cols-2 sm:grid-cols-4 gap-3' : 'grid-cols-2 lg:grid-cols-4 gap-3.5'
        }`}
      >
        {/* Card 1: Workload Hours */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-[11px] sm:text-xs">ภาระงานพยาบาลรวม</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {summary.totalWorkloadHours.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">ชม.</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            = {(summary.totalWorkloadHours / 7).toFixed(1)} พยาบาล-เวร
          </div>
        </div>

        {/* Card 2: Required RN */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all hover:border-blue-300 dark:hover:border-blue-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-[11px] sm:text-xs">พยาบาลที่ควรมี</span>
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400">
              {summary.totalRequiredRN.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">อัตรา (RN)</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            เกณฑ์สภาการพยาบาล 7 ชม./เวร
          </div>
        </div>

        {/* Card 3: Actual Staff */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-[11px] sm:text-xs">พยาบาลขึ้นเวรจริง</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {summary.totalActualRN}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">RN (+{summary.totalActualPN} PN)</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            รวม {summary.totalActualRN + summary.totalActualPN} คน
          </div>
        </div>

        {/* Card 4: Staff Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-[11px] sm:text-xs">ดุลอัตรากำลังสุทธิ</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {summary.overallStatus === 'deficit' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums ${
                summary.overallStatus === 'deficit'
                  ? 'text-rose-600 dark:text-rose-400'
                  : summary.overallStatus === 'surplus'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {summary.totalBalanceRN > 0 ? `+${summary.totalBalanceRN}` : summary.totalBalanceRN}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">อัตรา</span>
          </div>
          <div className="mt-1.5">{getStatusBadge(summary.overallStatus, summary.totalBalanceRN)}</div>
        </div>
      </div>

      {/* DUAL GRAPHS SECTION: Comparison Bar + Donut Share */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : isTablet ? 'grid-cols-1 gap-5' : 'grid-cols-1 lg:grid-cols-12 gap-5'}`}>
        {/* GRAPH 1: Grouped Dual-Bar Chart: Actual vs Required Staffing by Department */}
        <div
          className={`${
            isMobile || isTablet ? 'w-full' : 'lg:col-span-7'
          } bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    เปรียบเทียบอัตรากำลังรายแผนก (Actual vs. Required)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  แท่งเขียว (พยาบาลจริง) เทียบกับ แท่งน้ำเงิน (พยาบาลที่ควรมีตามเกณฑ์)
                </p>
              </div>

              {/* Legend Indicator */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Actual RN (จริง)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Required (เกณฑ์)</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Grouped Bar Chart */}
            <div className="relative pt-4 pb-2">
              <div
                className="grid grid-cols-5 gap-2 sm:gap-4 items-end border-b border-slate-200 dark:border-slate-700 px-1"
                style={{ height: `${chartHeightPx}px` }}
              >
                {deptList.map((dId) => {
                  const res = summary.departments[dId];
                  const actualHeightPct = Math.min((res.actualRN / maxStaffValue) * 100, 100);
                  const requiredHeightPct = Math.min((res.requiredRN / maxStaffValue) * 100, 100);
                  const isHovered = hoveredDept === dId;

                  return (
                    <div
                      key={dId}
                      className={`h-full flex flex-col justify-end items-center group cursor-pointer p-1 rounded-lg transition-all ${
                        isHovered ? 'bg-slate-50 dark:bg-slate-750/60' : ''
                      }`}
                      onMouseEnter={() => setHoveredDept(dId)}
                      onMouseLeave={() => setHoveredDept(null)}
                      onClick={() => onSelectDepartment(dId)}
                    >
                      {/* Dual Bars Container */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Bar 1: Actual RN (Emerald) */}
                        <div className="flex-1 max-w-[20px] flex flex-col items-center justify-end h-full">
                          <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                            {res.actualRN}
                          </span>
                          <div
                            style={{ height: `${Math.max(actualHeightPct, 6)}%` }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-t-sm transition-all duration-500 shadow-2xs"
                          />
                        </div>

                        {/* Bar 2: Required RN (Blue) */}
                        <div className="flex-1 max-w-[20px] flex flex-col items-center justify-end h-full">
                          <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 mb-0.5">
                            {res.requiredRN}
                          </span>
                          <div
                            style={{ height: `${Math.max(requiredHeightPct, 6)}%` }}
                            className="w-full bg-blue-500 hover:bg-blue-400 rounded-t-sm transition-all duration-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Department Names Axis Labels */}
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-2 px-1 text-center">
                {deptList.map((dId) => {
                  const res = summary.departments[dId];
                  const isDeficit = res.balanceStatus === 'deficit';
                  return (
                    <div
                      key={dId}
                      onClick={() => onSelectDepartment(dId)}
                      className="cursor-pointer hover:underline"
                    >
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {dId}
                      </span>
                      <span
                        className={`inline-block text-[9px] font-mono font-semibold px-1 py-0.2 rounded mt-0.5 ${
                          isDeficit
                            ? 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {res.balanceRN > 0 ? `+${res.balanceRN}` : res.balanceRN}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Donut Workload Share by Department */}
        <div
          className={`${
            isMobile || isTablet ? 'w-full' : 'lg:col-span-5'
          } bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                สัดส่วนภาระงานรายแผนก (Workload Share)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              จำแนกสัดส่วนชั่วโมงการพยาบาลรวม {summary.totalWorkloadHours} ชม.
            </p>

            <div className={`flex ${isMobile ? 'flex-col items-center gap-3' : 'flex-col sm:flex-row items-center gap-4'}`}>
              {/* Donut SVG */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="18"
                    className="text-slate-100 dark:text-slate-700"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.deptId}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-700 cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setHoveredDept(seg.deptId)}
                      onMouseLeave={() => setHoveredDept(null)}
                    />
                  ))}
                </svg>

                {/* Central Donut Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                    ภาระงานรวม
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                    {summary.totalWorkloadHours}
                  </span>
                  <span className="text-[9px] text-slate-500">ชม.</span>
                </div>
              </div>

              {/* Department Share List Breakdown */}
              <div className="flex-1 w-full space-y-1.5 text-xs">
                {deptList.map((dId) => {
                  const res = summary.departments[dId];
                  const pct =
                    summary.totalWorkloadHours > 0
                      ? Math.round((res.totalWorkloadHours / summary.totalWorkloadHours) * 100)
                      : 0;
                  const isHovered = hoveredDept === dId;

                  return (
                    <div
                      key={dId}
                      onMouseEnter={() => setHoveredDept(dId)}
                      onMouseLeave={() => setHoveredDept(null)}
                      onClick={() => onSelectDepartment(dId)}
                      className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all ${
                        isHovered
                          ? 'bg-slate-100 dark:bg-slate-700/80 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: deptColors[dId].stroke }}
                        />
                        <span className="text-slate-800 dark:text-slate-200 text-xs">
                          {dId === 'IPD1' ? 'IPD 1' : dId === 'IPD2' ? 'IPD 2' : dId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 dark:text-slate-400 text-xs">
                        <span>{res.totalWorkloadHours} ชม.</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">ดัชนีภาระงานเฉลี่ย:</span>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {summary.totalActualRN > 0
                ? (summary.totalWorkloadHours / summary.totalActualRN).toFixed(1)
                : '0'}{' '}
              ชม./คน/เวร
            </span>
          </div>
        </div>
      </div>

      {/* 5 Main Department Detailed Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            สถานะ 4 แผนกหลัก โรงพยาบาลสังขละบุรี
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            สูตรคำนวณมาตรฐานสภาการพยาบาล (IPD 1 และ 2 ใช้สูตรเดียวกัน)
          </span>
        </div>

        <div
          className={`grid ${
            isMobile
              ? 'grid-cols-1 gap-3'
              : isTablet
              ? 'grid-cols-2 gap-3.5'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5'
          }`}
        >
          {deptList.map((dId) => {
            const res = summary.departments[dId];
            const cfg = DEPARTMENT_CONFIG[dId];
            const log = logs.find(
              (l) => l.departmentId === dId && l.date === selectedDate && l.shift === selectedShift
            );

            return (
              <div
                key={dId}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${cfg.bgLight}`}>{deptIcons[dId]}</div>
                      <div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${cfg.badgeBg} ${cfg.badgeText}`}
                        >
                          {dId}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-tight">
                          {cfg.name.split(' ')[0]}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Department Clinical Highlight */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/80 my-2 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ผู้รับบริการ:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {res.totalPatients} {dId.startsWith('IPD') ? 'เตียง' : 'ราย'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ภาระงานรวม:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {res.totalWorkloadHours} ชม.
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">จริง / ควรมี:</span>
                      <span className="font-mono font-semibold">
                        {res.actualRN} / <span className="text-blue-700">{res.requiredRN} RN</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectDepartment(dId)}
                    className="flex-1 py-1.5 text-center text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-750 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    ดูเกณฑ์คำนวณ
                  </button>
                  <button
                    onClick={() => onOpenDataEntryForDept(dId)}
                    className="p-1.5 text-emerald-700 hover:text-white hover:bg-emerald-700 rounded-lg transition-colors"
                    title="บันทึกข้อมูลแผนกนี้"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Overview Header Banner with Device View Switcher */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>กลุ่มงานการพยาบาล โรงพยาบาลสังขละบุรี</span>
              <span>·</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {selectedDate}
              </span>
              <span>·</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {SHIFT_NAMES[selectedShift]}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              สถานการณ์ค่างานและวิเคราะห์อัตรากำลังพยาบาล
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              ระบบคำนวณ Real-time เปรียบเทียบอัตรากำลังจริง (Actual) กับเกณฑ์ที่ควรมี (Required) ตามมาตรฐานสภาการพยาบาล
            </p>
          </div>

          {/* Action Tools: Device Switcher & Mobile Summary */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View Mode Switcher Toggle (Desktop / Tablet / Smartphone) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceView === 'desktop'
                    ? 'bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="มุมมองหน้าจอคอมพิวเตอร์ (เต็มจอ)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">เดสก์ท็อป</span>
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceView === 'tablet'
                    ? 'bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="มุมมองแท็บเล็ต (iPad 768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>แท็บเล็ต</span>
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceView === 'mobile'
                    ? 'bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="มุมมองสมาร์ทโฟน (Mobile 390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>สมาร์ทโฟน</span>
              </button>
            </div>

            <button
              onClick={onOpenMobileShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ส่งสรุปมือถือ/LINE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RENDER VIEW: SMARTPHONE SIMULATOR FRAME */}
      {/* ========================================================= */}
      {deviceView === 'mobile' && (
        <div className="py-2">
          {/* Top Switcher Banner */}
          <div className="max-w-[420px] mx-auto mb-2 flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>จำลองมุมมองสมาร์ทโฟน (390px)</span>
            </span>
            <button
              onClick={() => setDeviceView('desktop')}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>กลับสู่เดสก์ท็อป</span>
            </button>
          </div>

          {/* Phone Mockup Frame */}
          <div className="max-w-[416px] mx-auto rounded-[46px] p-3.5 bg-slate-950 border-[6px] border-slate-700 dark:border-slate-600 shadow-2xl relative transition-all">
            {/* Top Phone Speaker / Dynamic Island */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
            </div>

            {/* Mobile Simulated Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-4 pb-2">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-400" />
                <Battery className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Screen Content Wrapper */}
            <div className="rounded-[30px] overflow-hidden bg-slate-100/90 dark:bg-slate-900 p-3 space-y-4 max-h-[750px] overflow-y-auto">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <HospitalLogo size={32} />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    รพ.สังขละบุรี
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedDate} · {SHIFT_NAMES[selectedShift].split(' ')[0]}
                  </span>
                </div>
              </div>

              {renderDashboardBody(true, false)}
            </div>

            {/* Phone Bottom Home Swipe Bar Indicator */}
            <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENDER VIEW: TABLET SIMULATOR FRAME */}
      {/* ========================================================= */}
      {deviceView === 'tablet' && (
        <div className="py-2">
          {/* Top Switcher Banner */}
          <div className="max-w-[800px] mx-auto mb-2 flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Tablet className="w-4 h-4 text-emerald-600" />
              <span>จำลองมุมมองแท็บเล็ต iPad (768px)</span>
            </span>
            <button
              onClick={() => setDeviceView('desktop')}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>กลับสู่เดสก์ท็อป</span>
            </button>
          </div>

          {/* Tablet Mockup Frame */}
          <div className="max-w-[800px] mx-auto rounded-[36px] p-4 bg-slate-950 border-[6px] border-slate-700 dark:border-slate-600 shadow-2xl relative transition-all">
            {/* Top Camera Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mx-auto mb-2" />

            {/* Tablet Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-4 pb-2">
              <span>iPad · 09:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-400" />
                <Battery className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Screen Content Wrapper */}
            <div className="rounded-[22px] overflow-hidden bg-slate-100/90 dark:bg-slate-900 p-4 space-y-4 max-h-[800px] overflow-y-auto">
              {renderDashboardBody(false, true)}
            </div>

            {/* Tablet Home Bar */}
            <div className="w-36 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENDER VIEW: STANDARD DESKTOP VIEW */}
      {/* ========================================================= */}
      {deviceView === 'desktop' && renderDashboardBody(false, false)}
    </div>
  );
};
