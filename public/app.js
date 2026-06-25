const API_URL = 'http://localhost:3000/api';

let currentMemberId = null;
let selectedCandidates = [];
let nominations = [];
let adminPassword = null;

// ==================== TAB SWITCHING ====================
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');

  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');

  // Load data when results tab is clicked
  if (tabName === 'results') {
    loadNominations();
  }
}

// ==================== VOTING FUNCTIONS ====================
async function verifyPIN() {
  const pin = document.getElementById('pinInput').value.trim();
  const errorDiv = document.getElementById('pinError');

  if (!pin || pin.length !== 6) {
    showError(errorDiv, 'Please enter a valid 6-digit PIN');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/voter/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });

    const data = await response.json();

    if (data.success) {
      currentMemberId = data.memberId;
      document.getElementById('voterName').textContent = `Welcome, ${data.memberName}!`;
      document.getElementById('phase1').classList.add('hidden');
      document.getElementById('phase2').classList.remove('hidden');
      loadCandidates();
    } else {
      showError(errorDiv, data.message);
    }
  } catch (error) {
    showError(errorDiv, 'Error verifying PIN: ' + error.message);
  }
}

async function loadCandidates() {
  try {
    const response = await fetch(`${API_URL}/nominations`);
    const data = await response.json();

    if (data.success) {
      nominations = data.nominations;
      const listDiv = document.getElementById('candidatesList');
      listDiv.innerHTML = '';

      nominations.forEach(nom => {
        const item = document.createElement('div');
        item.className = 'candidate-item';
        item.innerHTML = `
          <input type="checkbox" id="cand-${nom.id}" onchange="updateSelectedCount()">
          <label for="cand-${nom.id}">${nom.name}</label>
        `;
        listDiv.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading candidates:', error);
  }
}

function updateSelectedCount() {
  selectedCandidates = [];
  const checkboxes = document.querySelectorAll('.candidate-item input[type="checkbox"]:checked');

  checkboxes.forEach(cb => {
    const id = parseInt(cb.id.split('-')[1]);
    selectedCandidates.push(id);
  });

  document.getElementById('selectedCount').textContent = selectedCandidates.length;

  // Update visual selection
  document.querySelectorAll('.candidate-item').forEach(item => {
    if (item.querySelector('input:checked')) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

async function submitVote() {
  const errorDiv = document.getElementById('voteError');
  const pin = document.getElementById('pinInput').value;

  if (selectedCandidates.length === 0) {
    showError(errorDiv, 'Please select at least 1 candidate');
    return;
  }

  if (selectedCandidates.length > 13) {
    showError(errorDiv, 'Cannot select more than 13 candidates');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/voter/submit-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: pin,
        selectedCandidates: selectedCandidates
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('phase2').classList.add('hidden');
      document.getElementById('phase3').classList.remove('hidden');
    } else {
      showError(errorDiv, data.message);
    }
  } catch (error) {
    showError(errorDiv, 'Error submitting vote: ' + error.message);
  }
}

function cancelVote() {
  if (confirm('Cancel this vote?')) {
    resetVoting();
  }
}

function resetVoting() {
  document.getElementById('pinInput').value = '';
  document.getElementById('pinError').textContent = '';
  document.getElementById('pinError').classList.remove('show');
  document.getElementById('voteError').textContent = '';
  document.getElementById('voteError').classList.remove('show');
  currentMemberId = null;
  selectedCandidates = [];
  document.getElementById('phase1').classList.remove('hidden');
  document.getElementById('phase2').classList.add('hidden');
  document.getElementById('phase3').classList.add('hidden');
  document.getElementById('pinInput').focus();
}

// ==================== ADMIN FUNCTIONS ====================
async function adminLogin() {
  const password = document.getElementById('adminPassword').value;
  const errorDiv = document.getElementById('adminLoginError');

  if (!password) {
    showError(errorDiv, 'Please enter password');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      adminPassword = password;
      document.getElementById('adminLogin').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      loadAdminStats();
    } else {
      showError(errorDiv, 'Invalid password');
    }
  } catch (error) {
    showError(errorDiv, 'Error: ' + error.message);
  }
}

async function loadAdminStats() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    });

    const data = await response.json();

    if (data.success) {
      const stats = data.stats;
      document.getElementById('statTotalMembers').textContent = stats.totalMembers;
      document.getElementById('statMembersVoted').textContent = stats.membersVoted;
      document.getElementById('statVotingPercent').textContent = stats.votingPercentage + '%';
      document.getElementById('statTotalNominations').textContent = stats.totalNominations;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function uploadMembers() {
  const csvData = document.getElementById('csvInput').value;
  const msgDiv = document.getElementById('uploadMsg');

  if (!csvData.trim()) {
    showSuccess(msgDiv, 'Please paste CSV data');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/upload-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, csvData })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(msgDiv, `✓ ${data.message}`);
      document.getElementById('csvInput').value = '';
      loadAdminStats();
    } else {
      showSuccess(msgDiv, '✗ ' + data.message);
    }
  } catch (error) {
    showSuccess(msgDiv, 'Error: ' + error.message);
  }
}

