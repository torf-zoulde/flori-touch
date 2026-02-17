/* =============================================
   FLORI'TOUCH — admin.js
   Panneau d'administration
   ============================================= */

/* ── Mobile menu ─────────────────────────────── */
const sidebar         = document.getElementById("sidebar");
const mobileMenuBtn   = document.getElementById("mobileMenuBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const sidebarClose    = document.getElementById("sidebarClose");

function openSidebar()  { sidebar.classList.add("open"); sidebarBackdrop.classList.add("active"); }
function closeSidebar() { sidebar.classList.remove("open"); sidebarBackdrop.classList.remove("active"); }

mobileMenuBtn.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

/* ── Mot de passe par défaut ─────────────────── */
const DEFAULT_PASSWORD = "floritouch2026";
const PW_KEY  = "floritouch_pw";
const PROD_KEY = "floritouch_products";

/* ── Produits par défaut (déjà présents sur le site) ── */
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Bracelet personnalisé", price: 2500, desc: "Bracelets en perles avec prénom, faits main.", badge: "Bestseller", emoji: "💎", img: "bracelet.jpg", available: true },
    { id: 2, name: "Porte-clés en perles",  price: 1500, desc: "Porte-clés élégants et personnalisables.", badge: "Nouveau",    emoji: "🔑", img: "porte-cle.jpg", available: true },
    { id: 3, name: "Collier personnalisé",  price: 3500, desc: "Colliers fins avec pendentif prénom ou initiale.", badge: "Populaire", emoji: "📿", img: "", available: true }
];

/* ── State ───────────────────────────────────── */
let products    = [];
let editingId   = null;
let selectedEmoji = "💎";

/* ── Helpers localStorage ────────────────────── */
function getPassword() {
    return localStorage.getItem(PW_KEY) || DEFAULT_PASSWORD;
}
function savePassword(pw) {
    localStorage.setItem(PW_KEY, pw);
}
function loadProducts() {
    const raw = localStorage.getItem(PROD_KEY);
    if (raw) {
        try { products = JSON.parse(raw); } catch { products = [...DEFAULT_PRODUCTS]; }
    } else {
        products = [...DEFAULT_PRODUCTS];
        saveProducts();
    }
}
function saveProducts() {
    localStorage.setItem(PROD_KEY, JSON.stringify(products));
}
function nextId() {
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/* ── Toast ───────────────────────────────────── */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

/* =============================================
   LOGIN
   ============================================= */
const loginScreen = document.getElementById("loginScreen");
const dashboard   = document.getElementById("dashboard");
const loginForm   = document.getElementById("loginForm");
const loginError  = document.getElementById("loginError");

// Afficher/masquer mot de passe
document.getElementById("togglePw").addEventListener("click", () => {
    const inp = document.getElementById("pwInput");
    inp.type  = inp.type === "password" ? "text" : "password";
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.getElementById("pwInput").value;
    if (val === getPassword()) {
        loginScreen.style.display  = "none";
        dashboard.style.display    = "flex";
        loginError.textContent     = "";
        loadProducts();
        renderProducts();
        updateStats();
    } else {
        loginError.textContent = "❌ Mot de passe incorrect";
        document.getElementById("pwInput").value = "";
        document.getElementById("pwInput").focus();
    }
});

// Déconnexion
document.getElementById("logoutBtn").addEventListener("click", () => {
    dashboard.style.display   = "none";
    loginScreen.style.display = "flex";
    document.getElementById("pwInput").value = "";
});

/* =============================================
   NAVIGATION TABS
   ============================================= */
const navItems   = document.querySelectorAll(".nav-item");
const tabPanels  = document.querySelectorAll(".tab-content");
const pageTitle  = document.getElementById("pageTitle");
const pageSub    = document.getElementById("pageSubtitle");
const openModalBtn = document.getElementById("openModalBtn");

const tabMeta = {
    products: { title: "Gestion des Produits",  sub: "Ajoutez, modifiez ou supprimez vos produits", showAdd: true },
    orders:   { title: "Commandes",              sub: "Suivi de vos commandes WhatsApp",             showAdd: false },
    settings: { title: "Paramètres",             sub: "Configurez votre boutique",                   showAdd: false }
};

navItems.forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        navItems.forEach(n => n.classList.remove("active"));
        tabPanels.forEach(p => p.classList.remove("active"));
        item.classList.add("active");
        document.getElementById("tab-" + tab)?.classList.add("active");
        const meta = tabMeta[tab];
        if (meta) {
            pageTitle.textContent = meta.title;
            pageSub.textContent   = meta.sub;
            openModalBtn.style.display = meta.showAdd ? "inline-block" : "none";
        }
        // Fermer sidebar sur mobile après clic
        closeSidebar();
    });
});

