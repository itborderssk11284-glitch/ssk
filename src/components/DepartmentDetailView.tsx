import React, { useState } from 'react';
import {
  DepartmentCalculationResult,
  DepartmentDailyLog,
  DepartmentId,
  ShiftType,
  StandardWeights,
  RiskLevel,
  ActivityCatalogItem,
  DepartmentActivitiesMap,
} from '../types/staffing';
import {
  DEPARTMENT_CONFIG,
  SHIFT_NAMES,
  DEFAULT_DEPARTMENT_ACTIVITIES,
} from '../data/defaults';
import { calculateDepartmentWorkload } from '../utils/calculator';
import { ActivityEditorModal } from './ActivityEditorModal';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Users,
  BedDouble,
  HeartPulse,
  Stethoscope,
  Clock,
  Calculator,
  Info,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  ShieldAlert,
  ClipboardList,
  Building2,
  Edit3,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface DepartmentDetailViewProps {
  selectedDeptId: DepartmentId;
  onSelectDeptId: (id: DepartmentId) => void;
  logs: DepartmentDailyLog[];
  selectedDate: string;
  selectedShift: ShiftType;
  weights: StandardWeights;
  onOpenDataEntry: (deptId: DepartmentId) => void;
  activitiesMap?: DepartmentActivitiesMap;
  onSaveDepartmentActivity?: (activity: ActivityCatalogItem, deptId: DepartmentId) => void;
  onDeleteDepartmentActivity?: (
    activityId: string,
    category: 'indirect_care' | 'unit_related',
    deptId: DepartmentId
  ) => void;
  onResetDepartmentActivities?: (deptId: DepartmentId) => void;
}

