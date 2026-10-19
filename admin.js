// ====================== إعادة توجيه prompt افتراضياً للنافذة المخصصة ======================
window.prompt = function(title, defaultText) {
    return new Promise(function(resolve) {
        var modalEl = document.getElementById("customPromptModal");
        var titleEl = document.getElementById("customPromptTitle");
        var inputEl = document.getElementById("customPromptInput");
        var confirmBtn = document.getElementById("customPromptConfirmBtn");

        if (modalEl && titleEl && inputEl && confirmBtn) {
            titleEl.innerText = title;
            inputEl.value = defaultText || "";
            modalEl.classList.remove("hidden");
            inputEl.focus();

            // تنظيف أي أحداث قديمة
            var newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.onclick = function() {
                var val = inputEl.value;
                modalEl.classList.add("hidden");
                resolve(val);
            };
        } else {
            resolve(null);
        }
    });
};

// ====================== لوحة تحكم الإدارة (الأدمن) ======================

function renderAdminPanel() {
    reloadDataFromStorage();
    renderAdminRequestsTable();
    renderAdminWithdrawRequestsTable();
    renderAdminUserTable();
}

function renderAdminRequestsTable() {
    var tbody = document.getElementById("adminRequestsTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    var pendingKeys = Object.keys(pendingRequests);
    if (pendingKeys.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-muted);'>لا توجد طلبات معلقة حالياً</td></tr>";
        return;
    }

    pendingKeys.forEach(function (phone) {
        var req = pendingRequests[phone];
        var uName = usersDB[phone] ? usersDB[phone].name : "غير معروف";
        tbody.innerHTML +=
            "<tr>" +
            "<td>" + uName + " (" + phone + ")</td>" +
            "<td>" + req.packageName + "</td>" +
            "<td>" + req.price + " EGP</td>" +
            "<td>" +
            "<button onclick='approvePackageRequest(\"" + phone + "\")' class='btn-submit' style='padding:5px 10px; font-size:12px; background:var(--neon-green); color:black; margin-left:5px;'>قبول ✅</button>" +
            "<button onclick='rejectPackageRequest(\"" + phone + "\")' class='btn-submit' style='padding:5px 10px; font-size:12px; background:var(--danger);'>رفض ❌</button>" +
            "</td>" +
            "</tr>";
    });
}

function approvePackageRequest(phone) {
    reloadDataFromStorage();
    var req = pendingRequests[phone];
    if (!req) return;

    if (usersDB[phone]) {
        usersDB[phone].subscribed = true;
        usersDB[phone].subscribedPackage = req.packageName;
        usersDB[phone].deposit = req.price;

        if (usersDB[phone].referrerPhone && usersDB[usersDB[phone].referrerPhone]) {
            var refUser = usersDB[usersDB[phone].referrerPhone];
            if (!refUser.referrals) refUser.referrals = [];
            if (refUser.referrals.indexOf(phone) === -1) {
                refUser.referrals.push(phone);
                refUser.profit = (refUser.profit || 0) + 100;
                refUser.refBonusEarned = (refUser.refBonusEarned || 0) + 100;
                usersDB[phone].referrerPhone = null;
            }
        }
    }

    delete pendingRequests[phone];
    saveAllData();
    renderAdminPanel();
    alert("تم قبول طلب تفعيل الباقة بنجاح!");
}

function rejectPackageRequest(phone) {
    reloadDataFromStorage();
    delete pendingRequests[phone];
    saveAllData();
    renderAdminPanel();
    alert("تم رفض طلب الباقة!");
}

function renderAdminWithdrawRequestsTable() {
    var tbody = document.getElementById("adminWithdrawRequestsTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    var pendingWithdraws = withdrawRequests.filter(function (r) {
        return r.status === "pending";
    });

    if (pendingWithdraws.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-muted);'>لا توجد طلبات سحب معلقة حالياً</td></tr>";
        return;
    }

    pendingWithdraws.forEach(function (req) {
        tbody.innerHTML +=
            "<tr>" +
            "<td>" + req.name + " (" + req.phone + ")</td>" +
            "<td>" + req.wallet + "</td>" +
            "<td>" + req.amount.toFixed(2) + " EGP</td>" +
            "<td>" + req.date + "</td>" +
            "<td>" +
            "<button onclick='approveWithdrawRequest(" + req.id + ")' class='btn-submit' style='padding:5px 10px; font-size:12px; background:var(--neon-green); color:black; margin-left:5px;'>موافقة وتسديد ✅</button>" +
            "<button onclick='rejectWithdrawRequest(" + req.id + ")' class='btn-submit' style='padding:5px 10px; font-size:12px; background:var(--danger);'>رفض ❌</button>" +
            "</td>" +
            "</tr>";
    });
}

