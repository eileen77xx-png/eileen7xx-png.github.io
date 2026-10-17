// ==========================================
// 1. ربط منصة تسوق بلس بقاعدة بيانات Supabase (بشكل آمن تماماً)
// ==========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://puhtvfikoegfemjkwulg.supabase.co'
const supabaseKey = 'Sb_publishable_DMfZzbWWHF0D6xorB5Saug_wfLYn7fD'

let supabase = null;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.log("Supabase initialization skipped");
}

// ==========================================
// 2. حالة التطبيق والمتغيرات الأساسية
// ==========================================
var currentUserPhone = localStorage.getItem("tasawuq_logged_user") || null;
var usersDB = {};
var pendingRequests = {};
var withdrawRequests = [];
var selectedWalletType = "";

try {
    usersDB = JSON.parse(localStorage.getItem("tasawuq_users")) || {};
    pendingRequests = JSON.parse(localStorage.getItem("tasawuq_pending_requests")) || {};
    withdrawRequests = JSON.parse(localStorage.getItem("tasawuq_withdraw_requests")) || [];
} catch(e) {
    usersDB = {};
    pendingRequests = {};
    withdrawRequests = [];
}

if (!usersDB["01032315526"]) {
    usersDB["01032315526"] = {
        name: "Owner",
        password: "asmael",
        balance: 5000,
        deposit: 300,
        profit: 0,
        subscribed: true,
        subscribedPackage: "300 EGP",
        completedTasks: {},
        referrals: [],
        refBonusEarned: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        avatar: "https://via.placeholder.com/150"
    };
    localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
}

// جعل الدوال متاحة عالمياً
window.executeLogin = executeLogin;
window.executeRegister = executeRegister;
window.copyReferralLink = copyReferralLink;
window.switchTab = switchTab;
window.openPackageOptionsModal = openPackageOptionsModal;
window.closePackageOptionsModal = closePackageOptionsModal;
window.refundDepositToBalance = refundDepositToBalance;
window.subscribeDirectPackage = subscribeDirectPackage;
window.uploadUserAvatar = uploadUserAvatar;
window.editUserName = editUserName;
window.doTask = doTask;
window.openWithdrawModal = openWithdrawModal;
window.closeWithdrawModal = closeWithdrawModal;
window.selectWalletType = selectWalletType;
window.setWithdrawAmount = setWithdrawAmount;
window.submitWithdrawRequest = submitWithdrawRequest;
window.showRegister = showRegister;
window.showLogin = showLogin;
window.openPackagesModal = openPackagesModal;
window.closePackagesModal = closePackagesModal;
window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;
window.handleLogout = handleLogout;

window.onload = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var refPhone = urlParams.get("ref");
    if (refPhone && usersDB[refPhone]) {
        localStorage.setItem("tasawuq_referrer", refPhone);
    }

    if (currentUserPhone && usersDB[currentUserPhone]) {
        showMainApp();
    }
};

async function syncUserToSupabase(phone, userData) {
    if (!supabase) return;
    try {
        await supabase.from('users').upsert({
            phone: phone,
            user_data: userData,
            updated_at: new Date().toISOString()
        }, { onConflict: 'phone' });
    } catch(err) {}
}

function executeLogin() {
    var phoneEl = document.getElementById("loginPhone");
    var passEl = document.getElementById("loginPassword");
    
    if (!phoneEl || !passEl) {
        alert("خطأ في قراءة حقول تسجيل الدخول!");
        return;
    }
    
    var phone = phoneEl.value.trim();
    var pass = passEl.value.trim();

    if (!phone || !pass) {
        alert("يرجى إدخال رقم الموبايل وكلمة السر!");
        return;
    }

    if (!usersDB[phone]) {
        alert("رقم الموبايل غير مسجل!");
        return;
    }

    if (usersDB[phone].password !== pass) {
        alert("كلمة السر غير صحيحة!");
        return;
    }

    currentUserPhone = phone;
    localStorage.setItem("tasawuq_logged_user", phone);
    showMainApp();
}

