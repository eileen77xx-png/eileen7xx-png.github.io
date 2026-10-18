var currentUserPhone = localStorage.getItem("tasawuq_logged_user") || null;
var usersDB = {};
var pendingRequests = {};
var withdrawRequests = [];
var selectedWalletType = "";

// ====================== حماية بسيطة للبيانات ======================
function getDataIntegrity(data) {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data)))).slice(0, 32);
    } catch (e) {
        return "";
    }
}

function saveAllData() {
    localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
    localStorage.setItem("tasawuq_pending_requests", JSON.stringify(pendingRequests));
    localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));

    var integrity = getDataIntegrity({
        users: usersDB,
        pending: pendingRequests,
        withdraws: withdrawRequests
    });
    localStorage.setItem("tasawuq_integrity", integrity);
}

try {
    var savedUsers = localStorage.getItem("tasawuq_users");
    var savedPending = localStorage.getItem("tasawuq_pending_requests");
    var savedWithdraws = localStorage.getItem("tasawuq_withdraw_requests");
    var savedIntegrity = localStorage.getItem("tasawuq_integrity");

    usersDB = savedUsers ? JSON.parse(savedUsers) : {};
    pendingRequests = savedPending ? JSON.parse(savedPending) : {};
    withdrawRequests = savedWithdraws ? JSON.parse(savedWithdraws) : [];

    var currentIntegrity = getDataIntegrity({
        users: usersDB,
        pending: pendingRequests,
        withdraws: withdrawRequests
    });

    if (savedIntegrity && savedIntegrity !== currentIntegrity) {
        console.warn("تم اكتشاف تعديل غير مصرح به على البيانات");
    }
} catch (e) {
    usersDB = {};
    pendingRequests = {};
    withdrawRequests = [];
}

// ترحيل الحساب القديم وإعطائه صلاحية الأدمن
if (usersDB["01032315526"] && usersDB["01032315526"].isAdmin !== true) {
    usersDB["01032315526"].isAdmin = true;
    saveAllData();
}

// ====================== باقي الكود ======================
window.onload = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var refPhone = urlParams.get("ref");
    if (refPhone && usersDB[refPhone]) {
        localStorage.setItem("tasawuq_referrer", refPhone);
    }

    if (currentUserPhone && usersDB[currentUserPhone]) {
        showMainApp();
    }
};

function executeLogin() {
    var phone = document.getElementById("loginPhone").value.trim();
    var pass = document.getElementById("loginPassword").value.trim();
    if (!usersDB[phone] || usersDB[phone].password !== pass) {
        alert("رقم الموبايل أو كلمة السر غير صحيحة!");
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
    if (!name || !phone || !pass) {
        alert("املأ الحقول المطلوبة!");
        return;
    }
    if (usersDB[phone]) {
        alert("الموبايل مسجل مسبقاً!");
        return;
    }

    var referrerPhone = localStorage.getItem("tasawuq_referrer");
    var assignedReferrer = null;
    if (referrerPhone && usersDB[referrerPhone] && referrerPhone !== phone) {
        assignedReferrer = referrerPhone;
        localStorage.removeItem("tasawuq_referrer");
    }

    usersDB[phone] = {
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
        avatar: "https://via.placeholder.com/150",
        isAdmin: false
    };

    saveAllData();
    currentUserPhone = phone;
    localStorage.setItem("tasawuq_logged_user", phone);
    alert("مرحباً بك! تم إنشاء حسابك بنجاح وحصلت على مكافأة ترحيبية 50 جنيه في رصيدك المتاح 🎉");
    showMainApp();
}

function showMainApp() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");
    document.getElementById("bottomNav").classList.remove("hidden");
    loadUserData();

    var currentUser = usersDB[currentUserPhone];
    if (currentUser && currentUser.isAdmin === true) {
        document.getElementById("adminNavBtn").classList.remove("hidden");
        if (typeof renderAdminPanel === "function") renderAdminPanel();
    } else {
        document.getElementById("adminNavBtn").classList.add("hidden");
    }
}

