
import os
from typing import Optional

class Config:
    # Bot Configuration
    BOT_TOKEN = "8063509725:AAFZIEmk0eNZ5Z56_HYOz_bnwyg2rytPB-k"
    ADMIN_ID = 1742433244
    
    # Database Configuration
    MONGODB_URI = "mongodb+srv://zoobot:zoobot@zoolbot.6avd6qf.mongodb.net/zoolbot?retryWrites=true&w=majority&appName=Zoolbot"
    DB_NAME = "zoolbot"
    
    # Mini App Configuration
    WEBAPP_URL = "http://a22328e0b7e3ff9643.blackbx.ai"  # Updated with new URL
    
    # Payment Configuration
    GEMS_TO_TON_RATE = 100000  # 100,000 💎 = 1 TON
    TASK_REWARD = 5000  # 5000 💎 per task
    REFERRAL_PERCENTAGE = 10  # 10% referral bonus
    
    # Security
    SECRET_KEY = "your-secret-key-here"
    
    # TON Configuration
    TON_API_KEY = ""  # To be configured
    TONKEEPER_MANIFEST_URL = ""  # To be configured

class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False

# Default configuration
config = DevelopmentConfig()
