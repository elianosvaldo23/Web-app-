
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import jwt
import hashlib
import hmac
import json
import sys
import os
from urllib.parse import unquote
import logging

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import config
from backend.database import db, UserModel, TaskModel, TransactionModel

app = Flask(__name__, template_folder='../frontend', static_folder='../static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database
db.connect()

def verify_telegram_auth(init_data: str) -> dict:
    """Verify Telegram WebApp authentication"""
    try:
        # Parse init data
        parsed_data = {}
        for item in init_data.split('&'):
            key, value = item.split('=', 1)
            parsed_data[key] = unquote(value)
        
        # Extract hash and create data string
        received_hash = parsed_data.pop('hash', '')
        data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(parsed_data.items())])
        
        # Create secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            config.BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash == received_hash:
            user_data = json.loads(parsed_data.get('user', '{}'))
            return user_data
        
        return None
    except Exception as e:
        logger.error(f"Auth verification error: {e}")
        return None

@app.route('/')
def index():
    """Serve the main mini-app page"""
    return render_template('index.html')

@app.route('/api/auth', methods=['POST'])
def authenticate():
    """Authenticate user via Telegram WebApp"""
    try:
        data = request.get_json()
        init_data = data.get('initData')
        referrer_id = data.get('referrerId')
        
        user_data = verify_telegram_auth(init_data)
        if not user_data:
            return jsonify({'error': 'Invalid authentication'}), 401
        
        telegram_id = user_data['id']
        
        # Check if user exists
        user = UserModel.get_user(telegram_id)
        if not user:
            # Create new user
            UserModel.create_user(
                telegram_id=telegram_id,
                username=user_data.get('username'),
                first_name=user_data.get('first_name'),
                last_name=user_data.get('last_name'),
                referrer_id=referrer_id
            )
            user = UserModel.get_user(telegram_id)
        
        # Generate JWT token
        token = jwt.encode({
            'telegram_id': telegram_id,
            'username': user_data.get('username')
        }, config.SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'telegram_id': user['telegram_id'],
                'username': user.get('username'),
                'first_name': user.get('first_name'),
                'gems_balance': user['gems_balance'],
                'ton_balance': user['ton_balance'],
                'total_earned': user['total_earned'],
                'referrals_count': len(user.get('referrals', []))
            }
        })
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return jsonify({'error': 'Authentication failed'}), 500

def require_auth(f):
    """Decorator to require authentication"""
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = jwt.decode(token, config.SECRET_KEY, algorithms=['HS256'])
            request.user_id = payload['telegram_id']
            return f(*args, **kwargs)
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/api/user/profile', methods=['GET'])
@require_auth
def get_user_profile():
    """Get user profile information"""
    try:
        user = UserModel.get_user(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'telegram_id': user['telegram_id'],
            'username': user.get('username'),
            'first_name': user.get('first_name'),
            'gems_balance': user['gems_balance'],
            'ton_balance': user['ton_balance'],
            'total_earned': user['total_earned'],
            'referrals_count': len(user.get('referrals', [])),
            'wallet_address': user.get('wallet_address'),
            'tasks_completed': len(user.get('tasks_completed', [])),
            'missions_completed': len(user.get('missions_completed', [])),
            'interventions_completed': len(user.get('interventions_completed', []))
        })
        
    except Exception as e:
        logger.error(f"Profile error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500

@app.route('/api/tasks', methods=['GET'])
@require_auth
def get_tasks():
    """Get tasks by type"""
    try:
        task_type = request.args.get('type', 'task')
        tasks = TaskModel.get_tasks(task_type)
        
        # Convert ObjectId to string and add completion status
        user = UserModel.get_user(request.user_id)
        completed_tasks = user.get(f'{task_type}s_completed', [])
        
        result = []
        for task in tasks:
            task['_id'] = str(task['_id'])
            task['completed'] = str(task['_id']) in completed_tasks
            task['completed_count'] = len(task.get('completed_by', []))
            result.append(task)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Get tasks error: {e}")
        return jsonify({'error': 'Failed to get tasks'}), 500

@app.route('/api/tasks/<task_id>/complete', methods=['POST'])
@require_auth
def complete_task(task_id):
    """Complete a task"""
    try:
        success = TaskModel.complete_task(task_id, request.user_id)
        
        if success:
            # Get updated user data
            user = UserModel.get_user(request.user_id)
            return jsonify({
                'success': True,
                'message': 'Task completed successfully!',
                'new_balance': user['gems_balance'],
                'reward': config.TASK_REWARD
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Task already completed or not found'
            }), 400
            
    except Exception as e:
        logger.error(f"Complete task error: {e}")
        return jsonify({'error': 'Failed to complete task'}), 500

@app.route('/api/wallet/connect', methods=['POST'])
@require_auth
def connect_wallet():
    """Connect TonKeeper wallet"""
    try:
        data = request.get_json()
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'Wallet address required'}), 400
        
        UserModel.update_user(request.user_id, {'wallet_address': wallet_address})
        
        return jsonify({
            'success': True,
            'message': 'Wallet connected successfully'
        })
        
    except Exception as e:
        logger.error(f"Connect wallet error: {e}")
        return jsonify({'error': 'Failed to connect wallet'}), 500

