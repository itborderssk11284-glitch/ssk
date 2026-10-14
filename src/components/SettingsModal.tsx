import React, { useState } from 'react';
import { StandardWeights } from '../types/staffing';
import { DEFAULT_STANDARD_WEIGHTS } from '../data/defaults';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Save,
  RotateCcw,
  Sliders,
  Activity,
  Users,
  BedDouble,
  HeartPulse,
  Clock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: StandardWeights;
  onSaveWeights: (newWeights: StandardWeights) => void;
  onNotifySuccess: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
  onNotifySuccess,
}) => {
  const { isAdmin, userProfile } = useAuth();
  const [formData, setFormData] = useState<StandardWeights>(weights);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    if (!isAdmin) {
      alert('การแก้ไขและรีเซ็ตค่ามาตรฐานสงวนไว้สำหรับสิทธิ Admin เท่านั้น');
      return;
    }
    setFormData(DEFAULT_STANDARD_WEIGHTS);
    onNotifySuccess('รีเซ็ตเป็นเกณฑ์มาตรฐานกระทรวงสาธารณสุขและสภาการพยาบาลเรียบร้อย');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('การแก้ไขเกณฑ์ชั่วโมงการพยาบาลมาตรฐานสงวนไว้สำหรับสิทธิ Admin เท่านั้น');
      return;
    }
    onSaveWeights(formData);
    onNotifySuccess('บันทึกการปรับแต่งเกณฑ์ชั่วโมงการพยาบาลมาตรฐาน 4 แผนกเรียบร้อย');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                ตั้งค่าน้ำหนักเวลามาตรฐานและสูตรคำนวณ (Staffing Parameters)
              </h2>
              <p className="text-xs text-emerald-200">
                ปรับแต่งเกณฑ์ชั่วโมงการพยาบาลมาตรฐาน ER · OPD · IPD 1/2 · LR ให้สอดคล้องกับบริบท รพ.สังขละบุรี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800 dark:text-slate-100 text-xs">
          {!isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">โหมดเปิดดูค่ามาตรฐาน (Read-Only):</span>{' '}
                บัญชีของคุณ (<strong>{userProfile?.displayName}</strong>) มีระดับสิทธิเป็น{' '}
                {userProfile?.role === 'head_nurse'
                  ? 'หัวหน้าพยาบาล (ดูได้อย่างเดียว)'
                  : 'หัวหน้าฝ่าย'}{' '}
                — การแก้ไขเกณฑ์มาตรฐานชั่วโมงการพยาบาลและสูตรคำนวณสงวนสิทธิไว้สำหรับ <strong>Admin</strong> เท่านั้น
              </div>
            </div>
          )}

          {/* Section 1: General Parameters */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. ค่ามาตรฐานทั่วไป (General Parameters)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  เวลาทำงานที่ให้ผลผลิตต่อเวร (Effective Hours - ชม.)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="12"
                  value={formData.effectiveShiftHours}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveShiftHours: parseFloat(e.target.value) || 7 })
                  }
                  className="w-full font-mono text-xs font-bold p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  เกณฑ์มาตรฐาน 7.0 ชม. (เวร 8 ชม. หักพัก/ส่งมอบเวร 1 ชม.)
                </span>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  ตัวเผื่อวันลาและวันหยุด (DFTE Relief Factor)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="1.5"
                  value={formData.dfteReliefFactor}
                  onChange={(e) =>
                    setFormData({ ...formData, dfteReliefFactor: parseFloat(e.target.value) || 1.2 })
                  }
                  className="w-full font-mono text-xs font-bold p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  เกณฑ์มาตรฐาน 1.20 (เผื่อวันหยุดราชการ วันลาพักผ่อน 20%)
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: ER Triage Weights */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. ห้องอุบัติเหตุและฉุกเฉิน (ER): ชั่วโมงพยาบาลมาตรฐานต่อราย
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Triage 1 (วิกฤติ Resuscitation)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.er.triage1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, triage1: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Triage 2 (ฉุกเฉิน Emergency)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.er.triage2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, triage2: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Triage 3 (เร่งด่วน Urgency)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.er.triage3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, triage3: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Triage 4 (กึ่งเร่งด่วน Semi-urgency)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.er.triage4}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, triage4: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Triage 5 (ไม่เร่งด่วน Non-urgency)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.er.triage5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, triage5: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Refer ส่งต่อ รพ.พหลฯ (EMS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.er.referAmbulance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, referAmbulance: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  CPR / หัตถการกู้ชีพวิกฤติ
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.er.cprCases}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        er: { ...formData.er, cprCases: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: OPD Weights (NEWLY ADDED) */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-blue-50/20 dark:bg-blue-950/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>3. แผนกผู้ป่วยนอก (OPD): เวลามาตรฐานต่อรายบริการ (RVU & Standard Time)</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">
                  กำหนดต่อผู้ป่วย
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  ตรวจโรคทั่วไป (General Visit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.opd.generalVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opd: { ...formData.opd, generalVisit: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  = {Math.round(formData.opd.generalVisit * 60)} นาที/ราย
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  โรคเรื้อรัง NCDs (Chronic Visit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.opd.chronicVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opd: { ...formData.opd, chronicVisit: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  = {Math.round(formData.opd.chronicVisit * 60)} นาที/ราย
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  ผ่าตัดเล็ก & หัตถการ (Minor Surgery)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.opd.minorSurgery}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opd: { ...formData.opd, minorSurgery: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  = {Math.round(formData.opd.minorSurgery * 60)} นาที/ราย
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  คลินิกเฉพาะทาง / คัดกรอง
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.opd.specialtyClinic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opd: { ...formData.opd, specialtyClinic: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  = {Math.round(formData.opd.specialtyClinic * 60)} นาที/ราย
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  ฉีดยา / ทำแผล (Injection/Dressing)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.opd.injectionsDressing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opd: { ...formData.opd, injectionsDressing: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  = {Math.round(formData.opd.injectionsDressing * 60)} นาที/ราย
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: IPD PCS Weights */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>4. หอผู้ป่วยใน (IPD 1 & IPD 2): ชั่วโมงพยาบาลต่อคนต่อวัน (HPPN)</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded">
                  สูตรเดียวกันทั้ง 2 หอ
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Category 1 (ดูแลตนเองได้)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.ipd.cat1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ipd: { ...formData.ipd, cat1: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Category 2 (ปานกลาง)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.ipd.cat2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ipd: { ...formData.ipd, cat2: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Category 3 (เฉียบพลัน/ใกล้ชิด)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.ipd.cat3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ipd: { ...formData.ipd, cat3: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Category 4 (วิกฤติ/กึ่ง ICU)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.ipd.cat4}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ipd: { ...formData.ipd, cat4: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Category 5 (Ventilator/ใส่ท่อ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.ipd.cat5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ipd: { ...formData.ipd, cat5: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: LR Weights (NEWLY ADDED) */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-purple-50/20 dark:bg-purple-950/10">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>5. ห้องคลอด (LR - Labor Room): ชั่วโมงการพยาบาลมาตรฐานต่อเคส</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded">
                  ตามระยะการคลอด & ภาวะเสี่ยง
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Stage 1 Latent (ระยะแฝง)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.stage1Latent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, stage1Latent: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Stage 1 Active (ระยะเร่ง)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.stage1Active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, stage1Active: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Stage 2 (ระยะเบ่ง/ทำคลอด)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.stage2Delivery}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, stage2Delivery: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Stage 3-4 (ระยะรก & สังเกต)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.stage3and4Recovery}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, stage3and4Recovery: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  เคสเสี่ยงสูง (PPH / PIH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.highRiskCases}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, highRiskCases: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                  กู้ชีพ/ดูแลทารกแรกเกิด
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.lr.nbResuscitation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lr: { ...formData.lr, nbResuscitation: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full font-mono text-xs font-semibold p-1.5 pr-8 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">ชม.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้น สธ./สภาการพยาบาล</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                🔒 สิทธิแก้ไขสงวนไว้สำหรับ Admin
              </span>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isAdmin ? 'ยกเลิก' : 'ปิดหน้าต่าง'}
              </button>
              {isAdmin && (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการตั้งค่าทั้ง 4 แผนก</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
