// history.js - Display and manage score history

let currentFilter = 'all';
let allHistory = [];

// Field labels mapping
const fieldLabels = {
    '2000m': 'ריצת 2000 מטר',
    '1500m': 'ריצת 1500 מטר',
    '3000m': 'ריצת 3000 מטר',
    '1000m': 'ריצת 1000 מטר',
    '4x10m': 'ריצת 4x10 מטר',
    'pullups': 'מתח',
    'pushups': 'שכיבות סמיכה',
    'seat_ups': 'כפיפות בטן',
    'squats': 'סקוואט',
    'long_jump': 'קפיצה לרוחק',
    'plank': 'פלאנק',
    'beep_test': 'בדיקת ביפ',
    'skipping_rope': 'קפיצה בחבל'
};

const genderLabels = {
    'male': 'בנים',
    'female': 'בנות',
    'boys': 'בנים',
    'girls': 'בנות'
};

const gradeLabels = {
    '9': "כיתה ט'",
    '10': "כיתה י'",
    '11': "כיתה יא'",
    '12': "כיתה יב'"
};

function getGradeLabel(grade) {
    return gradeLabels[grade] || `כיתה ${grade}`;
}

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    setupEventListeners();
});

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderHistory();
        });
    });
    
    // Delete all button
    document.getElementById('deleteAllBtn').addEventListener('click', function() {
        if (allHistory.length === 0) {
            return;
        }
        showConfirmModal(
            'מחיקת כל ההיסטוריה',
            'האם אתה בטוח שברצונך למחוק את כל הציונים? פעולה זו לא ניתנת לביטול.',
            function() {
                ScoreStorage.deleteAll();
                loadHistory();
            }
        );
    });
}

function loadHistory() {
    allHistory = ScoreStorage.getHistory();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    
    // Filter history based on current filter
    let filteredHistory = allHistory;
    if (currentFilter !== 'all') {
        filteredHistory = allHistory.filter(item => item.type === currentFilter);
    }
    
    // Show empty state if no items
    if (filteredHistory.length === 0) {
        historyList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Render history items
    historyList.innerHTML = filteredHistory.map(item => renderHistoryItem(item)).join('');
    
    // Add delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseFloat(this.dataset.id);
            showConfirmModal(
                'מחיקת ציון',
                'האם אתה בטוח שברצונך למחוק ציון זה?',
                function() {
                    ScoreStorage.deleteScore(id);
                    loadHistory();
                }
            );
        });
    });
}

function renderHistoryItem(item) {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const typeLabel = item.type === 'single' ? 'מבחן בודד' : 'ציון סופי';
    const typeClass = item.type === 'single' ? 'type-single' : 'type-final';
    
    let detailsHtml = '';
    
    if (item.type === 'single') {
        detailsHtml = `
            <div class="history-item-details">
                <div class="detail-item">
                    <div class="detail-label">שכבה</div>
                    <div class="detail-value">${getGradeLabel(item.grade)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">מגדר</div>
                    <div class="detail-value">${genderLabels[item.gender] || item.gender}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">מבחן</div>
                    <div class="detail-value">${fieldLabels[item.field] || item.field}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">תוצאה</div>
                    <div class="detail-value">${item.score}</div>
                </div>
            </div>
        `;
    } else {
        // Final grade - show all tests
        const testsHtml = Object.entries(item.tests || {})
            .map(([testType, score]) => `
                <div class="test-result-item">
                    <span>${fieldLabels[testType] || testType}</span>
                    <span><strong>${score}</strong></span>
                </div>
            `).join('');
        
        detailsHtml = `
            <div class="history-item-details">
                <div class="detail-item">
                    <div class="detail-label">שכבה</div>
                    <div class="detail-value">${getGradeLabel(item.grade)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">מגדר</div>
                    <div class="detail-value">${genderLabels[item.gender] || item.gender}</div>
                </div>
            </div>
            <div class="test-results">
                <div class="test-results-title">תוצאות המבחנים:</div>
                ${testsHtml}
            </div>
        `;
    }
    
    return `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-item-type ${typeClass}">${typeLabel}</span>
                <span class="history-item-date">${dateStr}</span>
            </div>
            <div class="history-item-score">${item.finalScore}</div>
            ${detailsHtml}
            <button class="delete-btn" data-id="${item.id}">מחק ציון</button>
        </div>
    `;
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modal.style.display = 'block';
    
    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new listeners
    newConfirmBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        onConfirm();
    });
    
    newCancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close on outside click
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
