# TaskGram - Telegram Mini App para Gestión de Tareas

Una aplicación completa de Telegram que permite a los usuarios completar tareas y ganar recompensas en forma de gemas (💎) que pueden convertirse a TON.

## 🚀 Características

### Mini App (Frontend)
- **Interfaz moderna** con Tailwind CSS
- **4 secciones principales:**
  - 📋 **Tareas**: Tareas simples con recompensas de 5,000 💎
  - 🎯 **Misiones**: Objetivos especiales con recompensas mayores
  - 🔧 **Intervenciones**: Tareas especializadas
  - 👤 **Cuenta**: Gestión de balance, conversión y billetera

### Sistema de Recompensas
- **💎 Gemas**: Moneda principal del sistema
- **Conversión**: 100,000 💎 = 1 TON ⚡
- **Sistema de referidos**: 10% de bonificación por referidos
- **Integración con TonKeeper** para retiros

### Bot de Administración
- **Panel completo de administración** para el admin
- **Gestión de usuarios**: Ver info, modificar balance, ban/unban
- **Gestión de tareas**: Crear, editar, eliminar tareas/misiones/intervenciones
- **Sistema de anuncios** masivos
- **Estadísticas** en tiempo real
- **Gestión de pagos** y transacciones

## 📁 Estructura del Proyecto

```
/workspace/
├── frontend/
│   └── index.html          # Mini App principal
├── backend/
│   ├── app.py             # API Flask
│   └── database.py        # Modelos de base de datos
├── bot/
│   ├── bot.py             # Bot principal de Telegram
│   └── admin_handlers.py  # Handlers adicionales de admin
├── static/
│   └── js/
│       └── app.js         # JavaScript del frontend
├── config/
│   └── config.py          # Configuración del sistema
└── requirements.txt       # Dependencias Python
```

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 2. Configurar Variables
Editar `config/config.py`:
```python
BOT_TOKEN = "TU_BOT_TOKEN_AQUI"
ADMIN_ID = TU_TELEGRAM_ID
MONGODB_URI = "tu_mongodb_connection_string"
WEBAPP_URL = "https://tu-dominio.com"
```

### 3. Ejecutar el Sistema

#### Backend (API)
```bash
python3 backend/app.py
```

#### Bot de Telegram
```bash
python3 bot/bot.py
```

## 🔧 Configuración del Bot

### 1. Crear Bot en Telegram
1. Habla con [@BotFather](https://t.me/botfather)
2. Usa `/newbot` y sigue las instrucciones
3. Copia el token y ponlo en `config.py`

### 2. Configurar Mini App
1. Usa `/newapp` en BotFather
2. Selecciona tu bot
3. Proporciona la URL de tu mini app
4. Configura el nombre y descripción

### 3. Configurar Comandos del Bot
```
start - Iniciar el bot y abrir mini app
help - Obtener ayuda
```

## 📊 Base de Datos (MongoDB)

### Colecciones:

#### Users
```javascript
{
  telegram_id: Number,
  username: String,
  first_name: String,
  last_name: String,
  gems_balance: Number,
  ton_balance: Number,
  referrer_id: Number,
  referrals: [Number],
  total_earned: Number,
  tasks_completed: [String],
  missions_completed: [String],
  interventions_completed: [String],
  wallet_address: String,
  is_banned: Boolean,
  created_at: Date,
  last_active: Date
}
```

#### Tasks
```javascript
{
  title: String,
  description: String,
  url: String,
  reward: Number,
  type: String, // "task", "mission", "intervention"
  is_active: Boolean,
  created_at: Date,
  completed_by: [Number]
}
```

#### Transactions
```javascript
{
  telegram_id: Number,
  type: String, // "deposit", "withdraw", "conversion", "task_reward"
  amount: Number,
  currency: String, // "gems", "ton"
  status: String, // "pending", "completed", "failed"
  details: Object,
  created_at: Date,
  updated_at: Date
}
```

## 🎮 Uso del Sistema

### Para Usuarios
1. **Iniciar**: `/start` en el bot
2. **Abrir Mini App**: Botón "🚀 Abrir Mini App"
3. **Completar tareas**: Navegar por las secciones y completar tareas
4. **Convertir gemas**: En la sección "Cuenta" → "Conversión"
5. **Conectar billetera**: Para retirar TON
6. **Referir amigos**: Compartir enlace de referido

### Para Administradores
1. **Acceder al panel**: `/start` → "⚙️ Panel de Admin"
2. **Crear tareas**: Panel Admin → Gestión de Tareas → Crear
3. **Gestionar usuarios**: Ver info, modificar balances, ban/unban
4. **Enviar anuncios**: Mensajes masivos a todos los usuarios
5. **Ver estadísticas**: Métricas del sistema en tiempo real

## 🔐 Seguridad

- **Autenticación Telegram**: Verificación de datos de WebApp
- **JWT Tokens**: Para sesiones de API
- **Validación de admin**: Solo el admin puede acceder al panel
- **Rate limiting**: Protección contra spam
- **Validación de datos**: Sanitización de inputs

## 🚀 Despliegue

### Desarrollo
```bash
# Backend
python3 backend/app.py

# Bot
python3 bot/bot.py
```

### Producción
- Usar **Gunicorn** para el backend
- **Supervisor** o **systemd** para el bot
- **Nginx** como proxy reverso
- **SSL/HTTPS** obligatorio para mini apps

## 📈 Características Avanzadas

### Sistema de Referidos
- 10% de bonificación por cada tarea completada por referidos
- Tracking completo de la red de referidos
- Estadísticas detalladas

### Verificación de Tareas
- Sistema de verificación automática
- Prevención de completado múltiple
- Tracking de progreso

### Gestión de Pagos
- Integración con TonKeeper
- Historial completo de transacciones
- Sistema de depósitos y retiros

## 🛠️ API Endpoints

### Autenticación
- `POST /api/auth` - Autenticar usuario
- `GET /api/user/profile` - Obtener perfil

### Tareas
- `GET /api/tasks?type=task` - Obtener tareas
- `POST /api/tasks/{id}/complete` - Completar tarea

### Billetera
- `POST /api/wallet/connect` - Conectar billetera
- `POST /api/convert` - Convertir gemas a TON
- `GET /api/transactions` - Historial de transacciones

### Referidos
- `GET /api/referrals` - Información de referidos

## 🐛 Solución de Problemas

### Bot no responde
- Verificar token del bot
- Comprobar conexión a internet
- Revisar logs: `cat bot.log`

### Mini App no carga
- Verificar URL en BotFather
- Comprobar certificado SSL
- Revisar logs del backend: `cat backend.log`

### Base de datos
- Verificar string de conexión MongoDB
- Comprobar permisos de red
- Revisar logs de conexión

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico, contactar al administrador del sistema.

---

**TaskGram** - Sistema completo de gestión de tareas para Telegram 🚀
