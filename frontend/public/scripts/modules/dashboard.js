// Módulo Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la sección dashboard
    if (!document.getElementById('dashboard-section')) return;
    
    // Inicializar gráficos
    initDashboardCharts();
    
    // Cargar datos de actividad reciente
    loadRecentActivity();
    
    // Cargar próximos eventos
    loadUpcomingEvents();
    
    // Configurar acciones rápidas
    setupQuickActions();
});

// Inicializar gráficos del dashboard
function initDashboardCharts() {
    const ctx = document.getElementById('analytics-chart');
    if (!ctx) return;
    
    // Datos de ejemplo para el gráfico
    const data = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Spotify',
                data: [1200, 1900, 1500, 2000, 2500, 2800, 3100],
                borderColor: '#1DB954',
                backgroundColor: 'rgba(29, 185, 84, 0.1)',
                tension: 0.4
            },
            {
                label: 'Apple Music',
                data: [800, 1200, 1100, 1500, 1800, 2100, 2400],
                borderColor: '#FC3C44',
                backgroundColor: 'rgba(252, 60, 68, 0.1)',
                tension: 0.4
            },
            {
                label: 'YouTube Music',
                data: [600, 800, 950, 1100, 1300, 1500, 1700],
                borderColor: '#FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                tension: 0.4
            }
        ]
    };
    
    // Configuración del gráfico
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    
    // Crear el gráfico
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, config);
    } else {
        console.log('Chart.js no está disponible. El gráfico se mostrará cuando se cargue la librería.');
    }
}

// Cargar datos de actividad reciente
function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // En una implementación real, estos datos vendrían de Firebase
    // Por ahora, usamos datos de ejemplo
    const activities = [
        {
            icon: 'music',
            title: 'Nuevo álbum creado',
            time: 'Hace 2 horas',
            description: '"Ecos del Silencio" - 12 pistas'
        },
        {
            icon: 'upload',
            title: 'Contenido subido',
            time: 'Hace 5 horas',
            description: '3 fotos añadidas a la galería'
        },
        {
            icon: 'calendar-check',
            title: 'Evento programado',
            time: 'Ayer',
            description: 'Concierto en Teatro Metropolitan - 15 Jun'
        },
        {
            icon: 'file-contract',
            title: 'Contrato firmado',
            time: 'Hace 2 días',
            description: 'Colaboración con Sony Music'
        }
    ];
    
    // Actualizar la UI con los datos
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-${activity.icon}"></i></div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
        </div>
    `).join('');
}

// Cargar próximos eventos
function loadUpcomingEvents() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;
    
    // En una implementación real, estos datos vendrían de Firebase
    // Por ahora, usamos datos de ejemplo
    const events = [
        {
            day: '15',
            month: 'JUN',
            title: 'Concierto Teatro Metropolitan',
            location: 'Ciudad de México'
        },
        {
            day: '22',
            month: 'JUN',
            title: 'Entrevista Radio Nacional',
            location: 'Online'
        },
        {
            day: '30',
            month: 'JUN',
            title: 'Lanzamiento Nuevo Sencillo',
            location: 'Todas las plataformas'
        }
    ];
    
    // Actualizar la UI con los datos
    eventsList.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-date">
                <div class="event-day">${event.day}</div>
                <div class="event-month">${event.month}</div>
            </div>
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
            </div>
        </div>
    `).join('');
}

// Configurar acciones rápidas
function setupQuickActions() {
    const quickActions = document.querySelectorAll('.action-card');
    if (!quickActions.length) return;
    
    quickActions.forEach(action => {
        action.addEventListener('click', function() {
            const actionText = this.querySelector('.action-text').textContent;
            
            // Mostrar un mensaje de acción
            showNotification(`Acción iniciada: ${actionText}`);
            
            // En una implementación real, aquí se ejecutaría la acción correspondiente
            // Por ahora, solo mostramos un mensaje
        });
    });
}

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
