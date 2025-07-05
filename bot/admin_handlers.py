
# Additional admin handlers for bot.py
# This code should be added to the bot.py file

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

@router.message(AdminStates.waiting_for_user_id)
async def process_user_info(message: Message, state: FSMContext):
    try:
        user_id = int(message.text)
        user = UserModel.get_user(user_id)
        
        if not user:
            await message.answer("❌ Usuario no encontrado")
            await state.clear()
            return
        
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

# Handle admin actions that require user ID
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
        
    except ValueError:
        await message.answer("❌ Por favor envía un ID válido (número):")
