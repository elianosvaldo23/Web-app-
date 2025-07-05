
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from datetime import datetime, timezone
from typing import Optional, Dict, List
import logging
from config.config import config

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.async_client = None
        self.async_db = None
    
    def connect(self):
        """Synchronous connection for Flask app"""
        try:
            self.client = MongoClient(config.MONGODB_URI)
            self.db = self.client[config.DB_NAME]
            logger.info("Connected to MongoDB (sync)")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB (sync): {e}")
            return False
    
    async def async_connect(self):
        """Asynchronous connection for bot"""
        try:
            self.async_client = AsyncIOMotorClient(config.MONGODB_URI)
            self.async_db = self.async_client[config.DB_NAME]
            logger.info("Connected to MongoDB (async)")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB (async): {e}")
            return False
    
    def close(self):
        """Close synchronous connection"""
        if self.client:
            self.client.close()
    
    async def async_close(self):
        """Close asynchronous connection"""
        if self.async_client:
            self.async_client.close()

# Database instance
db = Database()

class UserModel:
    @staticmethod
    def create_user(telegram_id: int, username: str = None, first_name: str = None, 
                   last_name: str = None, referrer_id: int = None):
        """Create a new user"""
        user_data = {
            "telegram_id": telegram_id,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
            "gems_balance": 0,
            "ton_balance": 0.0,
            "referrer_id": referrer_id,
            "referrals": [],
            "total_earned": 0,
            "tasks_completed": [],
            "missions_completed": [],
            "interventions_completed": [],
            "wallet_address": None,
            "is_banned": False,
            "created_at": datetime.now(timezone.utc),
            "last_active": datetime.now(timezone.utc)
        }
        
        result = db.db.users.insert_one(user_data)
        
        # Add to referrer's referrals list
        if referrer_id:
            db.db.users.update_one(
                {"telegram_id": referrer_id},
                {"$push": {"referrals": telegram_id}}
            )
        
        return result.inserted_id
    
    @staticmethod
    def get_user(telegram_id: int):
        """Get user by telegram ID"""
        return db.db.users.find_one({"telegram_id": telegram_id})
    
    @staticmethod
    def update_user(telegram_id: int, update_data: dict):
        """Update user data"""
        update_data["last_active"] = datetime.now(timezone.utc)
        return db.db.users.update_one(
            {"telegram_id": telegram_id},
            {"$set": update_data}
        )
    
    @staticmethod
    def add_gems(telegram_id: int, amount: int):
        """Add gems to user balance"""
        return db.db.users.update_one(
            {"telegram_id": telegram_id},
            {
                "$inc": {"gems_balance": amount, "total_earned": amount},
                "$set": {"last_active": datetime.now(timezone.utc)}
            }
        )
    
    @staticmethod
    def subtract_gems(telegram_id: int, amount: int):
        """Subtract gems from user balance"""
        user = UserModel.get_user(telegram_id)
        if user and user["gems_balance"] >= amount:
            return db.db.users.update_one(
                {"telegram_id": telegram_id},
                {
                    "$inc": {"gems_balance": -amount},
                    "$set": {"last_active": datetime.now(timezone.utc)}
                }
            )
        return None

class TaskModel:
    @staticmethod
    def create_task(title: str, description: str, url: str, reward: int, task_type: str = "task"):
        """Create a new task"""
        task_data = {
            "title": title,
            "description": description,
            "url": url,
            "reward": reward,
            "type": task_type,  # task, mission, intervention
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "completed_by": []
        }
        return db.db.tasks.insert_one(task_data)
    
    @staticmethod
    def get_tasks(task_type: str = None, is_active: bool = True):
        """Get tasks by type"""
        query = {"is_active": is_active}
        if task_type:
            query["type"] = task_type
        return list(db.db.tasks.find(query))
    
    @staticmethod
    def complete_task(task_id: str, telegram_id: int):
        """Mark task as completed by user"""
        from bson import ObjectId
        
        # Check if already completed
        task = db.db.tasks.find_one({
            "_id": ObjectId(task_id),
            "completed_by": telegram_id
        })
        
        if task:
            return False  # Already completed
        
        # Mark as completed
        result = db.db.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"completed_by": telegram_id}}
        )
        
        if result.modified_count > 0:
            # Get task details for reward
            task = db.db.tasks.find_one({"_id": ObjectId(task_id)})
            if task:
                # Add reward to user
                UserModel.add_gems(telegram_id, task["reward"])
                
                # Add to user's completed tasks
                field_name = f"{task['type']}s_completed"
                db.db.users.update_one(
                    {"telegram_id": telegram_id},
                    {"$push": {field_name: task_id}}
                )
                
                # Process referral bonus
                user = UserModel.get_user(telegram_id)
                if user and user.get("referrer_id"):
                    referral_bonus = int(task["reward"] * config.REFERRAL_PERCENTAGE / 100)
                    UserModel.add_gems(user["referrer_id"], referral_bonus)
                
                return True
        
        return False

class TransactionModel:
    @staticmethod
    def create_transaction(telegram_id: int, transaction_type: str, amount: float, 
                         currency: str, status: str = "pending", details: dict = None):
        """Create a new transaction"""
        transaction_data = {
            "telegram_id": telegram_id,
            "type": transaction_type,  # deposit, withdraw, conversion
            "amount": amount,
            "currency": currency,  # gems, ton
            "status": status,  # pending, completed, failed
            "details": details or {},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        return db.db.transactions.insert_one(transaction_data)
    
    @staticmethod
    def get_user_transactions(telegram_id: int, limit: int = 50):
        """Get user transaction history"""
        return list(db.db.transactions.find(
            {"telegram_id": telegram_id}
        ).sort("created_at", -1).limit(limit))
    
    @staticmethod
    def update_transaction_status(transaction_id: str, status: str, details: dict = None):
        """Update transaction status"""
        from bson import ObjectId
        update_data = {
            "status": status,
            "updated_at": datetime.now(timezone.utc)
        }
        if details:
            update_data["details"] = details
        
        return db.db.transactions.update_one(
            {"_id": ObjectId(transaction_id)},
            {"$set": update_data}
        )
