// ====================== ملف التطبيق الرئيسي app.js ======================

var DB_KEY = "tasawuq_plus_users_db_v2";
var CURRENT_USER_KEY = "tasawuq_plus_current_user_phone";
var PENDING_REQ_KEY = "tasawuq_plus_pending_requests";
var WITHDRAW_REQ_KEY = "tasawuq_plus_withdraw_requests";

var usersDB = {};
var pendingRequests = {};
var withdrawRequests = [];

function reloadDataFromStorage() {
    try {
        var dbData = localStorage.getItem(DB_KEY);
        if (dbData) usersDB = JSON.parse(dbData);

        var pendingData = localStorage.getItem(PENDING_REQ_KEY);
        if (pendingData) pendingRequests = JSON.parse(pendingData);

        var withdrawData = localStorage.getItem(WITHDRAW_REQ_KEY);
        if (withdrawData) withdrawRequests = JSON.parse(withdrawData);
    } catch (e) {
        console.error("Error loading data", e);
    }
}

function saveAllData() {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(usersDB));
        localStorage.setItem(PENDING_REQ_KEY, JSON.stringify(pendingRequests));
        localStorage.setItem(WITHDRAW_REQ_KEY, JSON.stringify(withdrawRequests));
    } catch (e) {
        console.error("Error saving data", e);
    }
}

function getCurrentUserPhone() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    var phone = getCurrentUserPhone();
    if (phone && usersDB[phone]) {
        return usersDB[phone];
    }
    return null;
}

// ====================== النظام التفاعلي للتنبيهات ======================
function showCustomAlert(msg) {
    var modal = document.getElementById("customAlertModal");
    var msgEl = document.getElementById("customAlertMessage");
    if (modal && msgEl) {
        msgEl.innerText = msg;
        modal.classList.remove("hidden");
    } else {
        alert(msg);
    }
}

function closeCustomAlert() {
    var modal = document.getElementById("customAlertModal");
    if (modal) modal.classList.add("hidden");
}

window.alert = function(msg) {
    showCustomAlert(msg);
};

// ====================== المصادقة والدخول ======================
function showLogin() {
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.add("hidden");
    document.getElementById("bottomNav").classList.add("hidden");
}

function showRegister() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.remove("hidden");
    document.getElementById("appScreen").classList.add("hidden");
    document.getElementById("bottomNav").classList.add("hidden");
}

function showApp() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");
    document.getElementById("bottomNav").classList.remove("hidden");
    refreshUI();
}

function executeRegister() {
    reloadDataFromStorage();
    var name = document.getElementById("regName").value.trim();
    var phone = document.getElementById("regPhone").value.trim();
    var password = document.getElementById("regPassword").value.trim();

    if (!name || !phone || !password) {
        alert("يرجى ملء جميع الحقول المطلوبة لإنشاء الحساب!");
        return;
    }

    if (usersDB[phone]) {
        alert("رقم الموبايل مسجل مسبقاً! يرجى تسجيل الدخول.");
        return;
    }

    var isFirst = Object.keys(usersDB).length === 0;

    usersDB[phone] = {
        name: name,
        phone: phone,
        password: password,
        balance: 0,
        deposit: 0,
        profit: 50,
        refBonusEarned: 0,
        referrals: [],
        subscribedPackage: null,
        isAdmin: isFirst,
        avatar: ""
    };

    saveAllData();
    localStorage.setItem(CURRENT_USER_KEY, phone);
    alert("تم إنشاء الحساب بنجاح وتم منحك 50 جنيه مكافأة ترحيبية!");
    showApp();
}

