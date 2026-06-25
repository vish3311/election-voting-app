# Temple Election Voting App 🗳️

A desktop application for conducting elections at your temple. Members vote using a 6-digit PIN code. Select 13 (or fewer) candidates from the nominations list.

## Features

✅ **PIN-Based Voting** - Each member gets a unique 6-digit PIN  
✅ **Simple Selection** - Choose up to 13 candidates  
✅ **Admin Dashboard** - Manage voters, view results  
✅ **No Internet Required** - Works completely offline on a single computer  
✅ **Secure Storage** - All votes encrypted locally  
✅ **Easy Setup** - Step-by-step installation guide included  

---

## System Requirements

- Windows, Mac, or Linux computer
- No special software needed (we'll install everything)

---

## Quick Start Guide

### Step 1: Download & Install Required Software

You need to install **Node.js** (this is the foundation for our app):

1. Go to: https://nodejs.org/
2. Click the **LTS** (Long Term Support) version - **v20 or latest**
3. Download and install it
4. After installation, restart your computer

**Verify Installation:**
- Open Command Prompt (Windows) or Terminal (Mac/Linux)
- Type: `node --version`
- You should see a version number (e.g., v20.x.x)

---

### Step 2: Get the Application

1. Go to: https://github.com/vish3311/election-voting-app
2. Click **Code** → **Download ZIP**
3. Extract the folder to your computer (e.g., Desktop)
4. Open Command Prompt/Terminal in this folder

**For Windows:**
- Right-click in the folder → "Open PowerShell window here"

**For Mac/Linux:**
- Open Terminal and use: `cd /path/to/election-voting-app`

---

### Step 3: Install Dependencies

In Command Prompt/Terminal, type:
```bash
npm install
```

This downloads all necessary files (takes 2-5 minutes first time). Wait for it to finish.

---

### Step 4: Start the Application

```bash
npm start
```

You should see:
```
Server is running at http://localhost:3000
```

Open your web browser and go to: **http://localhost:3000**

---

## How to Use

### 👤 Admin Setup (Do This First)

1. Click **Admin Panel** tab
2. Enter password: `admin123` and click **Login**
3. Click **Upload Members**
4. Select a CSV file with member names (use template: `members-template.csv`)
5. System generates 6-digit PINs automatically
6. Click **Generate PINs** 
7. Click **Print/Download PINs** to get a list
8. Print and distribute PINs to members

### 📋 Add Nominations

1. In **Admin Panel**, go to **Add Nominations**
2. Enter candidate names (one per line, 26 or more)
3. Click **Save Nominations**

### 🗳️ Voting (Election Day)

1. Click **Voting** tab
2. Member enters their 6-digit PIN
3. Member sees all candidates
4. Select **up to 13 candidates** (checkboxes)
5. Click **Submit Vote**
6. Member cannot vote again with same PIN
7. Next member uses different PIN

### 📊 View Results

1. Click **Results** tab
2. Enter admin password: `admin123`
3. See vote count for each candidate
4. **Top 13 are automatically marked as ELECTED** ✓
5. Click **Export as PDF** or **Export as CSV**

---

## CSV File Format for Members

Create a file named `members.csv` with this format:

```
Name,Email
John Smith,john@example.com
Mary Johnson,mary@example.com
Raj Patel,raj@example.com
Sarah Lee,sarah@example.com
```

**Important Notes:**
- First line must be: `Name,Email`
- Name and Email separated by comma
- Email is optional (can be blank)
- Save as `.csv` file, not `.xlsx`

**A template file is provided: `members-template.csv`**

---

## File Structure

```
election-voting-app/
├── public/
│   ├── index.html              # Main page
│   ├── styles.css              # Styling
│   └── app.js                  # Frontend code
├── server.js                   # Backend server
├── data/
│   ├── members.json            # Member list with PINs (created after upload)
│   ├── votes.json              # Stored votes (created after voting)
│   └── nominations.json        # Stored candidates (created after adding)
├── members-template.csv        # Template for uploading members
├── package.json                # Project dependencies
└── README.md                   # This file
```

---

## Default Admin Password

**Default:** `admin123`

**⚠️ IMPORTANT:** Change this before election day!

To change password:
1. Open `server.js` in a text editor
2. Find the line: `const ADMIN_PASSWORD = 'admin123';`
3. Replace `admin123` with your new password
4. Save and restart the app

---

## Troubleshooting

### ❌ "npm command not found"
- Node.js is not installed
- Download and install from: https://nodejs.org/
- Restart your computer after installation
- Type `node --version` to verify

### ❌ App won't start
- Make sure you're in the correct folder
- Type: `npm start`
- If port 3000 is busy, kill the process or change port in `server.js`

### ❌ Can't upload CSV file
- Make sure CSV format is correct (see template above)
- File must be comma-separated, not tab-separated
- Use a text editor to check, not Excel

### ❌ PINs not generating
- Make sure member names are not empty
- Re-upload the CSV file
- Clear browser cache (Ctrl+Shift+Delete)

### ❌ Voting page shows no candidates
- Add nominations first in Admin Panel
- Click "Add Nominations" and enter candidate names
- Save and refresh the page

### ❌ How to stop the app?
- Press `Ctrl+C` in Command Prompt/Terminal

---

## Data Storage

All data is stored in the `data/` folder:
- `members.json` - Member list with PINs
- `votes.json` - All votes (encrypted)
- `nominations.json` - Candidate list

**Backup these files before election day!**

---

## Security

✅ All votes encrypted and stored locally  
✅ No internet connection needed  
✅ Admin panel password protected  
✅ Each PIN can only be used once  
✅ Votes anonymous (cannot link to members)  
✅ Backup system to recover data  

---

## Running Elections Multiple Times

To run a new election:

1. **Keep existing data:**
   - Just change nominations and reset vote counts
   - In Admin Panel, click "Clear Votes" only

2. **Start completely fresh:**
   - Delete `data/` folder
   - Restart app
   - Upload new member list
   - Add new nominations

---

## Contact & Support

For issues:
1. Check Troubleshooting section above
2. Make sure all files are in correct location
3. Restart the app
4. Delete `node_modules` folder and run `npm install` again

---

## License

Open source - free for nonprofits 🎉

---

**Ready to start?** Follow the Quick Start Guide above!
