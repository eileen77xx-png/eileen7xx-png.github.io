function renderAdminPanel() {
    var wTbody = document.getElementById("adminWithdrawRequestsTable");
    if (wTbody) {
        wTbody.innerHTML = "";
        var pendingWithdraws = withdrawRequests.filter(function(r) { return r.status === "pending"; });
        if (pendingWithdraws.length === 0) {
            wTbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-muted);'>لا توجد طلبات سحب معلقة حالياً</td></tr>";
        } else {
            pendingWithdraws.forEach(function(req) {
                wTbody.innerHTML += "<tr>" +
                    "<td><strong>" + req.name + "</strong><br><span style='color:var(--neon-green);'>" + req.phone + "</span></td>" +
                    "<td><strong style='color:var(--accent);'>" + req.wallet + "</strong></td>" +
                    "<td>" + req.amount.toFixed(2) + " EGP</td>" +
                    "<td>" + req.date + "</td>" +
                    "<td>" +
                        "<button onclick=\"approveWithdrawRequest(" + req.id + ")\" class='btn-action-sm' style='background:var(--neon-green); color:black;'>موافقة</button>" +
                        "<button onclick=\"rejectWithdrawRequest(" + req.id + ")\" class='btn-action-sm' style='background:var(--danger); color:white;'>رفض</button>" +
                    "</td>" +
                "</tr>";
            });
        }
    }

    var reqTbody = document.getElementById("adminRequestsTable");
    if (reqTbody) {
        reqTbody.innerHTML = "";
        var hasRequests = false;
        for (var phoneKey in pendingRequests) {
            hasRequests = true;
            var req = pendingRequests[phoneKey];
            reqTbody.innerHTML += "<tr>" +
                "<td><strong>" + req.name + "</strong><br><span style='color:var(--neon-green);'>" + phoneKey + "</span></td>" +
                "<td>" + req.packageName + "</td>" +
                "<td>" + req.price + " EGP</td>" +
                "<td>" +
                    "<button onclick=\"approvePackageRequest('" + phoneKey + "')\" class='btn-action-sm' style='background:var(--neon-green); color:black;'>موافقة</button>" +
                    "<button onclick=\"rejectPackageRequest('" + phoneKey + "')\" class='btn-action-sm' style='background:var(--danger); color:white;'>رفض</button>" +
                "</td>" +
            "</tr>";
        }
        if (!hasRequests) {
            reqTbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-muted);'>لا توجد طلبات معلقة حالياً</td></tr>";
        }
    }

    var tbody = document.getElementById("adminUserTable");
    if (!tbody) return;
    tbody.innerHTML = "";
    for (var p in usersDB) {
        var u = usersDB[p];
        var refCount = u.referrals ? u.referrals.length : 0;
        var refBonus = u.refBonusEarned || 0;
        var pkgName = u.subscribedPackage || "غير مشترك";

        tbody.innerHTML += "<tr>" +
            "<td><strong>" + u.name + "</strong><br><span style='color:var(--neon-green);'>" + p + "</span></td>" +
            "<td>" + (u.balance||0).toFixed(2) + " EGP</td>" +
            "<td>" + (u.deposit||0).toFixed(2) + " EGP</td>" +
            "<td><span style='color:var(--accent); font-weight:bold;'>" + pkgName + "</span></td>" +
            "<td>" + (u.profit||0).toFixed(2) + " EGP<br><span style='font-size:10px; color:var(--neon-green);'>إحالات: " + refCount + " (" + refBonus + " ج)</span></td>" +
            "<td>" +
                "<button onclick=\"adminAddBalance('" + p + "')\" class='btn-action-sm' style='background:var(--neon-green); color:black;'>شحن</button>" +
                "<button onclick=\"adminDeductBalance('" + p + "')\" class='btn-action-sm' style='background:var(--danger); color:white;'>خصم</button>" +
                "<button onclick=\"adminEditDeposit('" + p + "')\" class='btn-action-sm' style='background:var(--accent); color:black;'>الوديعة</button>" +
                "<button onclick=\"adminEditProfit('" + p + "')\" class='btn-action-sm' style='background:#3b82f6; color:white;'>الأرباح</button>" +
                "<button onclick=\"adminEditRefBonus('" + p + "')\" class='btn-action-sm' style='background:#8b5cf6; color:white;'>الإحالات</button>" +
            "</td>" +
        "</tr>";
    }
}