function executeLogin() {
    reloadDataFromStorage();
    var phone = document.getElementById("loginPhone").value.trim();
    var password = document.getElementById("loginPassword").value.trim();

    if (!phone || !password) {
        alert("يرجى إدخال رقم الموبايل وكلمة السر!");
        return;
    }

    if (phone === "01032315526" && password === "asmael") {
        if (!usersDB[phone]) {
            usersDB[phone] = {
                name: "إسماعيل بالصاوي",
                phone: phone,
                password: password,
                balance: 0,
                deposit: 0,
                profit: 100,
                refBonusEarned: 0,
                referrals: [],
                subscribedPackage: null,
                isAdmin: true,
                avatar: ""
            };
        } else {
            usersDB[phone].isAdmin = true;
            usersDB[phone].password = password;
        }
        saveAllData();
        localStorage.setItem(CURRENT_USER_KEY, phone);
        showApp();
        return;
    }

    if (!usersDB[phone] || usersDB[phone].password !== password) {
        alert("رقم الموبايل أو كلمة السر غير صحيحة!");
        return;
    }

    localStorage.setItem(CURRENT_USER_KEY, phone);
    showApp();
}

function handleLogout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    showLogin();
}

// ====================== التبويبات واجهة المستخدم ======================
function switchTab(tabId) {
    var tabs = document.querySelectorAll(".tab-content");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.add("hidden");
    }

    var selectedTab = document.getElementById("tab" + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (selectedTab) selectedTab.classList.remove("hidden");

    var navBtns = document.querySelectorAll(".nav-btn");
    for (var j = 0; j < navBtns.length; j++) {
        navBtns[j].classList.remove("active");
    }
    event.currentTarget.classList.add("active");

    if (tabId === 'history') {
        renderUserWithdrawHistory();
    } else if (tabId === 'admin') {
        if (typeof renderAdminPanel === 'function') renderAdminPanel();
    }
}

function refreshUI() {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) {
        showLogin();
        return;
    }

    document.getElementById("displayNameHeader").innerText = user.name;
    document.getElementById("displayPhone").innerText = user.phone;
    document.getElementById("depositVal").innerText = (user.deposit || 0).toFixed(2);
    document.getElementById("balanceVal").innerText = (user.balance || 0).toFixed(2);
    document.getElementById("profitVal").innerText = (user.profit || 0).toFixed(2);

    document.getElementById("accountName").innerText = user.name;
    document.getElementById("accountPhone").innerText = user.phone;
    document.getElementById("accountDeposit").innerText = (user.deposit || 0).toFixed(2) + " EGP";
    document.getElementById("accountBalance").innerText = (user.balance || 0).toFixed(2) + " EGP";
    document.getElementById("accountPackage").innerText = user.subscribedPackage || "غير مشترك";

    var vipBadge = document.getElementById("vipBadge");
    var vipBadgeText = document.getElementById("vipBadgeText");
    if (user.subscribedPackage) {
        vipBadge.classList.remove("hidden");
        vipBadgeText.innerText = user.subscribedPackage;
    } else {
        vipBadge.classList.add("hidden");
    }

    var adminNavBtn = document.getElementById("adminNavBtn");
    if (user.isAdmin) {
        adminNavBtn.classList.remove("hidden");
    } else {
        adminNavBtn.classList.add("hidden");
    }

    var avatarImgs = [document.getElementById("userAvatarImg"), document.getElementById("headerAvatarImg")];
    var avatarIcons = [null, document.getElementById("headerAvatarIcon")];
    for (var i = 0; i < avatarImgs.length; i++) {
        if (user.avatar) {
            avatarImgs[i].src = user.avatar;
            avatarImgs[i].classList.remove("hidden");
            if (avatarIcons[i]) avatarIcons[i].classList.add("hidden");
        } else {
            avatarImgs[i].classList.add("hidden");
            if (avatarIcons[i]) avatarIcons[i].classList.remove("hidden");
        }
    }

    var refLink = window.location.origin + window.location.pathname + "?ref=" + user.phone;
    var refInput = document.getElementById("referralLinkInput");
    if (refInput) refInput.value = refLink;
    
    var refCountDisplay = document.getElementById("refCountDisplay");
    if (refCountDisplay) refCountDisplay.innerText = user.referrals ? user.referrals.length : 0;

    var refBonusDisplay = document.getElementById("refBonusDisplay");
    if (refBonusDisplay) refBonusDisplay.innerText = (user.refBonusEarned || 0).toFixed(2) + " EGP";

    var pendingBox = document.getElementById("pendingAlertBox");
    if (pendingRequests[user.phone]) {
        if (pendingBox) pendingBox.classList.remove("hidden");
        document.getElementById("pendingPkgName").innerText = pendingRequests[user.phone].packageName;
        document.getElementById("pendingPkgPrice").innerText = pendingRequests[user.phone].price + " EGP";
    } else {
        if (pendingBox) pendingBox.classList.add("hidden");
    }
}

