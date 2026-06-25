const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Admin Password - CHANGE THIS!
const ADMIN_PASSWORD = 'admin123';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Data directory
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(dataDir);

const membersFile = path.join(dataDir, 'members.json');
const votesFile = path.join(dataDir, 'votes.json');
const nominationsFile = path.join(dataDir, 'nominations.json');

// Helper functions
function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function encryptVote(vote) {
  const cipher = crypto.createCipher('aes-256-cbc', 'election-secret-key');
  let encrypted = cipher.update(JSON.stringify(vote), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptVote(encrypted) {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', 'election-secret-key');
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

function loadMembers() {
  if (fs.existsSync(membersFile)) {
    return fs.readJsonSync(membersFile);
  }
  return [];
}

function saveMembers(data) {
  fs.writeJsonSync(membersFile, data, { spaces: 2 });
}

function loadVotes() {
  if (fs.existsSync(votesFile)) {
    return fs.readJsonSync(votesFile);
  }
  return [];
}

function saveVotes(data) {
  fs.writeJsonSync(votesFile, data, { spaces: 2 });
}

function loadNominations() {
  if (fs.existsSync(nominationsFile)) {
    return fs.readJsonSync(nominationsFile);
  }
  return [];
}

function saveNominations(data) {
  fs.writeJsonSync(nominationsFile, data, { spaces: 2 });
}

// API Routes

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Upload Members (CSV)
app.post('/api/admin/upload-members', (req, res) => {
  const { password, csvData } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  try {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.json({ success: false, message: 'CSV must have at least 2 lines (header + data)' });
    }

    const members = [];
    for (let i = 1; i < lines.length; i++) {
      const [name, email] = lines[i].split(',').map(s => s.trim());
      if (name) {
        members.push({
          id: uuidv4(),
          name: name,
          email: email || '',
          pin: generatePIN(),
          hasVoted: false
        });
      }
    }

    saveMembers(members);
    res.json({ success: true, message: `${members.length} members added`, count: members.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing CSV: ' + error.message });
  }
});

// Get Members (Admin)
app.post('/api/admin/get-members', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const members = loadMembers();
  res.json({ success: true, members });
});

// Export Members with PINs (Admin)
app.post('/api/admin/export-pins', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const members = loadMembers();
  let csv = 'Name,PIN\n';
  members.forEach(m => {
    csv += `"${m.name}",${m.pin}\n`;
  });

  res.json({ success: true, csv, filename: 'member-pins.csv' });
});

// Add Nominations (Admin)
app.post('/api/admin/add-nominations', (req, res) => {
  const { password, nominations } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  try {
    const nomArray = nominations
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map((name, index) => ({
        id: index,
        name: name,
        votes: 0
      }));

    if (nomArray.length < 13) {
      return res.json({ success: false, message: 'Need at least 13 nominations' });
    }

    saveNominations(nomArray);
    res.json({ success: true, message: `${nomArray.length} nominations added`, count: nomArray.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error: ' + error.message });
  }
});

// Get Nominations (Public)
app.get('/api/nominations', (req, res) => {
  const nominations = loadNominations();
  res.json({ success: true, nominations });
});

// Verify PIN (Public)
app.post('/api/voter/verify-pin', (req, res) => {
  const { pin } = req.body;
  const members = loadMembers();

  const member = members.find(m => m.pin === pin);

  if (!member) {
    return res.status(401).json({ success: false, message: 'Invalid PIN' });
  }

  if (member.hasVoted) {
    return res.status(403).json({ success: false, message: 'This PIN has already been used' });
  }

  res.json({ success: true, message: 'PIN verified', memberId: member.id, memberName: member.name });
});

// Submit Vote (Public)
app.post('/api/voter/submit-vote', (req, res) => {
  const { pin, selectedCandidates } = req.body;
  const members = loadMembers();

  const member = members.find(m => m.pin === pin);

  if (!member) {
    return res.status(401).json({ success: false, message: 'Invalid PIN' });
  }

  if (member.hasVoted) {
    return res.status(403).json({ success: false, message: 'This PIN has already been used' });
  }

  if (selectedCandidates.length === 0 || selectedCandidates.length > 13) {
    return res.json({ success: false, message: 'Select 1-13 candidates' });
  }

  try {
    // Mark member as voted
    member.hasVoted = true;
    saveMembers(members);

    // Save vote
    const votes = loadVotes();
    const vote = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      candidates: selectedCandidates,
      encrypted: encryptVote({ count: selectedCandidates.length, timestamp: new Date().toISOString() })
    };
    votes.push(vote);
    saveVotes(votes);

    // Update nominations with vote counts
    const nominations = loadNominations();
    nominations.forEach(nom => {
      if (selectedCandidates.includes(nom.id)) {
        nom.votes += 1;
      }
    });
    saveNominations(nominations);

    res.json({ success: true, message: 'Vote submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting vote: ' + error.message });
  }
});

// Get Results (Admin)
app.post('/api/admin/get-results', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const nominations = loadNominations();
  const votes = loadVotes();
  const members = loadMembers();

  const sorted = [...nominations].sort((a, b) => b.votes - a.votes);
  const elected = sorted.slice(0, 13).map(n => n.id);

  const results = {
    totalMembers: members.length,
    totalVotes: votes.length,
    candidates: sorted.map(n => ({
      ...n,
      elected: elected.includes(n.id)
    }))
  };

  res.json({ success: true, results });
});

// Export Results (Admin)
app.post('/api/admin/export-results', (req, res) => {
  const { password, format } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const nominations = loadNominations();
  const votes = loadVotes();
  const members = loadMembers();

  const sorted = [...nominations].sort((a, b) => b.votes - a.votes);
  const elected = sorted.slice(0, 13).map(n => n.id);

  if (format === 'csv') {
    let csv = 'Rank,Candidate Name,Votes,Status\n';
    sorted.forEach((nom, index) => {
      const status = elected.includes(nom.id) ? 'ELECTED' : 'NOT ELECTED';
      csv += `${index + 1},"${nom.name}",${nom.votes},${status}\n`;
    });
    csv += `\nTotal Members: ${members.length}\n`;
    csv += `Total Votes Cast: ${votes.length}\n`;
    csv += `Election Date: ${new Date().toLocaleString()}\n`;

    res.json({ success: true, data: csv, filename: 'election-results.csv' });
  } else {
    let txt = '====== ELECTION RESULTS ======\n\n';
    txt += `Total Members: ${members.length}\n`;
    txt += `Total Votes Cast: ${votes.length}\n`;
    txt += `Election Date: ${new Date().toLocaleString()}\n\n`;
    txt += '====== ELECTED (Top 13) ======\n\n';
    sorted.slice(0, 13).forEach((nom, index) => {
      txt += `${index + 1}. ${nom.name} - ${nom.votes} votes\n`;
    });
    txt += '\n====== NOT ELECTED ======\n\n';
    sorted.slice(13).forEach((nom, index) => {
      txt += `${index + 14}. ${nom.name} - ${nom.votes} votes\n`;
    });

    res.json({ success: true, data: txt, filename: 'election-results.txt' });
  }
});

// Clear Votes (Admin) - for running new election
app.post('/api/admin/clear-votes', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  try {
    // Reset member vote status
    const members = loadMembers();
    members.forEach(m => m.hasVoted = false);
    saveMembers(members);

    // Clear votes
    saveVotes([]);

    // Reset vote counts in nominations
    const nominations = loadNominations();
    nominations.forEach(n => n.votes = 0);
    saveNominations(nominations);

    res.json({ success: true, message: 'All votes cleared. Ready for new election.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error: ' + error.message });
  }
});

// Get Admin Stats
app.post('/api/admin/stats', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const members = loadMembers();
  const votes = loadVotes();
  const nominations = loadNominations();

  const stats = {
    totalMembers: members.length,
    membersVoted: members.filter(m => m.hasVoted).length,
    membersNotVoted: members.filter(m => !m.hasVoted).length,
    totalNominations: nominations.length,
    totalVotes: votes.length,
    votingPercentage: members.length > 0 ? Math.round((members.filter(m => m.hasVoted).length / members.length) * 100) : 0
  };

  res.json({ success: true, stats });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n`);
  console.log(`╔════════════════════════════════════════╗`);
  console.log(`║  Election Voting App Running          ║`);
  console.log(`║  Open: http://localhost:${PORT}        ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});
