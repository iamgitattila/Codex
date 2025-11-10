// Product Data
const products = [
    {
        id: 1,
        name: "Peanut Butter Bliss Bites",
        description: "Crunchy treats made with real peanut butter and oats. Perfect for training!",
        price: 12.99,
        weight: "12 oz",
        emoji: "🥜"
    },
    {
        id: 2,
        name: "Chicken Jerky Strips",
        description: "100% real chicken breast, slow-dried for maximum flavor.",
        price: 15.99,
        weight: "8 oz",
        emoji: "🍗"
    },
    {
        id: 3,
        name: "Bacon Buddies",
        description: "Smoky bacon flavor treats that'll make your pup go wild!",
        price: 13.99,
        weight: "10 oz",
        emoji: "🥓"
    },
    {
        id: 4,
        name: "Sweet Potato Chews",
        description: "Natural sweet potato slices, great for sensitive tummies.",
        price: 11.99,
        weight: "14 oz",
        emoji: "🍠"
    },
    {
        id: 5,
        name: "Dental Health Bones",
        description: "Helps clean teeth while satisfying the urge to chew.",
        price: 16.99,
        weight: "16 oz",
        emoji: "🦴"
    },
    {
        id: 6,
        name: "Salmon Snacks",
        description: "Omega-3 rich salmon treats for a shiny, healthy coat.",
        price: 17.99,
        weight: "6 oz",
        emoji: "🐟"
    },
    {
        id: 7,
        name: "Cheese & Apple Crunchies",
        description: "A delicious blend of cheddar cheese and fresh apples.",
        price: 10.99,
        weight: "10 oz",
        emoji: "🧀"
    },
    {
        id: 8,
        name: "Turkey Meatballs",
        description: "Bite-sized turkey meatballs, freeze-dried to perfection.",
        price: 14.99,
        weight: "8 oz",
        emoji: "🦃"
    },
    {
        id: 9,
        name: "Blueberry Boost Bars",
        description: "Antioxidant-rich blueberries mixed with wholesome grains.",
        price: 12.99,
        weight: "12 oz",
        emoji: "🫐"
    }
];

// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart(cart);
    showNotification('Item added to cart!');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart();
}

function updateQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart(cart);
            displayCart();
        }
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// UI Functions
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">${product.emoji}</div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-details">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <span class="product-weight">${product.weight}</span>
            </div>
            <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
    return card;
}

function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyDiv = document.getElementById('cart-empty');
    const cartContentDiv = document.getElementById('cart-content');

    if (cart.length === 0) {
        if (cartEmptyDiv) cartEmptyDiv.style.display = 'block';
        if (cartContentDiv) cartContentDiv.style.display = 'none';
        return;
    }

    if (cartEmptyDiv) cartEmptyDiv.style.display = 'none';
    if (cartContentDiv) cartContentDiv.style.display = 'grid';

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">${product.emoji}</div>
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${product.id})">Remove</button>
                </div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
            `;
            cartItemsContainer.appendChild(cartItem);
        }
    });

    // Update cart summary
    const shippingCost = 5.99;
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
