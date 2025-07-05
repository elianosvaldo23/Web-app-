
import asyncio
import logging
import sys
import os
from datetime import datetime, timezone
from typing import Optional, Dict, List

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from config.config import config
from backend.database import db, UserModel, TaskModel, TransactionModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize bot and dispatcher
bot = Bot(token=config.BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
router = Router()

# States for admin operations
class AdminStates(StatesGroup):
    waiting_for_task_title = State()
    waiting_for_task_description = State()
    waiting_for_task_url = State()
    waiting_for_task_reward = State()
    waiting_for_user_id = State()
    waiting_for_balance_amount = State()
    waiting_for_announcement = State()

# Admin keyboard
def get_admin_keyboard():
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="👥 Gestión de Usuarios", callback_data="admin_users"),
            InlineKeyboardButton(text="📋 Gestión de Tareas", callback_data="admin_tasks")
        ],
        [
            InlineKeyboardButton(text="💰 Gestión de Pagos", callback_data="admin_payments"),
            InlineKeyboardButton(text="📢 Anuncios", callback_data="admin_announcements")
        ],
        [
            InlineKeyboardButton(text="📊 Estadísticas", callback_data="admin_stats"),
            InlineKeyboardButton(text="🔧 Mantenimiento", callback_data="admin_maintenance")
        ],
        [
            InlineKeyboardButton(text="🔙 Menú Principal", callback_data="main_menu")
        ]
    ])
    return keyboard

def get_user_management_keyboard():
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="👤 Info de Usuario", callback_data="user_info"),
            InlineKeyboardButton(text="💎 Modificar Balance", callback_data="modify_balance")
        ],
        [
            InlineKeyboardButton(text="🚫 Banear Usuario", callback_data="ban_user"),
            InlineKeyboardButton(text="✅ Desbanear Usuario", callback_data="unban_user")
        ],
        [
            InlineKeyboardButton(text="📊 Lista de Usuarios", callback_data="list_users"),
            InlineKeyboardButton(text="🔙 Volver", callback_data="admin_panel")
        ]
    ])
    return keyboard

def get_task_management_keyboard():
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="➕ Crear Tarea", callback_data="create_task"),
            InlineKeyboardButton(text="🎯 Crear Misión", callback_data="create_mission")
        ],
        [
            InlineKeyboardButton(text="🔧 Crear Intervención", callback_data="create_intervention"),
            InlineKeyboardButton(text="📋 Ver Tareas", callback_data="list_tasks")
        ],
        [
            InlineKeyboardButton(text="❌ Eliminar Tarea", callback_data="delete_task"),
            InlineKeyboardButton(text="🔙 Volver", callback_data="admin_panel")
        ]
    ])
    return keyboard

def get_main_menu_keyboard(user_id: int):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🚀 Abrir Mini App", 
                web_app=WebAppInfo(url=f"{config.WEBAPP_URL}?start={user_id}")
            )
        ],
        [
            InlineKeyboardButton(text="👥 Mis Referidos", callback_data="my_referrals"),
            InlineKeyboardButton(text="💰 Mi Balance", callback_data="my_balance")
        ],
        [
            InlineKeyboardButton(text="📊 Estadísticas", callback_data="my_stats"),
            InlineKeyboardButton(text="ℹ️ Ayuda", callback_data="help")
        ]
    ])
    
    # Add admin panel for admin user
    if user_id == config.ADMIN_ID:
        keyboard.inline_keyboard.append([
            InlineKeyboardButton(text="⚙️ Panel de Admin", callback_data="admin_panel")
        ])
    
    return keyboard