function loadUserData() {
    var data = usersDB[currentUserPhone];
    if (!data) return;

    document.getElementById("displayNameHeader").innerText = data.name;
    document.getElementById("displayPhone").innerText = currentUserPhone;
    document.getElementById("depositVal").innerText = (data.deposit || 0).toFixed(2);
    document.getElementById("balanceVal").innerText = (data.balance || 0).toFixed(2);
    document.getElementById("profitVal").innerText = (data.profit || 0).toFixed(2);
    document.getElementById("accountName").innerText = data.name;
    document.getElementById("accountPhone").innerText = currentUserPhone;
    document.getElementById("accountPackage").innerText = (data.subscribedPackage || "غير مشترك") + " ⚙️";
    document.getElementById("accountDeposit").innerText = (data.deposit || 0).toFixed(2) + " EGP";
    document.getElementById("accountBalance").innerText = (data.balance || 0).toFixed(2) + " EGP";

    var refLink = window.location.origin + window.location.pathname + "?ref=" + currentUserPhone;
    document.getElementById("referralLinkInput").value = refLink;
    document.getElementById("refCountDisplay").innerText = data.referrals ? data.referrals.length : 0;
    document.getElementById("refBonusDisplay").innerText = (data.refBonusEarned || 0).toFixed(2) + " EGP";

    if (data.avatar) {
        document.getElementById("userAvatarImg").src = data.avatar;
        document.getElementById("headerAvatarImg").src = data.avatar;
        document.getElementById("headerAvatarImg").classList.remove("hidden");
        document.getElementById("headerAvatarIcon").classList.add("hidden");
    }

    var vipBadge = document.getElementById("vipBadge");
    var vipText = document.getElementById("vipBadgeText");
    if (data.subscribed) {
        vipText.innerText = data.subscribedPackage;
        vipBadge.classList.remove("hidden");
    } else {
        vipBadge.classList.add("hidden");
    }

    var alertBox = document.getElementById("pendingAlertBox");
    if (pendingRequests[currentUserPhone]) {
        document.getElementById("pendingPkgName").innerText = pendingRequests[currentUserPhone].packageName;
        document.getElementById("pendingPkgPrice").innerText = pendingRequests[currentUserPhone].price + " EGP";
        alertBox.classList.remove("hidden");
    } else {
        alertBox.classList.add("hidden");
    }

    renderFullUserWithdrawHistory();
    updateTasksButtons();
}

function copyReferralLink() {
    var copyText = document.getElementById("referralLinkInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("تم نسخ رابط الإحالة الخاص بك بنجاح! شاركه مع أصدقائك الآن 🚀");
}

function renderFullUserWithdrawHistory() {
    var tbody = document.getElementById("userFullWithdrawHistoryTable");
    if (!tbody) return;
    tbody.innerHTML = "";
    var myHistory = withdrawRequests.filter(function (r) {
        return r.phone === currentUserPhone;
    });

    if (myHistory.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-muted);'>لا توجد عمليات سحب سابقة حتى الآن</td></tr>";
        return;
    }

    myHistory.slice().reverse().forEach(function (item) {
        var statusHTML = "";
        if (item.status === "pending") {
            statusHTML = "<span class='status-badge status-pending'>قيد المراجعة ⏳</span>";
        } else if (item.status === "approved") {
            statusHTML = "<span class='status-badge status-success'>تم إرسال المبلغ ✅</span>";
        } else {
            statusHTML = "<span class='status-badge status-rejected'>مرفوض ❌</span>";
        }

        tbody.innerHTML +=
            "<tr>" +
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
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.add("hidden");
    }
    for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove("active");
    }

    if (tabName === "home") {
        document.getElementById("tabHome").classList.remove("hidden");
        btns[0].classList.add("active");
    } else if (tabName === "tasks") {
        document.getElementById("tabTasks").classList.remove("hidden");
        btns[1].classList.add("active");
    } else if (tabName === "history") {
        document.getElementById("tabHistory").classList.remove("hidden");
        btns[2].classList.add("active");
        renderFullUserWithdrawHistory();
    } else if (tabName === "account") {
        document.getElementById("tabAccount").classList.remove("hidden");
        btns[3].classList.add("active");
    } else if (tabName === "admin") {
        document.getElementById("tabAdmin").classList.remove("hidden");
        if (btns[4]) btns[4].classList.add("active");
        if (typeof renderAdminPanel === "function") renderAdminPanel();
    }
}

function openPackageOptionsModal() {
    document.getElementById("packageOptionsModal").classList.remove("hidden");
}

function closePackageOptionsModal() {
    document.getElementById("packageOptionsModal").classList.add("hidden");
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

        saveAllData();
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
        }
    }

    saveAllData();
    loadUserData();
    closePackagesModal();
    alert("مبروك! تم الاشتراك في الباقة بنجاح وتم تفعيلها فوريًا من رصيدك المتاح 🚀");
}

function updateTasksButtons() {
    var u = usersDB[currentUserPhone];
    if (!u) return;
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
    if (leftEl) leftEl.innerText = 5 - completedToday;
}

function uploadUserAvatar(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            usersDB[currentUserPhone].avatar = evt.target.result;
            saveAllData();
            loadUserData();
        };
        reader.readAsDataURL(file);
    }
}

