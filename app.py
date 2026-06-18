from flask import Flask, render_template, request, redirect, url_for, session, flash
from conexion import Conexion
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'tu_clave_secreta_aqui')

# ==================== RUTAS PRINCIPALES ====================

@app.route('/')
def index():
    conn = Conexion()
    cursor = conn.conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM productos WHERE estado = 1 ORDER BY id DESC")
    productos = cursor.fetchall()
    conn.cerrar()
    return render_template('index.html', productos=productos)

# ==================== LOGIN CLIENTES ====================

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        conn = Conexion()
        cursor = conn.conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s AND password = %s AND rol = 'cliente'", (email, password))
        usuario = cursor.fetchone()
        conn.cerrar()
        
        if usuario:
            session['usuario'] = {
                'id': usuario['id'],
                'nombre': usuario['nombre'],
                'email': usuario['email'],
                'rol': usuario['rol']
            }
            flash('¡Bienvenido!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Credenciales incorrectas', 'danger')
            return render_template('login.html')
    
    return render_template('login.html')

# ==================== REGISTRO CLIENTES ====================

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        password = request.form['password']
        
        conn = Conexion()
        cursor = conn.conexion.cursor()
        try:
            cursor.execute("INSERT INTO usuarios (nombre, email, password, rol) VALUES (%s, %s, %s, 'cliente')", 
                         (nombre, email, password))
            conn.conexion.commit()
            conn.cerrar()
            flash('¡Registro exitoso! Ahora puedes iniciar sesión', 'success')
            return redirect(url_for('login'))
        except:
            conn.conexion.rollback()
            conn.cerrar()
            flash('Error al registrar usuario', 'danger')
            return render_template('register.html')
    
    return render_template('register.html')

# ==================== LOGIN ADMIN ====================

@app.route('/admin_login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        conn = Conexion()
        cursor = conn.conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s AND password = %s AND rol = 'admin'", (email, password))
        admin = cursor.fetchone()
        conn.cerrar()
        
        if admin:
            session['admin'] = {
                'id': admin['id'],
                'nombre': admin['nombre'],
                'email': admin['email'],
                'rol': admin['rol']
            }
            flash('¡Bienvenido Admin!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Credenciales incorrectas', 'danger')
            return render_template('admin_login.html')
    
    return render_template('admin_login.html')

# ==================== DASHBOARD ADMIN ====================

@app.route('/admin_dashboard')
def admin_dashboard():
    if 'admin' not in session:
        flash('Acceso denegado', 'danger')
        return redirect(url_for('admin_login'))
    
    conn = Conexion()
    cursor = conn.conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM productos ORDER BY id DESC")
    productos = cursor.fetchall()
    conn.cerrar()
    
    return render_template('admin_dashboard.html', productos=productos)

# ==================== AGREGAR PRODUCTO ====================

@app.route('/agregar_producto', methods=['GET', 'POST'])
def agregar_producto():
    if 'admin' not in session:
        flash('Acceso denegado', 'danger')
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        precio = float(request.form['precio'])
        stock = int(request.form['stock'])
        imagen = request.form['imagen']
        categoria = request.form['categoria']
        
        # VALIDACIÓN: PRECIO NO PUEDE SER 0
        if precio <= 0:
            flash('❌ El precio NO puede ser 0 o negativo', 'danger')
            return render_template('agregar_producto.html')
        
        conn = Conexion()
        cursor = conn.conexion.cursor()
        cursor.execute("""
            INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (nombre, descripcion, precio, stock, imagen, categoria))
        conn.conexion.commit()
        conn.cerrar()
        
        flash('✅ Producto agregado exitosamente', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('agregar_producto.html')

# ==================== EDITAR PRODUCTO ====================

@app.route('/editar_producto/<int:id>', methods=['GET', 'POST'])
def editar_producto(id):
    if 'admin' not in session:
        flash('Acceso denegado', 'danger')
        return redirect(url_for('admin_login'))
    
    conn = Conexion()
    cursor = conn.conexion.cursor(dictionary=True)
    
    if request.method == 'POST':
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        precio = float(request.form['precio'])
        stock = int(request.form['stock'])
        imagen = request.form['imagen']
        categoria = request.form['categoria']
        
        if precio <= 0:
            flash('❌ El precio NO puede ser 0 o negativo', 'danger')
            cursor.execute("SELECT * FROM productos WHERE id = %s", (id,))
            producto = cursor.fetchone()
            conn.cerrar()
            return render_template('editar_producto.html', producto=producto)
        
        cursor.execute("""
            UPDATE productos 
            SET nombre=%s, descripcion=%s, precio=%s, stock=%s, imagen=%s, categoria=%s 
            WHERE id=%s
        """, (nombre, descripcion, precio, stock, imagen, categoria, id))
        conn.conexion.commit()
        conn.cerrar()
        
        flash('✅ Producto actualizado', 'success')
        return redirect(url_for('admin_dashboard'))
    
    cursor.execute("SELECT * FROM productos WHERE id = %s", (id,))
    producto = cursor.fetchone()
    conn.cerrar()
    return render_template('editar_producto.html', producto=producto)

# ==================== ELIMINAR PRODUCTO ====================

@app.route('/eliminar_producto/<int:id>')
def eliminar_producto(id):
    if 'admin' not in session:
        flash('Acceso denegado', 'danger')
        return redirect(url_for('admin_login'))
    
    conn = Conexion()
    cursor = conn.conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = %s", (id,))
    conn.conexion.commit()
    conn.cerrar()
    
    flash('✅ Producto eliminado', 'success')
    return redirect(url_for('admin_dashboard'))

# ==================== CARRITO ====================

@app.route('/mi_carrito')
def mi_carrito():
    if 'usuario' not in session:
        flash('Inicia sesión para ver tu carrito', 'warning')
        return redirect(url_for('login'))
    return render_template('mi_carrito.html')

# ==================== CERRAR SESIÓN ====================

@app.route('/logout')
def logout():
    session.pop('usuario', None)
    session.pop('admin', None)
    flash('Sesión cerrada', 'info')
    return redirect(url_for('index'))

@app.route('/admin_logout')
def admin_logout():
    session.pop('admin', None)
    flash('Sesión admin cerrada', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)