@router.message(CommandStart())
async def start_command(message: Message):
    user_id = message.from_user.id
    username = message.from_user.username
    first_name = message.from_user.first_name
    last_name = message.from_user.last_name
    
    # Extract referrer ID from start parameter
    referrer_id = None
    if message.text and len(message.text.split()) > 1:
        try:
            referrer_id = int(message.text.split()[1])
        except ValueError:
            pass
    
    # Ensure database is connected
    if not db.db:
        try:
            db.connect()
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            await message.answer("❌ Error de conexión. Intenta de nuevo en unos momentos.")
            return
    
    # Check if user exists
    user = UserModel.get_user(user_id)
    if not user:
        # Create new user
        UserModel.create_user(
            telegram_id=user_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            referrer_id=referrer_id
        )
        
        welcome_text = f"¡Bienvenido a TaskGram, {first_name}! 🎉\n\n"
        welcome_text += "Completa tareas y gana 💎 que puedes convertir a TON.\n\n"
        
        if referrer_id:
            referrer = UserModel.get_user(referrer_id)
            if referrer:
                welcome_text += f"Has sido referido por {referrer.get('first_name', 'Usuario')}. "
                welcome_text += "¡Ambos recibirán bonificaciones por tus actividades!\n\n"
        
        welcome_text += "Usa el botón de abajo para abrir la Mini App y comenzar a ganar."
    else:
        welcome_text = f"¡Hola de nuevo, {first_name}! 👋\n\n"
        welcome_text += f"Balance actual: {user['gems_balance']:,} 💎\n"
        welcome_text += f"TON: {user['ton_balance']:.4f} ⚡\n\n"
        welcome_text += "¿Qué te gustaría hacer hoy?"
    
    await message.answer(
        welcome_text,
        reply_markup=get_main_menu_keyboard(user_id)
    )

@router.callback_query(F.data == "main_menu")
async def main_menu_callback(callback: CallbackQuery):
    user_id = callback.from_user.id
    first_name = callback.from_user.first_name
    
    user = UserModel.get_user(user_id)
    if user:
        text = f"¡Hola, {first_name}! 👋\n\n"
        text += f"Balance: {user['gems_balance']:,} 💎\n"
        text += f"TON: {user['ton_balance']:.4f} ⚡\n\n"
        text += "¿Qué te gustaría hacer?"
    else:
        text = "¡Bienvenido a TaskGram! 🎉"
    
    await callback.message.edit_text(
        text,
        reply_markup=get_main_menu_keyboard(user_id)
    )

@router.callback_query(F.data == "my_balance")
async def my_balance_callback(callback: CallbackQuery):
    user_id = callback.from_user.id
    user = UserModel.get_user(user_id)
    
    if not user:
        await callback.answer("Usuario no encontrado", show_alert=True)
        return
    
    text = f"💰 **Tu Balance**\n\n"
    text += f"💎 Gemas: {user['gems_balance']:,}\n"
    text += f"⚡ TON: {user['ton_balance']:.6f}\n\n"
    text += f"📈 Total ganado: {user['total_earned']:,} 💎\n"
    text += f"👥 Referidos: {len(user.get('referrals', []))}\n\n"
    text += f"**Tasa de conversión:**\n"
    text += f"100,000 💎 = 1 ⚡ TON"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "my_referrals")
async def my_referrals_callback(callback: CallbackQuery):
    user_id = callback.from_user.id
    user = UserModel.get_user(user_id)
    
    if not user:
        await callback.answer("Usuario no encontrado", show_alert=True)
        return
    
    referrals = user.get('referrals', [])
    
    text = f"👥 **Mis Referidos** ({len(referrals)})\n\n"
    
    if referrals:
        total_earned_by_referrals = 0
        for i, ref_id in enumerate(referrals[:10], 1):  # Show first 10
            ref_user = UserModel.get_user(ref_id)
            if ref_user:
                text += f"{i}. {ref_user.get('first_name', 'Usuario')} - "
                text += f"{ref_user['total_earned']:,} 💎 ganados\n"
                total_earned_by_referrals += ref_user['total_earned']
        
        if len(referrals) > 10:
            text += f"\n... y {len(referrals) - 10} más\n"
        
        bonus_earned = int(total_earned_by_referrals * config.REFERRAL_PERCENTAGE / 100)
        text += f"\n💰 **Tu bonus por referidos:** {bonus_earned:,} 💎"
    else:
        text += "Aún no tienes referidos.\n\n"
        text += "¡Comparte tu enlace de referido para ganar el 10% de lo que ganen tus referidos!"
    
    text += f"\n\n🔗 **Tu enlace de referido:**\n"
    text += f"`https://t.me/{(await bot.get_me()).username}?start={user_id}`"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "my_stats")