function executeRegister() {
    var name = document.getElementById("regName").value.trim();
    var phone = document.getElementById("regPhone").value.trim();
    var pass = document.getElementById("regPassword").value.trim();
    if (!name || !phone || !pass) { alert("املأ الحقول المطلوبة!"); return; }
    if (usersDB[phone]) { alert("الموبايل مسجل مسبقاً!"); return; }

    var referrerPhone = localStorage.getItem("tasawuq_referrer");
    var assignedReferrer = null;
    if (referrerPhone && usersDB[referrerPhone] && referrerPhone !== phone) {
        assignedReferrer = referrerPhone;
        localStorage.removeItem("tasawuq_referrer");
    }

    var newUser = {
        name: name,
        password: pass,
        balance: 50,
        deposit: 0,
        profit: 0,
        subscribed: false,
        subscribedPackage: "غير مشترك",
        completedTasks: {},
        referrals: [],
        refBonusEarned: 0,
        referrerPhone: assignedReferrer,
        createdAt: new Date().toISOString().slice(0, 10),
        avatar: "https://via.placeholder.com/150"
    };

    usersDB[phone] = newUser;
    localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
    
    syncUserToSupabase(phone, newUser);

    currentUserPhone = phone;
    localStorage.setItem("tasawuq_logged_user", phone);
    alert("مرحباً بك! تم إنشاء حسابك بنجاح وحصلت على مكافأة ترحيبية 50 جنيه في رصيدك المتاح 🎉");
    showMainApp();
}

function showMainApp() {
    var loginScreen = document.getElementById("loginScreen");
    var registerScreen = document.getElementById("registerScreen");
    var appScreen = document.getElementById("appScreen");
    var bottomNav = document.getElementById("bottomNav");

    if (loginScreen) loginScreen.classList.add("hidden");
    if (registerScreen) registerScreen.classList.add("hidden");
    if (appScreen) appScreen.classList.remove("hidden");
    if (bottomNav) bottomNav.classList.remove("hidden");

    loadUserData();
    
    var adminNavBtn = document.getElementById("adminNavBtn");
    if (currentUserPhone === "01032315526") {
        if (adminNavBtn) adminNavBtn.classList.remove("hidden");
        if (typeof renderAdminPanel === "function") renderAdminPanel();
    } else {
        if (adminNavBtn) adminNavBtn.classList.add("hidden");
    }
}

function loadUserData() {
    var data = usersDB[currentUserPhone];
    if (!data) return;

    var displayNameHeader = document.getElementById("displayNameHeader");
    var displayPhone = document.getElementById("displayPhone");
    if (displayNameHeader) displayNameHeader.innerText = data.name;
    if (displayPhone) displayPhone.innerText = currentUserPhone;

    var depositVal = document.getElementById("depositVal");
    var balanceVal = document.getElementById("balanceVal");
    var profitVal = document.getElementById("profitVal");
    if (depositVal) depositVal.innerText = (data.deposit || 0).toFixed(2);
    if (balanceVal) balanceVal.innerText = (data.balance || 0).toFixed(2);
    if (profitVal) profitVal.innerText = (data.profit || 0).toFixed(2);

    var accountName = document.getElementById("accountName");
    var accountPhone = document.getElementById("accountPhone");
    var accountPackage = document.getElementById("accountPackage");
    var accountDeposit = document.getElementById("accountDeposit");
    var accountBalance = document.getElementById("accountBalance");
    if (accountName) accountName.innerText = data.name;
    if (accountPhone) accountPhone.innerText = currentUserPhone;
    if (accountPackage) accountPackage.innerText = (data.subscribedPackage || "غير مشترك") + " ⚙️";
    if (accountDeposit) accountDeposit.innerText = (data.deposit || 0).toFixed(2) + " EGP";
    if (accountBalance) accountBalance.innerText = (data.balance || 0).toFixed(2) + " EGP";
    
    var referralLinkInput = document.getElementById("referralLinkInput");
    if (referralLinkInput) {
        referralLinkInput.value = window.location.origin + window.location.pathname + "?ref=" + currentUserPhone;
    }
    
    var refCountDisplay = document.getElementById("refCountDisplay");
    var refBonusDisplay = document.getElementById("refBonusDisplay");
    if (refCountDisplay) refCountDisplay.innerText = data.referrals ? data.referrals.length : 0;
    if (refBonusDisplay) refBonusDisplay.innerText = (data.refBonusEarned || 0).toFixed(2) + " EGP";

    if(data.avatar) {
        var userAvatarImg = document.getElementById("userAvatarImg");
        var headerAvatarImg = document.getElementById("headerAvatarImg");
        var headerAvatarIcon = document.getElementById("headerAvatarIcon");
        if (userAvatarImg) userAvatarImg.src = data.avatar;
        if (headerAvatarImg) {
            headerAvatarImg.src = data.avatar;
            headerAvatarImg.classList.remove("hidden");
        }
        if (headerAvatarIcon) headerAvatarIcon.classList.add("hidden");
    }

    var vipBadge = document.getElementById("vipBadge");
    var vipText = document.getElementById("vipBadgeText");
    if (vipBadge && vipText) {
        if (data.subscribed) { 
            vipText.innerText = data.subscribedPackage; 
            vipBadge.classList.remove("hidden"); 
        } else { 
            vipBadge.classList.add("hidden"); 
        }
    }

    var alertBox = document.getElementById("pendingAlertBox");
    if (alertBox) {
        if (pendingRequests[currentUserPhone]) {
            var pendingPkgName = document.getElementById("pendingPkgName");
            var pendingPkgPrice = document.getElementById("pendingPkgPrice");
            if (pendingPkgName) pendingPkgName.innerText = pendingRequests[currentUserPhone].packageName;
            if (pendingPkgPrice) pendingPkgPrice.innerText = pendingRequests[currentUserPhone].price + " EGP";
            alertBox.classList.remove("hidden");
        } else {
            alertBox.classList.add("hidden");
        }
    }

    renderFullUserWithdrawHistory();
    updateTasksButtons();
}