/* =============================================
   RENDU PRODUITS
   ============================================= */
function renderProducts(filter = "") {
    const grid   = document.getElementById("productsGrid");
    const empty  = document.getElementById("emptyState");
    const countEl = document.getElementById("productCount");

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.desc.toLowerCase().includes(filter.toLowerCase())
    );

    countEl.textContent = products.length + " produit(s)";

    if (filtered.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    grid.innerHTML = filtered.map(p => `
        <div class="admin-product-card ${!p.available ? 'unavailable' : ''}" data-id="${p.id}">
            <div class="admin-card-img">
                ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.remove()">` : ''}
                <span>${p.emoji || "💎"}</span>
                ${p.badge ? `<span class="card-badge ${p.badge === 'Nouveau' ? 'new-badge' : ''}">${p.badge}</span>` : ''}
                ${!p.available ? '<span class="unavail-tag">Indisponible</span>' : ''}
            </div>
            <div class="admin-card-body">
                <h4>${p.name}</h4>
                <p>${p.desc}</p>
                <div class="card-price">${p.price.toLocaleString("fr-FR")} FCFA</div>
            </div>
            <div class="card-actions">
                <button class="btn-edit" onclick="openEdit(${p.id})">✏️ Modifier</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Supprimer</button>
            </div>
        </div>
    `).join("");
}

function updateStats() {
    document.getElementById("statTotal").textContent = products.length;
    const newCount = products.filter(p => p.badge === "Nouveau").length;
    document.getElementById("statNew").textContent = newCount;
    const avg = products.length > 0
        ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
        : 0;
    document.getElementById("statAvgPrice").textContent = avg.toLocaleString("fr-FR");
}

/* ─── Recherche ──────────────────────────────── */
document.getElementById("searchInput").addEventListener("input", function () {
    renderProducts(this.value);
});

/* ─── Upload image depuis téléphone ──────────── */
let currentImageBase64 = "";

const imgUploadZone = document.getElementById("imgUploadZone");
const imgFileInput  = document.getElementById("pImgFile");
const imgPreview    = document.getElementById("imgPreview");
const imgPreviewImg = document.getElementById("imgPreviewImg");
const imgRemoveBtn  = document.getElementById("imgRemoveBtn");

imgUploadZone.addEventListener("click", (e) => {
    if (e.target === imgRemoveBtn) return;
    imgFileInput.click();
});

imgFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("⚠️ Veuillez choisir une image !"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("⚠️ Image trop lourde (max 5 Mo)"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
        currentImageBase64 = ev.target.result;
        imgPreviewImg.src   = currentImageBase64;
        imgPreviewImg.style.display = "block";
        imgPreview.style.display    = "none";
        imgRemoveBtn.style.display  = "block";
    };
    reader.readAsDataURL(file);
});

imgRemoveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetImageUpload();
});

function resetImageUpload() {
    currentImageBase64 = "";
    imgPreviewImg.src   = "";
    imgPreviewImg.style.display = "none";
    imgPreview.style.display    = "flex";
    imgRemoveBtn.style.display  = "none";
    imgFileInput.value          = "";
}

function setImagePreview(base64OrUrl) {
    if (base64OrUrl) {
        currentImageBase64 = base64OrUrl;
        imgPreviewImg.src   = base64OrUrl;
        imgPreviewImg.style.display = "block";
        imgPreview.style.display    = "none";
        imgRemoveBtn.style.display  = "block";
    } else {
        resetImageUpload();
    }
}

/* =============================================
   MODAL PRODUIT
   ============================================= */
const modalOverlay = document.getElementById("modalOverlay");
const productForm  = document.getElementById("productForm");
const modalTitle   = document.getElementById("modalTitle");

function openModal(reset = true) {
    if (reset) {
        modalTitle.textContent = "Nouveau Produit";
        productForm.reset();
        document.getElementById("editId").value = "";
        editingId = null;
        setEmoji("💎");
        document.getElementById("availLabel").textContent = "Disponible";
        resetImageUpload();
    }
    modalOverlay.classList.add("open");
}

function closeModal() {
    modalOverlay.classList.remove("open");
    editingId = null;
}

document.getElementById("openModalBtn").addEventListener("click", () => openModal(true));
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

/* ─── Emoji picker ───────────────────────────── */
function setEmoji(val) {
    selectedEmoji = val;
    document.querySelectorAll(".emoji-opt").forEach(el => {
        el.classList.toggle("active", el.dataset.emoji === val);
    });
}
document.querySelectorAll(".emoji-opt").forEach(el => {
    el.addEventListener("click", () => setEmoji(el.dataset.emoji));
});

/* ─── Toggle disponibilité ───────────────────── */
document.getElementById("pAvailable").addEventListener("change", function () {
    document.getElementById("availLabel").textContent = this.checked ? "Disponible" : "Indisponible";
});

/* ─── Soumettre le formulaire ────────────────── */
productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name  = document.getElementById("pName").value.trim();
    const price = parseInt(document.getElementById("pPrice").value);
    const badge = document.getElementById("pBadge").value;
    const desc  = document.getElementById("pDesc").value.trim();
    const avail = document.getElementById("pAvailable").checked;
    const img   = currentImageBase64; // image en base64 depuis le téléphone

    if (!name || !price || !desc) {
        showToast("⚠️ Remplissez tous les champs obligatoires");
        return;
    }

    if (editingId !== null) {
        const idx = products.findIndex(p => p.id === editingId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], name, price, badge, desc, emoji: selectedEmoji, img, available: avail };
            showToast("✅ Produit modifié avec succès !");
        }
    } else {
        products.push({ id: nextId(), name, price, badge, desc, emoji: selectedEmoji, img, available: avail });
        showToast("🌸 Nouveau produit ajouté !");
    }

    saveProducts();
    renderProducts(document.getElementById("searchInput").value);
    updateStats();
    closeModal();
    exportToSite();
});

/* ─── Ouvrir l'édition ───────────────────────── */
function openEdit(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;

    editingId = id;
    modalTitle.textContent = "Modifier le Produit";

    document.getElementById("editId").value    = id;
    document.getElementById("pName").value     = p.name;
    document.getElementById("pPrice").value    = p.price;
    document.getElementById("pBadge").value    = p.badge || "";
    document.getElementById("pDesc").value     = p.desc;
    document.getElementById("pAvailable").checked = p.available !== false;
    document.getElementById("availLabel").textContent = p.available !== false ? "Disponible" : "Indisponible";
    setEmoji(p.emoji || "💎");
    setImagePreview(p.img || "");

    openModal(false);
}

/* ─── Supprimer un produit ───────────────────── */
function deleteProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    if (!confirm(`Supprimer "${p.name}" ? Cette action est irréversible.`)) return;
    products = products.filter(pr => pr.id !== id);
    saveProducts();
    renderProducts(document.getElementById("searchInput").value);
    updateStats();
    exportToSite();
    showToast("🗑️ Produit supprimé.");
}

/* =============================================
   EXPORT VERS LE SITE PRINCIPAL
   Sauvegarde les produits dans localStorage
   sous la même clé que le site lit
   ============================================= */
function exportToSite() {
    localStorage.setItem(PROD_KEY, JSON.stringify(products));
    // Note : le site index.html doit lire cette clé au chargement
    // Voir le commentaire dans script.js pour l'intégration
}

/* =============================================
   PARAMÈTRES
   ============================================= */
const settingsForm = document.getElementById("settingsForm");
const SETTINGS_KEY = "floritouch_settings";

function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
        try {
            const s = JSON.parse(raw);
            if (s.name)   document.getElementById("shopName").value   = s.name;
            if (s.slogan) document.getElementById("shopSlogan").value = s.slogan;
            if (s.wa)     document.getElementById("shopWa").value     = s.wa;
            if (s.tel)    document.getElementById("shopTel").value    = s.tel;
        } catch {}
    }
}

settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = {
        name:   document.getElementById("shopName").value.trim(),
        slogan: document.getElementById("shopSlogan").value.trim(),
        wa:     document.getElementById("shopWa").value.trim(),
        tel:    document.getElementById("shopTel").value.trim()
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    showToast("💾 Paramètres enregistrés !");
});

// Supprimer tous les produits
document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (!confirm("⚠️ Supprimer TOUS les produits ? Cette action est irréversible.")) return;
    products = [];
    saveProducts();
    renderProducts();
    updateStats();
    showToast("🗑️ Tous les produits ont été supprimés.");
});

/* ─── Changer le mot de passe ────────────────── */
document.getElementById("pwForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const old   = document.getElementById("oldPw").value;
    const newPw = document.getElementById("newPw").value;
    const msgEl = document.getElementById("pwMsg");

    if (old !== getPassword()) {
        msgEl.textContent = "❌ Ancien mot de passe incorrect";
        msgEl.className   = "pw-msg err";
        return;
    }
    if (newPw.length < 6) {
        msgEl.textContent = "❌ Le mot de passe doit faire au moins 6 caractères";
        msgEl.className   = "pw-msg err";
        return;
    }
    savePassword(newPw);
    msgEl.textContent = "✅ Mot de passe modifié avec succès !";
    msgEl.className   = "pw-msg ok";
    document.getElementById("pwForm").reset();
    setTimeout(() => msgEl.textContent = "", 4000);
});

/* =============================================
   INIT
   ============================================= */
loadSettings();