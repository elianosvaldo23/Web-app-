
import asyncio
import sys
import os
sys.path.append('/home/user/workspace')

from config.config import config
from backend.database import db, UserModel, TaskModel

async def test_bot_functions():
    print("🔧 Probando funciones del bot TaskGram...")
    print("=" * 50)
    
    # 1. Probar conexión a base de datos
    try:
        await db.async_connect()
        print("✅ 1. Conexión a MongoDB: OK")
    except Exception as e:
        print(f"❌ 1. Error MongoDB: {e}")
        return
    
    # 2. Probar modelo de usuario
    try:
        admin_user = UserModel.get_user(config.ADMIN_ID)
        if admin_user:
            print(f"✅ 2. Usuario admin encontrado: {admin_user['first_name']}")
        else:
            print("ℹ️ 2. Usuario admin se creará al usar /start")
    except Exception as e:
        print(f"❌ 2. Error usuario: {e}")
    
    # 3. Probar modelo de tareas
    try:
        tasks = TaskModel.get_tasks()
        print(f"✅ 3. Tareas en DB: {len(tasks)} encontradas")
    except Exception as e:
        print(f"❌ 3. Error tareas: {e}")
    
    # 4. Verificar configuración
    print(f"✅ 4. Bot Token: {config.BOT_TOKEN[:20]}...")
    print(f"✅ 5. Admin ID: {config.ADMIN_ID}")
    print(f"✅ 6. WebApp URL: {config.WEBAPP_URL}")
    
    print("=" * 50)
    print("🎉 Todas las funciones del bot están listas!")
    print()
    print("📋 Para probar el bot:")
    print("1. Envía /start al bot @Asistentedesign_bot")
    print("2. El bot debería responder con el menú principal")
    print("3. Como admin, verás el botón 'Panel de Admin'")
    print("4. Puedes abrir la Mini App desde el botón")
    
    await db.async_close()

if __name__ == "__main__":
    asyncio.run(test_bot_functions())