// ====================== الباقات والاشتراكات ======================
function openPackagesModal() {
    document.getElementById("packagesModal").classList.remove("hidden");
}

function closePackagesModal() {
    document.getElementById("packagesModal").classList.add("hidden");
}

function openPackageOptionsModal() {
    document.getElementById("packageOptionsModal").classList.remove("hidden");
}

function closePackageOptionsModal() {
    document.getElementById("packageOptionsModal").classList.add("hidden");
}

function subscribeDirectPackage(price) {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    if (pendingRequests[user.phone]) {
        alert("لديك طلب تفعيل باقة قيد المراجعة بالفعل!");
        closePackagesModal();
        return;
    }

    var packageName = "باقة " + price + " EGP";

    pendingRequests[user.phone] = {
        packageName: packageName,
        price: price,
        date: new Date().toISOString().split('T')[0]
    };

    saveAllData();
    closePackagesModal();
    refreshUI();
    alert("تم إرسال طلب تفعيل " + packageName + " إلى الإدارة بنجاح!");
}

function refundDepositToBalance() {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    if (!user.subscribedPackage || user.deposit <= 0) {
        alert("لا توجد خطة ترويج نشطة حالياً لاسترجاعها!");
        closePackageOptionsModal();
        return;
    }

    user.balance += user.deposit;
    user.deposit = 0;
    user.subscribedPackage = null;

    saveAllData();
    closePackageOptionsModal();
    refreshUI();
    alert("تم إلغاء الباقة وإعادة قيمة خطة الترويج إلى رصيدك المتاح بنجاح!");
}

// ====================== سحب العمولات ======================
var selectedWallet = "";
var selectedWithdrawAmount = 0;

function openWithdrawModal() {
    var user = getCurrentUser();
    if (!user) return;

    document.getElementById("withdrawAvailableProfit").innerText = (user.profit || 0).toFixed(2) + " EGP";
    
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours();
    
    var isWithdrawAllowed = (day === 0 || day === 3) && (hour >= 10 && hour < 24);
    
    var timeAlert = document.getElementById("withdrawTimeAlertBox");
    var activeSec = document.getElementById("withdrawActiveSection");
    var lockedSec = document.getElementById("withdrawLockedSection");

    if (isWithdrawAllowed) {
        timeAlert.style.background = "rgba(34, 197, 94, 0.15)";
        timeAlert.style.color = "var(--neon-green)";
        timeAlert.style.border = "1px solid var(--neon-green)";
        timeAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> باب سحب العمولات مفتوح الآن (الأحد والأربعاء من 10 ص حتى منتصف الليل)';
        activeSec.classList.remove("hidden");
        lockedSec.classList.add("hidden");
    } else {
        timeAlert.style.background = "rgba(239, 68, 68, 0.15)";
        timeAlert.style.color = "var(--danger)";
        timeAlert.style.border = "1px solid var(--danger)";
        timeAlert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> باب السحب مغلق حالياً. مواعيد السحب: الأحد والأربعاء من 10 ص حتى منتصف الليل';
        activeSec.classList.add("hidden");
        lockedSec.classList.remove("hidden");
    }

    document.getElementById("withdrawModal").classList.remove("hidden");
}

