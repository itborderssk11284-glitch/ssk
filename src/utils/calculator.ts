import {
  DepartmentCalculationResult,
  DepartmentDailyLog,
  DepartmentId,
  HospitalDailySummary,
  ShiftType,
  StandardWeights,
  DepartmentActivitiesMap,
} from '../types/staffing';
import { DEPARTMENT_CONFIG, DEFAULT_DEPARTMENT_ACTIVITIES } from '../data/defaults';

export function calculateDepartmentWorkload(
  log: DepartmentDailyLog,
  weights: StandardWeights,
  activitiesMap?: DepartmentActivitiesMap
): DepartmentCalculationResult {
  const deptId = log.departmentId;
  const deptInfo = DEPARTMENT_CONFIG[deptId];
  let directCareHours = 0;
  let totalPatients = 0;
  let bedOccupancyRate: number | undefined = undefined;

  // 1. Direct Care Nursing Hours
  if (deptId === 'ER' && log.erData) {
    const d = log.erData;
    totalPatients =
      d.triage1 +
      d.triage2 +
      d.triage3 +
      d.triage4 +
      d.triage5;
    directCareHours =
      d.triage1 * weights.er.triage1 +
      d.triage2 * weights.er.triage2 +
      d.triage3 * weights.er.triage3 +
      d.triage4 * weights.er.triage4 +
      d.triage5 * weights.er.triage5 +
      d.referAmbulance * weights.er.referAmbulance +
      d.cprCases * weights.er.cprCases;
  } else if (deptId === 'OPD' && log.opdData) {
    const d = log.opdData;
    totalPatients =
      d.generalVisit +
      d.chronicVisit +
      d.minorSurgery +
      d.specialtyClinic +
      d.injectionsDressing;
    directCareHours =
      d.generalVisit * weights.opd.generalVisit +
      d.chronicVisit * weights.opd.chronicVisit +
      d.minorSurgery * weights.opd.minorSurgery +
      d.specialtyClinic * weights.opd.specialtyClinic +
      d.injectionsDressing * weights.opd.injectionsDressing;
  } else if ((deptId === 'IPD1' || deptId === 'IPD2') && log.ipdData) {
    const d = log.ipdData;
    totalPatients = d.occupiedBeds;
    if (d.bedCapacity > 0) {
      bedOccupancyRate = Math.round((d.occupiedBeds / d.bedCapacity) * 100 * 10) / 10;
    }

    // 24-hr standard HPPN based on PCS categories (same standard for IPD1 & IPD2)
    const dailyHPPN =
      d.cat1SelfCare * weights.ipd.cat1 +
      d.cat2Moderate * weights.ipd.cat2 +
      d.cat3Acute * weights.ipd.cat3 +
      d.cat4Intensive * weights.ipd.cat4 +
      d.cat5Ventilator * weights.ipd.cat5;

    // Shift distribution according to Thai Nursing Council (Day 45%, Eve 35%, Night 20%)
    if (log.shift === 'morning') {
      directCareHours = dailyHPPN * 0.45;
    } else if (log.shift === 'afternoon') {
      directCareHours = dailyHPPN * 0.35;
    } else if (log.shift === 'night') {
      directCareHours = dailyHPPN * 0.20;
    } else {
      directCareHours = dailyHPPN;
    }
  } else if (deptId === 'LR' && log.lrData) {
    const d = log.lrData;
    totalPatients =
      d.stage1Latent +
      d.stage1Active +
      d.stage2Delivery;
    directCareHours =
      d.stage1Latent * weights.lr.stage1Latent +
      d.stage1Active * weights.lr.stage1Active +
      d.stage2Delivery * weights.lr.stage2Delivery +
      d.stage3and4Recovery * weights.lr.stage3and4Recovery +
      d.highRiskCases * weights.lr.highRiskCases +
      d.nbResuscitation * weights.lr.nbResuscitation;
  }

  // Active Catalog for this department (allows dynamic custom items)
  const activeCatalog =
    activitiesMap?.[deptId] || DEFAULT_DEPARTMENT_ACTIVITIES[deptId] || { indirect: [], unit: [] };

  // 2. Indirect Care Nursing Hours (Standard Time: นาที/ครั้ง ÷ 60)
  let indirectCareMinutes = 0;
  if (log.indirectCareCounts) {
    activeCatalog.indirect.forEach((item) => {
      const count = log.indirectCareCounts?.[item.id] || 0;
      indirectCareMinutes += count * item.standardTimeMinutes;
    });
  }
  const indirectCareHours = indirectCareMinutes / 60;

  // 3. Unit-Related Activities Hours (Standard Time: นาที/ครั้ง ÷ 60)
  let unitRelatedMinutes = 0;
  if (log.unitRelatedCounts) {
    activeCatalog.unit.forEach((item) => {
      const count = log.unitRelatedCounts?.[item.id] || 0;
      unitRelatedMinutes += count * item.standardTimeMinutes;
    });
  }
  const unitRelatedHours = unitRelatedMinutes / 60;

  // Total Comprehensive Workload Hours
  const totalWorkloadHours = directCareHours + indirectCareHours + unitRelatedHours;

  // Calculate Required RN
  let requiredRN = 0;
  if (log.shift === 'daily_total') {
    requiredRN = (totalWorkloadHours / weights.effectiveShiftHours) * weights.dfteReliefFactor;
  } else {
    requiredRN = totalWorkloadHours / weights.effectiveShiftHours;
  }

  const roundedRequiredRN = Math.round(requiredRN * 10) / 10;
  const actualRN = log.staff.actualRN;
  const actualPN = log.staff.actualPN;
  const balanceRN = Math.round((actualRN - roundedRequiredRN) * 10) / 10;

  // Status determination
  let balanceStatus: 'deficit' | 'balanced' | 'surplus' = 'balanced';
  const ratio = roundedRequiredRN > 0 ? actualRN / roundedRequiredRN : 1;
  if (ratio < 0.9) {
    balanceStatus = 'deficit'; // ขาดอัตรากำลัง
  } else if (ratio > 1.15) {
    balanceStatus = 'surplus'; // เกินเกณฑ์ / เพียงพอ
  } else {
    balanceStatus = 'balanced'; // สมดุล
  }

  const workloadIndexPerNurse =
    actualRN > 0 ? Math.round((totalWorkloadHours / actualRN) * 10) / 10 : totalWorkloadHours;

  return {
    departmentId: deptId,
    departmentName: deptInfo.name,
    directCareHours: Math.round(directCareHours * 10) / 10,
    indirectCareHours: Math.round(indirectCareHours * 10) / 10,
    unitRelatedHours: Math.round(unitRelatedHours * 10) / 10,
    totalWorkloadHours: Math.round(totalWorkloadHours * 10) / 10,
    requiredRN: roundedRequiredRN,
    actualRN,
    actualPN,
    balanceRN,
    balanceStatus,
    workloadIndexPerNurse,
    totalPatients,
    bedOccupancyRate,
  };
}

