/* =============================================
   FLORI'TOUCH — script.js
   ============================================= */

/* ── Chargement dynamique des produits (Admin) ─ */
(function loadAdminProducts() {
    const PROD_KEY = "floritouch_products";
    const raw = localStorage.getItem(PROD_KEY);
    if (!raw) return;

    let adminProducts;
    try { adminProducts = JSON.parse(raw); } catch { return; }
    if (!Array.isArray(adminProducts) || adminProducts.length === 0) return;

    const grid = document.querySelector(".products");
    if (!grid) return;

    grid.innerHTML = adminProducts
        .filter(p => p.available !== false)
        .map(p => `
        <div class="product" data-id="${p.id}">
            <div class="product-img-wrap">
                ${p.img
                    ? `<img src="${p.img}" alt="${p.name}"
                           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ''}
                <div class="img-placeholder" style="display:${p.img ? 'none' : 'flex'}">${p.emoji || '💎'}</div>
                ${p.badge ? `<div class="product-badge ${p.badge === 'Nouveau' ? 'new' : ''}">${p.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <div class="product-footer">
                    <span class="price">${p.price.toLocaleString('fr-FR')} FCFA</span>
                    <button class="btn btn-add" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})">+ Panier</button>
                </div>
                <a class="btn btn-order"
                   href="https://wa.me/22999551400?text=${encodeURIComponent('Bonjour, je veux commander : ' + p.name)}">
                    Commander sur WhatsApp
                </a>
            </div>
        </div>
    `).join("");

    // Ré-appliquer le scroll reveal sur les nouvelles cartes
    document.querySelectorAll(".product").forEach(el => {
        el.classList.add("reveal");
        setTimeout(() => el.classList.add("visible"), 100);
    });
})();

/* ── Panier ─────────────────────────────────── */
let cart = [];

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartUI();
    openCart();
    showToast("✅ " + name + " ajouté au panier !");
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Badge
    document.getElementById("cartCount").textContent = count;

    const itemsEl  = document.getElementById("cartItems");
    const footerEl = document.getElementById("cartFooter");
    const totalEl  = document.getElementById("cartTotal");

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide 🌸</p>';
        footerEl.style.display = "none";
        return;
    }

    footerEl.style.display = "block";
    totalEl.textContent = total.toLocaleString("fr-FR") + " FCFA";

    // Construire message WhatsApp
    let waMsg = "Bonjour Flori'Touch 😊 Je souhaite commander :\n";
    cart.forEach(i => {
        waMsg += `• ${i.qty}x ${i.name} — ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA\n`;
    });
    waMsg += `\nTotal : ${total.toLocaleString("fr-FR")} FCFA`;
    document.getElementById("cartWhatsapp").href =
        "https://wa.me/22999551400?text=" + encodeURIComponent(waMsg);

    // Rendu des items
    itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${(item.price * item.qty).toLocaleString("fr-FR")} FCFA</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join("");
}

/* ── Ouvrir / Fermer le panier ──────────────── */
function openCart() {
    document.getElementById("cartSidebar").classList.add("open");
    document.getElementById("cartOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.style.overflow = "";
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);


/* ── Toast notification ─────────────────────── */
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}


/* ── Navbar scroll ──────────────────────────── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
});


/* ── Menu mobile ────────────────────────────── */
const menuToggle  = document.getElementById("menuToggle");
const navLinks    = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuToggle.textContent = navLinks.classList.contains("open") ? "✕" : "☰";
});

// Fermer le menu si on clique un lien
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.textContent = "☰";
    });
});


/* ── Formulaire de personnalisation ─────────── */
const personalForm = document.getElementById("personalizationForm");
personalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const prenom  = document.getElementById("prenom").value.trim();
    const produit = document.getElementById("produit").value;
    const couleur = document.querySelector('input[name="couleur"]:checked');
    const message = document.getElementById("message").value.trim();

    if (!prenom || !produit || !couleur) {
        showToast("⚠️ Merci de remplir tous les champs !");
        return;
    }

    const couleurVal = couleur.value;
    let waText = `Bonjour Flori'Touch 😊\n\nJe souhaite personnaliser :\n`;
    waText += `• Produit : ${produit}\n`;
    waText += `• Prénom : ${prenom}\n`;
    waText += `• Couleur : ${couleurVal}\n`;
    if (message) waText += `• Note : ${message}\n`;

    const waUrl = "https://wa.me/22999551400?text=" + encodeURIComponent(waText);
    showToast(`Merci ${prenom} ! Redirection vers WhatsApp...`);

    setTimeout(() => {
        window.open(waUrl, "_blank");
        personalForm.reset();
    }, 1200);
});


