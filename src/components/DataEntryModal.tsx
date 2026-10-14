import React, { useState, useEffect } from 'react';
import {
  DepartmentDailyLog,
  DepartmentId,
  ShiftType,
  StandardWeights,
  ERWorkloadData,
  OPDWorkloadData,
  IPDWorkloadData,
  LRWorkloadData,
  RiskLevel,
  ActivityCatalogItem,
  DepartmentActivitiesMap,
} from '../types/staffing';
import {
  DEPARTMENT_CONFIG,
  SHIFT_NAMES,
} from '../data/defaults';
import { calculateDepartmentWorkload } from '../utils/calculator';
import { ActivityEditorModal } from './ActivityEditorModal';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Save,
  Clock,
  Users,
  Activity,
  BedDouble,
  HeartPulse,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  ClipboardList,
  Building2,
  Plus,
  Minus,
  PlusCircle,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: DepartmentDailyLog) => void;
  initialDeptId?: DepartmentId;
  selectedDate: string;
  selectedShift: ShiftType;
  weights: StandardWeights;
  existingLogs: DepartmentDailyLog[];
  activitiesMap: DepartmentActivitiesMap;
  onSaveDepartmentActivity: (activity: ActivityCatalogItem, deptId: DepartmentId) => void;
  onDeleteDepartmentActivity: (
    activityId: string,
    category: 'indirect_care' | 'unit_related',
    deptId: DepartmentId
  ) => void;
  onResetDepartmentActivities: (deptId: DepartmentId) => void;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  initialDeptId = 'ER',
  selectedDate,
  selectedShift,
  weights,
  existingLogs,
  activitiesMap,
  onSaveDepartmentActivity,
  onDeleteDepartmentActivity,
  onResetDepartmentActivities,
}) => {
  const { isHeadNurse, canAddActivity, userProfile } = useAuth();
  const [deptId, setDeptId] = useState<DepartmentId>(initialDeptId);
  const [date, setDate] = useState<string>(selectedDate);
  const [shift, setShift] = useState<ShiftType>(selectedShift);
  const [activeTab, setActiveTab] = useState<'direct' | 'indirect' | 'unit'>('direct');
  const [recorderName, setRecorderName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Staff on duty
  const [actualRN, setActualRN] = useState<number>(4);
  const [actualPN, setActualPN] = useState<number>(2);

  // ER form
  const [erData, setErData] = useState<ERWorkloadData>({
    triage1: 1,
    triage2: 4,
    triage3: 12,
    triage4: 18,
    triage5: 8,
    referAmbulance: 1,
    cprCases: 0,
  });

  // OPD form
  const [opdData, setOpdData] = useState<OPDWorkloadData>({
    generalVisit: 120,
    chronicVisit: 60,
    minorSurgery: 4,
    specialtyClinic: 12,
    injectionsDressing: 18,
  });

  // IPD form
  const [ipdData, setIpdData] = useState<IPDWorkloadData>({
    bedCapacity: 30,
    occupiedBeds: 24,
    admissions: 3,
    discharges: 2,
    cat1SelfCare: 4,
    cat2Moderate: 11,
    cat3Acute: 7,
    cat4Intensive: 2,
    cat5Ventilator: 0,
  });

  // LR form
  const [lrData, setLrData] = useState<LRWorkloadData>({
    stage1Latent: 2,
    stage1Active: 2,
    stage2Delivery: 1,
    stage3and4Recovery: 1,
    highRiskCases: 1,
    nbResuscitation: 1,
  });

  // Extra Workload: Indirect Care & Unit-Related Activities
  const [indirectCareCounts, setIndirectCareCounts] = useState<Record<string, number>>({});
  const [unitRelatedCounts, setUnitRelatedCounts] = useState<Record<string, number>>({});

  // Activity Editor Modal State
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<'indirect_care' | 'unit_related'>('indirect_care');
  const [editingItem, setEditingItem] = useState<ActivityCatalogItem | null>(null);

  // Load existing log if one exists for dept + date + shift
  useEffect(() => {
    if (initialDeptId) setDeptId(initialDeptId);
    setDate(selectedDate);
    setShift(selectedShift);
  }, [initialDeptId, selectedDate, selectedShift]);

  useEffect(() => {
    const found = existingLogs.find(
      (l) => l.departmentId === deptId && l.date === date && l.shift === shift
    );
    if (found) {
      setActualRN(found.staff.actualRN);
      setActualPN(found.staff.actualPN);
      if (found.recorderName) setRecorderName(found.recorderName);
      if (found.notes) setNotes(found.notes);
      if (found.erData) setErData(found.erData);
      if (found.opdData) setOpdData(found.opdData);
      if (found.ipdData) setIpdData(found.ipdData);
      if (found.lrData) setLrData(found.lrData);
      if (found.indirectCareCounts) setIndirectCareCounts(found.indirectCareCounts);
      if (found.unitRelatedCounts) setUnitRelatedCounts(found.unitRelatedCounts);
    } else {
      // Set reasonable defaults based on department
      if (deptId === 'ER') {
        setActualRN(4);
        setActualPN(2);
      } else if (deptId === 'OPD') {
        setActualRN(7);
        setActualPN(4);
      } else if (deptId === 'IPD1') {
        setActualRN(5);
        setActualPN(3);
        setIpdData((prev) => ({ ...prev, bedCapacity: 30 }));
      } else if (deptId === 'IPD2') {
        setActualRN(4);
        setActualPN(2);
        setIpdData((prev) => ({ ...prev, bedCapacity: 20 }));
      } else if (deptId === 'LR') {
        setActualRN(3);
        setActualPN(1);
      }
    }
  }, [deptId, date, shift, existingLogs]);

  if (!isOpen) return null;

  // Department's current activities
  const currentDeptActivities = activitiesMap[deptId] || { indirect: [], unit: [] };

  // Build provisional log for real-time preview
  const provisionalLog: DepartmentDailyLog = {
    id: `temp-${Date.now()}`,
    departmentId: deptId,
    date,
    shift,
    staff: { actualRN, actualPN },
    erData: deptId === 'ER' ? erData : undefined,
    opdData: deptId === 'OPD' ? opdData : undefined,
    ipdData: deptId === 'IPD1' || deptId === 'IPD2' ? ipdData : undefined,
    lrData: deptId === 'LR' ? lrData : undefined,
    indirectCareCounts,
    unitRelatedCounts,
    notes,
    recorderName: recorderName || 'พยาบาลเวร',
    recordedAt: new Date().toISOString(),
  };

  const previewResult = calculateDepartmentWorkload(provisionalLog, weights, activitiesMap);

  const handleIndirectChange = (id: string, delta: number) => {
    setIndirectCareCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleIndirectDirectInput = (id: string, value: number) => {
    setIndirectCareCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const handleUnitChange = (id: string, delta: number) => {
    setUnitRelatedCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleUnitDirectInput = (id: string, value: number) => {
    setUnitRelatedCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const openAddActivity = (cat: 'indirect_care' | 'unit_related') => {
    setEditingCategory(cat);
    setEditingItem(null);
    setIsActivityEditorOpen(true);
  };

  const openEditActivity = (cat: 'indirect_care' | 'unit_related', item: ActivityCatalogItem) => {
    setEditingCategory(cat);
    setEditingItem(item);
    setIsActivityEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isHeadNurse) {
      alert('บัญชีของคุณคือ "หัวหน้าพยาบาล" (สิทธิการเข้าถึงการดูได้อย่างเดียว ไม่สามารถ บันทึก แก้ไข หรือเปลี่ยนแปลงข้อมูลได้)');
      return;
    }
    const finalLog: DepartmentDailyLog = {
      id: `log-${deptId}-${date}-${shift}`,
      departmentId: deptId,
      date,
      shift,
      staff: { actualRN, actualPN },
      erData: deptId === 'ER' ? erData : undefined,
      opdData: deptId === 'OPD' ? opdData : undefined,
      ipdData: deptId === 'IPD1' || deptId === 'IPD2' ? ipdData : undefined,
      lrData: deptId === 'LR' ? lrData : undefined,
      indirectCareCounts,
      unitRelatedCounts,
      notes,
      recorderName: recorderName.trim() || 'พยาบาลหัวหน้าเวร รพ.สังขละบุรี',
      recordedAt: new Date().toISOString(),
    };
    onSaveLog(finalLog);
    onClose();
  };

  // Helper for risk badge styling
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-800 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                ระบบบันทึกค่างานทางการพยาบาล
              </span>
              <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full font-mono">
                กำหนดรายการเฉพาะแผนกได้
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 mt-0.5">
              <span>{DEPARTMENT_CONFIG[deptId].name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-slate-800 dark:text-slate-100">
          {/* Head Nurse View-Only Alert Banner */}
          {isHeadNurse && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">โหมดดูข้อมูลอย่างเดียว (View-Only Mode):</span>{' '}
                บัญชีของคุณมีสิทธิเป็น <strong>หัวหน้าพยาบาล</strong> (สิทธิการเข้าถึงการดูได้อย่างเดียว ไม่สามารถ บันทึก แก้ไข หรือเปลี่ยนแปลงข้อมูลได้)
              </div>
            </div>
          )}

          {/* Top Config Bar: Department, Date, Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                แผนกที่บันทึก
              </label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value as DepartmentId)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ER">ห้องฉุกเฉิน (ER)</option>
                <option value="OPD">แผนกผู้ป่วยนอก (OPD)</option>
                <option value="IPD1">หอผู้ป่วยใน 1 (IPD 1 - สามัญ)</option>
                <option value="IPD2">หอผู้ป่วยใน 2 (IPD 2 - กุมาร/พิเศษ)</option>
                <option value="LR">ห้องคลอด (LR)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                วันที่บันทึก
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                เวรปฏิบัติงาน
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="morning">เวรเช้า (08:00 - 16:00 น.)</option>
                <option value="afternoon">เวรบ่าย (16:00 - 24:00 น.)</option>
                <option value="night">เวรดึก (24:00 - 08:00 น.)</option>
                <option value="daily_total">สรุปประจำวัน (24 ชม.)</option>
              </select>
            </div>
          </div>

          {/* Actual Staff on Duty */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>อัตรากำลังพยาบาลปฏิบัติงานจริงในเวรนี้ (Actual Staff on Duty)</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                รวม {actualRN + actualPN} คน
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  พยาบาลวิชาชีพปฏิบัติงานจริง (RN - คน)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={actualRN}
                  onChange={(e) => setActualRN(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full font-mono text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ผู้ช่วยพยาบาล / NA ปฏิบัติงานจริง (PN/NA - คน)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={actualPN}
                  onChange={(e) => setActualPN(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full font-mono text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3 WORKLOAD CATEGORIES TABS */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'direct'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>1. ค่างานโดยตรง (Direct Care)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
                {previewResult.directCareHours} ชม.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('indirect')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'indirect'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>2. ค่างานเสริม (Indirect Care)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
                {previewResult.indirectCareHours} ชม.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'unit'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. บริหารหน่วยงาน (Unit-Related)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
                {previewResult.unitRelatedHours} ชม.
              </span>
            </button>
          </div>

          {/* TAB 1: DIRECT CARE BY DEPARTMENT */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              {deptId === 'ER' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      สถิติผู้ป่วยฉุกเฉินแยกตามระดับ Triage Level 1-5 (คน)
                    </h3>
                    <span className="text-[11px] text-slate-500">น้ำหนักเวลามาตรฐานสภาการพยาบาล</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                        <span>Level 1: Resuscitation</span>
                        <span className="font-mono">{weights.er.triage1} ชม./ราย</span>
                      </div>
                      <p className="text-[10px] text-red-600 dark:text-red-400 mb-1.5">
                        วิกฤติ กู้ชีพทันที
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.triage1}
                        onChange={(e) =>
                          setErData({ ...erData, triage1: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-red-300 dark:border-red-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
                        <span>Level 2: Emergency</span>
                        <span className="font-mono">{weights.er.triage2} ชม./ราย</span>
                      </div>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mb-1.5">
                        ฉุกเฉินเร่งด่วน ภาวะคุกคาม
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.triage2}
                        onChange={(e) =>
                          setErData({ ...erData, triage2: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        <span>Level 3: Urgency</span>
                        <span className="font-mono">{weights.er.triage3} ชม./ราย</span>
                      </div>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-1.5">
                        ฉุกเฉิน ต้องตรวจรักษาเร็ว
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.triage3}
                        onChange={(e) =>
                          setErData({ ...erData, triage3: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                        <span>Level 4: Semi-urgency</span>
                        <span className="font-mono">{weights.er.triage4} ชม./ราย</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1.5">
                        กึ่งฉุกเฉิน อาการคงที่
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.triage4}
                        onChange={(e) =>
                          setErData({ ...erData, triage4: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        <span>Level 5: Non-urgency</span>
                        <span className="font-mono">{weights.er.triage5} ชม./ราย</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-1.5">
                        ไม่ฉุกเฉิน อาการทั่วไป
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.triage5}
                        onChange={(e) =>
                          setErData({ ...erData, triage5: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                        <span>เคส Refer ส่งต่อ / EMS</span>
                        <span className="font-mono">{weights.er.referAmbulance} ชม./เคส</span>
                      </div>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mb-1.5">
                        ส่งต่อ รพ.พหลพลพยุหเสนา
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={erData.referAmbulance}
                        onChange={(e) =>
                          setErData({ ...erData, referAmbulance: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-800 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {deptId === 'OPD' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>ตรวจโรคทั่วไป</span>
                        <span className="font-mono">{weights.opd.generalVisit * 60} นาที</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={opdData.generalVisit}
                        onChange={(e) =>
                          setOpdData({ ...opdData, generalVisit: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        <span>คลินิกโรคเรื้อรัง (NCDs)</span>
                        <span className="font-mono">{weights.opd.chronicVisit * 60} นาที</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={opdData.chronicVisit}
                        onChange={(e) =>
                          setOpdData({ ...opdData, chronicVisit: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
                        <span>ผ่าตัดเล็ก & หัตถการ</span>
                        <span className="font-mono">{weights.opd.minorSurgery * 60} นาที</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={opdData.minorSurgery}
                        onChange={(e) =>
                          setOpdData({ ...opdData, minorSurgery: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-purple-300 dark:border-purple-800 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(deptId === 'IPD1' || deptId === 'IPD2') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">เตียงที่เปิดบริการ</label>
                      <input
                        type="number"
                        min="1"
                        value={ipdData.bedCapacity}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, bedCapacity: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-full font-mono text-xs p-1.5 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">เตียงครอง (Census)</label>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.occupiedBeds}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, occupiedBeds: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-xs p-1.5 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">รับใหม่ (Admit)</label>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.admissions}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, admissions: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-xs p-1.5 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">จำหน่าย (Discharge)</label>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.discharges}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, discharges: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-xs p-1.5 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>จำแนกประเภทผู้ป่วย Patient Classification System (PCS 5 ระดับ)</span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        สูตรมาตรฐานเดียวกันสำหรับ IPD 1 & 2
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                        <span>Category 1: ดูแลตนเองได้</span>
                        <span className="font-mono">{weights.ipd.cat1} ชม./วัน</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.cat1SelfCare}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, cat1SelfCare: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        <span>Category 2: ปานกลาง</span>
                        <span className="font-mono">{weights.ipd.cat2} ชม./วัน</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.cat2Moderate}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, cat2Moderate: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        <span>Category 3: มาก/เฉียบพลัน</span>
                        <span className="font-mono">{weights.ipd.cat3} ชม./วัน</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.cat3Acute}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, cat3Acute: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
                        <span>Category 4: ใกล้ชิด / กึ่งวิกฤติ</span>
                        <span className="font-mono">{weights.ipd.cat4} ชม./วัน</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.cat4Intensive}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, cat4Intensive: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                        <span>Category 5: วิกฤติ / On Ventilator</span>
                        <span className="font-mono">{weights.ipd.cat5} ชม./วัน</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={ipdData.cat5Ventilator}
                        onChange={(e) =>
                          setIpdData({ ...ipdData, cat5Ventilator: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-red-300 dark:border-red-800 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {deptId === 'LR' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
                        <span>Stage 1: Latent Phase</span>
                        <span className="font-mono">{weights.lr.stage1Latent} ชม.</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={lrData.stage1Latent}
                        onChange={(e) =>
                          setLrData({ ...lrData, stage1Latent: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-purple-300 dark:border-purple-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                        <span>Stage 1: Active Phase</span>
                        <span className="font-mono">{weights.lr.stage1Active} ชม.</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={lrData.stage1Active}
                        onChange={(e) =>
                          setLrData({ ...lrData, stage1Active: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-800 rounded p-1.5"
                      />
                    </div>

                    <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
                        <span>Stage 2: Delivery (ทำคลอด)</span>
                        <span className="font-mono">{weights.lr.stage2Delivery} ชม.</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={lrData.stage2Delivery}
                        onChange={(e) =>
                          setLrData({ ...lrData, stage2Delivery: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full font-mono text-sm bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-800 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INDIRECT CARE ACTIVITIES WITH ADD/EDIT/DELETE */}
          {activeTab === 'indirect' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>ค่างานเสริม: การพยาบาลโดยอ้อม ({DEPARTMENT_CONFIG[deptId].name.split(' ')[0]})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    สามารถ เพิ่ม ลบ หรือแก้ไขรายการและเวลามาตรฐานเฉพาะแผนกนี้ได้
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResetDepartmentActivities(deptId)}
                    title="คืนค่ากิจกรรมมาตรฐานของแผนกนี้"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAddActivity('indirect_care')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ เพิ่มกิจกรรมใหม่</span>
                  </button>
                </div>
              </div>

              {currentDeptActivities.indirect.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs">ยังไม่มีรายการค่างานเสริมในแผนกนี้</p>
                  <button
                    type="button"
                    onClick={() => openAddActivity('indirect_care')}
                    className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
                  >
                    + คลิกเพื่อเพิ่มรายการแรก
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDeptActivities.indirect.map((item) => {
                    const count = indirectCareCounts[item.id] || 0;
                    const totalMinutes = count * item.standardTimeMinutes;
                    const hours = (totalMinutes / 60).toFixed(1);

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {renderRiskBadge(item.riskLevel, item.riskLabel)}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditActivity('indirect_care', item)}
                              title="แก้ไขรายการนี้"
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteDepartmentActivity(item.id, 'indirect_care', deptId)
                              }
                              title="ลบรายการนี้ออกจากแผนก"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">เวลามาตรฐาน:</span>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {item.standardTimeMinutes} นาที/ครั้ง
                            </span>
                          </div>

                          {/* Counter */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleIndirectChange(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) =>
                                handleIndirectDirectInput(item.id, parseInt(e.target.value) || 0)
                              }
                              className="w-14 text-center font-mono text-xs font-bold p-1 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleIndirectChange(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {count > 0 && (
                          <div className="text-[10px] text-slate-500 flex justify-between font-mono bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded">
                            <span>ค่างานสะสม: {totalMinutes} นาที</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              = {hours} ชม.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UNIT-RELATED ACTIVITIES WITH ADD/EDIT/DELETE */}
          {activeTab === 'unit' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>กิจกรรมบริหารจัดการหน่วยงาน ({DEPARTMENT_CONFIG[deptId].name.split(' ')[0]})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    สามารถ เพิ่ม ลบ หรือแก้ไขรายการและเวลามาตรฐานเฉพาะแผนกนี้ได้
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResetDepartmentActivities(deptId)}
                    title="คืนค่ากิจกรรมมาตรฐานของแผนกนี้"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAddActivity('unit_related')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-2xs transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ เพิ่มกิจกรรมใหม่</span>
                  </button>
                </div>
              </div>

              {currentDeptActivities.unit.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs">ยังไม่มีรายการกิจกรรมบริหารในแผนกนี้</p>
                  <button
                    type="button"
                    onClick={() => openAddActivity('unit_related')}
                    className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                  >
                    + คลิกเพื่อเพิ่มรายการแรก
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDeptActivities.unit.map((item) => {
                    const count = unitRelatedCounts[item.id] || 0;
                    const totalMinutes = count * item.standardTimeMinutes;
                    const hours = (totalMinutes / 60).toFixed(1);

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xs space-y-2 hover:border-blue-300 transition-colors relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {renderRiskBadge(item.riskLevel, item.riskLabel)}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditActivity('unit_related', item)}
                              title="แก้ไขรายการนี้"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteDepartmentActivity(item.id, 'unit_related', deptId)
                              }
                              title="ลบรายการนี้ออกจากแผนก"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">เวลามาตรฐาน:</span>
                            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                              {item.standardTimeMinutes} นาที/ครั้ง
                            </span>
                          </div>

                          {/* Counter */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUnitChange(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) =>
                                handleUnitDirectInput(item.id, parseInt(e.target.value) || 0)
                              }
                              className="w-14 text-center font-mono text-xs font-bold p-1 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleUnitChange(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {count > 0 && (
                          <div className="text-[10px] text-slate-500 flex justify-between font-mono bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded">
                            <span>ค่างานสะสม: {totalMinutes} นาที</span>
                            <span className="font-bold text-blue-700 dark:text-blue-400">
                              = {hours} ชม.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recorder Name & Shift Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                ชื่อผู้บันทึกข้อมูล / พยาบาลหัวหน้าเวร
              </label>
              <input
                type="text"
                placeholder="เช่น พว.สุดารัตน์ ใจดี (พยาบาลชำนาญการ)"
                value={recorderName}
                onChange={(e) => setRecorderName(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                บันทึกหมายเหตุอาการ / ปัญหาอุปสรรคทางการพยาบาล
              </label>
              <input
                type="text"
                placeholder="เช่น มีเคสฉุกเฉินส่งต่อ 1 ราย / ภาระงานหนาแน่นช่วงต้นเวร"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Real-Time Live Calculation Preview Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                สรุปผลการคำนวณอัตโนมัติ (Live Comprehensive Calculation)
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
                <span>
                  โดยตรง: <strong className="font-mono text-slate-800 dark:text-slate-200">{previewResult.directCareHours}</strong> ชม.
                </span>
                <span>+</span>
                <span>
                  โดยอ้อม (Indirect): <strong className="font-mono text-emerald-600">{previewResult.indirectCareHours}</strong> ชม.
                </span>
                <span>+</span>
                <span>
                  บริหาร (Unit): <strong className="font-mono text-blue-600 dark:text-blue-400">{previewResult.unitRelatedHours}</strong> ชม.
                </span>
                <span>=</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  รวมภาระงาน: <span className="font-mono text-sm text-emerald-700 dark:text-emerald-400">{previewResult.totalWorkloadHours}</span> ชม.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">พยาบาลควรมี / จริง:</span>
                <span className="font-mono font-bold">
                  ควรมี <span className="text-blue-600">{previewResult.requiredRN}</span> / จริง <span className="text-emerald-600">{previewResult.actualRN}</span> RN
                </span>
              </div>

              <span
                className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md ${
                  previewResult.balanceStatus === 'deficit'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                    : previewResult.balanceStatus === 'surplus'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                }`}
              >
                {previewResult.balanceRN > 0 ? `+${previewResult.balanceRN}` : previewResult.balanceRN} RN (
                {previewResult.balanceStatus === 'deficit' ? 'ขาด' : previewResult.balanceStatus === 'surplus' ? 'เกิน' : 'พอดี'})
              </span>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            {isHeadNurse ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                title="หัวหน้าพยาบาลมีสิทธิการเข้าดูได้อย่างเดียว"
              >
                <span>ปิดหน้าต่าง (โหมดดูอย่างเดียว)</span>
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลค่างานเวรนี้</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Activity Add/Edit Modal */}
      <ActivityEditorModal
        isOpen={isActivityEditorOpen}
        onClose={() => setIsActivityEditorOpen(false)}
        onSave={(activity, targetDeptId) => {
          onSaveDepartmentActivity(activity, targetDeptId);
          setIsActivityEditorOpen(false);
        }}
        deptId={deptId}
        category={editingCategory}
        editingActivity={editingItem}
      />
    </div>
  );
};
