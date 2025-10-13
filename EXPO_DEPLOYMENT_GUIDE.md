# Expo Deployment Guide for "The Real Johnson Handyman Services"

## ✅ Configuration Complete

Your app is now configured with:
- **Expo Username:** needanevo
- **EAS Project ID:** 1e8bec7e-6182-4a54-ab0b-d2fc9deb571e
- **App Name:** The Real Johnson Handyman Services
- **Slug:** real-johnson-handyman

---

## 🚀 Deployment Steps (Run on Your Local Machine)

### Step 1: Navigate to Your Project

```powershell
cd C:\Users\Joshua\Documents\Handyman-app\Handyman-app-main\frontend
```

### Step 2: Verify You're Logged In

```powershell
eas whoami
```
Should show: **needanevo**

### Step 3: Build for Android (Easiest to Start)

```powershell
# Build APK for testing
eas build --platform android --profile preview

# Build for Google Play Store
eas build --platform android --profile production
```

**What happens:**
- Build happens in the cloud (Expo's servers)
- Takes 10-20 minutes
- You'll get a download link when complete
- Can install APK directly on Android device for testing

### Step 4: Build for iOS (Optional - Requires Apple Developer Account)

```powershell
eas build --platform ios --profile production
```

**Requirements:**
- Apple Developer Account ($99/year)
- You'll be prompted to set up credentials during first build

---

## 📱 Testing Your Build

### Option A: Install APK Directly (Android)
1. After build completes, download the APK
2. Transfer to your Android device
3. Enable "Install from Unknown Sources"
4. Install and test

### Option B: Submit to Internal Testing
```powershell
# Submit to Google Play Console (internal testing track)
eas submit --platform android --track internal
```

---

## 🔧 Important Configuration

### Backend URL
Your app currently connects to:
```
https://auth-debug-15.preview.emergentagent.com
```

**For Production:**
1. Deploy your backend on Emergent (or other hosting)
2. Update the backend URL in `/frontend/.env`:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-production-api.com
   ```
3. Rebuild the app with the new URL

---

## 📋 Build Profiles (already configured in eas.json)

### Development Build
```powershell
eas build --profile development --platform android
```
- Includes developer tools
- Larger file size
- For testing

### Preview Build
```powershell
eas build --profile preview --platform android
```
- Smaller than development
- No dev tools
- Good for beta testing

### Production Build
```powershell
eas build --profile production --platform android
```
- Optimized and minified
- Smallest file size
- For app store release

---

## 🎯 Next Steps

1. **Build Preview Version:**
   ```powershell
   cd C:\Users\Joshua\Documents\Handyman-app\Handyman-app-main\frontend
   eas build --platform android --profile preview
   ```

2. **Wait for Build** (10-20 minutes)
   - You'll see progress in terminal
   - Get download link when complete

3. **Test on Device:**
   - Download APK
   - Install on Android phone
   - Test all features

4. **Deploy Backend** (when ready for production)
   - Use Emergent deployment
   - Update app with production API URL
   - Rebuild with production profile

5. **Submit to Stores:**
   ```powershell
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 🆘 Common Issues & Solutions

### Build Fails
```powershell
# Clear cache and try again
eas build:clear-cache
eas build --platform android --profile preview
```

### App Can't Connect to Backend
- Check EXPO_PUBLIC_BACKEND_URL in .env
- Ensure backend is running and accessible
- Check API endpoints return correct data

### iOS Build Issues
- Need Apple Developer account
- Set up signing certificates with `eas credentials`

---

## 📞 Support Resources

- Expo Documentation: https://docs.expo.dev/
- EAS Build Guide: https://docs.expo.dev/build/introduction/
- EAS Submit Guide: https://docs.expo.dev/submit/introduction/
- Your EAS Project: https://expo.dev/accounts/needanevo/projects/real-johnson-handyman

---

## ✨ Your First Build Command

**Run this now to create your first build:**

```powershell
cd C:\Users\Joshua\Documents\Handyman-app\Handyman-app-main\frontend
eas build --platform android --profile preview
```

This will create a preview build you can install and test on any Android device!