async function exportPINs() {
  try {
    const response = await fetch(`${API_URL}/admin/export-pins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    });

    const data = await response.json();

    if (data.success) {
      downloadFile(data.csv, data.filename, 'text/csv');
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function addNominations() {
  const nominationsText = document.getElementById('nominationsInput').value;
  const msgDiv = document.getElementById('nominationsMsg');

  if (!nominationsText.trim()) {
    showSuccess(msgDiv, 'Please enter nominations');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/add-nominations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, nominations: nominationsText })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(msgDiv, `✓ ${data.message}`);
      document.getElementById('nominationsInput').value = '';
      loadAdminStats();
    } else {
      showSuccess(msgDiv, '✗ ' + data.message);
    }
  } catch (error) {
    showSuccess(msgDiv, 'Error: ' + error.message);
  }
}

async function clearVotes() {
  if (!confirm('This will clear all votes. Are you sure?')) return;

  const msgDiv = document.getElementById('clearMsg');

  try {
    const response = await fetch(`${API_URL}/admin/clear-votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(msgDiv, '✓ ' + data.message);
      loadAdminStats();
    } else {
      showSuccess(msgDiv, '✗ ' + data.message);
    }
  } catch (error) {
    showSuccess(msgDiv, 'Error: ' + error.message);
  }
}

function adminLogout() {
  adminPassword = null;
  document.getElementById('adminPassword').value = '';
  document.getElementById('adminLogin').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
}

// ==================== RESULTS FUNCTIONS ====================
async function viewResults() {
  const password = document.getElementById('resultsPassword').value;
  const errorDiv = document.getElementById('resultsLoginError');

  if (!password) {
    showError(errorDiv, 'Please enter password');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/get-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      displayResults(data.results);
      document.getElementById('resultsLogin').classList.add('hidden');
      document.getElementById('resultsPanel').classList.remove('hidden');
    } else {
      showError(errorDiv, 'Invalid password');
    }
  } catch (error) {
    showError(errorDiv, 'Error: ' + error.message);
  }
}

function displayResults(results) {
  document.getElementById('resultsTotalMembers').textContent = results.totalMembers;
  document.getElementById('resultsTotalVotes').textContent = results.totalVotes;
  document.getElementById('resultsDate').textContent = new Date().toLocaleString();

  const listDiv = document.getElementById('resultsList');
  listDiv.innerHTML = '';

  results.candidates.forEach((cand, index) => {
    const item = document.createElement('div');
    item.className = 'result-item' + (cand.elected ? ' elected' : '');
    item.innerHTML = `
      <div class="result-rank">#${index + 1}</div>
      <div class="result-name">${cand.name}</div>
      <div class="result-votes">${cand.votes} votes</div>
      <div class="result-status ${cand.elected ? 'elected' : 'not-elected'}">
        ${cand.elected ? '✓ ELECTED' : 'NOT ELECTED'}
      </div>
    `;
    listDiv.appendChild(item);
  });
}

async function exportResultsCSV() {
  const password = document.getElementById('resultsPassword').value;

  try {
    const response = await fetch(`${API_URL}/admin/export-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, format: 'csv' })
    });

    const data = await response.json();

    if (data.success) {
      downloadFile(data.data, data.filename, 'text/csv');
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function exportResultsTXT() {
  const password = document.getElementById('resultsPassword').value;

  try {
    const response = await fetch(`${API_URL}/admin/export-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, format: 'txt' })
    });

    const data = await response.json();

    if (data.success) {
      downloadFile(data.data, data.filename, 'text/plain');
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function resultsLogout() {
  document.getElementById('resultsPassword').value = '';
  document.getElementById('resultsLogin').classList.remove('hidden');
  document.getElementById('resultsPanel').classList.add('hidden');
}

async function loadNominations() {
  try {
    const response = await fetch(`${API_URL}/nominations`);
    const data = await response.json();

    if (data.success) {
      nominations = data.nominations;
    }
  } catch (error) {
    console.error('Error loading nominations:', error);
  }
}

// ==================== UTILITY FUNCTIONS ====================
function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function showSuccess(element, message) {
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 3000);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  // Auto-focus on PIN input
  document.getElementById('pinInput').focus();

  // Allow Enter key to submit PIN
  document.getElementById('pinInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      verifyPIN();
    }
  });
});