function copyReferralLink() {
    var copyText = document.getElementById("referralLinkInput");
    if(!copyText) return;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("تم نسخ رابط الإحالة الخاص بك بنجاح! شاركه مع أصدقائك الآن 🚀");
}

function renderFullUserWithdrawHistory() {
    var tbody = document.getElementById("userFullWithdrawHistoryTable");
    if (!tbody) return;
    tbody.innerHTML = "";
    var myHistory = withdrawRequests.filter(function(r) { return r.phone === currentUserPhone; });

    if (myHistory.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-muted);'>لا توجد عمليات سحب سابقة حتى الآن</td></tr>";
        return;
    }

    myHistory.slice().reverse().forEach(function(item) {
        var statusHTML = "";
        if (item.status === "pending") {
            statusHTML = "<span class='status-badge status-pending'>قيد المراجعة ⏳</span>";
        } else if (item.status === "approved") {
            statusHTML = "<span class='status-badge status-success'>تم إرسال المبلغ ✅</span>";
        } else {
            statusHTML = "<span class='status-badge status-rejected'>مرفوض ❌</span>";
        }

        tbody.innerHTML += "<tr>" +
            "<td>" + item.date + "</td>" +
            "<td>" + item.wallet + "</td>" +
            "<td>" + item.amount.toFixed(2) + " EGP</td>" +
            "<td>" + statusHTML + "</td>" +
        "</tr>";
    });
}

function switchTab(tabName) {
    var tabs = document.querySelectorAll(".tab-content");
    var btns = document.querySelectorAll(".nav-btn");
    for (var i = 0; i < tabs.length; i++) { tabs[i].classList.add("hidden"); }
    for (var j = 0; j < btns.length; j++) { btns[j].classList.remove("active"); }

    if (tabName === "home") { document.getElementById("tabHome").classList.remove("hidden"); btns[0].classList.add("active"); }
    else if (tabName === "tasks") { document.getElementById("tabTasks").classList.remove("hidden"); btns[1].classList.add("active"); }
    else if (tabName === "history") { document.getElementById("tabHistory").classList.remove("hidden"); btns[2].classList.add("active"); renderFullUserWithdrawHistory(); }
    else if (tabName === "account") { document.getElementById("tabAccount").classList.remove("hidden"); btns[3].classList.add("active"); }
    else if (tabName === "admin") {
        document.getElementById("tabAdmin").classList.remove("hidden");
        if(btns[4]) btns[4].classList.add("active");
        if (typeof renderAdminPanel === "function") renderAdminPanel();
    }
}