@app.route('/api/convert', methods=['POST'])
@require_auth
def convert_gems_to_ton():
    """Convert gems to TON"""
    try:
        data = request.get_json()
        gems_amount = data.get('gems_amount', 0)
        
        if gems_amount < config.GEMS_TO_TON_RATE:
            return jsonify({
                'error': f'Minimum {config.GEMS_TO_TON_RATE} gems required for conversion'
            }), 400
        
        user = UserModel.get_user(request.user_id)
        if user['gems_balance'] < gems_amount:
            return jsonify({'error': 'Insufficient gems balance'}), 400
        
        ton_amount = gems_amount / config.GEMS_TO_TON_RATE
        
        # Create transaction record
        TransactionModel.create_transaction(
            telegram_id=request.user_id,
            transaction_type='conversion',
            amount=ton_amount,
            currency='ton',
            status='completed',
            details={'gems_converted': gems_amount}
        )
        
        # Update user balances
        UserModel.subtract_gems(request.user_id, gems_amount)
        UserModel.update_user(request.user_id, {
            'ton_balance': user['ton_balance'] + ton_amount
        })
        
        return jsonify({
            'success': True,
            'message': f'Converted {gems_amount} 💎 to {ton_amount} TON',
            'ton_amount': ton_amount
        })
        
    except Exception as e:
        logger.error(f"Conversion error: {e}")
        return jsonify({'error': 'Conversion failed'}), 500

@app.route('/api/transactions', methods=['GET'])
@require_auth
def get_transactions():
    """Get user transaction history"""
    try:
        transactions = TransactionModel.get_user_transactions(request.user_id)
        
        # Convert ObjectId to string
        result = []
        for tx in transactions:
            tx['_id'] = str(tx['_id'])
            result.append(tx)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Get transactions error: {e}")
        return jsonify({'error': 'Failed to get transactions'}), 500

@app.route('/api/referrals', methods=['GET'])
@require_auth
def get_referrals():
    """Get user referrals information"""
    try:
        user = UserModel.get_user(request.user_id)
        referrals = user.get('referrals', [])
        
        # Get referral details
        referral_details = []
        for ref_id in referrals:
            ref_user = UserModel.get_user(ref_id)
            if ref_user:
                referral_details.append({
                    'telegram_id': ref_user['telegram_id'],
                    'username': ref_user.get('username'),
                    'first_name': ref_user.get('first_name'),
                    'total_earned': ref_user['total_earned'],
                    'joined_at': ref_user['created_at']
                })
        
        return jsonify({
            'referrals_count': len(referrals),
            'referrals': referral_details,
            'referral_link': f"https://t.me/your_bot?start={request.user_id}"
        })
        
    except Exception as e:
        logger.error(f"Get referrals error: {e}")
        return jsonify({'error': 'Failed to get referrals'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=config.DEBUG)