async def my_stats_callback(callback: CallbackQuery):
    user_id = callback.from_user.id
    user = UserModel.get_user(user_id)
    
    if not user:
        await callback.answer("Usuario no encontrado", show_alert=True)
        return
    
    text = f"📊 **Tus Estadísticas**\n\n"
    text += f"📅 Miembro desde: {user['created_at'].strftime('%d/%m/%Y')}\n"
    text += f"🕐 Última actividad: {user['last_active'].strftime('%d/%m/%Y %H:%M')}\n\n"
    text += f"✅ Tareas completadas: {len(user.get('tasks_completed', []))}\n"
    text += f"🎯 Misiones completadas: {len(user.get('missions_completed', []))}\n"
    text += f"🔧 Intervenciones completadas: {len(user.get('interventions_completed', []))}\n\n"
    text += f"💰 Total ganado: {user['total_earned']:,} 💎\n"
    text += f"👥 Referidos activos: {len(user.get('referrals', []))}\n"
    
    if user.get('wallet_address'):
        text += f"\n💼 Billetera conectada: `{user['wallet_address'][:10]}...`"
    else:
        text += f"\n💼 Billetera: No conectada"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "help")
async def help_callback(callback: CallbackQuery):
    text = f"ℹ️ **Ayuda - TaskGram**\n\n"
    text += f"**¿Cómo funciona?**\n"
    text += f"1. Completa tareas para ganar 💎\n"
    text += f"2. Convierte 💎 a TON (100,000 💎 = 1 TON)\n"
    text += f"3. Retira tus ganancias a tu billetera\n\n"
    text += f"**Sistema de Referidos:**\n"
    text += f"• Gana 10% de lo que ganen tus referidos\n"
    text += f"• Comparte tu enlace para invitar amigos\n\n"
    text += f"**Tipos de Tareas:**\n"
    text += f"• 📋 Tareas: Actividades simples (5,000 💎)\n"
    text += f"• 🎯 Misiones: Objetivos especiales\n"
    text += f"• 🔧 Intervenciones: Tareas especializadas\n\n"
    text += f"**Soporte:** @admin_username"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

# Admin Panel Functions
@router.callback_query(F.data == "admin_panel")
async def admin_panel_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos de administrador", show_alert=True)
        return
    
    text = f"⚙️ **Panel de Administración**\n\n"
    text += f"Selecciona una opción para gestionar el bot:"
    
    await callback.message.edit_text(text, reply_markup=get_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_users")
async def admin_users_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    text = f"👥 **Gestión de Usuarios**\n\n"
    text += f"Selecciona una acción:"
    
    await callback.message.edit_text(text, reply_markup=get_user_management_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_tasks")
async def admin_tasks_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    text = f"📋 **Gestión de Tareas**\n\n"
    text += f"Selecciona una acción:"
    
    await callback.message.edit_text(text, reply_markup=get_task_management_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_stats")
async def admin_stats_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    # Get statistics
    total_users = db.db.users.count_documents({})
    active_users = db.db.users.count_documents({
        "last_active": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)}
    })
    total_tasks = db.db.tasks.count_documents({"is_active": True})
    total_gems_distributed = db.db.users.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$total_earned"}}}
    ])
    total_gems = list(total_gems_distributed)
    total_gems_amount = total_gems[0]["total"] if total_gems else 0
    
    text = f"📊 **Estadísticas del Bot**\n\n"
    text += f"👥 Total de usuarios: {total_users:,}\n"
    text += f"🟢 Usuarios activos hoy: {active_users:,}\n"
    text += f"📋 Tareas activas: {total_tasks:,}\n"
    text += f"💎 Gemas distribuidas: {total_gems_amount:,}\n"
    text += f"⚡ TON en circulación: {total_gems_amount / config.GEMS_TO_TON_RATE:.2f}\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Actualizar", callback_data="admin_stats")],
        [InlineKeyboardButton(text="🔙 Volver", callback_data="admin_panel")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data.startswith("create_"))
async def create_task_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    task_type = callback.data.split("_")[1]  # task, mission, intervention
    
    await state.update_data(task_type=task_type)
    await state.set_state(AdminStates.waiting_for_task_title)
    
    type_name = {"task": "Tarea", "mission": "Misión", "intervention": "Intervención"}[task_type]
    
    await callback.message.edit_text(
        f"📝 **Crear {type_name}**\n\nEnvía el título de la {type_name.lower()}:",
        parse_mode="Markdown"
    )

@router.message(AdminStates.waiting_for_task_title)
async def process_task_title(message: Message, state: FSMContext):
    await state.update_data(title=message.text)
    await state.set_state(AdminStates.waiting_for_task_description)
    
    await message.answer("📄 Ahora envía la descripción:")

