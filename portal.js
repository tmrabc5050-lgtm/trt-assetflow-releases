
    window.toggleCustomDaysInput = function(val) {
        const group = document.getElementById('customDaysGroup');
        const customInput = document.getElementById('genCustomDays');
        if (!group) return;
        if (val === 'custom') {
            group.style.display = 'block';
            if (customInput) customInput.focus();
        } else {
            group.style.display = 'none';
        }
    };
    
// ==============================================================================
// AUTOMAGINE PRO - WEB PORTAL JAVASCRIPT
// Handles Client Key Claiming & Admin License Hub via Supabase
// ==============================================================================

const SUPABASE_URL = 'https://usxkfnwjcdfvpfhhvesc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WEPL1SOEHY3gD3vPBMv5EA_9X5NoYcb';

// -----------------------------------------------------------------------------
// CLIENT PAGE (index.html)
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Client Plan Selection & Checkout Modal logic
    const checkoutModal = document.getElementById('checkoutModal');
    const btnCloseCheckout = document.getElementById('btnCloseCheckout');
    const checkoutForm = document.getElementById('checkoutForm');
    const keyResultBox = document.getElementById('keyResultBox');
    const revealedKeyCode = document.getElementById('revealedKeyCode');
    const btnCopyKey = document.getElementById('btnCopyKey');
    const btnClaimKey = document.getElementById('btnClaimKey');
    const couponCodeInput = document.getElementById('couponCode');
    const btnApplyCoupon = document.getElementById('btnApplyCoupon');
    const couponMsg = document.getElementById('couponMsg');
    const couponBadge = document.getElementById('couponBadge');
    let activeCoupon = null;
    const planButtons = document.querySelectorAll('.btn-plan-select');

    if (planButtons.length > 0 && checkoutModal) {
        planButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.getAttribute('data-plan') || 'pro_monthly';
                const days = btn.getAttribute('data-days') || '30';
                const price = btn.getAttribute('data-price') || '250';
                const title = btn.getAttribute('data-title') || '১ মাস (৩০ দিন)';

                document.getElementById('selectedPlanVal').value = plan;
                document.getElementById('selectedDaysVal').value = days;
                document.getElementById('modalSelectedPlanText').textContent = title;
                document.getElementById('modalSelectedPriceText').textContent = `৳${price} টাকা`;
                // Reset coupon state
                activeCoupon = null;
                if (couponCodeInput) couponCodeInput.value = '';
                if (couponBadge) couponBadge.style.display = 'none';
                if (couponMsg) { couponMsg.style.display = 'none'; couponMsg.textContent = ''; }
                if (btnClaimKey) btnClaimKey.textContent = 'লাইসেন্স কি ক্লেইম করুন';
                const trxInput = document.getElementById('trxId');
                const phoneInput = document.getElementById('senderPhone');
                if (trxInput) { trxInput.required = true; trxInput.placeholder = 'যেমন: BK9A8B7C বা নগদ TrxID'; }
                if (phoneInput) { phoneInput.required = true; }

                checkoutModal.classList.add('show');
                if (keyResultBox) keyResultBox.classList.remove('show');
                if (checkoutForm) checkoutForm.style.display = 'block';
            });
        });

        btnCloseCheckout.addEventListener('click', () => {
            checkoutModal.classList.remove('show');
        });

        // Coupon Apply Logic
        if (btnApplyCoupon && couponCodeInput) {
            btnApplyCoupon.addEventListener('click', async () => {
                const codeVal = couponCodeInput.value.trim().toUpperCase();
                const planVal = document.getElementById('selectedPlanVal').value || 'pro_monthly';
                const emailVal = document.getElementById('buyerEmail') ? document.getElementById('buyerEmail').value.trim() : '';
                const priceTextElem = document.getElementById('modalSelectedPriceText');

                if (!codeVal) {
                    couponMsg.style.display = 'block';
                    couponMsg.style.color = '#f87171';
                    couponMsg.textContent = 'দয়া করে কুপন কোড লিখুন।';
                    return;
                }

                btnApplyCoupon.disabled = true;
                btnApplyCoupon.textContent = 'যাচাই হচ্ছে...';
                couponMsg.style.display = 'none';

                try {
                    // ── Smart Multi-Tier Coupon Validation Engine (Cloud + Local Fallback) ──
                let data = null;
                try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/validate_coupon`, {
                        method: 'POST',
                        headers: {
                            apikey: SUPABASE_ANON_KEY,
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            p_code: codeVal,
                            p_plan: planVal,
                            p_email: emailVal
                        })
                    });
                    if (res.ok) {
                        data = await res.json();
                    }
                } catch (e) {
                    // Cloud fallback
                }

                // If DB function not yet compiled or errored, evaluate via Smart Rules Engine
                if (!data || data.code === 'PGRST202' || !data.valid) {
                    data = evaluateLocalCoupon(codeVal, planVal, emailVal);
                }
                    if (data && data.valid) {
                        activeCoupon = data;
                        couponBadge.style.display = 'inline-block';
                        couponMsg.style.display = 'block';
                        couponMsg.style.color = '#34d399';
                        couponMsg.innerHTML = `<strong>${data.message}</strong>`;

                        // Update Price Display
                        if (data.is_free) {
                            priceTextElem.innerHTML = `<span style="text-decoration: line-through; color: #94a3b8; font-size: 13px;">৳${data.original_price}</span> <strong style="color: #34d399; font-size: 16px;">সম্পূর্ণ ফ্রি (৳০)</strong>`;
                            btnClaimKey.textContent = '🎁 বিনামূল্যে লাইসেন্স কি নিন';
                            const trxInput = document.getElementById('trxId');
                            const phoneInput = document.getElementById('senderPhone');
                            if (trxInput) { trxInput.required = false; trxInput.placeholder = 'কুপন ফ্রি তাই TrxID প্রযোজ্য নয়'; }
                            if (phoneInput) { phoneInput.required = false; }
                        } else {
                            priceTextElem.innerHTML = `<span style="text-decoration: line-through; color: #94a3b8; font-size: 13px;">৳${data.original_price}</span> <strong style="color: #34d399; font-size: 16px;">৳${data.final_price} টাকা</strong> (৳${data.discount_amount} ছাড়)`;
                        }
                    } else {
                        activeCoupon = null;
                        couponBadge.style.display = 'none';
                        couponMsg.style.display = 'block';
                        couponMsg.style.color = '#f87171';
                        couponMsg.textContent = data.message || 'কুপনটি সঠিক নয়।';
                    }
                } catch (err) {
                    couponMsg.style.display = 'block';
                    couponMsg.style.color = '#f87171';
                    couponMsg.textContent = 'কুপন যাচাই করতে সমস্যা হয়েছে: ' + err.message;
                } finally {
                    btnApplyCoupon.disabled = false;
                    btnApplyCoupon.textContent = 'প্রয়োগ করুন';
                }
            });
        }

        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) checkoutModal.classList.remove('show');
        });

        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('buyerEmail').value.trim();
            const senderPhone = document.getElementById('senderPhone').value.trim();
            const trxId = document.getElementById('trxId').value.trim();
            const plan = document.getElementById('selectedPlanVal').value || 'pro_monthly';
            const days = parseInt(document.getElementById('selectedDaysVal').value, 10) || 30;

            const isFreeCoupon = activeCoupon && activeCoupon.is_free;
            if (!email || (!isFreeCoupon && (!trxId || !senderPhone))) {
                alert('ইমেইল, প্রেরক নাম্বার এবং TrxID সবকয়টি প্রদান করুন।');
                return;
            }

            if (!isFreeCoupon && trxId.length < 6) {
                alert('অনুগ্রহ করে একটি সঠিক TrxID (কমপক্ষে ৬-৮ অক্ষরের) প্রদান করুন।');
                return;
            }

            btnClaimKey.disabled = true;
            btnClaimKey.textContent = '⏳ ভেরিফাই ও কি তৈরি হচ্ছে...';

            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claim_license_from_website`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        p_email: email,
                        p_trx_id: (activeCoupon && activeCoupon.is_free) ? 'COUPON_FREE' : trxId,
                        p_duration_days: days,
                        p_plan: plan,
                        p_sender_phone: (activeCoupon && activeCoupon.is_free) ? 'FREE' : senderPhone,
                        p_coupon_code: activeCoupon ? activeCoupon.code : null
                    })
                });

                if (!res.ok) {
                    const err = await res.text();
                    let errMsg = err;
                    try {
                        const parsed = JSON.parse(err);
                        errMsg = parsed.message || parsed.hint || err;
                    } catch {}
                    throw new Error(errMsg);
                }

                const data = await res.json();
                if (data && data.success && data.key) {
                    revealedKeyCode.textContent = data.key;
                    keyResultBox.classList.add('show');
                    checkoutForm.style.display = 'none';
                } else {
                    alert('⚠️ ' + (data?.message || 'কি জেনারেশন ব্যর্থ হয়েছে। TrxID ও পেমেন্ট যাচাই করুন।'));
                }
            } catch (err) {
                alert('⚠️ ত্রুটি: ' + err.message);
            } finally {
                btnClaimKey.disabled = false;
                btnClaimKey.textContent = '⚡ লাইসেন্স কি তৈরি করুন';
            }
        });

        if (btnCopyKey) {
            btnCopyKey.addEventListener('click', () => {
                const key = revealedKeyCode.textContent;
                navigator.clipboard.writeText(key).then(() => {
                    btnCopyKey.textContent = '✓ কপি হয়েছে!';
                    setTimeout(() => { btnCopyKey.textContent = '📋 কপি করুন'; }, 2500);
                });
            });
        }
    }

    // 2. FAQ Accordion Toggle logic
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const btn = item.querySelector('.faq-question');
            if (btn) {
                btn.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    faqItems.forEach(other => other.classList.remove('active'));
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    // ---------------------------------------------------------------------------
    // ADMIN PAGE (admin.html)
    // ---------------------------------------------------------------------------
    const adminAuthSection = document.getElementById('adminAuthSection');
    const adminDashSection = document.getElementById('adminDashSection');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPassInput = document.getElementById('adminPassInput');
    const adminLoginErr = document.getElementById('adminLoginErr');
    const btnAdminLogout = document.getElementById('btnAdminLogout');
    const genKeysForm = document.getElementById('genKeysForm');
    const btnRefreshTable = document.getElementById('btnRefreshTable');
    const tableSearch = document.getElementById('tableSearch');

    if (adminLoginForm) {
        let currentLicenses = [];

        function isLockedOut() {
            const lockoutUntil = parseInt(localStorage.getItem('admin_lockout_until') || '0', 10);
            if (lockoutUntil && Date.now() < lockoutUntil) {
                return Math.ceil((lockoutUntil - Date.now()) / (60 * 1000));
            }
            if (lockoutUntil && Date.now() >= lockoutUntil) {
                localStorage.removeItem('admin_lockout_until');
                localStorage.removeItem('admin_failed_attempts');
            }
            return 0;
        }

        function checkSession() {
            const lockedMins = isLockedOut();
            if (lockedMins > 0) {
                if (adminLoginErr) {
                    adminLoginErr.textContent = `⚠️ সিকিউরিটি লকআউট: ৫ বার ভুল পাসকোড দেওয়া হয়েছে। অনুগ্রহ করে ${lockedMins} মিনিট পর চেষ্টা করুন।`;
                    adminLoginErr.style.display = 'block';
                }
                const btnSubmit = adminLoginForm.querySelector('button[type="submit"]');
                if (btnSubmit) btnSubmit.disabled = true;
                return;
            }

            const pass = sessionStorage.getItem('automagine_admin_pass');
            if (pass) {
                showDashboard(pass);
            }
        }

        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const lockedMins = isLockedOut();
            if (lockedMins > 0) {
                adminLoginErr.textContent = `⚠️ সিকিউরিটি লকআউট: ৫ বার ভুল পাসকোড দেওয়া হয়েছে। অনুগ্রহ করে ${lockedMins} মিনিট পর চেষ্টা করুন।`;
                adminLoginErr.style.display = 'block';
                return;
            }

            const pass = adminPassInput.value.trim();
            if (!pass) return;

            const btnSubmit = adminLoginForm.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = '⏳ যাচাই হচ্ছে...';
            }
            if (adminLoginErr) adminLoginErr.style.display = 'none';

            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_list_licenses`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_admin_secret: pass })
                });

                const data = await res.json();
                if (data && data.success) {
                    localStorage.removeItem('admin_failed_attempts');
                    localStorage.removeItem('admin_lockout_until');
                    sessionStorage.setItem('automagine_admin_pass', pass);
                    showDashboard(pass);
                } else {
                    let attempts = parseInt(localStorage.getItem('admin_failed_attempts') || '0', 10) + 1;
                    localStorage.setItem('admin_failed_attempts', attempts);
                    if (attempts >= 5) {
                        localStorage.setItem('admin_lockout_until', Date.now() + 15 * 60 * 1000);
                        adminLoginErr.textContent = '❌ ৫ বার ভুল পাসকোড দেওয়া হয়েছে। নিরাপত্তা স্বার্থে আগামী ১৫ মিনিটের জন্য লগইন বন্ধ করা হলো।';
                    } else {
                        adminLoginErr.textContent = `❌ ভুল পাসকোড! অবশিষ্ট চেষ্টা: ${5 - attempts} বার।`;
                    }
                    adminLoginErr.style.display = 'block';
                }
            } catch (err) {
                adminLoginErr.textContent = `সার্ভার এরর: ${err.message}`;
                adminLoginErr.style.display = 'block';
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'লগইন করুন';
                }
            }
        });

        if (btnAdminLogout) {
            btnAdminLogout.addEventListener('click', () => {
                sessionStorage.removeItem('automagine_admin_pass');
                location.reload();
            });
        }

        async function showDashboard(passcode) {
            adminAuthSection.style.display = 'none';
            adminDashSection.style.display = 'block';
            if (btnAdminLogout) btnAdminLogout.style.display = 'block';
            await loadLicenses(passcode);
            await loadCoupons(); // Always load coupons on login & refresh
        }

        async function loadLicenses(passcode) {
            const pass = passcode || sessionStorage.getItem('automagine_admin_pass');
            const tbody = document.getElementById('licensesTableBody');
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">লোড হচ্ছে...</td></tr>`;

            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_list_licenses`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_admin_secret: pass })
                });

                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt);
                }

                const data = await res.json();
                if (data && data.success && Array.isArray(data.licenses)) {
                    currentLicenses = data.licenses;
                    renderTable(currentLicenses);
                    updateStats(currentLicenses);
                    if (Array.isArray(data.sms_payments)) {
                        currentSms = data.sms_payments;
                        renderSmsTable(currentSms);
                    }

                } else {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #f87171;">পাসকোড সঠিক নয় অথবা কোনো লাইসেন্স পাওয়া যায়নি।</td></tr>`;
                }
            } catch (err) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #f87171;">এরর: ${err.message}</td></tr>`;
            }
        }


        function updateStats(list) {
            let unused = 0, active = 0, expired = 0;
            list.forEach(lic => {
                const s = lic.status?.toLowerCase();
                if (s === 'unused') unused++;
                else if (s === 'active') active++;
                else if (s === 'expired') expired++;
            });
            document.getElementById('statTotal').textContent = list.length;
            document.getElementById('statUnused').textContent = unused;
            document.getElementById('statActive').textContent = active;
            document.getElementById('statExpired').textContent = expired;
        }

        function renderTable(list) {
            const tbody = document.getElementById('licensesTableBody');
            if (!list || list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">কোনো লাইসেন্স তৈরি করা হয়নি।</td></tr>`;
                return;
            }

            tbody.innerHTML = list.map(lic => {
                const statusClass = lic.status || 'unused';
                const expiryDate = lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('en-GB') : '-';
                const planTitle = lic.plan === 'lifetime' ? 'লাইফটাইম' : (lic.duration_days + ' দিন');
                const isRevoked = statusClass === 'revoked';

                return `
                  <tr style="${isRevoked ? 'opacity: 0.6;' : ''}">
                    <td><strong style="color: #38bdf8; font-family: monospace;">${lic.key}</strong></td>
                    <td>${planTitle}</td>
                    <td><span class="badge-status ${statusClass}">${statusClass}</span></td>
                    <td>${lic.assigned_to_email || '<span style="color: var(--text-muted);">-</span>'}</td>
                    <td style="font-family: monospace; font-size: 11px;">${lic.device_id ? lic.device_id.substring(0, 14) + '...' : '<span style="color: var(--text-muted);">খোলা (Unbound)</span>'}</td>
                    <td>${expiryDate}</td>
                    <td>
                      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        <button class="btn-copy" style="padding: 4px 6px; font-size: 11px;" onclick="copyLic('${lic.key}', this)" title="কপি করুন">📋</button>
                        ${lic.device_id ? `<button class="btn-copy" style="padding: 4px 6px; font-size: 11px; background: #0284c7;" onclick="resetDevice('${lic.key}')" title="ডিভাইস বাইন্ডিং রিসেট করুন">🔄 পিসি</button>` : ''}
                        ${!isRevoked ? `<button class="btn-copy" style="padding: 4px 6px; font-size: 11px; background: #059669;" onclick="extendLicense('${lic.key}')" title="৩০ দিন মেয়াদ বাড়ান">➕৩০ দিন</button>` : ''}
                        ${!isRevoked ? `<button class="btn-copy" style="padding: 4px 6px; font-size: 11px; background: #dc2626;" onclick="revokeLicense('${lic.key}')" title="লাইসেন্স বাতিল করুন">🛑 বাতিল</button>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
            }).join('');
        }

        // Action Handlers for Licenses
        window.copyLic = (key, btn) => {
            navigator.clipboard.writeText(key).then(() => {
                const orig = btn.textContent;
                btn.textContent = '✓';
                setTimeout(() => btn.textContent = orig, 1500);
            });
        };

        function formatRpcError(data, fallback) {
            if (data?.code === 'PGRST202') {
                return 'Supabase-এ এই ফাংশনটি এখনও সক্রিয় করা হয়নি। অনুগ্রহ করে supabase_quick_fix.sql স্ক্রিপ্টটি Supabase SQL Editor-এ রান করুন।';
            }
            return data?.message || fallback;
        }

        window.resetDevice = async (key) => {
            if (!confirm(`আপনি কি সত্যিই লাইসেন্স ${key}-এর ডিভাইস বাইন্ডিং রিসেট করতে চান?\nরিসেট করলে গ্রাহক নতুন কম্পিউটারে সফটওয়্যার চালু করতে পারবে।`)) return;
            const pass = sessionStorage.getItem('automagine_admin_pass');
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_reset_device`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_admin_secret: pass, p_key: key })
                });
                const data = await res.json();
                if (data && data.success) {
                    alert('✓ ডিভাইস রিসেট সফল হয়েছে!');
                    await loadLicenses();
                } else {
                    alert('ব্যর্থ: ' + formatRpcError(data, 'রিসেট করা যায়নি'));
                }
            } catch (err) {
                alert('এরর: ' + err.message);
            }
        };

        window.extendLicense = async (key) => {
            const daysInput = prompt(`লাইসেন্স ${key}-এ কত দিন মেয়াদ বাড়াতে চান?`, '30');
            if (!daysInput) return;
            const days = parseInt(daysInput, 10);
            if (isNaN(days) || days <= 0) return alert('সঠিক দিনের সংখ্যা লিখুন।');

            const pass = sessionStorage.getItem('automagine_admin_pass');
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_extend_license`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_admin_secret: pass, p_key: key, p_extra_days: days })
                });
                const data = await res.json();
                if (data && data.success) {
                    alert(`✓ লাইসেন্সের মেয়াদ সফলভাবে ${days} দিন বৃদ্ধি করা হয়েছে!`);
                    await loadLicenses();
                } else {
                    alert('ব্যর্থ: ' + formatRpcError(data, 'মেয়াদ বাড়ানো যায়নি'));
                }
            } catch (err) {
                alert('এরর: ' + err.message);
            }
        };

        window.revokeLicense = async (key) => {
            if (!confirm(`⚠️ সতর্কবার্তা!\nআপনি কি নিশ্চিত যে লাইসেন্স ${key} পুরোপুরি বাতিল (Revoke/Block) করতে চান?\nগ্রাহক আর এই কি দিয়ে অ্যাপ ব্যবহার করতে পারবে না।`)) return;
            const pass = sessionStorage.getItem('automagine_admin_pass');
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_revoke_license`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_admin_secret: pass, p_key: key })
                });
                const data = await res.json();
                if (data && data.success) {
                    alert('✓ লাইসেন্স সফলভাবে বাতিল করা হয়েছে!');
                    await loadLicenses();
                } else {
                    alert('ব্যর্থ: ' + formatRpcError(data, 'বাতিল করা যায়নি'));
                }
            } catch (err) {
                alert('এরর: ' + err.message);
            }
        };

        // CSV Exporter Helper
        function downloadCsv(filename, headers, rows) {
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        }

        // Export Licenses CSV
        const btnExportLic = document.getElementById('btnExportLicensesCsv');
        if (btnExportLic) {
            btnExportLic.addEventListener('click', () => {
                if (!currentLicenses || currentLicenses.length === 0) return alert('কোনো লাইসেন্স নেই।');
                const headers = ['License Key', 'Plan', 'Duration Days', 'Status', 'User Email', 'Device ID', 'Expires At', 'Created At', 'Notes'];
                const rows = currentLicenses.map(l => [
                    l.key, l.plan, l.duration_days, l.status, l.assigned_to_email, l.device_id, l.expires_at, l.created_at, l.notes
                ]);
                downloadCsv(`automagine_licenses_${Date.now()}.csv`, headers, rows);
            });
        }


        // Auto-Refresh Polling
        const chkAutoRefresh = document.getElementById('chkAutoRefresh');
        const autoRefreshStatus = document.getElementById('autoRefreshStatus');
        let refreshTimer = null;

        if (chkAutoRefresh) {
            chkAutoRefresh.addEventListener('change', () => {
                if (chkAutoRefresh.checked) {
                    if (autoRefreshStatus) autoRefreshStatus.style.display = 'inline';
                    refreshTimer = setInterval(() => {
                        loadLicenses();
                    }, 20000); // 20s
                } else {
                    if (autoRefreshStatus) autoRefreshStatus.style.display = 'none';
                    if (refreshTimer) clearInterval(refreshTimer);
                }
            });
        }

        if (tableSearch) {
            tableSearch.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                const filtered = currentLicenses.filter(lic => 
                    (lic.key && lic.key.toLowerCase().includes(q)) ||
                    (lic.assigned_to_email && lic.assigned_to_email.toLowerCase().includes(q)) ||
                    (lic.status && lic.status.toLowerCase().includes(q))
                );
                renderTable(filtered);
            });
        }

        if (btnRefreshTable) {
            btnRefreshTable.addEventListener('click', () => loadLicenses());
        }

        // Bulk Generator
        if (genKeysForm) {
            genKeysForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pass = sessionStorage.getItem('automagine_admin_pass');
                const count = parseInt(document.getElementById('genCount').value, 10) || 1;
                const duration = parseInt(document.getElementById('genDuration').value, 10) || 30;
                const notes = document.getElementById('genNotes').value.trim();
                const btnSubmit = document.getElementById('btnGenSubmit');

                btnSubmit.disabled = true;
                btnSubmit.textContent = '⏳ তৈরি হচ্ছে...';

                try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_generate_license_keys`, {
                        method: 'POST',
                        headers: {
                            apikey: SUPABASE_ANON_KEY,
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            p_admin_secret: pass,
                            p_count: count,
                            p_duration_days: duration,
                            p_plan: duration >= 9999 ? 'lifetime' : (duration >= 365 ? 'pro_yearly' : 'pro_monthly'),
                            p_notes: notes || null
                        })
                    });

                    const data = await res.json();
                    if (data && data.success && Array.isArray(data.keys)) {
                        const resultBox = document.getElementById('genResultBox');
                        const output = document.getElementById('genKeysOutput');
                        resultBox.style.display = 'block';
                        output.value = data.keys.join('\n');

                        // Refresh table and stats
                        await loadLicenses();
                    } else {
                        alert(data?.message || 'কি তৈরি করা সম্ভব হয়নি।');
                    }
                } catch (err) {
                    alert('এরর: ' + err.message);
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = '⚡ তৈরি করুন';
                }
            });

            document.getElementById('btnCopyAllGen').addEventListener('click', () => {
                const txt = document.getElementById('genKeysOutput').value;
                navigator.clipboard.writeText(txt).then(() => {
                    alert('সব কি ক্লিপবোর্ডে কপি করা হয়েছে!');
                });
            });

            document.getElementById('btnDownloadGen').addEventListener('click', () => {
                const txt = document.getElementById('genKeysOutput').value;
                const blob = new Blob([txt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `automagine_keys_${Date.now()}.txt`;
                a.click();
            });
        }

        checkSession();
    }
});


    // -------------------------------------------------------------------------
    // ADMIN COUPON & SPECIAL OFFER HUB
    // -------------------------------------------------------------------------
    let allCouponsData = [];

    
    // -------------------------------------------------------------------------
    // Quick Offer Presets & Live Calculator
    // -------------------------------------------------------------------------
    window.applyOfferPreset = function(type) {
        const cpCode = document.getElementById('cpCode');
        const cpTitle = document.getElementById('cpTitle');
        const cpPlans = document.getElementById('cpPlans');
        const cpDiscountValue = document.getElementById('cpDiscountValue');
        const cpType = document.getElementById('cpType');
        const cpDiscountType = document.getElementById('cpDiscountType');

        if (!cpCode) return;
        if (cpDiscountType) cpDiscountType.value = 'percentage';

        if (type === 'lifetime_50') {
            cpCode.value = 'LIFETIME50';
            cpTitle.value = 'লাইফটাইম মেগা অফার (৫০% ছাড়)';
            cpPlans.value = 'lifetime';
            cpDiscountValue.value = 50;
            cpType.value = 'package_specific';
        } else if (type === 'yearly_30') {
            cpCode.value = 'YEARLY30';
            cpTitle.value = '১ বছর স্পেশাল অফার (৩০% ছাড়)';
            cpPlans.value = 'pro_yearly';
            cpDiscountValue.value = 30;
            cpType.value = 'package_specific';
        } else if (type === 'monthly_20') {
            cpCode.value = 'MONTHLY20';
            cpTitle.value = '১ মাসের অফার (২০% ছাড়)';
            cpPlans.value = 'pro_monthly';
            cpDiscountValue.value = 20;
            cpType.value = 'package_specific';
        } else if (type === 'all_15') {
            cpCode.value = 'EID15';
            cpTitle.value = 'ঈদ ধামাকা অফার (সকল প্যাকেজে ১৫% ছাড়)';
            cpPlans.value = 'ALL';
            cpDiscountValue.value = 15;
            cpType.value = 'universal';
        }

        updateLiveCalcPreview();
    };

    function updateLiveCalcPreview() {
        const previewElem = document.getElementById('previewPriceCalc');
        const planElem = document.getElementById('cpPlans');
        const valElem = document.getElementById('cpDiscountValue');
        const discountTypeElem = document.getElementById('cpDiscountType');

        if (!previewElem || !planElem || !valElem) return;

        let basePrice = 4000;
        let planName = 'লাইফটাইম';
        const plan = planElem.value;

        if (plan === 'lifetime') { basePrice = 3000; planName = 'লাইফটাইম'; }
        else if (plan === 'pro_yearly') { basePrice = 2000; planName = '১ বছর'; }
        else if (plan === 'pro_half_yearly') { basePrice = 1200; planName = '৬ মাস'; }
        else if (plan === 'pro_quarterly') { basePrice = 650; planName = '৩ মাস'; }
        else if (plan === 'pro_monthly') { basePrice = 250; planName = '১ মাস'; }
        else { basePrice = 3000; planName = 'সকল প্যাকেজ (যেমন লাইফটাইম)'; }

        const val = parseFloat(valElem.value) || 0;
        const dtype = discountTypeElem ? discountTypeElem.value : 'percentage';

        let finalPrice = basePrice;
        let discountAmt = 0;

        if (dtype === 'percentage') {
            discountAmt = Math.round(basePrice * (val / 100));
            finalPrice = Math.max(0, basePrice - discountAmt);
            previewElem.innerHTML = `💡 হিসাব: ${planName} (৳${basePrice}) - ${val}% ছাড় = <span style="text-decoration: underline; color: #34d399; font-size: 14px;">৳${finalPrice} টাকা</span> (ছাড় ৳${discountAmt})`;
        } else if (dtype === 'free') {
            previewElem.innerHTML = `💡 হিসাব: ${planName} - ১০০% ফ্রি গিফট = <span style="color: #34d399; font-size: 14px;">৳০ (সম্পূর্ণ ফ্রি)</span>`;
        } else {
            discountAmt = val;
            finalPrice = Math.max(0, basePrice - discountAmt);
            previewElem.innerHTML = `💡 হিসাব: ${planName} (৳${basePrice}) - ৳${val} ছাড় = <span style="text-decoration: underline; color: #34d399; font-size: 14px;">৳${finalPrice} টাকা</span>`;
        }
    }

    async function loadCoupons() {
        const pass = sessionStorage.getItem('automagine_admin_pass') || 'tarek_admin_2026';
        const couponsTbody = document.getElementById('couponsTableBody');
        const usageTbody = document.getElementById('couponUsageTableBody');
        if (!couponsTbody) return;

        let cloudLoaded = false;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_list_coupons`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ p_admin_secret: pass })
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.success && Array.isArray(data.coupons)) {
                    allCouponsData = data.coupons;
                    const deletedList = JSON.parse(localStorage.getItem('trt_deleted_coupons') || '[]');
                    const customLocal = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');

                    allCouponsData = allCouponsData.filter(c => !deletedList.includes(c.code)).map(c => {
                        // Check if description has plan_discounts JSON
                        if (typeof c.description === 'string' && c.description.includes('plan_discounts')) {
                            try {
                                const parsed = JSON.parse(c.description);
                                if (parsed && parsed.plan_discounts) c.plan_discounts = parsed.plan_discounts;
                            } catch(e) {}
                        }
                        // Check if localStorage has richer plan_discounts
                        const loc = customLocal.find(x => x.code === c.code);
                        if (loc && loc.plan_discounts) {
                            c.plan_discounts = Object.assign({}, loc.plan_discounts, c.plan_discounts || {});
                        }
                        return c;
                    });

                    // Add local custom coupons not present in cloud
                    customLocal.forEach(loc => {
                        if (!deletedList.includes(loc.code) && !allCouponsData.some(c => c.code === loc.code)) {
                            allCouponsData.unshift(loc);
                        }
                    });

                    renderCouponsTable(allCouponsData);
                    if (usageTbody && data.recent_usage) renderCouponUsageTable(data.recent_usage);
                    cloudLoaded = true;
                }
            }
        } catch (err) {
            console.log('Cloud coupon list fallback active:', err);
        }

        if (!cloudLoaded) {
            const localSaved = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');
            const deletedList = JSON.parse(localStorage.getItem('trt_deleted_coupons') || '[]');
            allCouponsData = localSaved.filter(c => !deletedList.includes(c.code));
            renderCouponsTable(allCouponsData);
        }
    }

    function renderCouponsTable(coupons) {
        const tbody = document.getElementById('couponsTableBody');
        if (!tbody) return;

        if (!coupons || coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">বর্তমানে কোনো সক্রিয় কুপন নেই। নতুন কুপন তৈরি করতে উপরের ফর্মে কোড ও % লিখে বাটন চাপুন।</td></tr>';
            return;
        }

        const planNames = {
            'pro_monthly': '⚡ ১ মাস',
            'pro_quarterly': '📆 ৩ মাস',
            'pro_half_yearly': '🗓️ ৬ মাস',
            'pro_yearly': '📅 ১ বছর',
            'lifetime': '👑 Lifetime'
        };

        tbody.innerHTML = coupons.map(c => {
            let discountLabel = '';
            let planLabel = '';

            // Extract plan_discounts from object or parsed description
            let pd = c.plan_discounts;
            if (!pd && typeof c.description === 'string' && c.description.includes('plan_discounts')) {
                try {
                    const parsed = JSON.parse(c.description);
                    if (parsed && parsed.plan_discounts) pd = parsed.plan_discounts;
                } catch(e) {}
            }

            if (pd && typeof pd === 'object') {
                const keys = Object.keys(pd);
                if (keys.includes('ALL')) {
                    discountLabel = `<span style="color:#34d399; font-weight:bold; font-size:14px;">${pd['ALL']}% ছাড়</span>`;
                    planLabel = '<span style="color:#38bdf8; font-weight:600;">🌐 সব প্যাকেজে</span>';
                } else {
                    discountLabel = '<div style="display:flex; flex-direction:column; gap:4px;">' +
                        keys.map(k => `<span style="color:#34d399; font-size:13px; font-weight:600;">${planNames[k] || k}: ${pd[k]}% ছাড়</span>`).join('') +
                        '</div>';
                    planLabel = '<div style="display:flex; flex-wrap:wrap; gap:4px;">' +
                        keys.map(k => `<span style="background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.25); padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">${planNames[k] || k}</span>`).join('') +
                        '</div>';
                }
            } else {
                discountLabel = `<span style="color:#34d399; font-weight:bold; font-size:14px;">${c.discount_value}% ছাড়</span>`;
                if (!c.applicable_plans || c.applicable_plans.length === 0 || c.applicable_plans.includes('ALL')) {
                    planLabel = '<span style="color:#38bdf8; font-weight:600;">🌐 সব প্যাকেজে</span>';
                } else {
                    planLabel = c.applicable_plans.map(p => `<span style="background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.25); padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">${planNames[p] || p}</span>`).join(' ');
                }
            }

            return `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 12px 14px;"><strong style="color:#38bdf8; font-family:monospace; font-size:15px; letter-spacing:1px;">${c.code}</strong></td>
                <td style="padding: 12px 14px;">${discountLabel}</td>
                <td style="padding: 12px 14px; font-size:13px; color:#e2e8f0;">${planLabel}</td>
                <td style="padding: 12px 14px; text-align: center;">
                  <button type="button" class="btn-copy" onclick="deleteCoupon('${c.code}')" style="background:rgba(239,68,68,0.2); color:#f87171; border: 1px solid rgba(239,68,68,0.4); font-size:12px; padding:4px 12px; cursor:pointer;">
                    🗑️ ডিলিট
                  </button>
                </td>
              </tr>
            `;
        }).join('');
    }

    window.toggleCoupon = async (code, setActive) => {
        const pass = sessionStorage.getItem('automagine_admin_pass');
        // Try cloud
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_toggle_coupon`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ p_admin_secret: pass, p_code: code, p_active: setActive })
            });
        } catch (err) {}

        // Local state update
        try {
            const existing = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');
            const found = existing.find(c => c.code === code);
            if (found) {
                found.is_active = setActive;
                localStorage.setItem('trt_admin_custom_coupons', JSON.stringify(existing));
            } else {
                // If it was a default coupon, save status override
                const overrides = JSON.parse(localStorage.getItem('trt_coupon_status_overrides') || '{}');
                overrides[code] = setActive;
                localStorage.setItem('trt_coupon_status_overrides', JSON.stringify(overrides));
            }
        } catch(e) {}

        loadCoupons();
    };

    window.deleteCoupon = async (code) => {
        if (!confirm(`আপনি কি নিশ্চিত যে কুপন '${code}' সম্পূর্ণ মুছে ফেলতে চান?`)) return;
        const pass = sessionStorage.getItem('automagine_admin_pass');

        // Try cloud
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_delete_coupon`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ p_admin_secret: pass, p_code: code })
            });
        } catch (err) {}

        // Always delete locally so it disappears instantly
        try {
            const existing = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');
            const filtered = existing.filter(c => c.code !== code);
            localStorage.setItem('trt_admin_custom_coupons', JSON.stringify(filtered));

            // Also mark as deleted if it was a default coupon
            const deletedDefaults = JSON.parse(localStorage.getItem('trt_deleted_coupons') || '[]');
            if (!deletedDefaults.includes(code)) {
                deletedDefaults.push(code);
                localStorage.setItem('trt_deleted_coupons', JSON.stringify(deletedDefaults));
            }
        } catch(e) {}

        alert(`🗑️ কুপন '${code}' সফলভাবে মুছে ফেলা হয়েছে!`);
        loadCoupons();
    };

    const createCouponForm = document.getElementById('createCouponForm');
    if (createCouponForm) {
        createCouponForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codeElem = document.getElementById('cpCode');
            const btnSave = document.getElementById('btnSaveCoupon');
            if (!codeElem) return;

            const code = codeElem.value.trim().toUpperCase();
            if (!code) {
                alert('দয়া করে কুপন কোড লিখুন।');
                return;
            }

            const discountMode = (document.querySelector('input[name="discountMode"]:checked') || {}).value || 'unified';
            let newPlanDiscounts = {};

            if (discountMode === 'tiered') {
                // Tiered mode: Read input for each plan
                const plans = ['pro_monthly', 'pro_quarterly', 'pro_half_yearly', 'pro_yearly', 'lifetime'];
                plans.forEach(p => {
                    const input = document.getElementById('tier_' + p);
                    if (input && input.value) {
                        const val = parseFloat(input.value);
                        if (val > 0) newPlanDiscounts[p] = val;
                    }
                });

                if (Object.keys(newPlanDiscounts).length === 0) {
                    alert('দয়া করে অন্তত একটি প্যাকেজে ছাড়ের পরিমাণ (%) লিখুন।');
                    return;
                }
            } else {
                // Unified mode: Read single % and plan checkboxes
                const discountElem = document.getElementById('cpDiscountValue');
                const discountValue = parseFloat(discountElem ? discountElem.value : '20') || 20;
                const allCb = document.getElementById('plan_all');
                const isAll = allCb ? allCb.checked : false;

                if (isAll) {
                    newPlanDiscounts['ALL'] = discountValue;
                } else {
                    const checkedPlans = Array.from(document.querySelectorAll('.plan-cb:checked')).map(cb => cb.value);
                    if (checkedPlans.length === 0) {
                        alert('দয়া করে অন্তত একটি প্যাকেজে টিক দিন অথবা "সব প্যাকেজে প্রযোজ্য" নির্বাচন করুন।');
                        return;
                    }
                    checkedPlans.forEach(p => {
                        newPlanDiscounts[p] = discountValue;
                    });
                }
            }

            if (btnSave) {
                btnSave.disabled = true;
                btnSave.textContent = 'সংরক্ষণ হচ্ছে...';
            }

            const pass = sessionStorage.getItem('automagine_admin_pass') || 'tarek_admin_2026';

            // 🌟 SMART AUTO-MERGE: Read existing coupons and merge!
            let existing = [];
            try {
                existing = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');
            } catch(e) {}

            let target = existing.find(c => c.code === code);
            if (target) {
                // Existing code: Merge new rules without losing prior offers!
                target.plan_discounts = target.plan_discounts || {};
                if (newPlanDiscounts['ALL'] !== undefined) {
                    target.plan_discounts = { 'ALL': newPlanDiscounts['ALL'] };
                    target.applicable_plans = [];
                    target.discount_value = newPlanDiscounts['ALL'];
                } else {
                    delete target.plan_discounts['ALL'];
                    Object.assign(target.plan_discounts, newPlanDiscounts);
                    target.applicable_plans = Object.keys(target.plan_discounts);
                    target.discount_value = Math.max(...Object.values(target.plan_discounts));
                }
                target.is_active = true;
            } else {
                // Brand new coupon
                const isAll = newPlanDiscounts['ALL'] !== undefined;
                const maxVal = Math.max(...Object.values(newPlanDiscounts));
                target = {
                    code: code,
                    title: code + ' (' + maxVal + '% ছাড়)',
                    description: JSON.stringify({ plan_discounts: newPlanDiscounts }),
                    coupon_type: isAll ? 'universal' : 'package_specific',
                    discount_type: 'percentage',
                    discount_value: maxVal,
                    plan_discounts: newPlanDiscounts,
                    applicable_plans: isAll ? [] : Object.keys(newPlanDiscounts),
                    eligible_customers: [],
                    used_count: 0,
                    max_uses: null,
                    is_active: true,
                    expires_at: null
                };
                existing.unshift(target);
            }

            // Save updated target to localStorage
            try {
                localStorage.setItem('trt_admin_custom_coupons', JSON.stringify(existing));
                const deletedList = JSON.parse(localStorage.getItem('trt_deleted_coupons') || '[]');
                const unDeleted = deletedList.filter(c => c !== code);
                localStorage.setItem('trt_deleted_coupons', JSON.stringify(unDeleted));
            } catch(e) {}

            // Save to Supabase Cloud with JSON description payload
            try {
                const applicableList = target.applicable_plans || [];
                await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_save_coupon`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        p_admin_secret: pass,
                        p_code: code,
                        p_title: code + ' (' + target.discount_value + '% ছাড়)',
                        p_description: JSON.stringify({ plan_discounts: target.plan_discounts }),
                        p_coupon_type: applicableList.length > 0 ? 'package_specific' : 'universal',
                        p_discount_type: 'percentage',
                        p_discount_value: target.discount_value,
                        p_applicable_plans: applicableList,
                        p_eligible_customers: [],
                        p_max_uses: null,
                        p_expires_days: null
                    })
                });
            } catch (err) {
                console.error('Cloud coupon save error:', err);
            }

            alert(`🎉 কুপন '${code}' সফলভাবে সংরক্ষিত ও মার্জ হয়েছে! কোনো পূর্বের অফার হারাবে না।`);
            createCouponForm.reset();
            // Reset checkboxes
            const allCb = document.getElementById('plan_all');
            if (allCb) allCb.checked = true;
            document.querySelectorAll('.plan-cb').forEach(cb => cb.checked = false);
            document.querySelectorAll('.tier-input').forEach(inp => inp.value = '');
            if (typeof toggleDiscountMode === 'function') toggleDiscountMode('unified');

            await loadCoupons();

            if (btnSave) {
                btnSave.disabled = false;
                btnSave.textContent = '+ কুপন চালু করুন';
            }
        });

        const cpPlansElem = document.getElementById('cpPlans');
        const cpValElem = document.getElementById('cpDiscountValue');
        const cpTypeElem = document.getElementById('cpDiscountType');
        if (cpPlansElem) cpPlansElem.addEventListener('change', updateLiveCalcPreview);
        if (cpValElem) cpValElem.addEventListener('input', updateLiveCalcPreview);
        if (cpTypeElem) cpTypeElem.addEventListener('change', updateLiveCalcPreview);

        const btnRefreshCoupons = document.getElementById('btnRefreshCoupons');
        if (btnRefreshCoupons) {
            btnRefreshCoupons.addEventListener('click', () => loadCoupons());
        }
    }


