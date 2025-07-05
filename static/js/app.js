
class TaskGramApp {
    constructor() {
        this.user = null;
        this.authToken = null;
        this.currentTab = 'tasks';
        this.currentTask = null;
        this.apiBase = window.location.origin + '/api';
        
        this.init();
    }

    async init() {
        try {
            // Initialize Telegram WebApp
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                
                // Set theme
                document.body.style.backgroundColor = window.Telegram.WebApp.backgroundColor || '#f3f4f6';
            }

            // Setup event listeners
            this.setupEventListeners();
            
            // Authenticate user
            await this.authenticate();
            
            // Load initial data
            await this.loadUserProfile();
            await this.loadTasks();
            
            // Hide loading screen
            this.hideLoading();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Error al inicializar la aplicación', 'error');
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('openTaskBtn').addEventListener('click', () => {
            this.openTaskLink();
        });

        document.getElementById('completeTaskBtn').addEventListener('click', () => {
            this.completeTask();
        });

        // Conversion
        document.getElementById('convertBtn').addEventListener('click', () => {
            this.convertGems();
        });

        // Wallet connection
        document.getElementById('connectWalletBtn').addEventListener('click', () => {
            this.connectWallet();
        });

        // Deposit/Withdraw
        document.getElementById('depositBtn').addEventListener('click', () => {
            this.showToast('Función de depósito próximamente', 'info');
        });

        document.getElementById('withdrawBtn').addEventListener('click', () => {
            this.showToast('Función de retiro próximamente', 'info');
        });

        // Copy referral link
        document.getElementById('copyReferralBtn').addEventListener('click', () => {
            this.copyReferralLink();
        });

        // Close modal on backdrop click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });
    }

