import React, { useState, useEffect } from 'react';
import { ActivityCatalogItem, DepartmentId, RiskLevel } from '../types/staffing';
import { DEPARTMENT_CONFIG } from '../data/defaults';
import { X, Save, PlusCircle, Edit3, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ActivityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ActivityCatalogItem, deptId: DepartmentId) => void;
  deptId: DepartmentId;
  category: 'indirect_care' | 'unit_related';
  editingActivity?: ActivityCatalogItem | null;
}

export const ActivityEditorModal: React.FC<ActivityEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  deptId,
  category,
  editingActivity,
}) => {
  const [name, setName] = useState('');
  const [standardTimeMinutes, setStandardTimeMinutes] = useState(20);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [difficulty, setDifficulty] = useState<
    'ง่าย (Low)' | 'ปานกลาง (Medium)' | 'ซับซ้อน (Complex)' | 'ซับซ้อนสูง (High Complexity)'
  >('ปานกลาง (Medium)');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingActivity) {
      setName(editingActivity.name);
      setStandardTimeMinutes(editingActivity.standardTimeMinutes);
      setRiskLevel(editingActivity.riskLevel);
      setDifficulty(editingActivity.difficulty);
      setDescription(editingActivity.description);
    } else {
      setName('');
      setStandardTimeMinutes(category === 'indirect_care' ? 20 : 25);
      setRiskLevel('medium');
      setDifficulty('ปานกลาง (Medium)');
      setDescription('');
    }
  }, [editingActivity, category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const riskLabelMap: Record<RiskLevel, string> = {
      critical: 'วิกฤติ / เสี่ยงสูงมาก (Critical Risk)',
      high: 'ความเสี่ยงสูง (High Risk)',
      medium: 'ความเสี่ยงปานกลาง (Medium Risk)',
      low: 'ความเสี่ยงต่ำ (Low Risk)',
    };

    const newActivity: ActivityCatalogItem = {
      id: editingActivity ? editingActivity.id : `custom_${category}_${deptId}_${Date.now()}`,
      name: name.trim(),
      category,
      departmentId: deptId,
      standardTimeMinutes: Math.max(1, standardTimeMinutes),
      riskLevel,
      riskLabel: riskLabelMap[riskLevel],
      difficulty,
      description: description.trim() || 'กิจกรรมที่กำหนดโดยแผนก ' + deptId,
      isCustom: true,
    };

    onSave(newActivity, deptId);
    onClose();
  };

  const deptName = DEPARTMENT_CONFIG[deptId].name;
  const categoryName =
    category === 'indirect_care'
      ? 'ค่างานเสริม: การพยาบาลโดยอ้อม (Indirect Care)'
      : 'กิจกรรมบริหารจัดการหน่วยงาน (Unit-Related)';

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-2">
            {editingActivity ? <Edit3 className="w-5 h-5 text-emerald-200" /> : <PlusCircle className="w-5 h-5 text-emerald-200" />}
            <div>
              <h3 className="text-base font-bold">
                {editingActivity ? 'แก้ไขรายการกิจกรรม' : 'เพิ่มรายการกิจกรรมใหม่'}
              </h3>
              <p className="text-xs text-emerald-200">
                {deptName} · {categoryName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อกิจกรรม / ภาระงาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ส่งตรวจ CT Scan ฉุกเฉิน, ประสานห้องผ่าตัดด่วน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-medium p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เวลามาตรฐาน (นาที/ครั้ง) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="240"
                required
                value={standardTimeMinutes}
                onChange={(e) => setStandardTimeMinutes(parseInt(e.target.value) || 1)}
                className="w-full font-mono text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                คิดเป็น {(standardTimeMinutes / 60).toFixed(2)} ชม./ครั้ง
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ระดับความเสี่ยงของงาน
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="critical">วิกฤติ / เสี่ยงสูงมาก (Critical Risk)</option>
                <option value="high">ความเสี่ยงสูง (High Risk)</option>
                <option value="medium">ความเสี่ยงปานกลาง (Medium Risk)</option>
                <option value="low">ความเสี่ยงต่ำ (Low Risk)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ระดับความยากง่าย / ความซับซ้อน
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ง่าย (Low)">ง่าย (Low Complexity)</option>
              <option value="ปานกลาง (Medium)">ปานกลาง (Medium Complexity)</option>
              <option value="ซับซ้อน (Complex)">ซับซ้อน (Complex)</option>
              <option value="ซับซ้อนสูง (High Complexity)">ซับซ้อนสูง (High Complexity)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              คำอธิบายรายละเอียดกิจกรรม
            </label>
            <textarea
              rows={2}
              placeholder="ระบุวัตถุประสงค์ ขั้นตอนการทำงาน หรือแนวทางปฏิบัติมาตรฐาน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingActivity ? 'บันทึกการแก้ไข' : 'เพิ่มกิจกรรมในแผนกนี้'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