function openPackageOptionsModal() {
    var modal = document.getElementById("packageOptionsModal");
    if(modal) modal.classList.remove("hidden");
}

function closePackageOptionsModal() {
    var modal = document.getElementById("packageOptionsModal");
    if(modal) modal.classList.add("hidden");
}

function refundDepositToBalance() {
    var user = usersDB[currentUserPhone];
    if (!user.deposit || user.deposit <= 0) {
        alert("ليس لديك وديعة قائمة لاسترجاعها!");
        return;
    }

    if (confirm("هل أنت متأكد من استرجاع قيمة الوديعة (" + user.deposit + " EGP) وإضافتها إلى رصيدك المتاح؟ سيتم إلغاء تفعيل الباقة الحالية.")) {
        user.balance = (user.balance || 0) + user.deposit;
        user.deposit = 0;
        user.subscribed = false;
        user.subscribedPackage = "غير مشترك";

        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        syncUserToSupabase(currentUserPhone, user);
        loadUserData();
        closePackageOptionsModal();
        alert("تم استرجاع مبلغ الوديعة بنجاح إلى رصيدك المتاح!");
    }
}

function subscribeDirectPackage(price) {
    var user = usersDB[currentUserPhone];
    
    if ((user.balance || 0) < price) {
        alert("رصيدك المتاح (" + (user.balance || 0).toFixed(2) + " EGP) غير كافٍ للاشتراك في هذه الباقة! يرجى التواصل مع الأدمن لشحن الرصيد.");
        closePackagesModal();
        return;
    }

    if (user.deposit > 0) {
        if (!confirm("لديك وديعة سابقة بقيمة " + user.deposit + " EGP. هل تريد استبدالها والاشتراك في الباقة الجديدة؟")) {
            return;
        }
        user.balance += user.deposit;
    }

    user.balance -= price;
    user.deposit = price;
    user.subscribed = true;
    user.subscribedPackage = "باقة " + price + " EGP";

    if (user.referrerPhone && usersDB[user.referrerPhone]) {
        var refUser = usersDB[user.referrerPhone];
        if (!refUser.referrals) refUser.referrals = [];
        if (refUser.referrals.indexOf(currentUserPhone) === -1) {
            refUser.referrals.push(currentUserPhone);
            refUser.profit = (refUser.profit || 0) + 100;
            refUser.refBonusEarned = (refUser.refBonusEarned || 0) + 100;
            user.referrerPhone = null;
            syncUserToSupabase(user.referrerPhone, refUser);
        }
    }

    localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
    syncUserToSupabase(currentUserPhone, user);
    loadUserData();
    closePackagesModal();
    alert("مبروك! تم الاشتراك في الباقة بنجاح وتم تفعيلها فوريًا من رصيدك المتاح 🚀");
}

function updateTasksButtons() {
    var u = usersDB[currentUserPhone];
    if(!u) return;
    var today = new Date().toISOString().slice(0, 10);
    if (!u.completedTasks) u.completedTasks = {};
    var completedToday = u.completedTasks[today] ? u.completedTasks[today].length : 0;
    
    for (var i = 1; i <= 5; i++) {
        var btn = document.getElementById("taskBtn" + i);
        if (btn) {
            if (u.completedTasks[today] && u.completedTasks[today].indexOf(i) !== -1) {
                btn.disabled = true;
                btn.innerText = "مكتملة ✓";
                btn.style.background = "#334155";
            } else {
                btn.disabled = false;
                btn.innerText = "تنفيذ المهمة";
                btn.style.background = "";
            }
        }
    }
    var leftEl = document.getElementById("tasksLeft");
    if(leftEl) leftEl.innerText = 5 - completedToday;
}

function uploadUserAvatar(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(evt) {
            usersDB[currentUserPhone].avatar = evt.target.result;
            localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
            syncUserToSupabase(currentUserPhone, usersDB[currentUserPhone]);
            loadUserData();
        };
        reader.readAsDataURL(file);
    }
}

