export type DepartmentId = 'ER' | 'OPD' | 'IPD1' | 'IPD2' | 'LR';

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'daily_total';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ActivityCatalogItem {
  id: string;
  name: string;
  category: 'indirect_care' | 'unit_related';
  departmentId?: DepartmentId;
  standardTimeMinutes: number; // นาที/ครั้ง
  riskLevel: RiskLevel;
  riskLabel: string;
  difficulty: 'ง่าย (Low)' | 'ปานกลาง (Medium)' | 'ซับซ้อน (Complex)' | 'ซับซ้อนสูง (High Complexity)';
  description: string;
  isCustom?: boolean;
}

export type DepartmentActivitiesMap = Record<
  DepartmentId,
  {
    indirect: ActivityCatalogItem[];
    unit: ActivityCatalogItem[];
  }
>;

export interface ERWorkloadData {
  triage1: number; // Resuscitation (วิกฤติ) ~ 4.0 hrs
  triage2: number; // Emergency (ฉุกเฉินเร่งด่วน) ~ 2.5 hrs
  triage3: number; // Urgency (เร่งด่วน) ~ 1.0 hr
  triage4: number; // Semi-urgency (กึ่งเร่งด่วน) ~ 0.5 hr
  triage5: number; // Non-urgency (ไม่เร่งด่วน) ~ 0.25 hr
  referAmbulance: number; // เคสส่งต่อ / รถพยาบาล EMS ~ 3.0 hrs
  cprCases: number; // เคสกู้ชีพ CPR / หัตถการวิกฤติ ~ 1.5 hrs
}

export interface OPDWorkloadData {
  generalVisit: number; // ตรวจโรคทั่วไป ~ 0.20 hr (12 นาที)
  chronicVisit: number; // โรคเรื้อรัง NCDs ~ 0.35 hr (21 นาที)
  minorSurgery: number; // ผ่าตัดเล็ก & หัตถการ ~ 0.75 hr (45 นาที)
  specialtyClinic: number; // คลินิกเฉพาะทาง / คัดกรอง ~ 0.50 hr (30 นาที)
  injectionsDressing: number; // ฉีดยา / ทำแผล ~ 0.25 hr (15 นาที)
}

export interface IPDWorkloadData {
  bedCapacity: number; // จำนวนเตียงทั้งหมด
  occupiedBeds: number; // จำนวนเตียงครองปัจจุบัน
  admissions: number; // รับใหม่
  discharges: number; // จำหน่าย/ย้าย
  cat1SelfCare: number; // Category 1: ดูแลตนเองได้ ~ 1.5 hrs/วัน
  cat2Moderate: number; // Category 2: ปานกลาง ~ 3.0 hrs/วัน
  cat3Acute: number; // Category 3: มาก/เฉียบพลัน ~ 5.5 hrs/วัน
  cat4Intensive: number; // Category 4: ใกล้ชิด/วิกฤติ ~ 8.5 hrs/วัน
  cat5Ventilator: number; // Category 5: วิกฤติพิเศษ/On Tube/Ventilator ~ 12.0 hrs/วัน
}

export interface LRWorkloadData {
  stage1Latent: number; // Latent phase ~ 1.5 hrs
  stage1Active: number; // Active phase ~ 3.5 hrs
  stage2Delivery: number; // คลอดศีรษะ/ทำคลอด ~ 2.5 hrs
  stage3and4Recovery: number; // ระยะรก & สังเกตอาการหลังคลอด 2 ชม. ~ 2.0 hrs
  highRiskCases: number; // ภาวะเสี่ยงสูง (PPH / PIH / Fetal distress) ~ 2.5 hrs
  nbResuscitation: number; // ดูแล/กู้ชีพทารกแรกเกิด ~ 1.0 hr
}

export interface StaffOnDuty {
  actualRN: number; // พยาบาลวิชาชีพปฏิบัติงานจริง
  actualPN: number; // ผู้ช่วยพยาบาล / NA
}