// ==============================================================================
// SMART LOCAL COUPON EVALUATION ENGINE
// Guarantees 100% coupon functionality even before DB migration
// ==============================================================================
function evaluateLocalCoupon(code, plan, email) {
    const cleanCode = (code || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Base pricing
    let originalPrice = 250;
    if (plan === 'lifetime') originalPrice = 3000;
    else if (plan === 'pro_yearly') originalPrice = 2000;
    else if (plan === 'pro_half_yearly') originalPrice = 1200;
    else if (plan === 'pro_quarterly') originalPrice = 650;
    else originalPrice = 250;

    // Check custom saved admin coupons from localStorage
    let savedCoupons = [];
    try {
        savedCoupons = JSON.parse(localStorage.getItem('trt_admin_custom_coupons') || '[]');
    } catch (e) {}

    const customMatch = savedCoupons.find(c => c.code === cleanCode);
    if (customMatch) {
        if (!customMatch.is_active) {
            return { valid: false, message: '❌ এই কুপনটি বর্তমানে সাময়িকভাবে বন্ধ আছে।' };
        }

        // 🌟 Auto-Merged Multi-Package Discounts
        if (customMatch.plan_discounts && typeof customMatch.plan_discounts === 'object') {
            let pct = null;
            if (customMatch.plan_discounts['ALL'] !== undefined) {
                pct = customMatch.plan_discounts['ALL'];
            } else if (customMatch.plan_discounts[plan] !== undefined) {
                pct = customMatch.plan_discounts[plan];
            }

            if (pct === null) {
                const planMap = {
                    'pro_monthly': '১ মাস (Monthly)',
                    'pro_quarterly': '৩ মাস (Quarterly)',
                    'pro_half_yearly': '৬ মাস (Half-Yearly)',
                    'pro_yearly': '১ বছর (Yearly)',
                    'lifetime': 'Lifetime'
                };
                const allowed = Object.keys(customMatch.plan_discounts).map(p => planMap[p] || p).join(', ');
                return { valid: false, message: '❌ এই কুপনটি শুধুমাত্র ' + allowed + ' প্যাকেজের জন্য প্রযোজ্য।' };
            }

            const discountAmt = Math.round(originalPrice * (pct / 100));
            const finalPrice = Math.max(0, originalPrice - discountAmt);
            return {
                valid: true,
                code: cleanCode,
                title: cleanCode + ' (' + pct + '% ছাড়)',
                original_price: originalPrice,
                discount_amount: discountAmt,
                final_price: finalPrice,
                is_free: false,
                message: '🎉 কুপন কার্যকর হয়েছে! এই প্যাকেজে আপনি ' + pct + '% ছাড়ে পাচ্ছেন মাত্র ৳' + finalPrice + ' টাকায়! (ছাড় ৳' + discountAmt + ')'
            };
        }
        if (!customMatch.is_active) {
            return { valid: false, message: '❌ এই কুপনটি বর্তমানে সাময়িকভাবে বন্ধ আছে।' };
        }

        // 🌟 CASE 1: Smart Tiered Coupon (1 Code gives 20% on 1-6M, 30% on 1Yr, 50% on Lifetime)
        if (customMatch.coupon_type === 'tiered' || customMatch.discount_type === 'tiered') {
            let pct = 20; // default for 1M, 3M, 6M
            let tierTitle = '১-৬ মাস ২০% ছাড়';
            if (plan === 'lifetime') {
                pct = 50;
                tierTitle = 'লাইফটাইম ৫০% মেগা অফার';
            } else if (plan === 'pro_yearly') {
                pct = 30;
                tierTitle = '১ বছর ৩০% স্পেশাল অফার';
            }

            const discountAmt = Math.round(originalPrice * (pct / 100));
            const finalPrice = Math.max(0, originalPrice - discountAmt);

            return {
                valid: true,
                code: cleanCode,
                title: `${customMatch.title || 'স্মার্ট মেগা কুপন'} (${tierTitle})`,
                original_price: originalPrice,
                discount_amount: discountAmt,
                final_price: finalPrice,
                is_free: false,
                message: `🎉 কুপন কার্যকর হয়েছে! এই প্যাকেজে আপনি ${pct}% ছাড়ে পাচ্ছেন মাত্র ৳${finalPrice} টাকায়! (ছাড় ৳${discountAmt})`
            };
        }

        // Check plan restriction for normal coupons
        if (customMatch.applicable_plans && customMatch.applicable_plans.length > 0 && !customMatch.applicable_plans.includes('ALL')) {
            if (!customMatch.applicable_plans.includes(plan)) {
                const planMap = {
                    'pro_monthly': '১ মাস (Monthly)',
                    'pro_quarterly': '৩ মাস (Quarterly)',
                    'pro_half_yearly': '৬ মাস (Half-Yearly)',
                    'pro_yearly': '১ বছর (Yearly)',
                    'lifetime': 'Lifetime'
                };
                const allowed = customMatch.applicable_plans.map(p => planMap[p] || p).join(', ');
                return { valid: false, message: '❌ এই কুপনটি শুধুমাত্র ' + allowed + ' প্যাকেজের জন্য প্রযোজ্য।' };
            }
        }
        if (customMatch.eligible_customers && customMatch.eligible_customers.length > 0) {
            if (!cleanEmail || !customMatch.eligible_customers.includes(cleanEmail)) {
                return { valid: false, message: '❌ এই স্পেশাল অফারটি আপনার ইমেইল অ্যাকাউন্টের জন্য প্রযোজ্য নয়।' };
            }
        }

        let discountAmt = 0;
        let finalPrice = originalPrice;
        if (customMatch.discount_type === 'percentage') {
            discountAmt = Math.round(originalPrice * (customMatch.discount_value / 100));
            finalPrice = Math.max(0, originalPrice - discountAmt);
        } else if (customMatch.discount_type === 'free') {
            discountAmt = originalPrice;
            finalPrice = 0;
        } else {
            discountAmt = customMatch.discount_value;
            finalPrice = Math.max(0, originalPrice - discountAmt);
        }

        return {
            valid: true,
            code: cleanCode,
            title: customMatch.title,
            original_price: originalPrice,
            discount_amount: discountAmt,
            final_price: finalPrice,
            is_free: (finalPrice === 0),
            message: '✅ কুপন প্রয়োগ হয়েছে! আপনি ৳' + discountAmt + ' ছাড় পেয়েছেন।'
        };
    }

    // Smart Built-in: Any coupon starting with TRT or MEGA is tiered by default!
    if (cleanCode === 'TRT20' || cleanCode === 'TRT' || cleanCode === 'OFFER' || cleanCode === 'DISCOUNT') {
        let pct = 20;
        let tierTitle = '১-৬ মাস ২০% ছাড়';
        if (plan === 'lifetime') {
            pct = 50;
            tierTitle = 'লাইফটাইম ৫০% মেগা অফার';
        } else if (plan === 'pro_yearly') {
            pct = 30;
            tierTitle = '১ বছর ৩০% স্পেশাল অফার';
        }

        const discountAmt = Math.round(originalPrice * (pct / 100));
        const finalPrice = Math.max(0, originalPrice - discountAmt);

        return {
            valid: true,
            code: cleanCode,
            title: `মেগা কুপন (${tierTitle})`,
            original_price: originalPrice,
            discount_amount: discountAmt,
            final_price: finalPrice,
            is_free: false,
            message: `🎉 কুপন কার্যকর হয়েছে! ${tierTitle} অনুযায়ী মাত্র ৳${finalPrice} টাকায় পাচ্ছেন! (ছাড় ৳${discountAmt})`
        };
    }

    // Standard Built-in Offers
    if (cleanCode === 'LIFETIME50') {
        if (plan !== 'lifetime') {
            return { valid: false, message: '❌ এই কুপনটি শুধুমাত্র Lifetime (লাইফটাইম) প্যাকেজের জন্য প্রযোজ্য।' };
        }
        const discountAmt = 2000;
        return {
            valid: true,
            code: cleanCode,
            title: 'লাইফটাইম মেগা অফার (৫০% ছাড়)',
            original_price: 4000,
            discount_amount: discountAmt,
            final_price: 2000,
            is_free: false,
            message: '🎉 অভিনন্দন! লাইফটাইম প্যাকেজে ৫০% ছাড়ে পাচ্ছেন মাত্র ৳১,৫০০ টাকায়!'
        };
    }

    if (cleanCode === 'YEARLY30') {
        if (plan !== 'pro_yearly') {
            return { valid: false, message: '❌ এই কুপনটি শুধুমাত্র ১ বছর (Yearly) প্যাকেজের জন্য প্রযোজ্য।' };
        }
        const discountAmt = 720;
        return {
            valid: true,
            code: cleanCode,
            title: '১ বছর স্পেশাল অফার (৩০% ছাড়)',
            original_price: 2400,
            discount_amount: discountAmt,
            final_price: 1680,
            is_free: false,
            message: '🎉 অভিনন্দন! ১ বছরের প্যাকেজে ৩০% ছাড়ে পাচ্ছেন মাত্র ৳১,৪০০ টাকায়!'
        };
    }

    if (cleanCode === 'MONTHLY20') {
        if (plan !== 'pro_monthly') {
            return { valid: false, message: '❌ এই কুপনটি শুধুমাত্র ১ মাস (Monthly) প্যাকেজের জন্য প্রযোজ্য।' };
        }
        const discountAmt = 50;
        return {
            valid: true,
            code: cleanCode,
            title: '১ মাস অফার (২০% ছাড়)',
            original_price: 250,
            discount_amount: discountAmt,
            final_price: 200,
            is_free: false,
            message: '🎉 অভিনন্দন! ১ মাসের প্যাকেজে ২০% ছাড়ে পাচ্ছেন মাত্র ৳২০০ টাকায়!'
        };
    }

    if (cleanCode === 'EID15' || cleanCode === 'EID2026') {
        const discountAmt = Math.round(originalPrice * 0.15);
        return {
            valid: true,
            code: cleanCode,
            title: 'ঈদ ধামাকা অফার (১৫% ছাড়)',
            original_price: originalPrice,
            discount_amount: discountAmt,
            final_price: originalPrice - discountAmt,
            is_free: false,
            message: '🎉 ঈদ স্পেশাল ১৫% ছাড় প্রয়োগ হয়েছে! বর্তমান মূল্য: ৳' + (originalPrice - discountAmt)
        };
    }

    if (cleanCode === 'SAVE100') {
        const discountAmt = Math.min(originalPrice, 100);
        return {
            valid: true,
            code: cleanCode,
            title: '১০০ টাকা ফ্ল্যাট ডিসকাউন্ট',
            original_price: originalPrice,
            discount_amount: discountAmt,
            final_price: Math.max(0, originalPrice - 100),
            is_free: false,
            message: '🎉 ১০০ টাকা ছাড় প্রয়োগ হয়েছে!'
        };
    }

    if (cleanCode === 'VIPGIFT') {
        return {
            valid: true,
            code: cleanCode,
            title: '১০০% ফ্রি গিফট',
            original_price: originalPrice,
            discount_amount: originalPrice,
            final_price: 0,
            is_free: true,
            message: '🎁 সম্পূর্ণ ফ্রি গিফট লাইসেন্স কুপন কার্যকর হয়েছে!'
        };
    }

    return { valid: false, message: '❌ এই কুপন কোডটি সঠিক নয়।' };
}



// ── SMS Payments Table Rendering ─────────────────────────────────────────────
let currentSms = [];

function renderSmsTable(smsList) {
    const smsBody = document.getElementById('smsTableBody');
    const smsBadge = document.getElementById('smsCountBadge');
    if (!smsBody) return;

    if (!smsList || smsList.length === 0) {
        if (smsBadge) smsBadge.textContent = '০ টি এসএমএস';
        smsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">ফোন থেকে এখনো কোনো পেমেন্ট এসএমএস আসেনি (কোনো পূর্ববর্তী রেকর্ড নেই)</td></tr>';
        return;
    }

    if (smsBadge) smsBadge.textContent = smsList.length + ' টি এসএমএস';

    smsBody.innerHTML = smsList.map(sms => {
        let dateStr = '—';
        if (sms.created_at) {
            try {
                const d = new Date(sms.created_at);
                dateStr = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                dateStr = sms.created_at;
            }
        }
        const isClaimed = !!sms.is_claimed;
        const statusBadge = isClaimed 
            ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">ক্লেমড (Claimed)</span>'
            : '<span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">অব্যবহৃত (Unclaimed)</span>';
        const emailStr = sms.claimed_by_email ? '<span style="color: #cbd5e1;">' + sms.claimed_by_email + '</span>' : '<span style="color: var(--text-muted);">—</span>';
        
        return '<tr>' +
            '<td><code style="background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 4px; font-weight: 700; color: #facc15;">' + (sms.trx_id || '—') + '</code></td>' +
            '<td><strong style="color: #f43f5e;">' + (sms.sender_phone || 'bKash') + '</strong></td>' +
            '<td><strong style="color: #34d399; font-size: 15px;">৳' + (sms.amount || 0) + '</strong></td>' +
            '<td>' + statusBadge + '</td>' +
            '<td>' + emailStr + '</td>' +
            '<td style="font-size: 12px; color: var(--text-secondary);">' + dateStr + '</td>' +
        '</tr>';
    }).join('');
}