function editUserName() {
    var newName = prompt("ادخل اسم المستخدم الجديد:", usersDB[currentUserPhone].name);
    if (newName && newName.trim() !== "") {
        usersDB[currentUserPhone].name = newName.trim();
        saveAllData();
        loadUserData();
        if (usersDB[currentUserPhone].isAdmin === true && typeof renderAdminPanel === "function") {
            renderAdminPanel();
        }
        alert("تم تحديث اسم المستخدم بنجاح!");
    }
}

function doTask(taskId) {
    var user = usersDB[currentUserPhone];
    if (!user.subscribed) {
        alert("يجب الاشتراك في باقة أولاً لتنفيذ المهام!");
        return;
    }

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
    else dailyTotal = user.deposit * 0.05;

    var earn = dailyTotal / 5;
    user.profit += earn;
    user.completedTasks[today].push(taskId);
    saveAllData();
    loadUserData();
    alert("تم تنفيذ المهمة بنجاح وأُضيف ربح المهمة (" + earn.toFixed(2) + " EGP)!");
}

function checkWithdrawSchedule() {
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours();

    var isWithdrawDay = day === 0 || day === 3;
    var isWithdrawHour = hour >= 10 && hour < 24;

    var alertBox = document.getElementById("withdrawTimeAlertBox");
    var activeSection = document.getElementById("withdrawActiveSection");
    var lockedSection = document.getElementById("withdrawLockedSection");

    if (isWithdrawDay && isWithdrawHour) {
        alertBox.style.background = "rgba(34, 197, 94, 0.15)";
        alertBox.style.border = "1px solid var(--neon-green)";
        alertBox.style.color = "var(--neon-green)";
        alertBox.innerHTML = "<i class='fa-solid fa-circle-check'></i> <strong>باب السحب مفتوح الآن ✅</strong>";
        activeSection.classList.remove("hidden");
        lockedSection.classList.add("hidden");
        return true;
    } else {
        alertBox.style.background = "rgba(239, 68, 68, 0.15)";
        alertBox.style.border = "1px solid var(--danger)";
        alertBox.style.color = "var(--danger)";
        alertBox.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> <strong>باب السحب مغلق حالياً ⏳</strong>";
        activeSection.classList.add("hidden");
        lockedSection.classList.remove("hidden");
        return false;
    }
}

function openWithdrawModal() {
    var user = usersDB[currentUserPhone];
    document.getElementById("withdrawAvailableProfit").innerText = (user.profit || 0).toFixed(2) + " EGP";
    selectedWalletType = "";
    document.getElementById("withdrawWalletNumber").value = "";
    document.getElementById("withdrawAmountInput").value = "";

    var cards = document.querySelectorAll(".wallet-logo-card");
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove("active");

    checkWithdrawSchedule();
    document.getElementById("withdrawModal").classList.remove("hidden");
}

function closeWithdrawModal() {
    document.getElementById("withdrawModal").classList.add("hidden");
}

function selectWalletType(walletName, el) {
    selectedWalletType = walletName;
    var cards = document.querySelectorAll(".wallet-logo-card");
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove("active");
    }
    el.classList.add("active");
    document.getElementById("withdrawWalletNumber").placeholder = "ادخل رقم محفظة " + walletName;
}

function setWithdrawAmount(amt) {
    document.getElementById("withdrawAmountInput").value = amt;
}

function submitWithdrawRequest() {
    if (!checkWithdrawSchedule()) {
        alert("عذراً، أوقات السحب غير متاح حالياً. يرجى الالتزام بمواعيد الأحد والأربعاء!");
        return;
    }

    var user = usersDB[currentUserPhone];
    var walletNum = document.getElementById("withdrawWalletNumber").value.trim();
    var amount = parseFloat(document.getElementById("withdrawAmountInput").value);

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
    saveAllData();

    document.getElementById("withdrawWalletNumber").value = "";
    document.getElementById("withdrawAmountInput").value = "";
    closeWithdrawModal();
    loadUserData();
    alert("تم تقديم طلب سحب الأرباح بنجاح!");
}

function showRegister() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
}

function openPackagesModal() {
    document.getElementById("packagesModal").classList.remove("hidden");
}
function closePackagesModal() {
    document.getElementById("packagesModal").classList.add("hidden");
}
function openInfoModal() {
    document.getElementById("infoModal").classList.remove("hidden");
}
function closeInfoModal() {
    document.getElementById("infoModal").classList.add("hidden");
}
function handleLogout() {
    localStorage.removeItem("tasawuq_logged_user");
    location.reload();
}