export interface DepartmentDailyLog {
  id: string;
  departmentId: DepartmentId;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  staff: StaffOnDuty;
  erData?: ERWorkloadData;
  opdData?: OPDWorkloadData;
  ipdData?: IPDWorkloadData;
  lrData?: LRWorkloadData;
  // Extra Workload: Indirect Care & Unit-Related Activities
  indirectCareCounts?: Record<string, number>; // id -> frequency count
  unitRelatedCounts?: Record<string, number>; // id -> frequency count
  notes?: string;
  recorderName: string; // ผู้บันทึก / พยาบาลเวร
  recordedAt: string;
}

export interface StandardWeights {
  effectiveShiftHours: number; // e.g. 7.0 productive hours
  dfteReliefFactor: number; // e.g. 1.20 (เผื่อวันลา/อบรม/วันหยุด)
  er: {
    triage1: number;
    triage2: number;
    triage3: number;
    triage4: number;
    triage5: number;
    referAmbulance: number;
    cprCases: number;
  };
  opd: {
    generalVisit: number;
    chronicVisit: number;
    minorSurgery: number;
    specialtyClinic: number;
    injectionsDressing: number;
  };
  ipd: {
    cat1: number;
    cat2: number;
    cat3: number;
    cat4: number;
    cat5: number;
  };
  lr: {
    stage1Latent: number;
    stage1Active: number;
    stage2Delivery: number;
    stage3and4Recovery: number;
    highRiskCases: number;
    nbResuscitation: number;
  };
}

export interface DepartmentCalculationResult {
  departmentId: DepartmentId;
  departmentName: string;
  directCareHours: number; // การพยาบาลโดยตรง (ข้างเตียง/เคส)
  indirectCareHours: number; // การพยาบาลโดยอ้อม (เวชระเบียน/ยา HAD/ส่งเวร)
  unitRelatedHours: number; // กิจกรรมบริหารจัดการหน่วยงาน
  totalWorkloadHours: number; // รวมทั้ง 3 ส่วน
  requiredRN: number; // FTE
  actualRN: number;
  actualPN: number;
  balanceRN: number; // actualRN - requiredRN
  balanceStatus: 'deficit' | 'balanced' | 'surplus'; // ขาด | สมดุล | เพียงพอ
  workloadIndexPerNurse: number; // ชม.ภาระงานเฉลี่ยต่อพยาบาล 1 คน
  totalPatients: number;
  bedOccupancyRate?: number; // for IPD
}

export interface HospitalDailySummary {
  date: string;
  shift: ShiftType;
  departments: Record<DepartmentId, DepartmentCalculationResult>;
  totalDirectCareHours: number;
  totalIndirectCareHours: number;
  totalUnitRelatedHours: number;
  totalWorkloadHours: number;
  totalRequiredRN: number;
  totalActualRN: number;
  totalActualPN: number;
  totalBalanceRN: number;
  overallStatus: 'deficit' | 'balanced' | 'surplus';
}

export type DisplayThemeMode = 'normal' | 'eyecare' | 'night';

// Role-Based Access Control types
// 1. Admin: สิทธิการเข้าถึงทุกฟังก์ชั่น
// 2. หัวหน้าพยาบาล (head_nurse): สิทธิการเข้าถึงการดูได้อย่างเดียว ไม่สามารถ บันทึก แก้ไข หรือเปลี่ยนแปลงข้อมูลได้
// 3. หัวหน้าฝ่าย (department_head): สิทธิการบันทึก ลบ แก้ไข พิมพ์งาน เพิ่มรายการกิจกรรมใหม่
export type UserRole = 'admin' | 'head_nurse' | 'department_head';

export interface SystemUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: DepartmentId | 'ALL';
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'entry'
  | 'departments'
  | 'reports'
  | 'settings'
  | 'users';
