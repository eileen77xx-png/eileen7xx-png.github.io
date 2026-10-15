// ==========================================
// إعداد الاتصال بقاعدة بيانات Supabase السحابية
// ==========================================
const SUPABASE_URL = 'https://aogqqgqpmrjarkubzkck.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2jtMwMHLyFmZkb0EFbhp-A_FkRrMB3h';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// دالة لجلب وتحديث بيانات المستخدمين من السحابة تلقائياً
async function syncUsersFromCloud() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
            // تحويل البيانات القادمة من السحابة إلى النظام المحلي للمنصة
            data.forEach(function(u) {
                usersDB[u.phone] = {
                    name: u.name,
                    password: u.password,
                    balance: u.balance || 0,
                    deposit: u.deposit || 0,
                    profit: u.profit || 0,
                    subscribed: u.subscribed || false,
                    subscribedPackage: u.subscribedPackage || 'غير مشترك',
                    referrals: u.referrals || []
                };
            });
            if (typeof renderAdminPanel === 'function') {
                renderAdminPanel();
            }
        }
    } catch (err) {
        console.error('خطأ في مزامنة البيانات من السحابة:', err);
    }
}

// تشغيل المزامنة عند فتح لوحة التحكم
document.addEventListener('DOMContentLoaded', () => {
    syncUsersFromCloud();
});

// ==========================================
// دوال لوحة التحكم الأصلية (مع دعم الحفظ السحابي)
// ==========================================

function renderAdminPanel() {
    renderAdminUsersList();
    renderAdminWithdrawRequests();
    renderAdminPendingRequests();
}

function renderAdminUsersList() {
    var tbody = document.getElementById("adminUserTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    Object.keys(usersDB).forEach(function(phone) {
        var u = usersDB[phone];
        var isOwner = (phone === "01032315526");
        
        var tr = document.createElement("tr");
        tr.innerHTML = 
            "<td><strong>" + u.name + "</strong><br><small style='color:var(--text-muted);'>" + phone + "</small></td>" +
            "<td><span style='color:var(--neon-green); font-weight:bold;'>" + (u.balance || 0).toFixed(2) + " EGP</span></td>" +
            "<td>" + (u.deposit || 0).toFixed(2) + " EGP</td>" +
            "<td><span class='status-badge " + (u.subscribed ? "status-success" : "status-pending") + "'>" + (u.subscribedPackage || "غير مشترك") + "</span></td>" +
            "<td>" +
                "<div>ربح: <strong style='color:var(--accent);'>" + (u.profit || 0).toFixed(2) + " EGP</strong></div>" +
                "<div style='font-size:11px; color:var(--text-muted);'>إحالات: " + (u.referrals ? u.referrals.length : 0) + "</div>" +
            "</td>" +
            "<td>" +
                "<button onclick='adminModifyBalance(\"" + phone + "\")' class='btn-action-sm' style='background:var(--neon-green); color:black;'>تعديل الرصيد</button>" +
                "<button onclick='adminModifyDeposit(\"" + phone + "\")' class='btn-action-sm' style='background:var(--accent); color:black;'>تعديل الوديعة</button>" +
                (!isOwner ? "<button onclick='adminDeleteUser(\"" + phone + "\")' class='btn-action-sm' style='background:var(--danger); color:white;'>حذف</button>" : "") +
            "</td>";
        tbody.appendChild(tr);
    });
}