function editUserName() {
    var newName = prompt("ادخل اسم المستخدم الجديد:", usersDB[currentUserPhone].name);
    if (newName && newName.trim() !== "") {
        usersDB[currentUserPhone].name = newName.trim();
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        syncUserToSupabase(currentUserPhone, usersDB[currentUserPhone]);
        loadUserData();
        if(currentUserPhone === "01032315526" && typeof renderAdminPanel === "function") renderAdminPanel();
        alert("تم تحديث اسم المستخدم بنجاح!");
    }
}

function doTask(taskId) {
    var user = usersDB[currentUserPhone];
    if (!user.subscribed) { alert("يجب الاشتراك في باقة أولاً لتنفيذ المهام!"); return; }
    
    var today = new Date().toISOString().slice(0, 10);
    if (!user.completedTasks) user.completedTasks = {};
    if (!user.completedTasks[today]) user.completedTasks[today] = [];

    if (user.completedTasks[today].indexOf(taskId) !== -1) {
        alert("تم تنفيذ هذه المهمة اليوم بالفعل!");
        return;
    }

    var dailyTotal = 0;
    if (user.deposit === 300) dailyTotal = 15;
    else if (user.deposit === 800) dailyTotal = 40;
    else if (user.deposit === 1500) dailyTotal = 75;
    else if (user.deposit === 3000) dailyTotal = 150;
    else if (user.deposit === 8000) dailyTotal = 400;
    else if (user.deposit === 12000) dailyTotal = 600;
    else dailyTotal = (user.deposit * 0.05);

    var earn = dailyTotal / 5;
    user.profit += earn;
    user.completedTasks[today].push(taskId);
    localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
    syncUserToSupabase(currentUserPhone, user);
    loadUserData();
    alert("تم تنفيذ المهمة بنجاح وأُضيف ربح المهمة (" + earn.toFixed(2) + " EGP)!");
}

function checkWithdrawSchedule() {
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours();

    var isWithdrawDay = (day === 0 || day === 3);
    var isWithdrawHour = (hour >= 10 && hour < 24);

    var alertBox = document.getElementById("withdrawTimeAlertBox");
    var activeSection = document.getElementById("withdrawActiveSection");
    var lockedSection = document.getElementById("withdrawLockedSection");

    if (isWithdrawDay && isWithdrawHour) {
        if(alertBox) {
            alertBox.style.background = "rgba(34, 197, 94, 0.15)";
            alertBox.style.border = "1px solid var(--neon-green)";
            alertBox.style.color = "var(--neon-green)";
            alertBox.innerHTML = "<i class='fa-solid fa-circle-check'></i> <strong>باب السحب مفتوح الآن ✅</strong>";
        }
        if(activeSection) activeSection.classList.remove("hidden");
        if(lockedSection) lockedSection.classList.add("hidden");
        return true;
    } else {
        if(alertBox) {
            alertBox.style.background = "rgba(239, 68, 68, 0.15)";
            alertBox.style.border = "1px solid var(--danger)";
            alertBox.style.color = "var(--danger)";
            alertBox.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> <strong>باب السحب مغلق حالياً ⏳</strong>";
        }
        if(activeSection) activeSection.classList.add("hidden");
        if(lockedSection) lockedSection.classList.remove("hidden");
        return false;
    }
}

function openWithdrawModal() {
    var user = usersDB[currentUserPhone];
    var profitEl = document.getElementById("withdrawAvailableProfit");
    if(profitEl) profitEl.innerText = (user.profit || 0).toFixed(2) + " EGP";
    selectedWalletType = "";
    
    var walletInput = document.getElementById("withdrawWalletNumber");
    var amountInput = document.getElementById("withdrawAmountInput");
    if(walletInput) walletInput.value = "";
    if(amountInput) amountInput.value = "";
    
    var cards = document.querySelectorAll(".wallet-logo-card");
    for(var i=0; i<cards.length; i++) cards[i].classList.remove("active");

    checkWithdrawSchedule();
    var modal = document.getElementById("withdrawModal");
    if(modal) modal.classList.remove("hidden");
}

function closeWithdrawModal() {
    var modal = document.getElementById("withdrawModal");
    if(modal) modal.classList.add("hidden");
}

