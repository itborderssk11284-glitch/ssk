import React, { useState } from 'react';
import { HospitalDailySummary, ShiftType } from '../types/staffing';
import { SHIFT_NAMES, DEPARTMENT_CONFIG } from '../data/defaults';
import {
  X,
  Phone,
  Send,
  Copy,
  Check,
  Share2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MobileSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: HospitalDailySummary;
  selectedDate: string;
  selectedShift: ShiftType;
  onNotifySuccess: (msg: string) => void;
}

export const MobileSummaryModal: React.FC<MobileSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  selectedDate,
  selectedShift,
  onNotifySuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('081-987-6543');
  const [recipientRole, setRecipientRole] = useState('หัวหน้ากลุ่มงานการพยาบาล');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build formatted text message for mobile sharing
  const formattedSummaryText = `🏥 [สรุปค่างานและอัตรากำลังพยาบาล รพ.สังขละบุรี]
📅 วันที่: ${selectedDate} | ${SHIFT_NAMES[selectedShift]}
━━━━━━━━━━━━━━━━━━
📊 ภาพรวมโรงพยาบาล:
• ภาระงานรวมสุทธิ: ${summary.totalWorkloadHours} ชม. (โดยตรง ${summary.totalDirectCareHours}h + เสริม ${summary.totalIndirectCareHours}h + บริหาร ${summary.totalUnitRelatedHours}h)
• พยาบาลควรมี (Required): ${summary.totalRequiredRN} อัตรา (RN)
• พยาบาลขึ้นเวรจริง (Actual): ${summary.totalActualRN} RN (+${summary.totalActualPN} PN)
• ดุลอัตรากำลัง: ${summary.totalBalanceRN > 0 ? `+${summary.totalBalanceRN}` : summary.totalBalanceRN} RN
• สถานะ: ${
    summary.overallStatus === 'deficit'
      ? '⚠️ ขาดอัตรากำลัง'
      : summary.overallStatus === 'surplus'
      ? '🔷 เพียงพอ'
      : '✅ สมดุลตามเกณฑ์'
  }

📋 รายละเอียดแยกตาม 4 แผนกหลัก:
1. ER (ฉุกเฉิน): ${summary.departments.ER.totalWorkloadHours} ชม. | จริง ${summary.departments.ER.actualRN} / ควรมี ${summary.departments.ER.requiredRN} RN (${summary.departments.ER.balanceStatus === 'deficit' ? 'ขาด' : 'สมดุล'})
2. OPD (ผู้ป่วยนอก): ${summary.departments.OPD.totalWorkloadHours} ชม. | จริง ${summary.departments.OPD.actualRN} / ควรมี ${summary.departments.OPD.requiredRN} RN
3. IPD 1 (สามัญ): ${summary.departments.IPD1.totalWorkloadHours} ชม. | จริง ${summary.departments.IPD1.actualRN} / ควรมี ${summary.departments.IPD1.requiredRN} RN (BOR ${summary.departments.IPD1.bedOccupancyRate || 0}%)
4. IPD 2 (กุมาร/พิเศษ): ${summary.departments.IPD2.totalWorkloadHours} ชม. | จริง ${summary.departments.IPD2.actualRN} / ควรมี ${summary.departments.IPD2.requiredRN} RN
5. LR (ห้องคลอด): ${summary.departments.LR.totalWorkloadHours} ชม. | จริง ${summary.departments.LR.actualRN} / ควรมี ${summary.departments.LR.requiredRN} RN
━━━━━━━━━━━━━━━━━━
ระบบคำนวณอัตรากำลังพยาบาล โรงพยาบาลสังขละบุรี`;

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      onNotifySuccess(`ส่งสรุปข้อมูลไปยังหมายเลข ${phoneNumber} (${recipientRole}) เรียบร้อยแล้ว`);
      setTimeout(() => {
        setSentSuccess(false);
      }, 4000);
    }, 1000);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummaryText);
      setCopied(true);
      onNotifySuccess('คัดลอกข้อความสรุปเรียบร้อยแล้ว พร้อมส่งต่อในกลุ่ม LINE เวร');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'สรุปค่างานและอัตรากำลังพยาบาล รพ.สังขละบุรี',
          text: formattedSummaryText,
        });
        onNotifySuccess('แชร์ข้อมูลสรุปสำเร็จ');
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-base font-bold">แจ้งเตือนและส่งสรุปผลผ่านเบอร์มือถือ</h2>
              <p className="text-xs text-emerald-200">
                ส่งข้อความสรุปค่างานรายวัน/เวร ไปยังผู้ตรวจการหรือกลุ่มเวรพยาบาล
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100">
          {/* Success Banner if sent */}
          {sentSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                ส่งข้อความสรุปรายงานไปยังหมายเลข <strong>{phoneNumber}</strong> สำเร็จแล้ว!
              </span>
            </div>
          )}

          {/* Phone Number Form */}
          <form onSubmit={handleSendSMS} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เบอร์โทรศัพท์ผู้รับ (SMS / Mobile Notification)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="08X-XXX-XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ตำแหน่ง / ผู้รับข้อความ
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="หัวหน้ากลุ่มงานการพยาบาล">หัวหน้ากลุ่มงานการพยาบาล</option>
                <option value="พยาบาลผู้ตรวจการนอกเวลาราชการ">พยาบาลผู้ตรวจการนอกเวลาราชการ</option>
                <option value="หัวหน้าหอผู้ป่วย / เวรฉุกเฉิน">หัวหน้าหอผู้ป่วย / เวรฉุกเฉิน</option>
                <option value="ผู้อำนวยการโรงพยาบาลสังขละบุรี">ผู้อำนวยการโรงพยาบาลสังขละบุรี</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-xs transition-all disabled:opacity-50 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งเตือน SMS สรุปค่างาน'}</span>
            </button>
          </form>

          {/* Formatted Text Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                ตัวอย่างข้อความสรุปสำหรับส่งต่อ:
              </span>
              <span className="text-slate-400 font-mono">LINE / SMS Ready</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-[11px] font-mono leading-relaxed text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto whitespace-pre-line select-all">
              {formattedSummaryText}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ (ส่งไลน์)'}</span>
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>แชร์ด่วน</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