function renderAdminWithdrawRequests() {
    var tbody = document.getElementById("adminWithdrawRequestsTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    var pendingWithdraws = withdrawRequests.filter(function(r) { return r.status === "pending"; });

    if (pendingWithdraws.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-muted);'>لا توجد طلبات سحب معلقة حالياً</td></tr>";
        return;
    }

    pendingWithdraws.forEach(function(req) {
        var tr = document.createElement("tr");
        tr.innerHTML = 
            "<td><strong>" + req.name + "</strong><br><small style='color:var(--text-muted);'>" + req.phone + "</small></td>" +
            "<td><strong style='color:var(--accent);'>" + req.wallet + "</strong></td>" +
            "<td><strong style='color:var(--neon-green);'>" + req.amount.toFixed(2) + " EGP</strong></td>" +
            "<td>" + req.date + "</td>" +
            "<td>" +
                "<button onclick='approveWithdrawRequest(" + req.id + ")' class='btn-action-sm' style='background:var(--neon-green); color:black;'>موافقة وتأكيد التحويل</button>" +
                "<button onclick='rejectWithdrawRequest(" + req.id + ")' class='btn-action-sm' style='background:var(--danger); color:white;'>رفض الطلب</button>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

function renderAdminPendingRequests() {
    var tbody = document.getElementById("adminRequestsTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    var keys = Object.keys(pendingRequests);
    if (keys.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-muted);'>لا توجد طلبات معلقة حالياً</td></tr>";
        return;
    }

    keys.forEach(function(phone) {
        var req = pendingRequests[phone];
        var tr = document.createElement("tr");
        tr.innerHTML = 
            "<td><strong>" + req.userName + "</strong><br><small style='color:var(--text-muted);'>" + phone + "</small></td>" +
            "<td>" + req.packageName + "</td>" +
            "<td><strong>" + req.price + " EGP</strong></td>" +
            "<td>" +
                "<button onclick='approvePackageRequest(\"" + phone + "\")' class='btn-action-sm' style='background:var(--neon-green); color:black;'>موافقة</button>" +
                "<button onclick='rejectPackageRequest(\"" + phone + "\")' class='btn-action-sm' style='background:var(--danger); color:white;'>رفض</button>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

async function adminModifyBalance(phone) {
    var u = usersDB[phone];
    var newBal = prompt("أدخل الرصيد المتاح الجديد للمستخدم " + u.name + ":", u.balance);
    if (newBal !== null && !isNaN(parseFloat(newBal))) {
        u.balance = parseFloat(newBal);
        
        // تحديث محلي
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        
        // تحديث سحابي في Supabase
        if (supabase) {
            await supabase.from('users').update({ balance: u.balance }).eq('phone', phone);
        }

        renderAdminPanel();
        if (typeof currentUserPhone !== 'undefined' && currentUserPhone === phone && typeof loadUserData === 'function') loadUserData();
        alert("تم تحديث الرصيد بنجاح وحفظه سحابياً!");
    }
}

async function adminModifyDeposit(phone) {
    var u = usersDB[phone];
    var newDep = prompt("أدخل مبلغ الوديعة الجديد للمستخدم " + u.name + ":", u.deposit);
    if (newDep !== null && !isNaN(parseFloat(newDep))) {
        u.deposit = parseFloat(newDep);
        if (u.deposit > 0) {
            u.subscribed = true;
            u.subscribedPackage = "باقة " + u.deposit + " EGP";
        } else {
            u.subscribed = false;
            u.subscribedPackage = "غير مشترك";
        }
        
        // تحديث محلي
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        
        // تحديث سحابي في Supabase
        if (supabase) {
            await supabase.from('users').update({ 
                deposit: u.deposit, 
                subscribed: u.subscribed, 
                subscribedPackage: u.subscribedPackage 
            }).eq('phone', phone);
        }

        renderAdminPanel();
        if (typeof currentUserPhone !== 'undefined' && currentUserPhone === phone && typeof loadUserData === 'function') loadUserData();
        alert("تم تحديث الوديعة والباقة بنجاح وحفظها سحابياً!");
    }
}

async function adminDeleteUser(phone) {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) {
        delete usersDB[phone];
        
        // تحديث محلي
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        
        // حذف من سحابة Supabase
        if (supabase) {
            await supabase.from('users').delete().eq('phone', phone);
        }

        renderAdminPanel();
        alert("تم حذف المستخدم بنجاح من النظام والسحابة.");
    }
}

async function approveWithdrawRequest(reqId) {
    var index = withdrawRequests.findIndex(function(r) { return r.id === reqId; });
    if (index !== -1) {
        var req = withdrawRequests[index];
        var u = usersDB[req.phone];
        if (u) {
            u.profit = Math.max(0, (u.profit || 0) - req.amount);
            if (supabase) {
                await supabase.from('users').update({ profit: u.profit }).eq('phone', req.phone);
            }
        }
        req.status = "approved";
        localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (typeof currentUserPhone !== 'undefined' && currentUserPhone === req.phone && typeof loadUserData === 'function') loadUserData();
        alert("تمت الموافقة على طلب السحب بنجاح وخصم المبلغ من أرباح المستخدم!");
    }
}

function rejectWithdrawRequest(reqId) {
    var index = withdrawRequests.findIndex(function(r) { return r.id === reqId; });
    if (index !== -1) {
        withdrawRequests[index].status = "rejected";
        localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));
        renderAdminPanel();
        alert("تم رفض طلب السحب.");
    }
}

async function approvePackageRequest(phone) {
    var req = pendingRequests[phone];
    if (req && usersDB[phone]) {
        usersDB[phone].deposit = req.price;
        usersDB[phone].subscribed = true;
        usersDB[phone].subscribedPackage = req.packageName;
        delete pendingRequests[phone];
        
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        localStorage.setItem("tasawuq_pending_requests", JSON.stringify(pendingRequests));
        
        if (supabase) {
            await supabase.from('users').update({ 
                deposit: usersDB[phone].deposit, 
                subscribed: true, 
                subscribedPackage: req.packageName 
            }).eq('phone', phone);
        }

        renderAdminPanel();
        if (typeof currentUserPhone !== 'undefined' && currentUserPhone === phone && typeof loadUserData === 'function') loadUserData();
        alert("تمت الموافقة على تفعيل الباقة بنجاح وحفظها سحابياً!");
    }
}

function rejectPackageRequest(phone) {
    if (pendingRequests[phone]) {
        delete pendingRequests[phone];
        localStorage.setItem("tasawuq_pending_requests", JSON.stringify(pendingRequests));
        renderAdminPanel();
        alert("تم رفض طلب الاشتراك.");
    }
}

function adminSearchUser() {
    var query = document.getElementById("adminSearchInput").value.trim();
    var resultDiv = document.getElementById("adminSearchResult");
    if (!query) { resultDiv.classList.add("hidden"); return; }

    var u = usersDB[query];
    if (!u) {
        resultDiv.innerHTML = "<div style='color:var(--danger); padding:10px;'>لم يتم العثور على مستخدم بهذا الرقم!</div>";
        resultDiv.classList.remove("hidden");
        return;
    }

    resultDiv.innerHTML = 
        "<div class='user-detail-card'>" +
            "<h4>بيانات المستخدم: " + u.name + " (" + query + ")</h4>" +
            "<p>الرصيد المتاح: <strong>" + (u.balance || 0).toFixed(2) + " EGP</strong></p>" +
            "<p>الوديعة: <strong>" + (u.deposit || 0).toFixed(2) + " EGP</strong></p>" +
            "<p>الأرباح: <strong>" + (u.profit || 0).toFixed(2) + " EGP</strong></p>" +
            "<p>الباقة: <strong>" + (u.subscribedPackage || "غير مشترك") + "</strong></p>" +
            "<div style='margin-top:10px;'>" +
                "<button onclick='adminModifyBalance(\"" + query + "\")' class='btn-action-sm' style='background:var(--neon-green); color:black;'>تعديل الرصيد</button>" +
                "<button onclick='adminModifyDeposit(\"" + query + "\")' class='btn-action-sm' style='background:var(--accent); color:black;'>تعديل الوديعة</button>" +
            "</div>" +
        "</div>";
    resultDiv.classList.remove("hidden");
}