function closeWithdrawModal() {
    document.getElementById("withdrawModal").classList.add("hidden");
}

function selectWalletType(walletName, el) {
    selectedWallet = walletName;
    var cards = document.querySelectorAll(".wallet-logo-card");
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.borderColor = "#23304d";
    }
    el.style.borderColor = "var(--neon-green)";
}

function setWithdrawAmount(amt) {
    selectedWithdrawAmount = amt;
    document.getElementById("withdrawAmountInput").value = amt;
}

function submitWithdrawRequest() {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    var walletNum = document.getElementById("withdrawWalletNumber").value.trim();
    var manualAmt = parseFloat(document.getElementById("withdrawAmountInput").value);
    var finalAmt = !isNaN(manualAmt) && manualAmt > 0 ? manualAmt : selectedWithdrawAmount;

    if (!selectedWallet) {
        alert("يرجى اختيار شبكة المحفظة الإلكترونية!");
        return;
    }

    if (!walletNum) {
        alert("يرجى إدخال رقم المحفظة الإلكترونية!");
        return;
    }

    if (finalAmt < 250) {
        alert("عذراً، الحد الأدنى لسحب العمولات هو 250 EGP!");
        return;
    }

    if ((user.profit || 0) < finalAmt) {
        alert("رصيد العمولات المتاح لديك لا يكفي لسحب هذا المبلغ!");
        return;
    }

    withdrawRequests.push({
        id: Date.now(),
        phone: user.phone,
        name: user.name,
        wallet: selectedWallet + " (" + walletNum + ")",
        amount: finalAmt,
        date: new Date().toISOString().split('T')[0],
        status: "pending"
    });

    saveAllData();
    closeWithdrawModal();
    alert("تم تقديم طلب سحب العمولات بنجاح وسيتم مراجعته وتحويله قريباً!");
}

