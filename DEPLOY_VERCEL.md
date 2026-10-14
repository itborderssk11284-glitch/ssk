# คู่มือการนำระบบขึ้น Vercel (Deployment Guide to Vercel)

ระบบคำนวณค่างานและอัตรากำลังพยาบาล โรงพยาบาลสังขละบุรี ถูกตั้งค่าไฟล์ `vercel.json` และรองรับการนำขึ้น Vercel เรียบร้อยแล้ว 100% สามารถเลือกใช้วิธีใดวิธีหนึ่งด้านล่างนี้ได้ทันที:

---

## 🚀 วิธีที่ 1: นำขึ้นผ่าน GitHub และ Vercel Dashboard (แนะนำ สะดวกที่สุด)

### ขั้นตอนที่ 1: ดึงโค้ดขึ้น GitHub Repository
1. นำโค้ดโปรเจกต์นี้ขึ้น GitHub ของคุณ (ผ่าน Git CLI หรือ GitHub Desktop)
```bash
git init
git add .
git commit -m "feat: Initial commit for Sangkhlaburi Nursing Workload app"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### ขั้นตอนที่ 2: เข้าสู่ระบบ Vercel
1. ไปที่เว็บไซต์ [https://vercel.com](https://vercel.com)
2. เข้าสู่ระบบ (Log in) ด้วยบัญชี **GitHub** ของคุณ

### ขั้นตอนที่ 3: Import Project
1. กดปุ่ม **"Add New..."** หรือ **"Create a New Project"** -> เลือก **Project**
2. เลือก Repository บน GitHub ของคุณ แล้วกด **"Import"**

### ขั้นตอนที่ 4: ตรวจสอบการตั้งค่า Build & Output Settings
Vercel จะตรวจพบว่าเป็น Vite โดยอัตโนมัติ:
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`
*(ไม่ต้องแก้ไขอะไร เนื่องจากมีไฟล์ `vercel.json` รองรับระบบ Single Page Application เรียบร้อยแล้ว)*

### ขั้นตอนที่ 5 (ทางเลือก): ตั้งค่า Environment Variables ใน Vercel
ระบบมีไฟล์ `firebase-applet-config.json` บรรจุการเชื่อมต่อ Firestore ให้พร้อมทำงานทันที แต่หากต้องการกำหนดผ่าน Vercel Dashboard เพิ่มเติม สามารถคัดลอกจากด้านล่างใส่ในหัวข้อ **Environment Variables**:
* `VITE_FIREBASE_PROJECT_ID`: `gen-lang-client-0590738786`
* `VITE_FIREBASE_APP_ID`: `1:275031817169:web:073e479f1ec5db6135bef0`
* `VITE_FIREBASE_API_KEY`: `AIzaSyDRisggZvg_6VVpC0iqJtbiG9Dy5P2cGZE`
* `VITE_FIREBASE_AUTH_DOMAIN`: `gen-lang-client-0590738786.firebaseapp.com`
* `VITE_FIREBASE_DATABASE_ID`: `ai-studio-1aea9dcf-b517-4d6e-9b2b-12436257cc92`
* `VITE_FIREBASE_STORAGE_BUCKET`: `gen-lang-client-0590738786.firebasestorage.app`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`: `275031817169`

### ขั้นตอนที่ 6: กด Deploy
* กดปุ่ม **"Deploy"** รอประมาณ 1-2 นาที คุณจะได้ URL เว็บไซต์จริง เช่น:
  `https://sangkhlaburi-nursing-workload.vercel.app`

---

## 💻 วิธีที่ 2: นำขึ้นผ่านคำสั่ง Terminal (Vercel CLI)

หากคุณติดตั้ง Node.js บนเครื่องแล้ว สามารถสั่ง Deploy ผ่านคำสั่งเดียวได้เลย:

```bash
# 1. ติดตั้งหรือรัน Vercel CLI
npx vercel

# 2. ทำตามขั้นตอนบนหน้าจอ Terminal:
# - Log in to Vercel: กดตามขั้นตอนล็อกอินในบราวเซอร์
# - Set up and deploy: กด Y
# - Which scope: เลือก Account ของคุณ
# - Link to existing project: n
# - What's your project's name?: กด Enter (หรือพิมพ์ชื่อที่ต้องการ)
# - In which directory is your code located?: ./
# - Want to modify these settings?: n

# 3. เมื่อพร้อมขึ้น Production จริง:
npx vercel --prod
```

---

## ⚠️ สิ่งสำคัญมากหลังนำขึ้น Vercel (เพิ่มโดเมนใน Firebase Authentication)

เพื่อให้ระบบล็อกอินด้วย Google หรือ Firebase Authentication บนโดเมน Vercel ทำงานได้สมบูรณ์:

1. เข้าไปที่ **[Firebase Console](https://console.firebase.google.com/)**
2. เลือกโปรเจกต์ `gen-lang-client-0590738786`
3. ไปที่เมนู **Build** > **Authentication** > แท็บ **Settings**
4. เลื่อนลงมาที่หัวข้อ **Authorized domains** (โดเมนที่อนุญาต)
5. กดปุ่ม **Add domain** แล้วพิมพ์โดเมน Vercel ของคุณ เช่น:
   `sangkhlaburi-nursing-workload.vercel.app`
6. กด **Save** เป็นอันเสร็จสิ้น

---

## 📁 ไฟล์สำคัญในโปรเจกต์ที่เตรียมไว้ให้:
* `vercel.json`: กำหนด URL rewrite สำหรับ Vite SPA และ Cache control
* `firebase-applet-config.json`: การตั้งค่าเชื่อมต่อ Firebase Firestore อัตโนมัติ
* `src/firebase/config.ts`: รองรับทั้งไฟล์คอนฟิกและ Environment Variables จาก Vercel
* `firestore.rules`: กฎความปลอดภัย Firestore กำหนดสิทธิ 3 ระดับ (Admin, หัวหน้าพยาบาล, หัวหน้าฝ่าย)