export const DepartmentDetailView: React.FC<DepartmentDetailViewProps> = ({
  selectedDeptId,
  onSelectDeptId,
  logs,
  selectedDate,
  selectedShift,
  weights,
  onOpenDataEntry,
  activitiesMap,
  onSaveDepartmentActivity,
  onDeleteDepartmentActivity,
  onResetDepartmentActivities,
}) => {
  const { isHeadNurse, canAddActivity } = useAuth();
  const deptList: DepartmentId[] = ['ER', 'OPD', 'IPD1', 'IPD2', 'LR'];
  const cfg = DEPARTMENT_CONFIG[selectedDeptId];

  // Activity Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorCategory, setEditorCategory] = useState<'indirect_care' | 'unit_related'>('indirect_care');
  const [editingItem, setEditingItem] = useState<ActivityCatalogItem | null>(null);

  const deptActivities =
    activitiesMap?.[selectedDeptId] ||
    DEFAULT_DEPARTMENT_ACTIVITIES[selectedDeptId] || { indirect: [], unit: [] };

  const currentLog = logs.find(
    (l) => l.departmentId === selectedDeptId && l.date === selectedDate && l.shift === selectedShift
  );

  const fallbackLog: DepartmentDailyLog = {
    id: 'placeholder',
    departmentId: selectedDeptId,
    date: selectedDate,
    shift: selectedShift,
    staff: { actualRN: 4, actualPN: 2 },
    recorderName: '-',
    recordedAt: '',
  };

  const activeResult = calculateDepartmentWorkload(currentLog || fallbackLog, weights, activitiesMap);

  const renderRiskBadge = (level: RiskLevel, label: string) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>{label}</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{label}</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span>{label}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {deptList.map((id) => {
          const item = DEPARTMENT_CONFIG[id];
          const isActive = selectedDeptId === id;
          return (
            <button
              key={id}
              onClick={() => onSelectDeptId(id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Department Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {cfg.nameEn}
              </span>
              <span>·</span>
              <span>{SHIFT_NAMES[selectedShift]}</span>
              <span>·</span>
              <span className="font-mono">{selectedDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {cfg.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
              {cfg.shortDesc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenDataEntry(selectedDeptId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{currentLog ? 'แก้ไขข้อมูลเวรนี้' : 'บันทึกข้อมูลเวรนี้'}</span>
            </button>
          </div>
        </div>

        {/* 4 Workload Pillars Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Pillar 1: Direct Care */}
          <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>1. การพยาบาลโดยตรง (Direct)</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {activeResult.directCareHours}
              </span>
              <span className="text-xs text-slate-500">ชม.</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ตาม Triage/RVU/PCS/Labor
            </span>
          </div>

          {/* Pillar 2: Indirect Care */}
          <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>2. การพยาบาลโดยอ้อม (Indirect)</span>
              <ClipboardList className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {activeResult.indirectCareHours}
              </span>
              <span className="text-xs text-slate-500">ชม.</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              เวชระเบียน / ส่งเวร / ยา HAD
            </span>
          </div>

          {/* Pillar 3: Unit-Related */}
          <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>3. บริหารหน่วยงาน (Unit)</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400">
                {activeResult.unitRelatedHours}
              </span>
              <span className="text-xs text-slate-500">ชม.</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              รถกู้ชีพ / ยาเสพติด / IC
            </span>
          </div>

          {/* Pillar 4: Total & Required RN */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 mb-1 font-semibold">
              <span>รวมภาระงานสุทธิ (Total)</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-200">
                {activeResult.totalWorkloadHours}
              </span>
              <span className="text-xs text-emerald-700">ชม.</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              ควรมี <span className="font-mono text-blue-700 dark:text-blue-400">{activeResult.requiredRN}</span> / จริง <span className="font-mono text-emerald-700">{activeResult.actualRN}</span> RN
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: DIRECT CARE BY DEPARTMENT */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                1. รายละเอียดการพยาบาลโดยตรง (Direct Nursing Care)
              </h2>
            </div>

            {selectedDeptId === 'ER' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    สูตรห้องฉุกเฉิน (ER Triage Formula):
                  </span>
                  <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Direct ER Hours = ∑(Triage Level i × น้ำหนักเวลามาตรฐาน) + (Refer × 3.0h) + (CPR × 1.5h)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">ระดับความรุนแรง / กิจกรรม</th>
                        <th className="p-2.5 text-center">จำนวน (ราย)</th>
                        <th className="p-2.5 text-center">เวลามาตรฐาน</th>
                        <th className="p-2.5 text-right">ค่างาน (ชม.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr>
                        <td className="p-2.5 font-medium text-rose-700 dark:text-rose-400">Level 1: Resuscitation (วิกฤติ)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.triage1 || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.triage1} ชม./ราย</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.triage1 || 0) * weights.er.triage1).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-rose-600">Level 2: Emergency (ฉุกเฉินเร่งด่วน)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.triage2 || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.triage2} ชม./ราย</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.triage2 || 0) * weights.er.triage2).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-amber-600">Level 3: Urgency (ฉุกเฉิน)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.triage3 || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.triage3} ชม./ราย</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.triage3 || 0) * weights.er.triage3).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-emerald-600">Level 4: Semi-urgency (กึ่งฉุกเฉิน)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.triage4 || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.triage4} ชม./ราย</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.triage4 || 0) * weights.er.triage4).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-600">Level 5: Non-urgency (ไม่ฉุกเฉิน)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.triage5 || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.triage5} ชม./ราย</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.triage5 || 0) * weights.er.triage5).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-indigo-600">Refer รพ.พหลฯ / EMS</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.referAmbulance || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.referAmbulance} ชม./เคส</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.referAmbulance || 0) * weights.er.referAmbulance).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-purple-600">เคสกู้ชีพ CPR / หัตถการวิกฤติ</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.erData?.cprCases || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.er.cprCases} ชม./เคส</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.erData?.cprCases || 0) * weights.er.cprCases).toFixed(1)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-t border-emerald-200">
                        <td className="p-2.5">รวมการพยาบาลโดยตรง ER</td>
                        <td className="p-2.5 text-center font-mono">{activeResult.totalPatients} ราย</td>
                        <td className="p-2.5 text-center">-</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {activeResult.directCareHours} ชม.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {selectedDeptId === 'OPD' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    สูตรแผนกผู้ป่วยนอก (OPD Complexity & RVU Formula):
                  </span>
                  <p className="font-mono text-[11px] text-emerald-700 mt-0.5">
                    Direct OPD Hours = ∑(จำนวนผู้รับบริการแยกประเภท × เวลาเฉลี่ยต่อราย)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600">
                      <tr>
                        <th className="p-2.5">ประเภทการตรวจ</th>
                        <th className="p-2.5 text-center">จำนวน (ราย)</th>
                        <th className="p-2.5 text-center">เวลามาตรฐาน</th>
                        <th className="p-2.5 text-right">ค่างาน (ชม.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr>
                        <td className="p-2.5 font-medium">ตรวจโรคทั่วไป</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.opdData?.generalVisit || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.opd.generalVisit * 60} นาที</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.opdData?.generalVisit || 0) * weights.opd.generalVisit).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-blue-600">คลินิกโรคเรื้อรัง (NCDs)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.opdData?.chronicVisit || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.opd.chronicVisit * 60} นาที</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.opdData?.chronicVisit || 0) * weights.opd.chronicVisit).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-purple-600">ผ่าตัดเล็ก & หัตถการ</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.opdData?.minorSurgery || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.opd.minorSurgery * 60} นาที</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.opdData?.minorSurgery || 0) * weights.opd.minorSurgery).toFixed(1)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-t border-emerald-200">
                        <td className="p-2.5">รวมการพยาบาลโดยตรง OPD</td>
                        <td className="p-2.5 text-center font-mono">{activeResult.totalPatients} ราย</td>
                        <td className="p-2.5 text-center">-</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700">
                          {activeResult.directCareHours} ชม.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {(selectedDeptId === 'IPD1' || selectedDeptId === 'IPD2') && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">
                      สูตรหอผู้ป่วยใน (IPD 1 และ IPD 2 ใช้เกณฑ์มาตรฐานเดียวกัน):
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 px-2 py-0.5 rounded">
                      มาตรฐานสภาการพยาบาล
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-emerald-800">
                    Daily HPPN = ∑(จำนวนผู้ป่วย Category i × ชั่วโมง HPPN Category i)
                  </p>
                  <p className="font-mono text-[11px] text-blue-700">
                    สัดส่วนเวร: เช้า 45% · บ่าย 35% · ดึก 20%
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600">
                      <tr>
                        <th className="p-2.5">การจำแนกประเภทผู้ป่วย (PCS)</th>
                        <th className="p-2.5 text-center">จำนวนเตียง</th>
                        <th className="p-2.5 text-center">มาตรฐาน HPPN</th>
                        <th className="p-2.5 text-right">ค่างานประจำวัน (ชม.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr>
                        <td className="p-2.5 font-medium text-emerald-700">Category 1: ดูแลตนเองได้</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.ipdData?.cat1SelfCare || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.ipd.cat1} ชม./วัน</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.ipdData?.cat1SelfCare || 0) * weights.ipd.cat1).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-blue-600">Category 2: การพยาบาลปานกลาง</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.ipdData?.cat2Moderate || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.ipd.cat2} ชม./วัน</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.ipdData?.cat2Moderate || 0) * weights.ipd.cat2).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-amber-600">Category 3: การพยาบาลมาก</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.ipdData?.cat3Acute || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.ipd.cat3} ชม./วัน</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.ipdData?.cat3Acute || 0) * weights.ipd.cat3).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-rose-600">Category 4: ใกล้ชิด / กึ่งวิกฤติ</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.ipdData?.cat4Intensive || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.ipd.cat4} ชม./วัน</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.ipdData?.cat4Intensive || 0) * weights.ipd.cat4).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-red-600">Category 5: วิกฤติ / On Ventilator</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.ipdData?.cat5Ventilator || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.ipd.cat5} ชม./วัน</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.ipdData?.cat5Ventilator || 0) * weights.ipd.cat5).toFixed(1)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-t border-emerald-200">
                        <td className="p-2.5">ค่างานเวร {SHIFT_NAMES[selectedShift].split(' ')[0]}</td>
                        <td className="p-2.5 text-center font-mono">{activeResult.totalPatients} เตียง</td>
                        <td className="p-2.5 text-center">BOR: {activeResult.bedOccupancyRate}%</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700">
                          {activeResult.directCareHours} ชม.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {selectedDeptId === 'LR' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    สูตรห้องคลอด (Labor Room Stage & Risk Formula):
                  </span>
                  <p className="font-mono text-[11px] text-emerald-700 mt-0.5">
                    Direct LR Hours = ∑(เคส Stage of Labor i × เวลามาตรฐาน) + เสี่ยงสูง + กู้ชีพทารก
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600">
                      <tr>
                        <th className="p-2.5">ระยะการคลอด / กิจกรรม</th>
                        <th className="p-2.5 text-center">จำนวนเคส</th>
                        <th className="p-2.5 text-center">เวลามาตรฐาน</th>
                        <th className="p-2.5 text-right">ค่างาน (ชม.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr>
                        <td className="p-2.5 font-medium text-purple-700">Stage 1: Latent Phase</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.lrData?.stage1Latent || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.lr.stage1Latent} ชม.</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.lrData?.stage1Latent || 0) * weights.lr.stage1Latent).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-indigo-700">Stage 1: Active Phase</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.lrData?.stage1Active || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.lr.stage1Active} ชม.</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.lrData?.stage1Active || 0) * weights.lr.stage1Active).toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-rose-700">Stage 2: Delivery (ทำคลอด)</td>
                        <td className="p-2.5 text-center font-mono">{currentLog?.lrData?.stage2Delivery || 0}</td>
                        <td className="p-2.5 text-center font-mono">{weights.lr.stage2Delivery} ชม.</td>
                        <td className="p-2.5 text-right font-mono font-semibold">{((currentLog?.lrData?.stage2Delivery || 0) * weights.lr.stage2Delivery).toFixed(1)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-t border-emerald-200">
                        <td className="p-2.5">รวมการพยาบาลโดยตรง LR</td>
                        <td className="p-2.5 text-center font-mono">{activeResult.totalPatients} เคส</td>
                        <td className="p-2.5 text-center">-</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700">
                          {activeResult.directCareHours} ชม.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: INDIRECT CARE ACTIVITIES TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>2. ค่างานเสริม: การพยาบาลโดยอ้อม (Indirect Nursing Care)</span>
                    <span className="text-[11px] font-normal text-slate-400">({deptActivities.indirect.length} รายการ)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กิจกรรมที่พยาบาลปฏิบัติเพื่อผู้ป่วยแต่ไม่ได้สัมผัสตัวโดยตรง (ระบุเวลามาตรฐานและระดับความเสี่ยง)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                  รวม {activeResult.indirectCareHours} ชม.
                </span>
                {onSaveDepartmentActivity && canAddActivity && (
                  <button
                    onClick={() => {
                      setEditorCategory('indirect_care');
                      setEditingItem(null);
                      setIsEditorOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการ</span>
                  </button>
                )}
                {onResetDepartmentActivities && canAddActivity && (
                  <button
                    onClick={() => onResetDepartmentActivities(selectedDeptId)}
                    title="คืนค่ารายการมาตรฐานของแผนกนี้"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600">
                  <tr>
                    <th className="p-2.5">กิจกรรมการพยาบาลโดยอ้อม</th>
                    <th className="p-2.5 text-center">ระดับความเสี่ยง / ความยาก</th>
                    <th className="p-2.5 text-center">เวลามาตรฐาน</th>
                    <th className="p-2.5 text-center">ความถี่ (ครั้ง)</th>
                    <th className="p-2.5 text-right">ค่างาน (ชม.)</th>
                    {(onSaveDepartmentActivity || onDeleteDepartmentActivity) && canAddActivity && (
                      <th className="p-2.5 text-center w-20">จัดการ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {deptActivities.indirect.map((item) => {
                    const count = currentLog?.indirectCareCounts?.[item.id] || 0;
                    const hours = ((count * item.standardTimeMinutes) / 60).toFixed(1);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-2.5 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-slate-100">{item.name}</span>
                            {item.isCustom && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-semibold">
                                ปรับแต่ง
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.description}</div>
                        </td>
                        <td className="p-2.5 text-center space-y-1">
                          <div>{renderRiskBadge(item.riskLevel, item.riskLabel.split(' ')[0])}</div>
                          {item.difficulty && (
                            <span className="inline-block text-[9px] text-slate-500 dark:text-slate-400">
                              {item.difficulty}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{item.standardTimeMinutes} นาที/ครั้ง</span>
                          <span className="block text-[10px] text-slate-400">({(item.standardTimeMinutes / 60).toFixed(2)} ชม.)</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {count}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {hours}
                        </td>
                        {(onSaveDepartmentActivity || onDeleteDepartmentActivity) && canAddActivity && (
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onSaveDepartmentActivity && (
                                <button
                                  onClick={() => {
                                    setEditorCategory('indirect_care');
                                    setEditingItem(item);
                                    setIsEditorOpen(true);
                                  }}
                                  title="แก้ไขรายการ"
                                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteDepartmentActivity && (
                                <button
                                  onClick={() => {
                                    if (confirm(`ต้องการลบรายการ "${item.name}" ออกจากแผนก ${selectedDeptId} หรือไม่?`)) {
                                      onDeleteDepartmentActivity(item.id, 'indirect_care', selectedDeptId);
                                    }
                                  }}
                                  title="ลบรายการ"
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: UNIT-RELATED ACTIVITIES TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>3. กิจกรรมบริหารจัดการหน่วยงาน (Unit-Related Activities)</span>
                    <span className="text-[11px] font-normal text-slate-400">({deptActivities.unit.length} รายการ)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กิจกรรมเพื่อการดำเนินงาน มาตรฐานคุณภาพ และความปลอดภัยของหอผู้ป่วย
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                  รวม {activeResult.unitRelatedHours} ชม.
                </span>
                {onSaveDepartmentActivity && canAddActivity && (
                  <button
                    onClick={() => {
                      setEditorCategory('unit_related');
                      setEditingItem(null);
                      setIsEditorOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการ</span>
                  </button>
                )}
                {onResetDepartmentActivities && canAddActivity && (
                  <button
                    onClick={() => onResetDepartmentActivities(selectedDeptId)}
                    title="คืนค่ารายการมาตรฐานของแผนกนี้"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600">
                  <tr>
                    <th className="p-2.5">กิจกรรมการบริหารหอผู้ป่วย</th>
                    <th className="p-2.5 text-center">ระดับความเสี่ยง / ความยาก</th>
                    <th className="p-2.5 text-center">เวลามาตรฐาน</th>
                    <th className="p-2.5 text-center">ความถี่ (ครั้ง)</th>
                    <th className="p-2.5 text-right">ค่างาน (ชม.)</th>
                    {(onSaveDepartmentActivity || onDeleteDepartmentActivity) && canAddActivity && (
                      <th className="p-2.5 text-center w-20">จัดการ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {deptActivities.unit.map((item) => {
                    const count = currentLog?.unitRelatedCounts?.[item.id] || 0;
                    const hours = ((count * item.standardTimeMinutes) / 60).toFixed(1);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-2.5 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-slate-100">{item.name}</span>
                            {item.isCustom && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-semibold">
                                ปรับแต่ง
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.description}</div>
                        </td>
                        <td className="p-2.5 text-center space-y-1">
                          <div>{renderRiskBadge(item.riskLevel, item.riskLabel.split(' ')[0])}</div>
                          {item.difficulty && (
                            <span className="inline-block text-[9px] text-slate-500 dark:text-slate-400">
                              {item.difficulty}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{item.standardTimeMinutes} นาที/ครั้ง</span>
                          <span className="block text-[10px] text-slate-400">({(item.standardTimeMinutes / 60).toFixed(2)} ชม.)</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {count}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                          {hours}
                        </td>
                        {(onSaveDepartmentActivity || onDeleteDepartmentActivity) && canAddActivity && (
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onSaveDepartmentActivity && (
                                <button
                                  onClick={() => {
                                    setEditorCategory('unit_related');
                                    setEditingItem(item);
                                    setIsEditorOpen(true);
                                  }}
                                  title="แก้ไขรายการ"
                                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteDepartmentActivity && (
                                <button
                                  onClick={() => {
                                    if (confirm(`ต้องการลบรายการ "${item.name}" ออกจากแผนก ${selectedDeptId} หรือไม่?`)) {
                                      onDeleteDepartmentActivity(item.id, 'unit_related', selectedDeptId);
                                    }
                                  }}
                                  title="ลบรายการ"
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quality Standards & Staffing Analysis */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>องค์ประกอบค่างาน 3 มิติ</span>
            </h3>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
              <p>
                <strong>1. Direct Nursing Care:</strong> กิจกรรมการพยาบาลที่กระทำต่อผู้ป่วยโดยตรง (ให้ยา ทำแผล กู้ชีพ ประเมินอาการ)
              </p>
              <p>
                <strong>2. Indirect Nursing Care:</strong> กิจกรรมสนับสนุนการดูแล (บันทึกเวชระเบียน SBAR ส่งเวร Double-check ยา HAD)
              </p>
              <p>
                <strong>3. Unit-Related Activities:</strong> การบริหารหอผู้ป่วย (ตรวจเช็ครถกู้ชีพ ตรวจสต๊อกยาเสพติด ควบคุมการติดเชื้อ IC)
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                สรุปดัชนีภาระงานเวรนี้
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">อัตราส่วน Actual / Required:</span>
                  <span className="font-mono font-semibold">
                    {activeResult.requiredRN > 0
                      ? `${Math.round((activeResult.actualRN / activeResult.requiredRN) * 100)}%`
                      : '100%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ชั่วโมงงานเฉลี่ย/พยาบาล:</span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {activeResult.workloadIndexPerNurse} ชม./คน
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Editor Modal for Add / Edit */}
      {isEditorOpen && onSaveDepartmentActivity && (
        <ActivityEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingItem(null);
          }}
          onSave={(activity, deptId) => {
            onSaveDepartmentActivity(activity, deptId);
            setIsEditorOpen(false);
            setEditingItem(null);
          }}
          deptId={selectedDeptId}
          category={editorCategory}
          editingActivity={editingItem}
        />
      )}
    </div>
  );
};