function approveWithdrawRequest(reqId) {
    reloadDataFromStorage();
    var reqIndex = withdrawRequests.findIndex(function (r) { return r.id === reqId; });
    if (reqIndex === -1) return;

    var req = withdrawRequests[reqIndex];
    var user = usersDB[req.phone];

    if (user) {
        if ((user.profit || 0) < req.amount) {
            alert("تنبيه: رصيد العمولات الحالي للمسوق أقل من المبلغ المطلوب!");
            return;
        }
        user.profit -= req.amount;
    }

    withdrawRequests[reqIndex].status = "approved";
    saveAllData();
    renderAdminPanel();
    alert("تمت الموافقة على طلب السحب وخصم المبلغ من أرباح المسوق بنجاح!");
}

function rejectWithdrawRequest(reqId) {
    reloadDataFromStorage();
    var reqIndex = withdrawRequests.findIndex(function (r) { return r.id === reqId; });
    if (reqIndex === -1) return;

    withdrawRequests[reqIndex].status = "rejected";
    saveAllData();
    renderAdminPanel();
    alert("تم رفض طلب السحب!");
}

// تحويل الجدول إلى نظام بطاقات متجاوبة (Cards Grid) لعرض كافة المعلومات بوضوح تام بدون تحريك أفقي
function renderAdminUserTable() {
    var container = document.getElementById("adminUserTable");
    if (!container) return;
    container.innerHTML = "";

    var phones = Object.keys(usersDB);
    if (phones.length === 0) {
        container.innerHTML = "<div style='text-align:center; padding:15px; color:var(--text-muted);'>لا يوجد مسوقون مسجلون</div>";
        return;
    }

    var cardsHTML = "";
    phones.forEach(function (phone) {
        var u = usersDB[phone];
        var adminBadge = u.isAdmin ? " <span style='color:var(--neon-green); font-size:11px;'>(أدمن)</span>" : "";
        
        cardsHTML += `
            <div style="background: #090d16; border: 1px solid #23304d; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <div>
                        <span style="font-weight: bold; color: white; font-size: 14px;">${u.name}</span> ${adminBadge}
                        <div style="font-size: 11px; color: var(--text-muted);">${phone}</div>
                    </div>
                    <div style="text-align: left;">
                        <span style="font-size: 11px; color: var(--text-muted);">الرصيد المتاح:</span>
                        <div style="font-weight: bold; color: var(--neon-green); font-size: 13px;">${(u.balance || 0).toFixed(2)} EGP</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 8px;">
                    <div><span style="color: var(--text-muted);">خطة الترويج:</span> <strong style="color: var(--accent);">${(u.deposit || 0).toFixed(2)} EGP</strong></div>
                    <div><span style="color: var(--text-muted);">الباقة الحالية:</span> <strong style="color: var(--neon-green);">${u.subscribedPackage || "غير مشترك"}</strong></div>
                    <div style="grid-column: span 2;"><span style="color: var(--text-muted);">العمولات والإحالات:</span> عمولات: ${(u.profit || 0).toFixed(2)} EGP | إحالات: ${u.referrals ? u.referrals.length : 0}</div>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 4px;">
                    <button onclick="adminEditUserBalance('${phone}')" class="btn-submit" style="flex: 1; padding: 8px; font-size: 12px; background: linear-gradient(135deg, #22c55e, #16a34a);">تعديل الأرصدة</button>
                    <button onclick="adminDeleteUser('${phone}')" class="btn-submit" style="flex: 1; padding: 8px; font-size: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--danger); color: var(--danger);">حذف الحساب 🗑️</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = cardsHTML;
}

// تعديل الأرصدة باستخدام النافذة المخصصة الحديثة
async function adminEditUserBalance(phone) {
    reloadDataFromStorage();
    var u = usersDB[phone];
    if (!u) return;

    var newBalStr = await prompt("أدخل الرصيد المتاح الجديد للمسوق (" + u.name + "):", u.balance || 0);
    if (newBalStr === null) return;
    var newBal = parseFloat(newBalStr);
    if (!isNaN(newBal)) {
        u.balance = newBal;
    }

    var newProfitStr = await prompt("أدخل رصيد العمولات والأرباح الجديد للمسوق (" + u.name + "):", u.profit || 0);
    if (newProfitStr === null) return;
    var newProfit = parseFloat(newProfitStr);
    if (!isNaN(newProfit)) {
        u.profit = newProfit;
    }

    saveAllData();
    renderAdminPanel();
    alert("تم تحديث أرصدة المسوق بنجاح!");
}

// دالة حذف المشترك بشكل كلي
function adminDeleteUser(phone) {
    reloadDataFromStorage();
    var u = usersDB[phone];
    if (!u) {
        alert("الحساب غير موجود!");
        return;
    }

    if (confirm("هل أنت متأكد تماماً من حذف حساب المسوق: " + u.name + " (" + phone + ")؟\nلا يمكن التراجع عن هذا الإجراء وسيتم حذف بياناته بالكامل.")) {
        delete usersDB[phone];

        if (pendingRequests[phone]) {
            delete pendingRequests[phone];
        }

        withdrawRequests = withdrawRequests.filter(function (req) {
            return req.phone !== phone;
        });

        saveAllData();
        renderAdminPanel();
        
        var resultDiv = document.getElementById("adminSearchResult");
        if (resultDiv) resultDiv.classList.add("hidden");

        alert("تم حذف حساب المسوق وكل بياناته المرتبطة بنجاح!");
    }
}

function adminSearchUser() {
    reloadDataFromStorage();
    var query = document.getElementById("adminSearchInput").value.trim();
    var resultDiv = document.getElementById("adminSearchResult");

    if (!query) {
        alert("يرجى إدخال رقم الموبايل للبحث!");
        return;
    }

    var u = usersDB[query];
    if (!u) {
        resultDiv.innerHTML = "<p style='color:var(--danger); text-align:center; padding:10px;'>لم يتم العثور على مسوق بهذا الرقم!</p>";
        resultDiv.classList.remove("hidden");
        return;
    }

    resultDiv.innerHTML =
        "<div style='background:#090d16; border:1px solid #23304d; border-radius:10px; padding:15px; margin-top:10px;'>" +
        "<h4 style='color:var(--neon-green); margin-bottom:8px;'>" + u.name + " (" + query + ")</h4>" +
        "<p style='font-size:12px; color:#cbd5e1; margin-bottom:4px;'>كلمة السر: <strong style='color:var(--accent);'>" + u.password + "</strong></p>" +
        "<p style='font-size:12px; color:#cbd5e1; margin-bottom:4px;'>الرصيد المتاح: <strong>" + (u.balance || 0).toFixed(2) + " EGP</strong></p>" +
        "<p style='font-size:12px; color:#cbd5e1; margin-bottom:4px;'>خطة الترويج: <strong>" + (u.deposit || 0).toFixed(2) + " EGP</strong></p>" +
        "<p style='font-size:12px; color:#cbd5e1; margin-bottom:4px;'>الباقة النشطة: <strong>" + (u.subscribedPackage || "غير مشترك") + "</strong></p>" +
        "<p style='font-size:12px; color:#cbd5e1; margin-bottom:12px;'>العمولات والمكافآت: <strong>" + (u.profit || 0).toFixed(2) + " EGP</strong></p>" +
        "<div style='display:flex; gap:8px;'>" +
        "<button onclick='adminEditUserBalance(\"" + query + "\")' class='btn-submit' style='padding:6px 12px; font-size:12px;'>تعديل الأرصدة</button>" +
        "<button onclick='adminDeleteUser(\"" + query + "\")' class='btn-submit' style='padding:6px 12px; font-size:12px; background:var(--danger);'>حذف الحساب 🗑️</button>" +
        "</div>" +
        "</div>";
    resultDiv.classList.remove("hidden");
}