@router.message(AdminStates.waiting_for_task_description)
async def process_task_description(message: Message, state: FSMContext):
    await state.update_data(description=message.text)
    await state.set_state(AdminStates.waiting_for_task_url)
    
    await message.answer("🔗 Envía la URL de la tarea:")

@router.message(AdminStates.waiting_for_task_url)
async def process_task_url(message: Message, state: FSMContext):
    await state.update_data(url=message.text)
    await state.set_state(AdminStates.waiting_for_task_reward)
    
    await message.answer("💰 Envía la recompensa en 💎 (ejemplo: 5000):")

@router.message(AdminStates.waiting_for_task_reward)
async def process_task_reward(message: Message, state: FSMContext):
    try:
        reward = int(message.text)
        data = await state.get_data()
        
        # Create task
        TaskModel.create_task(
            title=data['title'],
            description=data['description'],
            url=data['url'],
            reward=reward,
            task_type=data['task_type']
        )
        
        type_name = {"task": "Tarea", "mission": "Misión", "intervention": "Intervención"}[data['task_type']]
        
        await message.answer(
            f"✅ {type_name} creada exitosamente!\n\n"
            f"**Título:** {data['title']}\n"
            f"**Descripción:** {data['description']}\n"
            f"**URL:** {data['url']}\n"
            f"**Recompensa:** {reward:,} 💎",
            reply_markup=get_task_management_keyboard(),
            parse_mode="Markdown"
        )
        
        await state.clear()
        
    except ValueError:
        await message.answer("❌ Por favor envía un número válido para la recompensa:")

@router.callback_query(F.data == "user_info")
async def user_info_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    await state.set_state(AdminStates.waiting_for_user_id)
    await callback.message.edit_text(
        "👤 **Información de Usuario**\n\nEnvía el ID de Telegram del usuario:",
        parse_mode="Markdown"
    )

@router.callback_query(F.data == "modify_balance")
async def modify_balance_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    await state.set_state(AdminStates.waiting_for_user_id)
    await state.update_data(action="modify_balance")
    await callback.message.edit_text(
        "💎 **Modificar Balance**\n\nEnvía el ID de Telegram del usuario:",
        parse_mode="Markdown"
    )

@router.callback_query(F.data == "ban_user")
async def ban_user_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    await state.set_state(AdminStates.waiting_for_user_id)
    await state.update_data(action="ban_user")
    await callback.message.edit_text(
        "🚫 **Banear Usuario**\n\nEnvía el ID de Telegram del usuario a banear:",
        parse_mode="Markdown"
    )

@router.callback_query(F.data == "unban_user")
async def unban_user_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    await state.set_state(AdminStates.waiting_for_user_id)
    await state.update_data(action="unban_user")
    await callback.message.edit_text(
        "✅ **Desbanear Usuario**\n\nEnvía el ID de Telegram del usuario a desbanear:",
        parse_mode="Markdown"
    )

@router.message(AdminStates.waiting_for_balance_amount)
async def process_balance_amount(message: Message, state: FSMContext):
    try:
        amount = int(message.text)
        data = await state.get_data()
        user_id = data['user_id']
        
        user = UserModel.get_user(user_id)
        if not user:
            await message.answer("❌ Usuario no encontrado")
            await state.clear()
            return
        
        # Update balance
        if amount >= 0:
            UserModel.add_gems(user_id, amount)
            action_text = f"añadido {amount:,} 💎"
        else:
            UserModel.subtract_gems(user_id, abs(amount))
            action_text = f"restado {abs(amount):,} 💎"
        
        # Create transaction record
        TransactionModel.create_transaction(
            telegram_id=user_id,
            transaction_type="admin_adjustment",
            amount=amount,
            currency="gems",
            status="completed",
            details={"admin_id": message.from_user.id}
        )
        
        updated_user = UserModel.get_user(user_id)
        
        await message.answer(
            f"✅ Balance actualizado\n\n"
            f"**Usuario:** {user.get('first_name', 'Usuario')} ({user_id})\n"
            f"**Acción:** {action_text}\n"
            f"**Nuevo balance:** {updated_user['gems_balance']:,} 💎",
            reply_markup=get_user_management_keyboard(),
            parse_mode="Markdown"
        )
        
        # Notify user
        try:
            await bot.send_message(
                user_id,
                f"💰 Tu balance ha sido actualizado por un administrador\n\n"
                f"**Cambio:** {action_text}\n"
                f"**Nuevo balance:** {updated_user['gems_balance']:,} 💎"
            )
        except:
            pass  # User might have blocked the bot
        
        await state.clear()
        
    except ValueError:
        await message.answer("❌ Por favor envía un número válido (puede ser negativo para restar):")

