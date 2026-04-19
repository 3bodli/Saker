// ========== ملف الوظائف المشتركة لجميع الصفحات ==========
// ضع هذا الملف في نفس مجلد ملفات HTML وقم بربطه بـ <script src="script.js"></script>

// ========== إعدادات عامة ==========
const API_URL = 'https://saker2-production.up.railway.app'; // رابط السيرفر

// ========== التحقق من تسجيل الدخول ==========
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ========== التحقق من صلاحية المشرف ==========
function checkAdmin() {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// ========== جلب التوكن ==========
function getToken() {
    return localStorage.getItem('token');
}

// ========== جلب اسم المستخدم ==========
function getUsername() {
    return localStorage.getItem('username');
}

// ========== جلب دور المستخدم ==========
function getUserRole() {
    return localStorage.getItem('role');
}

// ========== تسجيل الخروج ==========
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// ========== عرض رسالة (متجددة) ==========
function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = text;
    element.className = `message show ${type}`;
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// ========== إظهار رسالة خطأ ==========
function showError(elementId, text) {
    showMessage(elementId, `❌ ${text}`, 'error');
}

// ========== إظهار رسالة نجاح ==========
function showSuccess(elementId, text) {
    showMessage(elementId, `✅ ${text}`, 'success');
}

// ========== إظهار رسالة معلومات ==========
function showInfo(elementId, text) {
    showMessage(elementId, `ℹ️ ${text}`, 'info');
}

// ========== طلب API (GET) ==========
async function apiGet(endpoint) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });
    return await response.json();
}

// ========== طلب API (POST) ==========
async function apiPost(endpoint, data) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// ========== طلب API (PUT) ==========
async function apiPut(endpoint, data) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// ========== تنسيق التاريخ ==========
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== تنسيق المبلغ ==========
function formatAmount(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

// ========== عرض حالة الطلب ==========
function getStatusBadge(status) {
    const statusMap = {
        'pending': '<span class="status-pending">⏳ قيد الانتظار</span>',
        'accepted': '<span class="status-accepted">✅ مقبول</span>',
        'rejected': '<span class="status-rejected">❌ مرفوض</span>'
    };
    return statusMap[status] || '<span class="status-pending">⏳ قيد الانتظار</span>';
}

// ========== تحميل شريط المستخدم (لصفحة الداشبورد) ==========
function loadUserBar() {
    const username = getUsername();
    const userBar = document.getElementById('userBar');
    if (userBar) {
        userBar.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                    <h3>مرحباً ${username || 'مستخدم'}</h3>
                    <p>${getUserRole() === 'admin' ? 'حساب مشرف ⭐' : 'حساب مميز'}</p>
                </div>
            </div>
            <button class="logout-btn" onclick="logout()">🚪 تسجيل خروج</button>
        `;
    }
}

// ========== جلب قائمة الشركات ==========
async function loadCompanies() {
    try {
        const data = await apiGet('/api/companies');
        return data.companies || [];
    } catch (error) {
        console.error('خطأ في جلب الشركات:', error);
        return [];
    }
}

// ========== جلب طلبات التحويل (للمشرف) ==========
async function loadTransfers() {
    try {
        const data = await apiGet('/api/admin/transfers');
        return data.transfers || [];
    } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
        return [];
    }
}

// ========== تحديث حالة الطلب ==========
async function updateTransferStatus(id, status) {
    try {
        const data = await apiPut(`/api/admin/update-transfer/${id}`, { status });
        return data;
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        return { success: false, error: error.message };
    }
}

// ========== إنشاء طلب دفع ==========
async function createPayment(amount) {
    try {
        const data = await apiPost('/api/create-payment', { amount });
        return data;
    } catch (error) {
        console.error('خطأ في إنشاء الدفع:', error);
        return { success: false, error: error.message };
    }
}

// ========== حساب الرسوم ==========
function calculateFee(amount, feePercent) {
    const fee = amount * (feePercent / 100);
    const finalAmount = amount - fee;
    return {
        fee: fee.toFixed(2),
        finalAmount: finalAmount.toFixed(2)
    };
}

// ========== عرض الرسوم في الصفحة ==========
function displayFeeInfo(amount, feePercent, elementId) {
    const { fee, finalAmount } = calculateFee(amount, feePercent);
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div>💵 المبلغ المرسل: $${amount}</div>
            <div>📉 رسوم ${feePercent}%: $${fee}</div>
            <div class="final-amount">💰 سيتم استلام: $${finalAmount}</div>
        `;
    }
}

// ========== منع الدخول بدون توكن ==========
function redirectIfNotLoggedIn() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

// ========== منع دخول المستخدم العادي للوحة المشرف ==========
function redirectIfNotAdmin() {
    if (getUserRole() !== 'admin') {
        window.location.href = 'dashboard.html';
    }
}

// ========== حفظ بيانات الطلب الحالي ==========
function saveCurrentTransfer(transferId, amount, finalAmount) {
    localStorage.setItem('currentTransferId', transferId);
    localStorage.setItem('currentAmount', amount);
    localStorage.setItem('finalAmount', finalAmount);
}

// ========== جلب بيانات الطلب الحالي ==========
function getCurrentTransfer() {
    return {
        transferId: localStorage.getItem('currentTransferId'),
        amount: localStorage.getItem('currentAmount'),
        finalAmount: localStorage.getItem('finalAmount')
    };
}

// ========== مسح بيانات الطلب الحالي ==========
function clearCurrentTransfer() {
    localStorage.removeItem('currentTransferId');
    localStorage.removeItem('currentAmount');
    localStorage.removeItem('finalAmount');
}

// ========== إظهار/إخفاء التحميل ==========
function showLoading(buttonId, text = '⏳ جاري...') {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.originalText = btn.innerHTML;
        btn.innerHTML = text;
        btn.disabled = true;
        btn.classList.add('loading');
    }
}

function hideLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.innerHTML = btn.originalText || 'إتمام';
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// ========== تحديث الإحصائيات (للمشرف) ==========
async function updateStats(statsElementId) {
    try {
        const data = await apiGet('/api/admin/stats');
        if (data.success && data.stats) {
            const stats = data.stats;
            const element = document.getElementById(statsElementId);
            if (element) {
                element.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-number">${stats.total}</div>
                        <div>إجمالي الطلبات</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.pending}</div>
                        <div>قيد الانتظار</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.accepted}</div>
                        <div>مقبولة</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$${stats.totalAmount}</div>
                        <div>إجمالي المبالغ</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

// ========== تنبيه للمستخدم ==========
function alertUser(message, type = 'info') {
    // يمكن استبدالها بـ SweetAlert أو أي مكتبة تنبيهات
    if (type === 'error') {
        alert('❌ ' + message);
    } else if (type === 'success') {
        alert('✅ ' + message);
    } else {
        alert('ℹ️ ' + message);
    }
}

// ========== نسخ نص إلى الحافظة ==========
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alertUser('تم النسخ إلى الحافظة', 'success');
}

// ========== تحميل الصفحة (تهيئة عامة) ==========
document.addEventListener('DOMContentLoaded', function() {
    // تحميل شريط المستخدم إذا كان موجوداً
    if (document.getElementById('userBar')) {
        loadUserBar();
    }
    
    // إضافة حدث لجميع أزرار الخروج
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.onclick = logout;
    });
});
