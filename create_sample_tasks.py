
import sys
import os
sys.path.append('/home/user/workspace')

from backend.database import db, TaskModel

# Connect to database
db.connect()

# Create sample tasks
sample_tasks = [
    {
        "title": "Seguir en Twitter",
        "description": "Sigue nuestra cuenta oficial de Twitter para recibir actualizaciones",
        "url": "https://twitter.com/taskgram_official",
        "reward": 5000,
        "task_type": "task"
    },
    {
        "title": "Unirse al Canal de Telegram",
        "description": "Únete a nuestro canal oficial para recibir noticias y actualizaciones",
        "url": "https://t.me/taskgram_channel",
        "reward": 5000,
        "task_type": "task"
    },
    {
        "title": "Compartir en Instagram",
        "description": "Comparte una historia en Instagram mencionando TaskGram",
        "url": "https://instagram.com",
        "reward": 7500,
        "task_type": "task"
    },
    {
        "title": "Misión Semanal: 10 Tareas",
        "description": "Completa 10 tareas durante esta semana para obtener una recompensa especial",
        "url": "#",
        "reward": 25000,
        "task_type": "mission"
    },
    {
        "title": "Reporte de Bug",
        "description": "Reporta un bug o problema en la aplicación para ayudarnos a mejorar",
        "url": "https://forms.gle/taskgram_bug_report",
        "reward": 10000,
        "task_type": "intervention"
    }
]

# Insert sample tasks
for task_data in sample_tasks:
    try:
        result = TaskModel.create_task(
            title=task_data["title"],
            description=task_data["description"],
            url=task_data["url"],
            reward=task_data["reward"],
            task_type=task_data["task_type"]
        )
        print(f"✅ Created task: {task_data['title']}")
    except Exception as e:
        print(f"❌ Error creating task {task_data['title']}: {e}")

print("\n🎉 Sample tasks created successfully!")