@router.callback_query(F.data == "list_users")
async def list_users_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    # Get recent users
    users = list(db.db.users.find({}).sort("created_at", -1).limit(20))
    
    text = f"👥 **Lista de Usuarios** (últimos 20)\n\n"
    
    for i, user in enumerate(users, 1):
        status = "🚫" if user.get('is_banned') else "✅"
        text += f"{i}. {status} {user.get('first_name', 'Usuario')} "
        text += f"({user['telegram_id']}) - {user['gems_balance']:,} 💎\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="admin_users")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "list_tasks")
async def list_tasks_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    tasks = TaskModel.get_tasks()
    
    text = f"📋 **Lista de Tareas Activas**\n\n"
    
    if not tasks:
        text += "No hay tareas activas"
    else:
        for i, task in enumerate(tasks, 1):
            type_emoji = {"task": "📋", "mission": "🎯", "intervention": "🔧"}
            emoji = type_emoji.get(task['type'], "📋")
            text += f"{i}. {emoji} **{task['title']}**\n"
            text += f"   Recompensa: {task['reward']:,} 💎\n"
            text += f"   Completadas: {len(task.get('completed_by', []))}\n"
            text += f"   ID: `{task['_id']}`\n\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="admin_tasks")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "admin_announcements")
async def admin_announcements_callback(callback: CallbackQuery, state: FSMContext):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    await state.set_state(AdminStates.waiting_for_announcement)
    await callback.message.edit_text(
        "📢 **Enviar Anuncio**\n\nEscribe el mensaje que quieres enviar a todos los usuarios:",
        parse_mode="Markdown"
    )

@router.message(AdminStates.waiting_for_announcement)
async def process_announcement(message: Message, state: FSMContext):
    announcement_text = message.text
    
    # Get all users
    users = list(db.db.users.find({"is_banned": {"$ne": True}}))
    
    sent_count = 0
    failed_count = 0
    
    await message.answer(f"📤 Enviando anuncio a {len(users)} usuarios...")
    
    for user in users:
        try:
            await bot.send_message(
                user['telegram_id'],
                f"📢 **Anuncio Oficial**\n\n{announcement_text}",
                parse_mode="Markdown"
            )
            sent_count += 1
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.05)
            
        except Exception as e:
            failed_count += 1
            logger.error(f"Failed to send announcement to {user['telegram_id']}: {e}")
    
    await message.answer(
        f"✅ **Anuncio enviado**\n\n"
        f"**Enviados:** {sent_count}\n"
        f"**Fallidos:** {failed_count}\n"
        f"**Total:** {len(users)}",
        reply_markup=get_admin_keyboard(),
        parse_mode="Markdown"
    )
    
    await state.clear()

@router.callback_query(F.data == "admin_payments")
async def admin_payments_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    # Get recent transactions
    recent_transactions = list(db.db.transactions.find({}).sort("created_at", -1).limit(10))
    
    text = f"💰 **Gestión de Pagos**\n\n"
    text += f"**Transacciones Recientes:**\n\n"
    
    if not recent_transactions:
        text += "No hay transacciones recientes"
    else:
        for tx in recent_transactions:
            user = UserModel.get_user(tx['telegram_id'])
            user_name = user.get('first_name', 'Usuario') if user else 'Usuario'
            
            text += f"• {user_name} ({tx['telegram_id']})\n"
            text += f"  {tx['type']} - {tx['amount']} {tx['currency']}\n"
            text += f"  Estado: {tx['status']}\n\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Volver", callback_data="admin_panel")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

@router.callback_query(F.data == "admin_maintenance")
async def admin_maintenance_callback(callback: CallbackQuery):
    if callback.from_user.id != config.ADMIN_ID:
        await callback.answer("No tienes permisos", show_alert=True)
        return
    
    text = f"🔧 **Modo Mantenimiento**\n\n"
    text += f"Funciones de mantenimiento del sistema:"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🗑️ Limpiar Logs", callback_data="clean_logs"),
            InlineKeyboardButton(text="📊 Backup DB", callback_data="backup_db")
        ],
        [
            InlineKeyboardButton(text="🔄 Reiniciar Bot", callback_data="restart_bot"),
            InlineKeyboardButton(text="⚠️ Modo Mantenimiento", callback_data="maintenance_mode")
        ],
        [
            InlineKeyboardButton(text="🔙 Volver", callback_data="admin_panel")
        ]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")

