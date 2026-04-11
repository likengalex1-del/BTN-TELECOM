/* =================================================_
   BTN TELECOM - SYSTÈME CORE (V2.0)
   Développeur : Sterling Black
   Lieu : Yaoundé, Cameroun
   Description : Logique unifiée pour Index, Boutique, Détails et Panier.
   ================================================= */

// 1. BASE DE DONNÉES PRODUITS
const products = [
    { 
        id: 1, 
        name: "Samsung S23 Ultra", 
        price: 715000, 
        category: "Téléphones", 
        img: "/photos/samsung.jpg",
        desc: "L'excellence Android avec un capteur photo de 200MP et le stylet S-Pen intégré."
    },
    { 
        id: 2, 
        name: "iPhone 15 Pro Max", 
        price: 950000, 
        category: "Téléphones", 
        img: "/photos/iphone.jpg",
        desc: "Design en titane, puce A17 Pro et le système photo le plus avancé sur iPhone."
    },
    { 
        id: 3, 
        name: "Sony WH-1000XM5", 
        price: 265000, 
        category: "Accessoires", 
        img: "/photos/sony.jpg",
        desc: "La référence mondiale du casque à réduction de bruit active."
    },
    { 
        id: 4, 
        name: "Apple Watch Ultra 2", 
        price: 580000, 
        category: "Accessoires", 
        img: "/photos/julian-o-hayon-Bs-zngH79Ds-unsplash.jpg",
        desc: "La montre de sport la plus robuste, capable de résister aux conditions extrêmes."
    }
];

// 2. GESTION DU PANIER (LocalStorage)
let cart = JSON.parse(localStorage.getItem('BTN_CART_DATA')) || [];

// Sauvegarder le panier et mettre à jour l'affichage
const saveCart = () => {
    localStorage.setItem('BTN_CART_DATA', JSON.stringify(cart));
    updateCartCount();
};

// Mettre à jour le badge du panier dans la navigation
const updateCartCount = () => {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = totalItems;
};

// Ajouter un produit au panier
const addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    showNotification(`${product.name} ajouté au panier !`);
};

// 3. FONCTIONS DE RENDU (Affichage)

// Affiche une liste de produits dans un conteneur donné
const renderProducts = (list, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 50px;">Aucun résultat trouvé.</p>`;
        return;
    }

    container.innerHTML = list.map(p => `
        <div class="card" data-id="${p.id}">
            <div class="card-img-container">
                <img src="${p.img}" alt="${p.name}" loading="lazy">
            </div>
            <div class="card-content">
                <span class="category-label">${p.category}</span>
                <h3>${p.name}</h3>
                <p class="price">${p.price.toLocaleString()} FCFA</p>
                <div class="card-actions">
                    <button class="btn add-cart-btn">Ajouter</button>
                    <a href="product.html?id=${p.id}" class="btn-link">Détails</a>
                </div>
            </div>
        </div>
    `).join('');
};

// Notification visuelle
const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// 4. INITIALISATION ET ROUTAGE
document.addEventListener('DOMContentLoaded', () => {
    console.log("BTN TELECOM - Initialisation...");
    updateCartCount();

    // --- GESTION DU LOADER ---
    const loader = document.getElementById('loader') || document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 400);
    }

    // --- PAGE ACCUEIL (index.html) ---
    if (document.getElementById('home-products')) {
        renderProducts(products.slice(0, 3), 'home-products');
    }

    // --- PAGE BOUTIQUE (shop.html) ---
    const shopGrid = document.getElementById('shop-grid') || document.getElementById('shop');
    if (shopGrid) {
        const searchInput = document.getElementById('search');
        const filterSelect = document.getElementById('filter');

        const updateShop = () => {
            const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
            const filterVal = filterSelect ? filterSelect.value : "all";

            const filtered = products.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchVal);
                const matchesFilter = (filterVal === "all" || p.category === filterVal || (filterVal === "telephone" && p.category === "Téléphones") || (filterVal === "accessoire" && p.category === "Accessoires"));
                return matchesSearch && matchesFilter;
            });
            renderProducts(filtered, shopGrid.id);
        };

        if (searchInput) searchInput.addEventListener('input', updateShop);
        if (filterSelect) filterSelect.addEventListener('change', updateShop);
        
        renderProducts(products, shopGrid.id);
    }

    // --- PAGE PRODUIT (product.html) ---
    const productDetailContainer = document.getElementById('product-detail') || document.getElementById('product');
    if (productDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const prodId = parseInt(params.get('id'));
        const p = products.find(item => item.id === prodId);

        if (p) {
            productDetailContainer.innerHTML = `
                <div class="product-layout container">
                    <img src="${p.img}" class="product-main-img">
                    <div class="product-details">
                        <span class="category-tag">${p.category}</span>
                        <h1>${p.name}</h1>
                        <p class="product-full-price">${p.price.toLocaleString()} FCFA</p>
                        <p class="description">${p.desc}</p>
                        <button class="btn btn-primary add-cart-btn" data-id="${p.id}" style="width:100%; padding:20px;">Ajouter au panier</button>
                    </div>
                </div>
            `;
        }
    }

    // --- PAGE PANIER (cart.html) ---
    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart');
    if (cartContainer) {
        renderCartPage();
    }

    // --- DÉLÉGATION DE CLIC GLOBALE (Pour les boutons dynamiques) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-cart-btn')) {
            const card = e.target.closest('[data-id]');
            const id = card ? parseInt(card.dataset.id) : parseInt(e.target.dataset.id);
            if (id) addToCart(id);
        }
    });
});

// 5. FONCTIONS SPÉCIFIQUES AU PANIER
function renderCartPage() {
    const container = document.getElementById('cart-items') || document.getElementById('cart');
    const totalDisplay = document.getElementById('cart-total') || document.getElementById('final-total');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;"><h2>Votre panier est vide</h2><br><a href="shop.html" class="btn">Retour à la boutique</a></div>`;
        if (totalDisplay) totalDisplay.innerText = "0 FCFA";
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item-card">
            <img src="${item.img}" width="80">
            <div style="flex:1; margin-left:15px;">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} FCFA</p>
            </div>
            <div class="qty-controls">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
                <button onclick="removeItem(${index})" style="margin-left:15px; background:none; border:none; cursor:pointer;">🗑️</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalDisplay) totalDisplay.innerText = total.toLocaleString() + " FCFA";
}

window.changeQty = (index, delta) => {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    saveCart();
    renderCartPage();
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    saveCart();
    renderCartPage();
};

window.checkout = () => {
    if (cart.length === 0) return alert("Votre panier est vide !");
    alert("Commande confirmée ! Sterling Black vous contactera pour la livraison à Yaoundé.");
    cart = [];
    saveCart();
    window.location.href = "index.html";
};