function adminSearchUser() {
    var phone = document.getElementById("adminSearchInput").value.trim();
    var resDiv = document.getElementById("adminSearchResult");

    if (!phone || !usersDB[phone]) {
        resDiv.innerHTML = "<p style='color:var(--danger); margin-top:10px;'>المستخدم غير موجود!</p>";
        resDiv.classList.remove("hidden");
        return;
    }

    var u = usersDB[phone];
    var uHistory = withdrawRequests.filter(function(r) { return r.phone === phone; });
    var historyHTML = "";

    if (uHistory.length === 0) {
        historyHTML = "<tr><td colspan='4'>لا توجد سحوبات سابقة</td></tr>";
    } else {
        uHistory.forEach(function(h) {
            historyHTML += "<tr><td>" + h.date + "</td><td>" + h.wallet + "</td><td>" + h.amount + " EGP</td><td>" + h.status + "</td></tr>";
        });
    }

    var refCount = u.referrals ? u.referrals.length : 0;
    var refBonus = u.refBonusEarned || 0;

    resDiv.innerHTML = "<div class='user-detail-card'>" +
        "<div style='display:flex; align-items:center; gap:12px; margin-bottom:10px;'>" +
            "<img src='" + (u.avatar || "https://via.placeholder.com/150") + "' style='width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-green);'>" +
            "<div><h4 style='color:var(--neon-green);'>" + u.name + "</h4><p style='font-size:12px; color:var(--text-muted);'>" + phone + "</p></div>" +
        "</div>" +
        "<p style='font-size:12px; margin-bottom:5px;'><strong>تاريخ إنشاء الحساب:</strong> " + (u.createdAt || "غير محدد") + "</p>" +
        "<p style='font-size:12px; margin-bottom:5px;'><strong>الباقة المشترك فيها:</strong> <span style='color:var(--accent);'>" + (u.subscribedPackage || "غير مشترك") + "</span></p>" +
        "<p style='font-size:12px; margin-bottom:5px;'><strong>الرصيد المتاح:</strong> " + (u.balance||0).toFixed(2) + " EGP</p>" +
        "<p style='font-size:12px; margin-bottom:5px;'><strong>الوديعة الحالية:</strong> " + (u.deposit||0).toFixed(2) + " EGP</p>" +
        "<p style='font-size:12px; margin-bottom:5px;'><strong>إجمالي الأرباح:</strong> " + (u.profit||0).toFixed(2) + " EGP</p>" +
        "<p style='font-size:12px; margin-bottom:10px;'><strong>إحصائيات الإحالة:</strong> عدد الأشخاص: " + refCount + " | أرباح الإحالات: " + refBonus + " EGP</p>" +
        "<h5 style='color:var(--accent); margin-bottom:5px;'>سجل سحوبات المستخدم:</h5>" +
        "<table><thead><tr><th>التاريخ</th><th>المحفظة</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>" + historyHTML + "</tbody></table>" +
    "</div>";

    resDiv.classList.remove("hidden");
}

function approveWithdrawRequest(reqId) {
    var reqIndex = withdrawRequests.findIndex(function(r) { return r.id === reqId; });
    if (reqIndex !== -1) {
        var req = withdrawRequests[reqIndex];
        var user = usersDB[req.phone];

        if (user && (user.profit || 0) >= req.amount) {
            user.profit -= req.amount;
            req.status = "approved";

            localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
            localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));

            renderAdminPanel();
            if (currentUserPhone === req.phone) loadUserData();
            alert("تمت الموافقة على طلب السحب بنجاح!");
        } else {
            alert("رصيد الأرباح غير كافٍ!");
        }
    }
}

