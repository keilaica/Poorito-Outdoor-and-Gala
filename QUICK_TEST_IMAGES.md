# Quick Test - Image Upload Feature

## ✅ What's Fixed
Your uploaded images now appear on the user pages! 

## 🚀 Quick Test (2 minutes)

### 1. Login to Admin
```
URL: http://localhost:3000/login
Email: admin@poorito.com
Password: password
```

### 2. Create Mountain with Image
1. Click **Mountains** → **Add New Mountain**
2. Fill in:
   - Name: **Test Mountain**
   - Location: **Test Region**
   - Elevation: **2500**
   - Difficulty: **Moderate**
3. **Click the big image upload box** → Select any image
4. Click **CREATE MOUNTAIN**

### 3. View on Public Page
```
URL: http://localhost:3000/mountains
```
**You should see your uploaded image!** 🎉

### 4. View Detail Page
Click **"View details"** on your mountain
**You should see the large image in the hero section!** 🖼️

---

## 📊 What Changed

### Code Changes:
1. `MountainForm.js` - Now sends image_url to backend ✅
2. `MountainsPublic.js` - Now displays images with fallback ✅

### Before vs After:

**Before:** 
- Upload image ❌ → Not saved → Public page shows gradient only

**After:**
- Upload image ✅ → Saved to database → Public page shows your image! 🎨

---

## 🔧 Both Servers Running?

Check:
- ✅ Backend: `http://localhost:5000/api/mountains`
- ✅ Frontend: `http://localhost:3000`

If not running:
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd Website
npm start
```

---

## 📖 More Info

- **Full testing guide**: `TEST_IMAGE_UPLOAD.md`
- **Technical summary**: `SUMMARY_IMAGE_UPLOAD_CHANGES.md`
- **Implementation details**: `IMAGE_UPLOAD_FEATURE.md`

---

**Ready? Go test it now!** ⛰️ → 🖼️ → ✨

