import React, { useState } from 'react';
import {
  X,
  Globe,
  GitBranch,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Server,
  Layers,
  FileCode,
} from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotifySuccess?: (msg: string) => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  onNotifySuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'cli' | 'firebase' | 'env'>('github');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    if (onNotifySuccess) {
      onNotifySuccess(`คัดลอก ${label} เรียบร้อยแล้ว`);
    }
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const gitCommands = `# 1. สร้าง Git Repository และ Commit ไฟล์ทั้งหมด
git init
git add .
git commit -m "feat: Sangkhlaburi Nursing Staffing workload app"

# 2. นำขึ้น GitHub ของคุณ (สร้าง repo เปล่าบน github.com ก่อน)
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main`;

  const cliCommands = `# 1. คำสั่งรัน Vercel CLI เพื่อ Deploy (ทดสอบก่อน)
npx vercel

# 2. เมื่อพร้อมนำขึ้น Production จริง:
npx vercel --prod`;

  const envVariablesText = `VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
VITE_FIREBASE_APP_ID=${firebaseConfig.appId}
VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
VITE_FIREBASE_DATABASE_ID=${firebaseConfig.firestoreDatabaseId}
VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
              {/* Vercel Triangle Logo */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 76 65" fill="none">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  คู่มือนำระบบขึ้นเว็ปไซต์ Vercel
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  พร้อมใช้งาน 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ระบบถูกเตรียมไฟล์ vercel.json และเชื่อมต่อ Firebase Firestore อัตโนมัติเรียบร้อยแล้ว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Checklist Banner */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                ไฟล์ <code className="font-mono font-bold bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">vercel.json</code> พร้อมแล้ว
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Build Command: <code className="font-mono font-bold bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">npm run build</code>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Output Directory: <code className="font-mono font-bold bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">dist</code>
              </span>
            </div>
          </div>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-lg font-semibold hover:bg-slate-800 transition shadow-xs text-xs"
          >
            <span>ไปที่ Vercel Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/60 dark:bg-slate-850/60 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>1. ผ่าน GitHub (แนะนำ & สะดวกที่สุด)</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'cli'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. ผ่าน Vercel CLI (Terminal)</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>3. ตั้งค่า Authorized Domain ใน Firebase (สำคัญ)</span>
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'env'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. ตัวแปร Environment Variables</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong>ข้อดีของการเชื่อมต่อผ่าน GitHub:</strong> เมื่อมีการแก้ไขหรืออัปเดตโค้ดในอนาคต Vercel จะทำการ Build และ Deploy ขึ้นเว็บให้อัตโนมัติทุกครั้งที่ Git Push ทันที!
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>ดึงโค้ดขึ้น GitHub Repository</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(gitCommands, 'คำสั่ง Git')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                  >
                    {copiedKey === 'คำสั่ง Git' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกคำสั่ง</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เปิด Terminal ที่โฟลเดอร์โปรเจกต์นี้ แล้วรันคำสั่ง:
                </p>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                  {gitCommands}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>เข้าสู่ระบบ Vercel และ Import โปรเจกต์</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-300 ml-1">
                  <li>
                    ไปที่{' '}
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      vercel.com
                    </a>{' '}
                    แล้วล็อกอินด้วยบัญชี GitHub เดียวกัน
                  </li>
                  <li>
                    กดปุ่ม <strong>"Add New..."</strong> แล้วเลือก <strong>"Project"</strong>
                  </li>
                  <li>
                    ค้นหาชื่อ Repository ของคุณ แล้วกด <strong>"Import"</strong>
                  </li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>ยืนยันการตั้งค่าแล้วกด "Deploy"</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    • Framework Preset: <span className="font-semibold text-emerald-600">Vite</span> (ตรวจพบอัตโนมัติ)
                  </div>
                  <div>
                    • Build Command: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">npm run build</code>
                  </div>
                  <div>
                    • Output Directory: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">dist</code>
                  </div>
                  <div className="pt-2 text-slate-700 dark:text-slate-200">
                    กดปุ่ม <span className="font-bold text-black dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Deploy</span> ได้เลย รอประมาณ 1 นาที จะได้โดเมนจริง เช่น{' '}
                    <code className="text-emerald-600 font-bold font-mono">https://sangkhlaburi-nursing.vercel.app</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span>คำสั่ง Vercel CLI (สำหรับผู้ที่ติดตั้ง Node.js)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cliCommands, 'คำสั่ง CLI')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                  >
                    {copiedKey === 'คำสั่ง CLI' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เปิด Terminal ที่รากโปรเจกต์นี้ แล้วสั่งรันได้ทันทีโดยไม่ต้องติดตั้งล่วงหน้า:
                </p>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                  {cliCommands}
                </pre>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                  <div>1. เมื่อสั่ง <code>npx vercel</code> จะเปิดบราวเซอร์ให้ยืนยันตัวตนกับบัญชี Vercel</div>
                  <div>2. ตอบคำถาม <code>Set up and deploy?</code> ด้วย <code>Y</code></div>
                  <div>3. เมื่อทดสอบเสร็จแล้ว ใช้ <code>npx vercel --prod</code> เพื่อส่งขึ้น Production จริง</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong>ขั้นตอนสำคัญมากหลังได้ URL จาก Vercel:</strong> เพื่อให้ผู้ใช้งานสามารถ Login ด้วย Google หรือลงทะเบียนผ่าน Firebase ได้อย่างสมบูรณ์แบบบนโดเมนใหม่ คุณต้องเพิ่มชื่อโดเมนของ Vercel ลงใน Firebase Console Authorized Domains
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>ขั้นตอนการเพิ่มโดเมนใน Firebase Console:</span>
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <span>เปิด Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li>
                    เข้าไปที่ <strong>Firebase Console</strong> และเลือกโปรเจกต์:{' '}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {firebaseConfig.projectId}
                    </code>
                  </li>
                  <li>
                    ที่เมนูด้านซ้าย เลือก <strong>Build</strong> &gt; <strong>Authentication</strong>
                  </li>
                  <li>
                    คลิกแท็บ <strong>Settings</strong> ด้านบน
                  </li>
                  <li>
                    เลื่อนลงมาที่หัวข้อ <strong>Authorized domains</strong>
                  </li>
                  <li>
                    กดปุ่ม <strong>"Add domain"</strong> แล้วกรอกชื่อโดเมน Vercel ของคุณ (ตัด <code>https://</code> ออก) เช่น:{' '}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-semibold">
                      your-app.vercel.app
                    </code>
                  </li>
                  <li>
                    กด <strong>Save</strong> — ผู้ใช้งานทุกคนจะสามารถเข้าสู่ระบบและบันทึกค่างานผ่าน Vercel ได้ทันที!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  💡 หมายเหตุเกี่ยวกับการเชื่อมต่อ Firebase:
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  โปรเจกต์นี้มีไฟล์ <code>firebase-applet-config.json</code> อยู่ในตัวอยู่แล้ว ซึ่งทำให้ระบบเชื่อมต่อ Firestore ได้ทันทีแม้ไม่ได้กรอก Environment Variables ใน Vercel แต่หากต้องการตั้งค่าแบบแยกต่างหากในแท็บ <strong>Settings &gt; Environment Variables</strong> ของ Vercel สามารถใช้ค่าเหล่านี้ได้:
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <span>ตัวแปรทั้งหมด (VITE_FIREBASE_*)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(envVariablesText, 'Environment Variables')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                  >
                    {copiedKey === 'Environment Variables' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">คัดลอกทั้งหมดแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกค่าทั้งหมด</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
                  {envVariablesText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>มีคู่มือฉบับเต็มอยู่ในไฟล์ <code>DEPLOY_VERCEL.md</code> ในโปรเจกต์</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