/* ── Galerie Carousel ───────────────────────── */
(function () {
    const track   = document.getElementById("carouselTrack");
    const dotsEl  = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!track) return;

    const items        = track.querySelectorAll(".gallery-item");
    const totalItems   = items.length;
    let visible        = getVisible();
    let current        = 0;

    function getVisible() {
        return window.innerWidth < 480 ? 1 : window.innerWidth < 768 ? 2 : 3;
    }

    // Créer les dots
    const maxSteps = totalItems - getVisible() + 1;
    for (let i = 0; i < maxSteps; i++) {
        const dot = document.createElement("div");
        dot.className = "dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goTo(i));
        dotsEl.appendChild(dot);
    }

    function updateDots() {
        dotsEl.querySelectorAll(".dot").forEach((d, i) => {
            d.classList.toggle("active", i === current);
        });
    }

    function goTo(index) {
        visible  = getVisible();
        const max = Math.max(0, totalItems - visible);
        current  = Math.max(0, Math.min(index, max));

        const itemWidth   = items[0].offsetWidth;
        const gap         = 16;
        const offset      = current * (itemWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    // Auto-slide every 4s
    let autoSlide = setInterval(() => {
        visible = getVisible();
        const max = Math.max(0, totalItems - visible);
        goTo(current >= max ? 0 : current + 1);
    }, 4000);

    // Pause on hover
    track.parentElement.addEventListener("mouseenter", () => clearInterval(autoSlide));
    track.parentElement.addEventListener("mouseleave", () => {
        autoSlide = setInterval(() => {
            visible = getVisible();
            const max = Math.max(0, totalItems - visible);
            goTo(current >= max ? 0 : current + 1);
        }, 4000);
    });

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    window.addEventListener("resize", () => goTo(current));
})();


/* ── Système d'avis dynamique ───────────────── */
(function () {
    let selectedStar = 0;
    const starSpans  = document.querySelectorAll("#starRating span");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsGrid = document.querySelector(".reviews-grid");

    starSpans.forEach(span => {
        span.addEventListener("mouseenter", () => highlight(+span.dataset.val));
        span.addEventListener("mouseleave", () => highlight(selectedStar));
        span.addEventListener("click", () => {
            selectedStar = +span.dataset.val;
            highlight(selectedStar);
        });
    });

    function highlight(val) {
        starSpans.forEach(s => {
            s.classList.toggle("active", +s.dataset.val <= val);
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name  = document.getElementById("reviewName").value.trim();
            const text  = document.getElementById("reviewText").value.trim();
            const stars = "★".repeat(selectedStar) + "☆".repeat(5 - selectedStar);

            if (!name || !text || selectedStar === 0) {
                showToast("⚠️ Merci de remplir tous les champs et de noter !");
                return;
            }

            // Créer la carte
            const card = document.createElement("div");
            card.className = "review-card";
            card.style.animation = "fadeUp 0.5s ease both";
            card.innerHTML = `
                <div class="stars">${stars}</div>
                <p>"${text}"</p>
                <div class="reviewer">
                    <span class="avatar">${name[0].toUpperCase()}</span>
                    <strong>${name}</strong>
                </div>
            `;

            // Insérer au début
            reviewsGrid.insertBefore(card, reviewsGrid.firstChild);

            showToast("💕 Merci " + name + " pour votre avis !");
            reviewForm.reset();
            selectedStar = 0;
            highlight(0);
        });
    }
})();


/* ── Scroll reveal ──────────────────────────── */
(function () {
    // Appliquer la classe reveal à toutes les sections/cards
    const targets = document.querySelectorAll(
        ".product, .review-card, .contact-card, .about-grid, .custom-form, .gallery-carousel, .info-strip"
    );
    targets.forEach(el => el.classList.add("reveal"));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("visible"), i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
})();


/* ── Active nav link au scroll ──────────────── */
(function () {
    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.style.color = "";
                    link.style.fontWeight = "";
                    if (link.getAttribute("href") === "#" + id) {
                        link.style.color = "var(--rose-deep)";
                        link.style.fontWeight = "600";
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(sec => observer.observe(sec));
})();

/* ── Logo visible → Admin (3 clics) ─────────── */
(function () {
    const btn   = document.getElementById("adminLogoBtn");
    const hint  = document.getElementById("adminClickHint");
    const svg   = btn?.querySelector("svg");
    if (!btn) return;

    let clicks  = 0;
    let timer   = null;
    let hintTimer = null;

    const messages = ["", "🌸 Encore 2 fois...", "🌸🌸 Encore 1 fois..."];

    function showHint(msg, duration = 1500) {
        hint.textContent   = msg;
        hint.style.opacity = "1";
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => hint.style.opacity = "0", duration);
    }

    btn.addEventListener("click", () => {
        clicks++;

        // Animation logo
        if (svg) {
            svg.style.transform = "scale(1.4) rotate(30deg)";
            svg.style.filter    = "drop-shadow(0 0 8px #c85c82)";
            setTimeout(() => {
                svg.style.transform = "scale(1) rotate(0deg)";
                svg.style.filter    = "none";
            }, 300);
        }

        if (clicks < 3) {
            showHint(messages[clicks]);
        }

        if (clicks >= 3) {
            showHint("✅ Accès admin...", 1200);
            clicks = 0;
            clearTimeout(timer);
            setTimeout(() => window.location.href = "Admin.html", 900);
            return;
        }

        // Reset si pas de clic pendant 3 secondes
        clearTimeout(timer);
        timer = setTimeout(() => {
            clicks = 0;
            hint.style.opacity = "0";
        }, 3000);
    });

    // Hover
    btn.addEventListener("mouseenter", () => {
        if (svg) svg.style.filter = "drop-shadow(0 0 6px #e8a0b8)";
    });
    btn.addEventListener("mouseleave", () => {
        if (svg) svg.style.filter = "none";
    });
})();