function selectWalletType(walletName, el) {
    selectedWalletType = walletName;
    var cards = document.querySelectorAll(".wallet-logo-card");
    for(var i=0; i<cards.length; i++) {
        cards[i].classList.remove("active");
    }
    el.classList.add("active");
    var walletNum = document.getElementById("withdrawWalletNumber");
    if(walletNum) walletNum.placeholder = "ادخل رقم محفظة " + walletName;
}

function setWithdrawAmount(amt) {
    var amtInput = document.getElementById("withdrawAmountInput");
    if(amtInput) amtInput.value = amt;
}

function submitWithdrawRequest() {
    if (!checkWithdrawSchedule()) {
        alert("عذراً، أوقات السحب غير متاح حالياً. يرجى الالتزام بمواعيد الأحد والأربعاء!");
        return;
    }

    var user = usersDB[currentUserPhone];
    var walletNumEl = document.getElementById("withdrawWalletNumber");
    var amountInputEl = document.getElementById("withdrawAmountInput");
    
    if(!walletNumEl || !amountInputEl) return;

    var walletNum = walletNumEl.value.trim();
    var amount = parseFloat(amountInputEl.value);

    if (!selectedWalletType) {
        alert("يرجى اختيار شبكة المحفظة الإلكترونية!");
        return;
    }

    if (!walletNum) {
        alert("يرجى إدخال رقم المحفظة!");
        return;
    }

    if (isNaN(amount) || amount < 250) {
        alert("عذراً، الحد الأدنى للسحب هو 250 EGP!");
        return;
    }

    if (amount > (user.profit || 0)) {
        alert("تنبيه: المبلغ المطلوبة أكبر من رصيد الأرباح المتاح لديك!");
        return;
    }

    var todayStr = new Date().toISOString().slice(0, 10);
    var fullWalletDesc = selectedWalletType + " (" + walletNum + ")";

    var newReq = {
        id: Date.now(),
        phone: currentUserPhone,
        name: user.name,
        wallet: fullWalletDesc,
        amount: amount,
        date: todayStr,
        status: "pending"
    };

    withdrawRequests.push(newReq);
    localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));

    if (supabase) {
        try {
            supabase.from('withdraw_requests').insert([{
                phone: currentUserPhone,
                amount: amount,
                wallet: fullWalletDesc,
                status: 'pending',
                created_at: new Date().toISOString()
            }]);
        } catch(err) {}
    }
    
    walletNumEl.value = "";
    amountInputEl.value = "";
    closeWithdrawModal();
    loadUserData();
    alert("تم تقديم طلب سحب الأرباح بنجاح!");
}

function showRegister() {
    var loginScreen = document.getElementById("loginScreen");
    var regScreen = document.getElementById("registerScreen");
    if(loginScreen) loginScreen.classList.add("hidden");
    if(regScreen) regScreen.classList.remove("hidden");
}

function showLogin() {
    var loginScreen = document.getElementById("loginScreen");
    var regScreen = document.getElementById("registerScreen");
    if(regScreen) regScreen.classList.add("hidden");
    if(loginScreen) loginScreen.classList.remove("hidden");
}

function openPackagesModal() { 
    var modal = document.getElementById("packagesModal");
    if(modal) modal.classList.remove("hidden"); 
}
function closePackagesModal() { 
    var modal = document.getElementById("packagesModal");
    if(modal) modal.classList.add("hidden"); 
}
function openInfoModal() { 
    var modal = document.getElementById("infoModal");
    if(modal) modal.classList.remove("hidden"); 
}
function closeInfoModal() { 
    var modal = document.getElementById("infoModal");
    if(modal) modal.classList.add("hidden"); 
}
function handleLogout() { 
    localStorage.removeItem("tasawuq_logged_user"); 
    location.reload(); 
}

// ==========================================
// 3. ربط أزرار النماذج المباشر لمنع أي عدم استجابة
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    var loginBtns = document.querySelectorAll("#loginScreen button, button[onclick*='Login']");
    loginBtns.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            executeLogin();
        });
    });

    var regBtns = document.querySelectorAll("#registerScreen button, button[onclick*='Register']");
    regBtns.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            executeRegister();
        });
    });
});
