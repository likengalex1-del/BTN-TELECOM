document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");
    const cartBtn = document.getElementById("cart-icon-btn");
    const closeBtn = document.getElementById("close-cart");

    const itemsList = document.getElementById("cart-items-list");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    let cart = [];

    // OPEN / CLOSE CART
    function toggleCart() {
        sidebar.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    }

    cartBtn?.addEventListener("click", toggleCart);
    closeBtn?.addEventListener("click", toggleCart);
    overlay?.addEventListener("click", toggleCart);

    // ADD TO CART (EVENT DELEGATION PRO)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-buy");
        if (!btn) return;

        const card = btn.closest(".product-card");
        if (!card) return;

        const name = card.querySelector("h3")?.innerText || "Produit";
        const priceText = card.querySelector(".price-tag")?.innerText || "0";
        const price = parseInt(priceText.replace(/[^0-9]/g, ""));

        addToCart(name, price, btn);
    });

    function addToCart(name, price, btn) {

        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: Date.now(),
                name,
                price,
                qty: 1
            });
        }

        // mini animation UX
        if (btn) {
            const oldText = btn.innerText;
            btn.innerText = "Ajouté ✓";
            btn.style.transform = "scale(0.95)";

            setTimeout(() => {
                btn.innerText = oldText;
                btn.style.transform = "scale(1)";
            }, 700);
        }

        updateUI();
    }

    function updateUI() {

        itemsList.innerHTML = "";

        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            itemsList.innerHTML = `<p class="empty-msg">Votre panier est vide.</p>`;
        }

        cart.forEach(item => {

            total += item.price * item.qty;
            count += item.qty;

            const div = document.createElement("div");
            div.className = "cart-item";

            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${item.price.toLocaleString()} FCFA x ${item.qty}</small>
                </div>

                <button class="remove-btn" data-id="${item.id}">✖</button>
            `;

            itemsList.appendChild(div);
        });

        cartCount.innerText = count;
        cartTotal.innerText = total.toLocaleString();
    }

    // DELETE (EVENT DELEGATION PRO)
    itemsList.addEventListener("click", (e) => {
        const btn = e.target.closest(".remove-btn");
        if (!btn) return;

        const id = Number(btn.dataset.id);

        cart = cart.filter(item => item.id !== id);
        updateUI();
    });

});