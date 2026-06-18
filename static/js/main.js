// ============================================
// IRON BEAST - CARRITO DE COMPRAS
// ============================================

console.log('🛒 IRON BEAST - Carrito de compras cargado');

// ==================== FUNCIONES DEL CARRITO ====================

function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch(e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, productName, price, stock) {
    console.log('🛒 Agregando:', productName);
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < stock) {
            existingItem.quantity += 1;
            showAlert(`✅ ${productName} agregado al carrito`, 'success');
        } else {
            showAlert(`❌ No hay suficiente stock de ${productName}`, 'danger');
            return;
        }
    } else {
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

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    console.log('📦 Productos en carrito:', count);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    const container = document.querySelector('.container.mt-5.pt-3');
    if (container) {
        container.prepend(alertDiv);
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado');
    updateCartCount();
    
    const buttons = document.querySelectorAll('.btn-add-cart');
    console.log(`🔍 Botones encontrados: ${buttons.length}`);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(
                parseInt(this.dataset.id),
                this.dataset.name,
                parseFloat(this.dataset.price),
                parseInt(this.dataset.stock)
            );
        });
    });
});

console.log('✅ main.js cargado completamente');