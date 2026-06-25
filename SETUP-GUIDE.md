# 🎯 Complete Setup Guide - Temple Election Voting App

## For Non-Programmers

This guide will walk you through every step. Don't worry if you're not technical!

---

## ✅ STEP 1: Install Node.js

### Windows:
1. Go to: **https://nodejs.org/**
2. You'll see two big buttons. Click the **LTS** (Left side) button
3. A file will download (nodejs-v20.x.x.msi)
4. Double-click the file and follow instructions
5. Keep clicking **Next** and accept all defaults
6. **Restart your computer** after installation

### Mac:
1. Go to: **https://nodejs.org/**
2. Click the **LTS** button
3. A file will download (node-v20.x.x.pkg)
4. Double-click and follow instructions
5. Restart your computer

### Linux (Ubuntu/Debian):
Open Terminal and type:
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

---

## ✅ STEP 2: Verify Installation

### Windows:
1. Press **Windows Key + R**
2. Type: `cmd` and press Enter
3. In the window, type: `node --version`
4. You should see a version like: `v20.x.x`

### Mac/Linux:
1. Open **Terminal**
2. Type: `node --version`
3. You should see: `v20.x.x`

If you see an error, restart your computer and try again.

---

## ✅ STEP 3: Download the Voting App

1. Go to: **https://github.com/vish3311/election-voting-app**
2. Click the green **Code** button
3. Select **Download ZIP**
4. Save to your computer (e.g., Desktop)
5. Find the downloaded file and extract/unzip it
   - **Windows:** Right-click → Extract All
   - **Mac:** Double-click
   - **Linux:** Right-click → Extract

---

## ✅ STEP 4: Open the Folder in Command Line

### Windows:
1. Open the extracted `election-voting-app` folder
2. Click the **Address Bar** at the top
3. Type: `cmd` and press Enter
4. A Command Prompt window will open **in that folder**

### Mac:
1. Open **Terminal**
2. Type: `cd ` (with a space)
3. Drag the `election-voting-app` folder into Terminal window
4. Press Enter

### Linux:
1. Open Terminal
2. Type: `cd ~/Desktop/election-voting-app` (adjust path if needed)
3. Press Enter

---

## ✅ STEP 5: Install Dependencies

In the Command Prompt/Terminal window, type:
```bash
npm install
```

**This will take 2-5 minutes.** You'll see lots of text appearing. Wait until you see:
```
added X packages
```

Do NOT close the window while it's installing.

---

## ✅ STEP 6: Start the App

In the same Command Prompt/Terminal, type:
```bash
npm start
```

You should see:
```
Server is running at http://localhost:3000
```

A browser window should open automatically, or go to: **http://localhost:3000**

---

## 📋 STEP 7: Upload Members (Election Admin)

### Prepare your member list:

1. Open **Notepad** (Windows) or **Text Editor** (Mac/Linux)
2. Create a file with this format:

```
Name,Email
John Smith,john@example.com
Mary Johnson,mary@example.com
Raj Patel,raj@example.com
```

**Important:**
- First line MUST be: `Name,Email`
- One member per line
- Separated by comma
- Email is optional (can leave blank)

3. Save as: `members.csv` (important: use .csv extension)

### Upload in the App:

1. Click **Admin Panel** tab
2. Enter password: `admin123`
3. Click **Login**
4. In "Upload Member List" section:
   - Copy and paste your CSV data into the text box
   - Click **Upload Members**
5. You should see: "✓ X members added"
6. Click **Download PINs (CSV)** to get the PIN list
7. **Print the PINs** and distribute to members

---

## 📝 STEP 8: Add Nominations

1. In **Admin Panel**, go to "Add Nominations" section
2. Enter candidate names, one per line:
```
John Smith
Mary Johnson
Raj Patel
Sarah Lee
Michael Brown
... (need at least 13)
```
3. Click **Add Nominations**
4. You should see: "✓ X nominations added"

---

## 🗳️ STEP 9: Start Voting (Election Day)

1. Have the app running on one computer at your temple
2. Members come up with their PIN
3. Click **Voting** tab
4. Member enters their 6-digit PIN
5. Member selects up to 13 candidates (checkboxes)
6. Click **Submit Vote**
7. Vote confirmed! ✓
8. Next member uses their PIN

---

## 📊 STEP 10: View Results (After Voting)

1. Click **Results** tab
2. Enter admin password: `admin123`
3. See all candidates ranked by votes
4. **Top 13 marked as ELECTED** ✓
5. Click **Export as CSV** or **Export as TXT** to save results

---

## 🔐 Change Admin Password (Recommended)

**Before election day:**

1. Open folder `election-voting-app`
2. Right-click on `server.js` → Open with Text Editor
3. Find this line (around line 7):
```javascript
const ADMIN_PASSWORD = 'admin123';
```
4. Change `admin123` to your new password (use quotes):
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```
5. Save the file
6. Stop the app (press Ctrl+C in Command Prompt)
7. Run again: `npm start`
8. Now use your new password

---

## ⚠️ Troubleshooting

### App won't start
- Make sure Node.js is installed: `node --version`
- Make sure you're in the correct folder in Command Prompt
- Close and restart Command Prompt

### Can't upload CSV
- Make sure first line is: `Name,Email`
- Make sure file is `.csv`, not `.xlsx` or `.txt`
- Use comma to separate Name and Email

### "Port 3000 already in use"
- Another app is using port 3000
- Press Ctrl+C to stop current app
- Wait 5 seconds
- Run `npm start` again

### Voters can't see candidates
- Make sure you added nominations first
- Add at least 13 candidates
- Refresh the voting page

### How to Stop the App
- Press **Ctrl+C** in Command Prompt/Terminal
- The browser will stop responding, but that's OK

---

## 📁 File Structure

What each file does:

```
election-voting-app/
├── server.js           → The brain of the app (don't edit unless changing password)
├── package.json        → List of required software
├── data/               → Where votes and member info are stored
│   ├── members.json    → Member list with PINs
│   ├── votes.json      → All votes (encrypted)
│   └── nominations.json → Candidate list
├── public/             → Website files
│   ├── index.html      → Main page
│   ├── app.js          → How the page works
│   └── styles.css      → How it looks
└── README.md           → Instructions
```

---

## 💾 Backup Your Data

**Important:** Keep backups of your voting data!

Before deleting anything, copy the `data/` folder:

### Windows:
1. In `election-voting-app` folder
2. Right-click `data/` folder
3. Click **Copy**
4. Paste it somewhere else (e.g., Another disk, USB drive)

### Mac/Linux:
```bash
cp -r data/ backup_data/
```

---

## 🎉 You're Ready!

You now have a working election voting system for your temple. 

**Questions? Check the main README.md file or the Troubleshooting section above.**

**Good luck with your election!** 🗳️✨
