// ============================================
// IRON BEAST - CARRITO DE COMPRAS
// ============================================

// ==================== CARRITO ====================

// Obtener carrito del localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Guardar carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Agregar producto al carrito
function addToCart(productId, productName, price, stock) {
    let cart = getCart();
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Si ya existe, aumentar cantidad (solo si hay stock)
        if (existingItem.quantity < stock) {
            existingItem.quantity += 1;
            showAlert(`✅ ${productName} agregado al carrito`, 'success');
        } else {
            showAlert(`❌ No hay suficiente stock de ${productName}`, 'danger');
            return;
        }
    } else {
        // Si no existe, agregar nuevo
        if (stock > 0) {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                maxStock: stock
            });
            showAlert(`✅ ${productName} agregado al carrito`, 'success');
        } else {
            showAlert(`❌ ${productName} no tiene stock disponible`, 'danger');
            return;
        }
    }
    
    saveCart(cart);
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    showAlert('🗑️ Producto eliminado del carrito', 'info');
    updateCartDisplay();
}

// Actualizar cantidad de un producto en el carrito
function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        if (newQuantity <= item.maxStock) {
            item.quantity = newQuantity;
            saveCart(cart);
            updateCartDisplay();
        } else {
            showAlert(`❌ Stock máximo disponible: ${item.maxStock}`, 'warning');
        }
    }
}

// Vaciar carrito
function clearCart() {
    if (confirm('¿Seguro que quieres vaciar el carrito?')) {
        saveCart([]);
        showAlert('🛒 Carrito vaciado', 'info');
        updateCartDisplay();
    }
}

// ==================== ACTUALIZAR VISTA ====================

// Actualizar contador del carrito en el navbar
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Mostrar productos del carrito
function updateCartDisplay() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h6>${item.name}</h6>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">
                    $${subtotal.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

// ==================== ALERTAS ====================

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container.mt-5.pt-3');
    if (container) {
        container.prepend(alertDiv);
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }
}

// ==================== INICIALIZAR ====================

document.addEventListener('DOMContentLoaded', function() {
    // Actualizar contador del carrito al cargar
    updateCartCount();
    
    // Agregar event listeners a botones "Agregar"
    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = parseInt(this.dataset.id);
            const productName = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const stock = parseInt(this.dataset.stock);
            
            addToCart(productId, productName, price, stock);
        });
    });
    
    // Si estamos en la página del carrito, mostrar los productos
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
});

console.log('🛒 IRON BEAST - Carrito de compras cargado');
console.log('📦 Productos en carrito:', getCart().length);