function rejectWithdrawRequest(reqId) {
    var reqIndex = withdrawRequests.findIndex(function(r) { return r.id === reqId; });
    if (reqIndex !== -1) {
        if (confirm("هل أنت متأكد من رفض طلب السحب؟")) {
            withdrawRequests[reqIndex].status = "rejected";
            localStorage.setItem("tasawuq_withdraw_requests", JSON.stringify(withdrawRequests));
            renderAdminPanel();
            if (currentUserPhone === withdrawRequests[reqIndex].phone) loadUserData();
            alert("تم رفض طلب السحب.");
        }
    }
}

function approvePackageRequest(phone) {
    var req = pendingRequests[phone];
    var user = usersDB[phone];
    if (req && user) {
        if ((user.balance || 0) >= req.price) {
            user.balance -= req.price;
            user.deposit = req.price;
            user.subscribed = true;
            user.subscribedPackage = req.packageName;

            if (user.referrerPhone && usersDB[user.referrerPhone]) {
                var refUser = usersDB[user.referrerPhone];
                if (!refUser.referrals) refUser.referrals = [];
                if (refUser.referrals.indexOf(phone) === -1) {
                    refUser.referrals.push(phone);
                    refUser.profit = (refUser.profit || 0) + 100;
                    refUser.refBonusEarned = (refUser.refBonusEarned || 0) + 100;
                    user.referrerPhone = null;
                }
            }

            delete pendingRequests[phone];
            localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
            localStorage.setItem("tasawuq_pending_requests", JSON.stringify(pendingRequests));

            renderAdminPanel();
            if (currentUserPhone === phone) loadUserData();
            alert("تمت الموافقة على طلب الباقة وتفعيلها بنجاح!");
        } else {
            alert("رصيد المستخدم غير كافٍ.");
        }
    }
}

function rejectPackageRequest(phone) {
    if (confirm("هل أنت متأكد من رفض طلب الاشتراك؟")) {
        delete pendingRequests[phone];
        localStorage.setItem("tasawuq_pending_requests", JSON.stringify(pendingRequests));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم رفض الطلب.");
    }
}

function adminAddBalance(phone) {
    var val = parseFloat(prompt("أدخل المبلغ المراد شحنه لحساب (" + phone + "):"));
    if (!isNaN(val) && val > 0) {
        usersDB[phone].balance = (usersDB[phone].balance || 0) + val;
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم شحن الرصيد بنجاح!");
    }
}

function adminDeductBalance(phone) {
    var val = parseFloat(prompt("أدخل المبلغ المراد خصمه من حساب (" + phone + "):"));
    if (!isNaN(val) && val > 0) {
        usersDB[phone].balance = Math.max(0, (usersDB[phone].balance || 0) - val);
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم خصم الرصيد بنجاح!");
    }
}

function adminEditDeposit(phone) {
    var val = parseFloat(prompt("أدخل قيمة الوديعة الجديدة للحساب:", usersDB[phone].deposit || 0));
    if (!isNaN(val)) {
        usersDB[phone].deposit = val;
        usersDB[phone].subscribed = val > 0;
        usersDB[phone].subscribedPackage = val > 0 ? "باقة " + val + " EGP" : "غير مشترك";
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم تحديث قيمة الوديعة بنجاح!");
    }
}

function adminEditProfit(phone) {
    var val = parseFloat(prompt("أدخل إجمالي الأرباح الجديد للحساب:", usersDB[phone].profit || 0));
    if (!isNaN(val)) {
        usersDB[phone].profit = val;
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم تعديل الأرباح بنجاح!");
    }
}

function adminEditRefBonus(phone) {
    var currentBonus = usersDB[phone].refBonusEarned || 0;
    var newBonus = parseFloat(prompt("أدخل قيمة مكافآت الإحالات الجديدة للحساب (EGP):", currentBonus));
    if (!isNaN(newBonus)) {
        var diff = newBonus - currentBonus;
        usersDB[phone].refBonusEarned = newBonus;
        usersDB[phone].profit = Math.max(0, (usersDB[phone].profit || 0) + diff);
        
        localStorage.setItem("tasawuq_users", JSON.stringify(usersDB));
        renderAdminPanel();
        if (currentUserPhone === phone) loadUserData();
        alert("تم تعديل رصيد أرباح الإحالات بنجاح!");
    }
}