export function calculateHospitalSummary(
  logs: DepartmentDailyLog[],
  date: string,
  shift: ShiftType,
  weights: StandardWeights,
  activitiesMap?: DepartmentActivitiesMap
): HospitalDailySummary {
  const departmentsMap: Record<DepartmentId, DepartmentCalculationResult> = {
    ER: {
      departmentId: 'ER',
      departmentName: DEPARTMENT_CONFIG.ER.name,
      directCareHours: 0,
      indirectCareHours: 0,
      unitRelatedHours: 0,
      totalWorkloadHours: 0,
      requiredRN: 0,
      actualRN: 0,
      actualPN: 0,
      balanceRN: 0,
      balanceStatus: 'balanced',
      workloadIndexPerNurse: 0,
      totalPatients: 0,
    },
    OPD: {
      departmentId: 'OPD',
      departmentName: DEPARTMENT_CONFIG.OPD.name,
      directCareHours: 0,
      indirectCareHours: 0,
      unitRelatedHours: 0,
      totalWorkloadHours: 0,
      requiredRN: 0,
      actualRN: 0,
      actualPN: 0,
      balanceRN: 0,
      balanceStatus: 'balanced',
      workloadIndexPerNurse: 0,
      totalPatients: 0,
    },
    IPD1: {
      departmentId: 'IPD1',
      departmentName: DEPARTMENT_CONFIG.IPD1.name,
      directCareHours: 0,
      indirectCareHours: 0,
      unitRelatedHours: 0,
      totalWorkloadHours: 0,
      requiredRN: 0,
      actualRN: 0,
      actualPN: 0,
      balanceRN: 0,
      balanceStatus: 'balanced',
      workloadIndexPerNurse: 0,
      totalPatients: 0,
    },
    IPD2: {
      departmentId: 'IPD2',
      departmentName: DEPARTMENT_CONFIG.IPD2.name,
      directCareHours: 0,
      indirectCareHours: 0,
      unitRelatedHours: 0,
      totalWorkloadHours: 0,
      requiredRN: 0,
      actualRN: 0,
      actualPN: 0,
      balanceRN: 0,
      balanceStatus: 'balanced',
      workloadIndexPerNurse: 0,
      totalPatients: 0,
    },
    LR: {
      departmentId: 'LR',
      departmentName: DEPARTMENT_CONFIG.LR.name,
      directCareHours: 0,
      indirectCareHours: 0,
      unitRelatedHours: 0,
      totalWorkloadHours: 0,
      requiredRN: 0,
      actualRN: 0,
      actualPN: 0,
      balanceRN: 0,
      balanceStatus: 'balanced',
      workloadIndexPerNurse: 0,
      totalPatients: 0,
    },
  };

  const filteredLogs = logs.filter((l) => l.date === date && l.shift === shift);

  filteredLogs.forEach((log) => {
    departmentsMap[log.departmentId] = calculateDepartmentWorkload(log, weights, activitiesMap);
  });

  let totalDirect = 0;
  let totalIndirect = 0;
  let totalUnit = 0;
  let totalWorkload = 0;
  let totalReq = 0;
  let totalActRN = 0;
  let totalActPN = 0;

  Object.values(departmentsMap).forEach((res) => {
    totalDirect += res.directCareHours;
    totalIndirect += res.indirectCareHours;
    totalUnit += res.unitRelatedHours;
    totalWorkload += res.totalWorkloadHours;
    totalReq += res.requiredRN;
    totalActRN += res.actualRN;
    totalActPN += res.actualPN;
  });

  const totalBalanceRN = Math.round((totalActRN - totalReq) * 10) / 10;
  const overallRatio = totalReq > 0 ? totalActRN / totalReq : 1;
  let overallStatus: 'deficit' | 'balanced' | 'surplus' = 'balanced';
  if (overallRatio < 0.9) overallStatus = 'deficit';
  else if (overallRatio > 1.15) overallStatus = 'surplus';

  return {
    date,
    shift,
    departments: departmentsMap,
    totalDirectCareHours: Math.round(totalDirect * 10) / 10,
    totalIndirectCareHours: Math.round(totalIndirect * 10) / 10,
    totalUnitRelatedHours: Math.round(totalUnit * 10) / 10,
    totalWorkloadHours: Math.round(totalWorkload * 10) / 10,
    totalRequiredRN: Math.round(totalReq * 10) / 10,
    totalActualRN: totalActRN,
    totalActualPN: totalActPN,
    totalBalanceRN,
    overallStatus,
  };
}
