/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DepartmentDailyLog,
  DepartmentId,
  ShiftType,
  StandardWeights,
  ActivityCatalogItem,
  DepartmentActivitiesMap,
  DisplayThemeMode,
  NavigationTab,
} from './types/staffing';
import {
  DEFAULT_STANDARD_WEIGHTS,
  INITIAL_DAILY_LOGS,
  DEPARTMENT_CONFIG,
  SHIFT_NAMES,
  DEFAULT_DEPARTMENT_ACTIVITIES,
} from './data/defaults';
import { calculateHospitalSummary } from './utils/calculator';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToDailyLogs,
  saveDailyLogToFirestore,
  subscribeToStandardWeights,
  saveStandardWeightsToFirestore,
  subscribeToDepartmentActivities,
  saveActivityToFirestore,
  deleteActivityFromFirestore,
  resetDepartmentActivitiesInFirestore,
} from './firebase/firestoreSync';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { DepartmentDetailView } from './components/DepartmentDetailView';
import { ReportView } from './components/ReportView';
import { UserManagementView } from './components/UserManagementView';
import { DataEntryModal } from './components/DataEntryModal';
import { MobileSummaryModal } from './components/MobileSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { HospitalLogo } from './components/HospitalLogo';
import {
  CheckCircle2,
  X,
  Cloud,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

function StaffingApp() {
  const { userProfile, quickLoginAsDemoRole } = useAuth();

  // Theme mode: 'eyecare' (โหมดถนอมสายตา) | 'night' (โหมดมืดกลางคืน) | 'normal' (โหมดปกติ)
  const [themeMode, setThemeMode] = useState<DisplayThemeMode>(() => {
    const saved = localStorage.getItem('sk_staffing_theme');
    if (saved === 'eyecare' || saved === 'night' || saved === 'normal') {
      return saved as DisplayThemeMode;
    }
    const legacyDark = localStorage.getItem('sk_staffing_dark');
    if (legacyDark === 'true') return 'night';
    return 'eyecare';
  });

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Selected Date and Shift
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');

  // Selected Department for deep-dive
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('ER');

  // Firestore sync states
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState(false);
  const [isVercelDeployOpen, setIsVercelDeployOpen] = useState(false);

  // Data persistence for Logs (local cache initialized, synced with Firestore)
  const [logs, setLogs] = useState<DepartmentDailyLog[]>(() => {
    const saved = localStorage.getItem('sk_staffing_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DAILY_LOGS;
      }
    }
    return INITIAL_DAILY_LOGS;
  });

  // Data persistence for Standard Weights (local cache initialized, synced with Firestore)
  const [weights, setWeights] = useState<StandardWeights>(() => {
    const saved = localStorage.getItem('sk_staffing_weights');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STANDARD_WEIGHTS;
      }
    }
    return DEFAULT_STANDARD_WEIGHTS;
  });

  // Data persistence for Department Activities (Indirect Care & Unit-Related)
  const [activitiesMap, setActivitiesMap] = useState<DepartmentActivitiesMap>(() => {
    const saved = localStorage.getItem('sk_staffing_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_DEPARTMENT_ACTIVITIES;
      }
    }
    return DEFAULT_DEPARTMENT_ACTIVITIES;
  });

  // Real-time automatic Firestore listeners
  useEffect(() => {
    setIsFirestoreSyncing(true);

    const unsubLogs = subscribeToDailyLogs(
      (cloudLogs) => {
        setLogs(cloudLogs);
        localStorage.setItem('sk_staffing_logs', JSON.stringify(cloudLogs));
        setIsFirestoreConnected(true);
        setIsFirestoreSyncing(false);
      },
      (err) => {
        console.warn('Firestore logs sync error, using local cache:', err);
        setIsFirestoreSyncing(false);
      }
    );

    const unsubWeights = subscribeToStandardWeights(
      (cloudWeights) => {
        setWeights(cloudWeights);
        localStorage.setItem('sk_staffing_weights', JSON.stringify(cloudWeights));
        setIsFirestoreConnected(true);
      },
      (err) => {
        console.warn('Firestore weights sync error:', err);
      }
    );

    const unsubActivities = subscribeToDepartmentActivities(
      (cloudActivities) => {
        setActivitiesMap(cloudActivities);
        localStorage.setItem('sk_staffing_activities', JSON.stringify(cloudActivities));
        setIsFirestoreConnected(true);
      },
      (err) => {
        console.warn('Firestore activities sync error:', err);
      }
    );

    return () => {
      unsubLogs();
      unsubWeights();
      unsubActivities();
    };
  }, []);

  // Handlers for Add/Edit/Delete/Reset activities per department with Firestore sync
  const handleSaveDepartmentActivity = async (activity: ActivityCatalogItem, deptId: DepartmentId) => {
    setActivitiesMap((prev) => {
      const dept = prev[deptId] || { indirect: [], unit: [] };
      const listKey = activity.category === 'indirect_care' ? 'indirect' : 'unit';
      const currentList = dept[listKey];
      const existingIndex = currentList.findIndex((item) => item.id === activity.id);

      let updatedList: ActivityCatalogItem[];
      if (existingIndex >= 0) {
        updatedList = [...currentList];
        updatedList[existingIndex] = activity;
      } else {
        updatedList = [activity, ...currentList];
      }

      const updated = {
        ...prev,
        [deptId]: {
          ...dept,
          [listKey]: updatedList,
        },
      };
      localStorage.setItem('sk_staffing_activities', JSON.stringify(updated));
      return updated;
    });

    showToast(`บันทึกรายการกิจกรรม "${activity.name}" แผนก ${DEPARTMENT_CONFIG[deptId].name} เรียบร้อย (ซิงค์ Firestore)`);

    try {
      setIsFirestoreSyncing(true);
      await saveActivityToFirestore(activity, deptId);
    } catch (err) {
      console.warn('Firestore activity save error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const handleDeleteDepartmentActivity = async (
    activityId: string,
    category: 'indirect_care' | 'unit_related',
    deptId: DepartmentId
  ) => {
    setActivitiesMap((prev) => {
      const dept = prev[deptId] || { indirect: [], unit: [] };
      const listKey = category === 'indirect_care' ? 'indirect' : 'unit';
      const filtered = dept[listKey].filter((item) => item.id !== activityId);

      const updated = {
        ...prev,
        [deptId]: {
          ...dept,
          [listKey]: filtered,
        },
      };
      localStorage.setItem('sk_staffing_activities', JSON.stringify(updated));
      return updated;
    });

    showToast(`ลบรายการกิจกรรมเรียบร้อยแล้ว (ซิงค์ Firestore)`);

    try {
      setIsFirestoreSyncing(true);
      await deleteActivityFromFirestore(activityId);
    } catch (err) {
      console.warn('Firestore activity delete error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const handleResetDepartmentActivities = async (deptId: DepartmentId) => {
    setActivitiesMap((prev) => {
      const updated = {
        ...prev,
        [deptId]: DEFAULT_DEPARTMENT_ACTIVITIES[deptId],
      };
      localStorage.setItem('sk_staffing_activities', JSON.stringify(updated));
      return updated;
    });

    showToast(`คืนค่ารายการกิจกรรมมาตรฐานของแผนก ${DEPARTMENT_CONFIG[deptId].name} เรียบร้อย (ซิงค์ Firestore)`);

    try {
      setIsFirestoreSyncing(true);
      await resetDepartmentActivitiesInFirestore(deptId);
    } catch (err) {
      console.warn('Firestore reset activities error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  // Modal visibility states
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [dataEntryTargetDept, setDataEntryTargetDept] = useState<DepartmentId>('ER');
  const [isMobileShareOpen, setIsMobileShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync theme mode classes (eye-care, dark) with root html
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'eye-care');

    if (themeMode === 'night') {
      root.classList.add('dark');
    } else if (themeMode === 'eyecare') {
      root.classList.add('eye-care');
    }
    localStorage.setItem('sk_staffing_theme', themeMode);
  }, [themeMode]);

  // Calculate Hospital-wide summary
  const summary = calculateHospitalSummary(
    logs,
    selectedDate,
    selectedShift,
    weights,
    activitiesMap
  );

  const handleSaveLog = async (newLog: DepartmentDailyLog) => {
    setLogs((prev) => {
      const filtered = prev.filter((l) => l.id !== newLog.id);
      const updated = [...filtered, newLog];
      localStorage.setItem('sk_staffing_logs', JSON.stringify(updated));
      return updated;
    });

    setIsDataEntryOpen(false);
    showToast(
      `บันทึกข้อมูลค่างาน ${DEPARTMENT_CONFIG[newLog.departmentId].name} เวร${
        SHIFT_NAMES[newLog.shift]
      } เรียบร้อยแล้ว (ซิงค์ Firestore)`
    );

    try {
      setIsFirestoreSyncing(true);
      await saveDailyLogToFirestore(newLog);
    } catch (err) {
      console.warn('Firestore log save error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const handleSaveWeights = async (newW: StandardWeights) => {
    setWeights(newW);
    localStorage.setItem('sk_staffing_weights', JSON.stringify(newW));
    showToast('บันทึกเกณฑ์น้ำหนักเวลามาตรฐานเรียบร้อยแล้ว (ซิงค์ Firestore)');

    try {
      setIsFirestoreSyncing(true);
      await saveStandardWeightsToFirestore(newW);
    } catch (err) {
      console.warn('Firestore weights save error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const handleOpenDataEntryForDept = (deptId: DepartmentId) => {
    setDataEntryTargetDept(deptId);
    setIsDataEntryOpen(true);
  };

  const handleSelectDepartment = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
    setCurrentTab('departments');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'entry') {
            setIsDataEntryOpen(true);
          } else if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        selectedDeptId={selectedDeptId}
        onSelectDeptId={handleSelectDepartment}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onOpenDataEntry={() => {
          setDataEntryTargetDept('ER');
          setIsDataEntryOpen(true);
        }}
        onOpenMobileShare={() => setIsMobileShareOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        onOpenVercelDeploy={() => setIsVercelDeployOpen(true)}
      />

      {/* Main Layout Area offset by Left Sidebar */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all duration-200">
        {/* Top Contextual Header Bar */}
        <TopBar
          currentTab={currentTab}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedShift={selectedShift}
          setSelectedShift={setSelectedShift}
          onOpenDataEntry={() => {
            setDataEntryTargetDept('ER');
            setIsDataEntryOpen(true);
          }}
          onOpenMobileShare={() => setIsMobileShareOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          isFirestoreConnected={isFirestoreConnected}
          isFirestoreSyncing={isFirestoreSyncing}
          onOpenVercelDeploy={() => setIsVercelDeployOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto transition-all">
          {/* Welcome & Login Gate if not signed in */}
          {!userProfile ? (
            <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <HospitalLogo className="w-16 h-16" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 mb-2">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>เชื่อมต่อฐานข้อมูล Firebase Firestore อัตโนมัติ</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ระบบคำนวณค่างานและอัตรากำลังพยาบาล โรงพยาบาลสังขละบุรี
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
                  กรุณาเข้าสู่ระบบ หรือ สมัครใช้งาน เพื่อเข้าใช้งานระบบตามระดับสิทธิการเข้าถึงของท่าน
                </p>
              </div>

              {/* Role matrix summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>1. Admin</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    สิทธิการเข้าถึงทุกฟังก์ชั่น จัดการผู้ใช้ ตั้งค่าสูตรค่างาน
                  </p>
                  <button
                    onClick={() => quickLoginAsDemoRole('admin')}
                    className="mt-3 w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    เข้าใช้งานเป็น Admin
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <UserCheck className="w-4 h-4" />
                    <span>2. หัวหน้าพยาบาล</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    สิทธิการเข้าถึงการดูได้อย่างเดียว ไม่สามารถบันทึกหรือแก้ไขข้อมูลได้
                  </p>
                  <button
                    onClick={() => quickLoginAsDemoRole('head_nurse')}
                    className="mt-3 w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    เข้าใช้งานเป็น หน.พยาบาล
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
                    <Stethoscope className="w-4 h-4" />
                    <span>3. หัวหน้าฝ่าย</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    สิทธิบันทึก ลบ แก้ไข พิมพ์งาน เพิ่มรายการกิจกรรมใหม่
                  </p>
                  <button
                    onClick={() => quickLoginAsDemoRole('department_head')}
                    className="mt-3 w-full py-1.5 px-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    เข้าใช้งานเป็น หน.ฝ่าย
                  </button>
                </div>
              </div>

              {/* Login / Register Triggers */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ / ลงทะเบียน</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  summary={summary}
                  logs={logs}
                  selectedDate={selectedDate}
                  selectedShift={selectedShift}
                  onOpenDataEntryForDept={handleOpenDataEntryForDept}
                  onSelectDepartment={handleSelectDepartment}
                  onOpenMobileShare={() => setIsMobileShareOpen(true)}
                />
              )}

              {currentTab === 'departments' && (
                <DepartmentDetailView
                  selectedDeptId={selectedDeptId}
                  onSelectDeptId={setSelectedDeptId}
                  logs={logs}
                  selectedDate={selectedDate}
                  selectedShift={selectedShift}
                  weights={weights}
                  onOpenDataEntry={handleOpenDataEntryForDept}
                  activitiesMap={activitiesMap}
                  onSaveDepartmentActivity={handleSaveDepartmentActivity}
                  onDeleteDepartmentActivity={handleDeleteDepartmentActivity}
                  onResetDepartmentActivities={handleResetDepartmentActivities}
                />
              )}

              {currentTab === 'reports' && (
                <ReportView
                  logs={logs}
                  selectedDate={selectedDate}
                  selectedShift={selectedShift}
                  weights={weights}
                  activitiesMap={activitiesMap}
                />
              )}

              {currentTab === 'users' && <UserManagementView />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>กลุ่มงานการพยาบาล โรงพยาบาลสังขละบุรี จ.กาญจนบุรี</span>
              <span>·</span>
              <span>มาตรฐานสภาการพยาบาลและกระทรวงสาธารณสุข</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVercelDeployOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-white hover:bg-slate-800 text-[11px] font-semibold transition shadow-xs cursor-pointer"
                title="เปิดคู่มือนำระบบขึ้นเว็ปไซต์ Vercel"
              >
                <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 76 65">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span>วิธีนำขึ้น Vercel</span>
              </button>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                <span>เชื่อมต่อ Firebase Firestore อัตโนมัติ</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating / Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-850 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium flex-1">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Entry Modal */}
      <DataEntryModal
        isOpen={isDataEntryOpen}
        onClose={() => setIsDataEntryOpen(false)}
        onSaveLog={handleSaveLog}
        initialDeptId={dataEntryTargetDept}
        selectedDate={selectedDate}
        selectedShift={selectedShift}
        weights={weights}
        existingLogs={logs}
        activitiesMap={activitiesMap}
        onSaveDepartmentActivity={handleSaveDepartmentActivity}
        onDeleteDepartmentActivity={handleDeleteDepartmentActivity}
        onResetDepartmentActivities={handleResetDepartmentActivities}
      />

      {/* Mobile Summary & Share Modal */}
      <MobileSummaryModal
        isOpen={isMobileShareOpen}
        onClose={() => setIsMobileShareOpen(false)}
        summary={summary}
        selectedDate={selectedDate}
        selectedShift={selectedShift}
        onNotifySuccess={showToast}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        weights={weights}
        onSaveWeights={handleSaveWeights}
        onNotifySuccess={showToast}
      />

      {/* Authentication & User Roles Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Vercel Deployment Guide Modal */}
      <VercelDeployModal
        isOpen={isVercelDeployOpen}
        onClose={() => setIsVercelDeployOpen(false)}
        onNotifySuccess={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StaffingApp />
    </AuthProvider>
  );
}
