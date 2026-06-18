import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

class Conexion:
    def __init__(self):
        try:
            self.conexion = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', 3306),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'gimnacio2026')
            )
            print("✅ Conexión exitosa")
        except Exception as e:
            print(f"❌ Error: {e}")
            self.conexion = None
    
    def cerrar(self):
        if self.conexion:
            self.conexion.close()
            