# Handle admin actions that require user ID with different logic
@router.message(AdminStates.waiting_for_user_id)
async def process_admin_user_action(message: Message, state: FSMContext):
    try:
        user_id = int(message.text)
        data = await state.get_data()
        action = data.get('action')
        
        user = UserModel.get_user(user_id)
        if not user:
            await message.answer("❌ Usuario no encontrado")
            await state.clear()
            return
        
        if action == "modify_balance":
            await state.update_data(user_id=user_id)
            await state.set_state(AdminStates.waiting_for_balance_amount)
            await message.answer(
                f"💎 **Modificar Balance de {user.get('first_name', 'Usuario')}**\n\n"
                f"Balance actual: {user['gems_balance']:,} 💎\n\n"
                f"Envía la cantidad a añadir (número positivo) o restar (número negativo):"
            )
            
        elif action == "ban_user":
            if user.get('is_banned'):
                await message.answer("❌ El usuario ya está baneado")
            else:
                UserModel.update_user(user_id, {'is_banned': True})
                await message.answer(
                    f"🚫 Usuario baneado exitosamente\n\n"
                    f"**Usuario:** {user.get('first_name', 'Usuario')} ({user_id})",
                    reply_markup=get_user_management_keyboard()
                )
                
                # Notify user
                try:
                    await bot.send_message(
                        user_id,
                        "🚫 Tu cuenta ha sido suspendida por un administrador.\n"
                        "Contacta al soporte si crees que esto es un error."
                    )
                except:
                    pass
            
            await state.clear()
            
        elif action == "unban_user":
            if not user.get('is_banned'):
                await message.answer("❌ El usuario no está baneado")
            else:
                UserModel.update_user(user_id, {'is_banned': False})
                await message.answer(
                    f"✅ Usuario desbaneado exitosamente\n\n"
                    f"**Usuario:** {user.get('first_name', 'Usuario')} ({user_id})",
                    reply_markup=get_user_management_keyboard()
                )
                
                # Notify user
                try:
                    await bot.send_message(
                        user_id,
                        "✅ Tu cuenta ha sido reactivada.\n"
                        "¡Bienvenido de vuelta a TaskGram!"
                    )
                except:
                    pass
            
            await state.clear()
        
        else:
            # Default case for user info
            text = f"👤 **Información del Usuario**\n\n"
            text += f"**ID:** {user['telegram_id']}\n"
            text += f"**Nombre:** {user.get('first_name', 'N/A')} {user.get('last_name', '')}\n"
            text += f"**Username:** @{user.get('username', 'N/A')}\n"
            text += f"**Balance 💎:** {user['gems_balance']:,}\n"
            text += f"**Balance ⚡:** {user['ton_balance']:.6f}\n"
            text += f"**Total ganado:** {user['total_earned']:,} 💎\n"
            text += f"**Referidos:** {len(user.get('referrals', []))}\n"
            text += f"**Estado:** {'🚫 Baneado' if user.get('is_banned') else '✅ Activo'}\n"
            text += f"**Registro:** {user['created_at'].strftime('%d/%m/%Y %H:%M')}\n"
            text += f"**Última actividad:** {user['last_active'].strftime('%d/%m/%Y %H:%M')}\n"
            
            if user.get('wallet_address'):
                text += f"**Billetera:** `{user['wallet_address']}`\n"
            
            text += f"\n**Tareas completadas:** {len(user.get('tasks_completed', []))}\n"
            text += f"**Misiones completadas:** {len(user.get('missions_completed', []))}\n"
            text += f"**Intervenciones completadas:** {len(user.get('interventions_completed', []))}"
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔙 Volver", callback_data="admin_users")]
            ])
            
            await message.answer(text, reply_markup=keyboard, parse_mode="Markdown")
            await state.clear()
        
    except ValueError:
        await message.answer("❌ Por favor envía un ID válido (número):")

async def main():
    # Connect to database
    await db.async_connect()
    
    # Include router
    dp.include_router(router)
    
    # Start polling
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