function renderUserWithdrawHistory() {
    var container = document.getElementById("userFullWithdrawHistoryTable");
    if (!container) return;
    
    var parent = container.parentElement;
    if (parent && parent.tagName === 'TABLE') {
        var wrapper = parent.parentElement;
        parent.remove();
        var newDiv = document.createElement('div');
        newDiv.id = "userFullWithdrawHistoryTable";
        newDiv.style.cssText = "display: flex; flex-direction: column; gap: 12px;";
        wrapper.appendChild(newDiv);
        container = newDiv;
    }

    var currentUser = getCurrentUser();
    if (!currentUser) return;

    var userWithdraws = withdrawRequests.filter(function(r) {
        return r.phone === currentUser.phone;
    });

    if (userWithdraws.length === 0) {
        container.innerHTML = "<div style='text-align:center; padding:20px; color:var(--text-muted); background:#090d16; border-radius:12px; border:1px solid #23304d;'>لا توجد عمليات سحب سابقة حتى الآن</div>";
        return;
    }

    var html = "";
    userWithdraws.forEach(function(req) {
        var statusColor = req.status === 'approved' ? 'var(--neon-green)' : (req.status === 'rejected' ? 'var(--danger)' : 'var(--accent)');
        var statusText = req.status === 'approved' ? 'تم استلام المبلغ ✅' : (req.status === 'rejected' ? 'مرفوض ❌' : 'قيد المراجعة ⏳');

        html += `
            <div style="background: linear-gradient(135deg, #090d16 0%, #111827 100%); border: 1px solid #23304d; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-wallet" style="color: var(--neon-green); font-size: 16px;"></i>
                        <span style="font-weight: bold; color: white; font-size: 14px;">${req.wallet}</span>
                    </div>
                    <div style="font-weight: bold; color: var(--neon-green); font-size: 15px;">EGP ${req.amount.toFixed(2)}</div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${req.date}</span>
                    <span style="color: ${statusColor}; font-weight: bold; background: rgba(255,255,255,0.03); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">${statusText}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ====================== المهام اليومية ======================
function doTask(taskNo) {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    if (!user.subscribedPackage) {
        alert("يجب عليك تفعيل باقة تسويق أولاً لكي تتمكن من تنفيذ المهام وكسب العمولات!");
        return;
    }

    var btn = document.getElementById("taskBtn" + taskNo);
    if (btn) {
        btn.innerText = "تم التنفيذ بنجاح ✅";
        btn.style.background = "#22c55e";
        btn.style.color = "black";
        btn.disabled = true;
    }

    var earned = 15;
    if (user.subscribedPackage.indexOf("800") !== -1) earned = 40;
    else if (user.subscribedPackage.indexOf("1500") !== -1) earned = 75;
    else if (user.subscribedPackage.indexOf("3000") !== -1) earned = 150;
    else if (user.subscribedPackage.indexOf("8000") !== -1) earned = 400;
    else if (user.subscribedPackage.indexOf("12000") !== -1) earned = 600;

    user.profit = (user.profit || 0) + earned;
    saveAllData();
    refreshUI();
    alert("أحسنت! تمت إتمام مهمة الترويج بنجاح وتمت إضافة " + earned + " جنيه إلى أرباحك.");
}

// دوال تعديل الاسم المخصصة للنافذة التصميمية بحيث تقبل النصوص بدلاً من الأرقام
function editUserName() {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    var modal = document.getElementById("editUserNameModal");
    var input = document.getElementById("editUserNameInput");
    
    if (input) {
        input.type = "text"; // إجبار خانة الإدخال على قبول النصوص والحروف
        input.value = user.name; // وضع الاسم الحالي افتراضياً في الخانة
    }
    
    if (modal) {
        modal.classList.remove("hidden");
    } else {
        // بديل احتياطي فوري لو لم يتم العثور على النافذة التصميمية في الـ HTML
        var newName = prompt("أدخل الاسم الجديد للمسوق:", user.name);
        if (newName !== null && newName.trim() !== "") {
            user.name = newName.trim();
            saveAllData();
            refreshUI();
            alert("تم تحديث اسم المسوق بنجاح!");
        }
    }
}

function saveUserNameChanges() {
    reloadDataFromStorage();
    var user = getCurrentUser();
    if (!user) return;

    var input = document.getElementById("editUserNameInput");
    if (!input) return;

    var newName = input.value.trim();
    if (newName === "") {
        alert("لا يمكن أن يكون الاسم فارغاً!");
        return;
    }

    user.name = newName;
    saveAllData();
    refreshUI();
    
    var modal = document.getElementById("editUserNameModal");
    if (modal) modal.classList.add("hidden");
    
    alert("تم تحديث اسم المسوق بنجاح!");
}

function closeEditUserNameModal() {
    var modal = document.getElementById("editUserNameModal");
    if (modal) modal.classList.add("hidden");
}

function uploadUserAvatar(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        reloadDataFromStorage();
        var user = getCurrentUser();
        if (user) {
            user.avatar = e.target.result;
            saveAllData();
            refreshUI();
            alert("تم تحديث الصورة الشخصية بنجاح!");
        }
    };
    reader.readAsDataURL(file);
}

function copyReferralLink() {
    var input = document.getElementById("referralLinkInput");
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value);
    alert("تم نسخ رابط الدعوة الخاص بك بنجاح!");
}

function openInfoModal() {
    document.getElementById("infoModal").classList.remove("hidden");
}

function closeInfoModal() {
    document.getElementById("infoModal").classList.add("hidden");
}

window.addEventListener('DOMContentLoaded', function() {
    reloadDataFromStorage();
    
    var urlParams = new URLSearchParams(window.location.search);
    var refPhone = urlParams.get('ref');
    if (refPhone && usersDB[refPhone]) {
        localStorage.setItem("tasawuq_plus_temp_ref", refPhone);
    }

    var currentUser = getCurrentUser();
    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }
});
