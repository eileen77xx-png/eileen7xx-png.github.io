<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسوق بلس | CENTRO COMERCIAL</title>
    <!-- FontAwesome & Google Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #0a0e14;
            --card-bg: #151c24;
            --card-border: #222d3a;
            --neon-green: #00ff88;
            --neon-green-gradient: linear-gradient(135deg, #00ff88, #10b981);
            --text-main: #ffffff;
            --text-muted: #94a3b8;
            --accent: #f59e0b;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
        body { background-color: var(--bg-dark); color: var(--text-main); min-height: 100vh; padding-bottom: 75px; }

        /* Fullscreen Screen Overlay for Login & Register */
        .fullscreen-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: linear-gradient(rgba(10, 14, 20, 0.85), rgba(10, 14, 20, 0.95)), 
                        url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1920&auto=format&fit=crop') no-repeat center center/cover;
            z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 15px; overflow-y: auto;
        }

        .auth-card {
            background: rgba(21, 28, 36, 0.95); backdrop-filter: blur(14px);
            border: 1px solid var(--card-border); border-radius: 20px;
            padding: 25px 20px; width: 100%; max-width: 420px; text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
        }

        .auth-card h2 { color: var(--neon-green); font-size: 24px; margin-bottom: 8px; }
        .auth-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 15px; }

        input {
            width: 100%; padding: 12px; margin: 8px 0; background: #0a0e14;
            border: 1px solid var(--card-border); border-radius: 10px; color: #fff;
            font-size: 14px; text-align: center; outline: none;
        }

        .btn-main {
            width: 100%; background: var(--neon-green-gradient); color: #000; border: none;
            padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 800;
            cursor: pointer; margin-top: 10px; transition: 0.2s;
        }

        .switch-text { margin-top: 15px; font-size: 13px; color: var(--text-muted); cursor: pointer; }
        .switch-text span { color: var(--neon-green); font-weight: 700; text-decoration: underline; }

        /* Fullscreen Admin Panel */
        #adminScreen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: #0a0e14; z-index: 3000; display: none; flex-direction: column; padding: 20px; overflow-y: auto;
        }

        .admin-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid var(--card-border); padding-bottom: 15px; margin-bottom: 20px;
        }

        .admin-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .admin-table th, .admin-table td { border: 1px solid var(--card-border); padding: 10px; text-align: center; }
        .admin-table th { background: #151c24; color: var(--neon-green); }

        /* App Container */
        #appContainer { display: none; flex-direction: column; width: 100%; max-width: 500px; margin: 0 auto; }

        .app-header-title {
            text-align: center; font-size: 20px; font-weight: 900; letter-spacing: 2px;
            color: #ffffff; padding: 15px 0 10px 0; text-transform: uppercase;
        }

        /* Notification Banner */
        .deposit-alert-box {
            background: rgba(0, 255, 136, 0.15); border: 1px solid var(--neon-green);
            color: var(--neon-green); border-radius: 12px; padding: 12px; margin: 10px 15px;
            font-size: 12px; text-align: center; display: none; font-weight: 700;
        }

        /* Wallet Hero Card */
        .wallet-card {
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 20px; padding: 20px; margin: 15px; text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative;
        }
        .wallet-balance-amount { font-size: 28px; font-weight: 900; color: #fff; margin: 5px 0; }
        .wallet-deposit { font-size: 13px; color: var(--neon-green); font-weight: 700; }

        .about-btn-badge {
            position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.08);
            border: 1px solid var(--card-border); color: var(--neon-green); padding: 4px 10px;
            border-radius: 20px; font-size: 11px; cursor: pointer; font-weight: 700;
        }

        /* Quick Actions Grid (Bonus & Referrals) */
        .quick-actions-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 0 15px 15px 15px;
        }
        .quick-action-btn {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
            padding: 12px; text-align: center; cursor: pointer; font-size: 12px; font-weight: 700;
            color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .quick-action-btn i { color: var(--neon-green); font-size: 16px; }

        /* Divider Bar (Profits Today) */
        .profit-divider-bar {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-radius: 14px; padding: 14px 18px; margin: 0 15px 15px 15px;
            display: flex; justify-content: space-between; align-items: center; color: #fff;
            box-shadow: 0 5px 15px rgba(37, 99, 235, 0.3);
        }

        /* Ticker Moving Bar */
        .ticker-container {
            background: var(--card-bg); border-y: 1px solid var(--card-border); padding: 8px 15px;
            overflow: hidden; white-space: nowrap; font-size: 12px; color: var(--accent); margin-bottom: 15px;
        }
        .ticker-text { display: inline-block; animation: marquee 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

        /* Egypt Flag Emblem */
        .egypt-badge-container { text-align: center; margin: 5px 0 15px 0; }
        .egypt-flag-icon { width: 45px; height: 30px; border-radius: 4px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.4); border: 1px solid #fff; }

        /* Pages Tab Content */
        .page-tab { display: none; padding: 0 15px; }
        .page-tab.active { display: block; }

        /* Packages List */
        .packages-list { display: flex; flex-direction: column; gap: 12px; }
        .package-item {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px;
            padding: 15px; display: flex; justify-content: space-between; align-items: center;
        }
        .package-info h4 { font-size: 15px; color: #fff; margin-bottom: 3px; }
        .package-info p { font-size: 12px; color: var(--neon-green); font-weight: 700; }
        .package-price-action .price { font-size: 16px; font-weight: 800; color: var(--accent); margin-bottom: 5px; text-align: left; }
        .package-price-action button { background: var(--neon-green-gradient); color: #000; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; }

        /* Task Cards */
        .task-card {
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;
        }
        .task-card img { width: 65px; height: 65px; border-radius: 10px; object-fit: cover; border: 1px solid var(--card-border); }
        .task-card.completed { opacity: 0.6; border-color: var(--neon-green); }
        .task-btn { background: var(--neon-green); color: #000; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer; margin-top: 5px; }

        /* Orders / Transactions List Card */
        .order-item-card {
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 14px; padding: 14px; margin-bottom: 10px; font-size: 12px; line-height: 1.7;
        }

        /* Bottom Navigation Bar */
        .bottom-nav {
            position: fixed; bottom: 0; left: 0; width: 100%; background: #0f141c;
            border-top: 1px solid var(--card-border); display: flex; justify-content: space-around;
            padding: 10px 0; z-index: 1000;
        }
        .nav-item {
            color: var(--text-muted); text-decoration: none; font-size: 11px;
            display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;
        }
        .nav-item.active { color: var(--neon-green); }
        .nav-item i { font-size: 18px; }

        .floating-support { position: fixed; bottom: 70px; left: 15px; background: #0088cc; color: #fff; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4); z-index: 99; text-decoration: none; }

        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 4000; justify-content: center; align-items: center; padding: 15px; }
        .modal-content { background: var(--card-bg); border-radius: 16px; padding: 20px; width: 100%; max-width: 450px; position: relative; border: 1px solid var(--card-border); max-height: 85vh; overflow-y: auto; }
    </style>
</head>
<body>

    <!-- 1. FULLSCREEN ADMIN PANEL FOR COMPANY OWNER -->
    <div id="adminScreen">
        <div class="admin-header">
            <h2 style="color: var(--neon-green); font-size: 18px;"><i class="fa-solid fa-user-shield"></i> لوحة تحكم صاحب الشركة (الأدمن)</h2>
            <button onclick="closeAdminPanel()" style="background:#dc2626; color:#fff; border:none; padding:8px 15px; border-radius:8px; font-weight:700; cursor:pointer;">إغلاق والعودة</button>
        </div>

        <h3 style="font-size:14px; margin-bottom:10px;">📋 جميع بيانات المستخدمين وأرصدتهم والباقات المشتركين بها:</h3>
        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الهاتف</th>
                        <th>الرصيد</th>
                        <th>الوديعة</th>
                        <th>الباقة المشترك بها</th>
                        <th>شحن الرصيد</th>
                    </tr>
                </thead>
                <tbody id="adminUsersTableBody"></tbody>
            </table>
        </div>
    </div>

    <!-- 2. LOGIN SCREEN -->
    <div id="loginScreen" class="fullscreen-screen">
        <div class="auth-card">
            <h2>تسجيل الدخول</h2>
            <p>أدخل بياناتك للدخول إلى حسابك أو إدارة المنصة.</p>
            <input type="tel" id="loginPhone" placeholder="رقم الهاتف">
            <input type="password" id="loginPass" placeholder="كلمة السر">
            <button class="btn-main" onclick="processLogin()">دخول</button>
            <div class="switch-text" onclick="showScreen('registerScreen')">
                ليس لديك حساب؟ <span>إنشاء حساب جديد</span>
            </div>
        </div>
    </div>

    <!-- 3. REGISTER SCREEN -->
    <div id="registerScreen" class="fullscreen-screen" style="display: none;">
        <div class="auth-card">
            <h2>إنشاء حساب جديد</h2>
            <p>انضم إلينا الآن واحصل على <strong>50 EGP هدية ترحيبية</strong> فوراً!</p>
            <input type="text" id="regName" placeholder="الاسم الكامل">
            <input type="tel" id="regPhone" placeholder="رقم الهاتف">
            <input type="password" id="regPass" placeholder="كلمة السر">
            <button class="btn-main" onclick="processRegister()">تسجيل حساب جديد</button>
            <div class="switch-text" onclick="showScreen('loginScreen')">
                لديك حساب بالفعل؟ <span>تسجيل الدخول</span>
            </div>
        </div>
    </div>

    <!-- 4. MAIN USER DASHBOARD -->
    <div id="appContainer">
        
        <div class="app-header-title">CENTRO COMERCIAL</div>

        <!-- Deposit Success Alert Notification -->
        <div id="depositAlert" class="deposit-alert-box">
            🎉 مبروك! تم شحن الحساب بنجاح. يمكنك الآن اختيار باقة الاستثمار المتوفرة حسب رصيدك!
        </div>

        <!-- PAGE 1: HOME TAB -->
        <div id="tabHome" class="page-tab active">
            <!-- Wallet Card -->
            <div class="wallet-card">
                <div class="about-btn-badge" onclick="openModal('aboutModal')">
                    <i class="fa-solid fa-shield-halved"></i> توثيق المنصة
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top:10px;">إجمالي رصيد المحفظة</div>
                <div class="wallet-balance-amount"><span id="balanceDisplay">50</span> EGP</div>
                <div class="wallet-deposit">الوديعة المتاحة: <span id="depositDisplay">0</span> EGP</div>
            </div>

            <!-- Quick Actions Grid (Daily Bonus & Referrals) -->
            <div class="quick-actions-grid">
                <div class="quick-action-btn" onclick="claimDailyBonus()">
                    <i class="fa-solid fa-gift"></i>
                    <span>مكافأة الحضور اليومي</span>
                </div>
                <div class="quick-action-btn" onclick="openModal('referralModal')">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>دعوة الأصدقاء (+10 EGP)</span>
                </div>
            </div>

            <!-- Egypt Flag Emblem -->
            <div class="egypt-badge-container">
                <img src="https://flagcdn.com/w80/eg.png" class="egypt-flag-icon" alt="مصر">
                <div style="font-size:11px; color:var(--text-muted); margin-top:3px; font-weight:700;">الفرع الرسمي المعتمد في جمهورية مصر العربية 🇪🇬</div>
            </div>

            <!-- Divider Bar (Profits Today) -->
            <div class="profit-divider-bar">
                <div>
                    <i class="fa-solid fa-chart-line"></i> 
                    <span>أرباح اليوم التقديرية</span>
                </div>
                <div style="font-size:18px; font-weight:900;" id="todayProfitsDisplay">0 EGP</div>
            </div>

            <!-- Moving Ticker Notifications Bar -->
            <div class="ticker-container">
                <div class="ticker-text">
                    🚀 تم انضمام مستخدم جديد برقم: 010****5821 | 🎉 ألف مبروك للمستخدم 012****3091 حصوله على جائزة السحب اليومي! | 💎 انضمام مستخدم جديد للباقة الفضية برقم: 015****8824
                </div>
            </div>

            <!-- Packages List -->
            <div style="font-size:15px; font-weight:800; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-crown" style="color: var(--accent);"></i>
                <span>باقات الاستثمار المتاحة (عائد يومي 10%)</span>
            </div>

            <div class="packages-list">
                <div class="package-item">
                    <div class="package-info">
                        <h4>باقة المبتدئين (VIP 1)</h4>
                        <p>العائد اليومي: 30 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">300 EGP</div>
                        <button onclick="subscribeUserPackage(300, 'VIP 1')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>الباقة الفضية (VIP 2)</h4>
                        <p>العائد اليومي: 100 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">1,000 EGP</div>
                        <button onclick="subscribeUserPackage(1000, 'VIP 2')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>الباقة الذهبية (VIP 3)</h4>
                        <p>العائد اليومي: 250 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">2,500 EGP</div>
                        <button onclick="subscribeUserPackage(2500, 'VIP 3')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>الباقة الماسّية (VIP 4)</h4>
                        <p>العائد اليومي: 400 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">4,000 EGP</div>
                        <button onclick="subscribeUserPackage(4000, 'VIP 4')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>باقة كبار المستثمرين (VIP 5)</h4>
                        <p>العائد اليومي: 600 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">6,000 EGP</div>
                        <button onclick="subscribeUserPackage(6000, 'VIP 5')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>الباقة النخبوية (VIP 6)</h4>
                        <p>العائد اليومي: 900 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">9,000 EGP</div>
                        <button onclick="subscribeUserPackage(9000, 'VIP 6')">اشتراك</button>
                    </div>
                </div>

                <div class="package-item">
                    <div class="package-info">
                        <h4>الباقة الملكية (VIP 7)</h4>
                        <p>العائد اليومي: 1,200 EGP</p>
                    </div>
                    <div class="package-price-action">
                        <div class="price">12,000 EGP</div>
                        <button onclick="subscribeUserPackage(12000, 'VIP 7')">اشتراك</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- PAGE 2: TASKS TAB (مركز المهمات الحقيقي) -->
        <div id="tabTasks" class="page-tab">
            <div style="font-size:16px; font-weight:800; margin-bottom:8px; color:var(--neon-green); display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-list-check"></i>
                <span>المهام اليومية لتقييم المنتجات</span>
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:15px;">أتمم مهامك اليومية (5 مهام) لإضافة عمولات الأرباح الفورية إلى رصيدك.</p>

            <div id="tasksContainer">
                <div class="task-card" id="task1">
                    <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150" alt="Phone">
                    <div style="flex:1;">
                        <h4 style="font-size:13px; margin-bottom:2px;">تقييم هاتف ذكي حديث</h4>
                        <p style="font-size:11px; color:var(--neon-green);">المكافأة: +10 EGP</p>
                        <button class="task-btn" onclick="completeTask(1, 10)">إنجاز المهمة</button>
                    </div>
                </div>

                <div class="task-card" id="task2">
                    <img src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150" alt="Charger">
                    <div style="flex:1;">
                        <h4 style="font-size:13px; margin-bottom:2px;">تقييم شاحن متنقل سريع</h4>
                        <p style="font-size:11px; color:var(--neon-green);">المكافأة: +10 EGP</p>
                        <button class="task-btn" onclick="completeTask(2, 10)">إنجاز المهمة</button>
                    </div>
                </div>

                <div class="task-card" id="task3">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150" alt="Headphones">
                    <div style="flex:1;">
                        <h4 style="font-size:13px; margin-bottom:2px;">تقييم سماعات لاسلكية</h4>
                        <p style="font-size:11px; color:var(--neon-green);">المكافأة: +15 EGP</p>
                        <button class="task-btn" onclick="completeTask(3, 15)">إنجاز المهمة</button>
                    </div>
                </div>

                <div class="task-card" id="task4">
                    <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150" alt="Tablet">
                    <div style="flex:1;">
                        <h4 style="font-size:13px; margin-bottom:2px;">تقييم جهاز لوحي محمول</h4>
                        <p style="font-size:11px; color:var(--neon-green);">المكافأة: +20 EGP</p>
                        <button class="task-btn" onclick="completeTask(4, 20)">إنجاز المهمة</button>
                    </div>
                </div>

                <div class="task-card" id="task5">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150" alt="Watch">
                    <div style="flex:1;">
                        <h4 style="font-size:13px; margin-bottom:2px;">تقييم ساعة ذكية رياضية</h4>
                        <p style="font-size:11px; color:var(--neon-green);">المكافأة: +15 EGP</p>
                        <button class="task-btn" onclick="completeTask(5, 15)">إنجاز المهمة</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- PAGE 3: ORDERS TAB (سجل المعاملات والطلبات) -->
        <div id="tabOrders" class="page-tab">
            <div style="font-size:16px; font-weight:800; margin-bottom:12px; color:var(--neon-green); display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-clipboard-list"></i>
                <span>سجل المعاملات والطلبات المالي</span>
            </div>
            
            <div id="userOrdersList"></div>
        </div>

        <a href="https://t.me/tasawwoq_plus" target="_blank" class="floating-support">
            <i class="fa-brands fa-telegram"></i>
        </a>

        <!-- Bottom Navigation Bar -->
        <nav class="bottom-nav">
            <div class="nav-item active" onclick="switchMainTab('tabHome', this)">
                <i class="fa-solid fa-house"></i>
                <span>الرئيسية</span>
            </div>
            <div class="nav-item" onclick="switchMainTab('tabTasks', this)">
                <i class="fa-solid fa-crown"></i>
                <span>مهمة</span>
            </div>
            <div class="nav-item" onclick="switchMainTab('tabOrders', this)">
                <i class="fa-solid fa-clipboard-list"></i>
                <span>الطلبات</span>
            </div>
            <div class="nav-item" onclick="checkAdminAccess()">
                <i class="fa-solid fa-user"></i>
                <span>حسابي / الأدمن</span>
            </div>
        </nav>

    </div>

    <!-- MODAL: ABOUT PLATFORM & OFFICIAL CERTIFICATES -->
    <div id="aboutModal" class="modal">
        <div class="modal-content">
            <span style="position:absolute; top:12px; left:12px; cursor:pointer;" onclick="closeModal('aboutModal')">&times;</span>
            <h3 style="font-size:16px; color:var(--neon-green); margin-bottom:10px;"><i class="fa-solid fa-shield-halved"></i> توثيق واعتمادات المنصة الرسمية</h3>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.7;">
                🏛️ **التأسيس والمقر الرئيسي:**<br>
                تأسست شركة <strong>Tasawwoq Plus LLC</strong> بفرعها الرئيسي في ولاية تكساس، الولايات المتحدة الأمريكية عام <strong>2018</strong> برأس مال يتجاوز 10 ملايين دولار.<br><br>
                🇪🇬 **فرع جمهورية مصر العربية:**<br>
                فرع معتمد رسمياً لتقديم خدمات التسويق وتقييم المنتجات الرقمية مع تسهيل السحب والإيداع الفوري عبر المحافظ الإلكترونية.<br><br>
                🔒 **الأمان والضمان:** تشفير بنكي `SSL 256-bit` لضمان حماية جميع المعاملات.
            </p>
            <button class="btn-main" onclick="closeModal('aboutModal')">تم الاطلاع والقبول</button>
        </div>
    </div>

    <!-- MODAL: REFERRAL SYSTEM -->
    <div id="referralModal" class="modal">
        <div class="modal-content">
            <span style="position:absolute; top:12px; left:12px; cursor:pointer;" onclick="closeModal('referralModal')">&times;</span>
            <h3 style="font-size:16px; color:var(--neon-green); margin-bottom:10px;"><i class="fa-solid fa-user-plus"></i> نظام دعوة الأصدقاء</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">شارك رابط الإحالة الخاص بك مع أصدقائك واحصل على 10 EGP فور تسجيلهم:</p>
            <input type="text" id="referralLinkInput" readonly style="font-size:11px;">
            <button class="btn-main" onclick="copyReferralLink()">نسخ رابط الدعوة</button>
        </div>
    </div>

    <!-- Script Logic -->
    <script>
        const ADMIN_PHONE = "01032315526";

        let dbUsers = JSON.parse(localStorage.getItem('tasawwoq_users')) || {
            [ADMIN_PHONE]: { name: "صاحب الشركة (الأدمن)", balance: 10000, deposit: 10000, package: "VIP 7", role: "admin", notified: false, lastBonusDate: "" }
        };

        let dbOrders = JSON.parse(localStorage.getItem('tasawwoq_orders')) || [];
        let currentPhone = "";

        function showScreen(screenId) {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('registerScreen').style.display = 'none';
            document.getElementById(screenId).style.display = 'flex';
        }

        function processLogin() {
            const phone = document.getElementById('loginPhone').value.trim();
            if(!phone) { alert('يرجى إدخال رقم الهاتف'); return; }

            if(!dbUsers[phone]) {
                dbUsers[phone] = {
                    name: (phone === ADMIN_PHONE) ? "صاحب الشركة" : "مستخدم " + phone.slice(-4),
                    balance: 50,
                    deposit: 0,
                    package: "غير مشترك",
                    role: (phone === ADMIN_PHONE) ? "admin" : "user",
                    notified: false,
                    lastBonusDate: ""
                };
                localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
            }

            currentPhone = phone;
            startApp();
        }

        function processRegister() {
            const name = document.getElementById('regName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            if(!name || !phone) { alert('يرجى ملء جميع البيانات'); return; }

            dbUsers[phone] = {
                name: name,
                balance: 50,
                deposit: 0,
                package: "غير مشترك",
                role: (phone === ADMIN_PHONE) ? "admin" : "user",
                notified: false,
                lastBonusDate: ""
            };

            localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
            currentPhone = phone;
            startApp();
        }

        function startApp() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('registerScreen').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
            
            document.getElementById('referralLinkInput').value = window.location.origin + window.location.pathname + "?ref=" + currentPhone;
            updateUI();
        }

        function updateUI() {
            const user = dbUsers[currentPhone];
            if(!user) return;

            document.getElementById('balanceDisplay').innerText = user.balance;
            document.getElementById('depositDisplay').innerText = user.deposit;

            if(user.notified) {
                document.getElementById('depositAlert').style.display = 'block';
            } else {
                document.getElementById('depositAlert').style.display = 'none';
            }

            if(user.package && user.package !== "غير مشترك") {
                document.getElementById('todayProfitsDisplay').innerText = (user.deposit * 0.10) + " EGP";
            } else {
                document.getElementById('todayProfitsDisplay').innerText = "0 EGP";
            }

            renderUserOrders();
        }

        function switchMainTab(tabId, element) {
            document.querySelectorAll('.page-tab').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            element.classList.add('active');
        }

        function checkAdminAccess() {
            if(currentPhone === ADMIN_PHONE || dbUsers[currentPhone]?.role === 'admin') {
                renderAdminTable();
                document.getElementById('adminScreen').style.display = 'flex';
            } else {
                alert('حساب المستخدم الخاص بك نشط وموثق برقم: ' + currentPhone);
            }
        }

        function closeAdminPanel() {
            document.getElementById('adminScreen').style.display = 'none';
            updateUI();
        }

        function renderAdminTable() {
            const tbody = document.getElementById('adminUsersTableBody');
            let html = "";
            for(let ph in dbUsers) {
                const u = dbUsers[ph];
                html += `<tr>
                    <td><b>${u.name}</b></td>
                    <td>${ph}</td>
                    <td>${u.balance} EGP</td>
                    <td>${u.deposit} EGP</td>
                    <td><span style="background:var(--accent); color:#000; padding:2px 6px; border-radius:4px; font-weight:bold;">${u.package || 'غير مشترك'}</span></td>
                    <td>
                        <button onclick="adminChargeUser('${ph}')" style="background:var(--neon-green); color:#000; border:none; padding:4px 8px; border-radius:6px; font-weight:bold; cursor:pointer;">شحن 💳</button>
                    </td>
                </tr>`;
            }
            tbody.innerHTML = html;
        }

        function adminChargeUser(ph) {
            const amount = prompt(`أدخل مبلغ الوديعة المراد شحنه للمستخدم ${ph}:`, "300");
            if(amount !== null && !isNaN(parseFloat(amount))) {
                dbUsers[ph].deposit += parseFloat(amount);
                dbUsers[ph].balance += parseFloat(amount);
                dbUsers[ph].notified = true;

                dbOrders.push({
                    userPhone: ph,
                    type: "شحن وديعة إداري",
                    amount: parseFloat(amount),
                    status: "مكتمـل ✓",
                    time: new Date().toLocaleString()
                });

                localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
                localStorage.setItem('tasawwoq_orders', JSON.stringify(dbOrders));
                renderAdminTable();
                alert(`تم شحن الوديعة للمستخدم ${ph} بنجاح!`);
            }
        }

        function subscribeUserPackage(price, packageName) {
            const user = dbUsers[currentPhone];

            if(user.deposit < price) {
                alert(`عذراً! رصيد الوديعة لديك (${user.deposit} EGP) غير كافٍ للاشتراك في ${packageName} بقيمة ${price} EGP.`);
                return;
            }

            user.deposit -= price;
            user.package = packageName;
            user.notified = false;

            dbOrders.push({
                userPhone: currentPhone,
                type: "اشتراك في " + packageName,
                amount: price,
                status: "مكتمـل ✓",
                time: new Date().toLocaleString()
            });

            localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
            localStorage.setItem('tasawwoq_orders', JSON.stringify(dbOrders));
            updateUI();
            alert(`🎉 مبروك! تم اشتراكك بنجاح في ${packageName}.`);
        }

        function claimDailyBonus() {
            const user = dbUsers[currentPhone];
            const today = new Date().toDateString();

            if(user.lastBonusDate === today) {
                alert('لقد استلمت مكافأة الحضور اليومي بالفعل! عُد غداً للمزيد.');
                return;
            }

            user.balance += 10;
            user.lastBonusDate = today;

            dbOrders.push({
                userPhone: currentPhone,
                type: "مكافأة الحضور اليومي",
                amount: 10,
                status: "مكتمـل ✓",
                time: new Date().toLocaleString()
            });

            localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
            localStorage.setItem('tasawwoq_orders', JSON.stringify(dbOrders));
            updateUI();
            alert('🎉 مبروك! حصلت على هدية الحضور اليومي بقيمة 10 EGP.');
        }

        function completeTask(taskId, reward) {
            const taskCard = document.getElementById('task' + taskId);
            if(taskCard.classList.contains('completed')) {
                alert('لقد أنجزت هذه المهمة اليوم مسبقاً!');
                return;
            }

            dbUsers[currentPhone].balance += reward;
            taskCard.classList.add('completed');
            taskCard.querySelector('.task-btn').innerText = 'تم الإنجاز ✓';
            taskCard.querySelector('.task-btn').style.background = '#64748b';

            dbOrders.push({
                userPhone: currentPhone,
                type: "إنجاز مهمة تسوق رقمية #" + taskId,
                amount: reward,
                status: "مكتمـل ✓",
                time: new Date().toLocaleString()
            });

            localStorage.setItem('tasawwoq_users', JSON.stringify(dbUsers));
            localStorage.setItem('tasawwoq_orders', JSON.stringify(dbOrders));
            updateUI();
            alert(`🎉 مبروك! تمت المهمة بنجاح وأُضيف مبلغ ${reward} EGP لرصيدك.`);
        }

        function copyReferralLink() {
            const input = document.getElementById("referralLinkInput");
            input.select();
            document.execCommand("copy");
            alert("تم نسخ رابط الدعوة بنجاح!");
        }

        function renderUserOrders() {
            const ordersDiv = document.getElementById('userOrdersList');
            const myOrders = dbOrders.filter(o => o.userPhone === currentPhone);

            if(myOrders.length === 0) {
                ordersDiv.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">لا توجد معاملات مسجلة حتى الآن.</div>`;
                return;
            }

            let html = "";
            myOrders.reverse().forEach(o => {
                html += `<div class="order-item-card">
                    <b>العملية:</b> ${o.type}<br>
                    <b>المبلغ:</b> <span style="color:var(--neon-green); font-weight:bold;">${o.amount} EGP</span><br>
                    <b>الحالة:</b> <span style="color:var(--accent); font-weight:bold;">${o.status}</span><br>
                    <span style="font-size:10px; color:var(--text-muted);">${o.time}</span>
                </div>`;
            });
            ordersDiv.innerHTML = html;
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }
    </script>
</body>
</html>