    async authenticate() {
        try {
            const initData = window.Telegram?.WebApp?.initData || '';
            const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_parameter;
            
            const response = await fetch(`${this.apiBase}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: initData,
                    referrerId: startParam ? parseInt(startParam) : null
                })
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            this.authToken = data.token;
            this.user = data.user;
            
            // Update UI with user info
            this.updateUserInfo();
            
        } catch (error) {
            console.error('Authentication error:', error);
            // For development, create a mock user
            this.createMockUser();
        }
    }

    createMockUser() {
        // Mock user for development
        this.user = {
            telegram_id: 123456789,
            username: 'testuser',
            first_name: 'Usuario',
            gems_balance: 15000,
            ton_balance: 0.05,
            total_earned: 25000,
            referrals_count: 3
        };
        this.authToken = 'mock-token';
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (!this.user) return;

        document.getElementById('userGreeting').textContent = 
            `¡Hola, ${this.user.first_name || this.user.username || 'Usuario'}!`;
        
        document.getElementById('headerBalance').textContent = 
            `${this.user.gems_balance.toLocaleString()} 💎`;
        
        document.getElementById('gemsBalance').textContent = 
            `${this.user.gems_balance.toLocaleString()} 💎`;
        
        document.getElementById('tonBalance').textContent = 
            `${this.user.ton_balance.toFixed(4)} ⚡`;
        
        document.getElementById('totalEarned').textContent = 
            this.user.total_earned.toLocaleString();
        
        document.getElementById('referralsCount').textContent = 
            this.user.referrals_count || 0;

        // Set referral link
        const referralLink = `https://t.me/your_bot?start=${this.user.telegram_id}`;
        document.getElementById('referralLink').value = referralLink;
    }

    async loadUserProfile() {
        if (!this.authToken) return;

        try {
            const response = await fetch(`${this.apiBase}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.user = { ...this.user, ...userData };
                this.updateUserInfo();
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    async loadTasks(type = 'task') {
        try {
            let tasks = [];
            
            if (this.authToken) {
                const response = await fetch(`${this.apiBase}/tasks?type=${type}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    tasks = await response.json();
                } else {
                    // Fallback to mock tasks if API fails
                    tasks = this.getMockTasks(type);
                }
            } else {
                // Always load mock tasks when no auth token
                tasks = this.getMockTasks(type);
            }

            this.renderTasks(tasks, type);
            
        } catch (error) {
            console.error('Failed to load tasks:', error);
            // Always fallback to mock tasks on error
            this.renderTasks(this.getMockTasks(type), type);
        }
    }

    getMockTasks(type) {
        const mockTasks = {
            task: [
                {
                    _id: '1',
                    title: 'Seguir en Twitter',
                    description: 'Sigue nuestra cuenta oficial de Twitter',
                    url: 'https://twitter.com/taskgram',
                    reward: 5000,
                    completed: false,
                    completed_count: 1250
                },
                {
                    _id: '2',
                    title: 'Unirse al Canal de Telegram',
                    description: 'Únete a nuestro canal oficial para recibir actualizaciones',
                    url: 'https://t.me/taskgram_official',
                    reward: 5000,
                    completed: false,
                    completed_count: 2100
                }
            ],
            mission: [
                {
                    _id: '3',
                    title: 'Misión Semanal',
                    description: 'Completa 10 tareas esta semana',
                    url: '#',
                    reward: 25000,
                    completed: false,
                    completed_count: 450
                }
            ],
            intervention: [
                {
                    _id: '4',
                    title: 'Reporte de Bug',
                    description: 'Reporta un bug en la aplicación',
                    url: 'https://forms.gle/example',
                    reward: 10000,
                    completed: false,
                    completed_count: 89
                }
            ]
        };

        return mockTasks[type] || [];
    }

    renderTasks(tasks, type) {
        const container = document.getElementById(`${type}sList`);
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No hay ${type === 'task' ? 'tareas' : type === 'mission' ? 'misiones' : 'intervenciones'} disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-card bg-white rounded-xl p-4 shadow-sm cursor-pointer" data-task-id="${task._id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800 mb-1">${task.title}</h3>
                        <p class="text-gray-600 text-sm">${task.description}</p>
                    </div>
                    <div class="ml-4 text-right">
                        <div class="text-lg font-bold text-green-500">${task.reward.toLocaleString()} 💎</div>
                        ${task.completed ? 
                            '<span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Completada</span>' :
                            '<span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Disponible</span>'
                        }
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span><i class="fas fa-users mr-1"></i>${task.completed_count} completadas</span>
                    <button class="text-blue-500 hover:text-blue-600 font-medium">
                        ${task.completed ? 'Ver detalles' : 'Completar tarea'}
                    </button>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskId = card.dataset.taskId;
                const task = tasks.find(t => t._id === taskId);
                this.openTaskModal(task);
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('tab-active');

        // Update content sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(tabName).classList.remove('hidden');

        this.currentTab = tabName;

        // Load data for the tab
        if (tabName === 'missions') {
            this.loadTasks('mission');
        } else if (tabName === 'interventions') {
            this.loadTasks('intervention');
        } else if (tabName === 'account') {
            this.loadTransactions();
        }
    }

    openTaskModal(task) {
        this.currentTask = task;
        
        document.getElementById('modalTaskTitle').textContent = task.title;
        document.getElementById('modalTaskDescription').textContent = task.description;
        document.getElementById('modalTaskReward').textContent = `${task.reward.toLocaleString()} 💎`;
        
        // Update buttons based on completion status
        const completeBtn = document.getElementById('completeTaskBtn');
        if (task.completed) {
            completeBtn.textContent = 'Completada';
            completeBtn.disabled = true;
            completeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            completeBtn.textContent = 'Completar';
            completeBtn.disabled = false;
            completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        document.getElementById('taskModal').classList.remove('hidden');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.add('hidden');
        this.currentTask = null;
    }

    openTaskLink() {
        if (this.currentTask && this.currentTask.url && this.currentTask.url !== '#') {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openLink(this.currentTask.url);
            } else {
                window.open(this.currentTask.url, '_blank');
            }
        }
    }

    async completeTask() {
        if (!this.currentTask || this.currentTask.completed) return;

        try {
            if (this.authToken) {
                const response = await fetch(`${this.apiBase}/tasks/${this.currentTask._id}/complete`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.showToast(`¡Tarea completada! +${result.reward} 💎`, 'success');
                        this.user.gems_balance = result.new_balance;
                        this.updateUserInfo();
                        this.closeTaskModal();
                        this.loadTasks(this.getTaskTypeFromTab());
                    } else {
                        this.showToast(result.message, 'error');
                    }
                } else {
                    throw new Error('Failed to complete task');
                }
            } else {
                // Mock completion for development
                this.showToast(`¡Tarea completada! +${this.currentTask.reward} 💎`, 'success');
                this.user.gems_balance += this.currentTask.reward;
                this.updateUserInfo();
                this.closeTaskModal();
                this.loadTasks(this.getTaskTypeFromTab());
            }
        } catch (error) {
            console.error('Failed to complete task:', error);
            this.showToast('Error al completar la tarea', 'error');
        }
    }

    getTaskTypeFromTab() {
        if (this.currentTab === 'missions') return 'mission';
        if (this.currentTab === 'interventions') return 'intervention';
        return 'task';
    }

    async convertGems() {
        const amount = parseInt(document.getElementById('convertAmount').value);
        
        if (!amount || amount < 100000) {
            this.showToast('Mínimo 100,000 💎 para conversión', 'error');
            return;
        }

        if (amount > this.user.gems_balance) {
            this.showToast('Saldo insuficiente', 'error');
            return;
        }

        try {
            if (this.authToken) {
                const response = await fetch(`${this.apiBase}/convert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: JSON.stringify({ gems_amount: amount })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.showToast(result.message, 'success');
                    await this.loadUserProfile();
                    document.getElementById('convertAmount').value = '';
                } else {
                    const error = await response.json();
                    this.showToast(error.error, 'error');
                }
            } else {
                // Mock conversion for development
                const tonAmount = amount / 100000;
                this.user.gems_balance -= amount;
                this.user.ton_balance += tonAmount;
                this.updateUserInfo();
                this.showToast(`Convertido ${amount.toLocaleString()} 💎 a ${tonAmount} ⚡`, 'success');
                document.getElementById('convertAmount').value = '';
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showToast('Error en la conversión', 'error');
        }
    }

    connectWallet() {
        // Mock wallet connection for development
        this.showToast('Conectando con TonKeeper...', 'info');
        
        setTimeout(() => {
            const mockAddress = 'EQD...ABC123';
            document.getElementById('walletStatus').innerHTML = `
                <div class="text-green-600">
                    <i class="fas fa-check-circle mr-2"></i>
                    Billetera conectada: ${mockAddress}
                </div>
            `;
            document.getElementById('connectWalletBtn').textContent = 'Billetera Conectada';
            document.getElementById('connectWalletBtn').disabled = true;
            document.getElementById('connectWalletBtn').classList.add('opacity-50');
            
            this.showToast('Billetera conectada exitosamente', 'success');
        }, 2000);
    }

    copyReferralLink() {
        const referralLink = document.getElementById('referralLink');
        referralLink.select();
        document.execCommand('copy');
        this.showToast('Enlace copiado al portapapeles', 'success');
    }

    async loadTransactions() {
        try {
            let transactions = [];
            
            if (this.authToken) {
                const response = await fetch(`${this.apiBase}/transactions`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    transactions = await response.json();
                }
            } else {
                // Mock transactions for development
                transactions = [
                    {
                        _id: '1',
                        type: 'conversion',
                        amount: 1,
                        currency: 'ton',
                        status: 'completed',
                        created_at: new Date().toISOString(),
                        details: { gems_converted: 100000 }
                    },
                    {
                        _id: '2',
                        type: 'task_reward',
                        amount: 5000,
                        currency: 'gems',
                        status: 'completed',
                        created_at: new Date(Date.now() - 86400000).toISOString()
                    }
                ];
            }

            this.renderTransactions(transactions);
            
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <p>No hay transacciones</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(tx => {
            const date = new Date(tx.created_at).toLocaleDateString();
            const icon = tx.type === 'conversion' ? 'fa-exchange-alt' : 
                        tx.type === 'deposit' ? 'fa-plus' : 
                        tx.type === 'withdraw' ? 'fa-minus' : 'fa-gift';
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas ${icon} text-blue-500 text-sm"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-800">${this.getTransactionTitle(tx)}</div>
                            <div class="text-sm text-gray-500">${date}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold ${tx.currency === 'gems' ? 'text-purple-600' : 'text-blue-600'}">
                            ${tx.amount.toLocaleString()} ${tx.currency === 'gems' ? '💎' : '⚡'}
                        </div>
                        <div class="text-xs ${tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}">
                            ${tx.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTransactionTitle(tx) {
        switch (tx.type) {
            case 'conversion': return 'Conversión 💎 → ⚡';
            case 'deposit': return 'Depósito';
            case 'withdraw': return 'Retiro';
            case 'task_reward': return 'Recompensa de tarea';
            default: return 'Transacción';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        // Set color based on type
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
        } text-white`;
        
        // Show toast
        toast.style.transform = 'translateX(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 3000);
    }

    hideLoading() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskGramApp();
});
