// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjVjlcUKYUBb62x4K8WUGI47mXXlfKTVU",
    authDomain: "zamx-v1.firebaseapp.com",
    projectId: "zamx-v1",
    storageBucket: "zamx-v1.appspot.com",
    messagingSenderId: "609415718761",
    appId: "1:609415718761:web:1b2c3d4e5f6a7b8c9d0e1f"
};

// Demo data for offline/development mode
const demoData = {
    projects: [
        {
            id: 'proj-001',
            title: 'Album 2024',
            status: 'in-progress',
            progress: 65,
            deadline: '2024-08-15',
            team: ['Carlos R.', 'María L.', 'Juan P.'],
            description: 'Nuevo álbum de estudio con 12 canciones originales',
            tasks: [
                { id: 'task-001', title: 'Grabación de voces', completed: true },
                { id: 'task-002', title: 'Mezcla final', completed: false },
                { id: 'task-003', title: 'Diseño de portada', completed: true }
            ]
        },
        {
            id: 'proj-002',
            title: 'Gira Nacional',
            status: 'planning',
            progress: 30,
            deadline: '2024-10-01',
            team: ['Ana M.', 'Pedro S.'],
            description: 'Gira promocional por 10 ciudades principales',
            tasks: [
                { id: 'task-004', title: 'Reserva de venues', completed: true },
                { id: 'task-005', title: 'Contratación de equipo', completed: false },
                { id: 'task-006', title: 'Plan de marketing', completed: false }
            ]
        },
        {
            id: 'proj-003',
            title: 'Videoclip "Amanecer"',
            status: 'almost-done',
            progress: 85,
            deadline: '2024-06-30',
            team: ['Luis V.', 'Carmen T.'],
            description: 'Videoclip para el primer single del nuevo álbum',
            tasks: [
                { id: 'task-007', title: 'Filmación', completed: true },
                { id: 'task-008', title: 'Edición', completed: true },
                { id: 'task-009', title: 'Efectos especiales', completed: false }
            ]
        }
    ],
    content: [
        {
            id: 'cont-001',
            title: 'Amanecer - Master Final.wav',
            type: 'audio',
            date: '2024-05-10',
            size: '48.2 MB'
        },
        {
            id: 'cont-002',
            title: 'Sesión Fotos Estudio.zip',
            type: 'image',
            date: '2024-05-05',
            size: '156.7 MB'
        },
        {
            id: 'cont-003',
            title: 'Ensayo General - 4K.mp4',
            type: 'video',
            date: '2024-04-28',
            size: '1.2 GB'
        },
        {
            id: 'cont-004',
            title: 'Contrato Distribución.pdf',
            type: 'document',
            date: '2024-04-15',
            size: '2.8 MB'
        },
        {
            id: 'cont-005',
            title: 'Noche Estrellada - Demo.wav',
            type: 'audio',
            date: '2024-04-10',
            size: '32.5 MB'
        },
        {
            id: 'cont-006',
            title: 'Portada Álbum - Borrador.png',
            type: 'image',
            date: '2024-04-05',
            size: '8.3 MB'
        },
        {
            id: 'cont-007',
            title: 'Entrevista Radio Nacional.mp4',
            type: 'video',
            date: '2024-03-22',
            size: '345.6 MB'
        },
        {
            id: 'cont-008',
            title: 'Plan Marketing Q2 2024.docx',
            type: 'document',
            date: '2024-03-15',
            size: '1.5 MB'
        }
    ],
    analytics: {
        platforms: [
            { name: 'Spotify', streams: 1250000, revenue: 5000, growth: 12 },
            { name: 'Apple Music', streams: 820000, revenue: 3280, growth: 8 },
            { name: 'YouTube', views: 3500000, revenue: 2800, growth: 15 },
            { name: 'TikTok', views: 9800000, revenue: 1960, growth: 45 }
        ],
        audience: {
            age: [
                { group: '18-24', percentage: 35 },
                { group: '25-34', percentage: 42 },
                { group: '35-44', percentage: 15 },
                { group: '45+', percentage: 8 }
            ],
            gender: [
                { type: 'Femenino', percentage: 58 },
                { type: 'Masculino', percentage: 40 },
                { type: 'No especificado', percentage: 2 }
            ],
            countries: [
                { name: 'México', percentage: 32 },
                { name: 'Colombia', percentage: 18 },
                { name: 'España', percentage: 15 },
                { name: 'Argentina', percentage: 12 },
                { name: 'Chile', percentage: 8 },
                { name: 'Otros', percentage: 15 }
            ]
        },
        monthlyTrends: [
            { month: 'Ene', streams: 980000 },
            { month: 'Feb', streams: 1050000 },
            { month: 'Mar', streams: 1120000 },
            { month: 'Abr', streams: 1250000 },
            { month: 'May', streams: 1380000 }
        ]
    },
    activities: [
        { id: 'act-001', type: 'project', text: 'Proyecto "Album 2024" actualizado', time: '2h' },
        { id: 'act-002', type: 'content', text: 'Nuevo contenido publicado en Instagram', time: '4h' },
        { id: 'act-003', type: 'analytics', text: 'Analytics semanal generado', time: '1d' }
    ],
    events: [
        { id: 'evt-001', title: 'Lanzamiento Single', date: '15 de Junio, 2024', color: 'purple' },
        { id: 'evt-002', title: 'Sesión de Fotos', date: '20 de Junio, 2024', color: 'pink' },
        { id: 'evt-003', title: 'Concierto en Vivo', date: '30 de Junio, 2024', color: 'green' }
    ],
    notifications: [
        { id: 'notif-001', type: 'project', text: 'Tarea "Mezcla final" vence mañana', time: '1h', read: false },
        { id: 'notif-002', type: 'analytics', text: 'Aumento del 15% en reproducciones', time: '3h', read: false },
        { id: 'notif-003', type: 'content', text: 'Nuevo comentario en tu publicación', time: '5h', read: true },
        { id: 'notif-004', type: 'system', text: 'Actualización de sistema completada', time: '1d', read: true }
    ]
};

// DOM Elements
let currentSection = 'dashboard';
let isDarkTheme = false;
let zeusActive = false;
let notificationsActive = false;
let sidebarActive = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleDarkTheme();
    }
    
    // Initialize UI
    setupEventListeners();
    loadSection('dashboard');
    updateNotificationBadge();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            loadSection(section);
        });
    });
    
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkTheme);
    
    // Zeus Assistant Toggle
    document.getElementById('zeus-toggle').addEventListener('click', toggleZeus);
    document.getElementById('zeus-float').addEventListener('click', toggleZeus);
    document.getElementById('zeus-close').addEventListener('click', toggleZeus);
    
    // Notifications Toggle
    document.getElementById('notifications-toggle').addEventListener('click', toggleNotifications);
    document.getElementById('notifications-close').addEventListener('click', toggleNotifications);
    
    // Sidebar Toggle (Mobile)
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-close').addEventListener('click', toggleSidebar);
    
    // Zeus Chat Form
    document.getElementById('zeus-form').addEventListener('submit', handleZeusChat);
    
    // Project Cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            showProjectDetails(card.getAttribute('data-id'));
        });
    });
    
    // Content Cards
    document.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', () => {
            showContentDetails(card.getAttribute('data-id'));
        });
    });
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.currentTarget.getAttribute('data-filter');
            filterContent(filterType);
        });
    });
    
    // View Toggle Buttons
    document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewType = e.currentTarget.getAttribute('data-view');
            toggleContentView(viewType);
        });
    });
    
    // Settings Form
    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
}

// Load Section Content
function loadSection(section) {
    // Update active section
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkSection = link.getAttribute('data-section');
        const listItem = link.parentElement;
        
        if (linkSection === section) {
            listItem.classList.add('active');
        } else {
            listItem.classList.remove('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768 && sidebarActive) {
        toggleSidebar();
    }
    
    // Load section specific data
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'projects':
            loadProjectsData();
            break;
        case 'content':
            loadContentData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Toggle Dark Theme
function toggleDarkTheme() {
    isDarkTheme = !isDarkTheme;
    
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Toggle Zeus Assistant
function toggleZeus() {
    zeusActive = !zeusActive;
    
    const zeusPanel = document.getElementById('zeus-panel');
    if (zeusActive) {
        zeusPanel.classList.add('active');
    } else {
        zeusPanel.classList.remove('active');
    }
}

// Toggle Notifications Panel
function toggleNotifications() {
    notificationsActive = !notificationsActive;
    
    const notificationsPanel = document.getElementById('notifications-panel');
    if (notificationsActive) {
        notificationsPanel.classList.add('active');
        // Mark notifications as read
        demoData.notifications.forEach(notification => {
            notification.read = true;
        });
        updateNotificationBadge();
    } else {
        notificationsPanel.classList.remove('active');
    }
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    sidebarActive = !sidebarActive;
    
    const sidebar = document.getElementById('sidebar');
    if (sidebarActive) {
        sidebar.classList.add('active');
    } else {
        sidebar.classList.remove('active');
    }
}

// Handle Zeus Chat
function handleZeusChat(e) {
    e.preventDefault();
    
    const input = document.getElementById('zeus-input');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        addZeusMessage(message, 'user');
        
        // Clear input
        input.value = '';
        
        // Simulate Zeus response
        setTimeout(() => {
            const responses = [
                "Estoy analizando los datos de tu último lanzamiento. Las reproducciones han aumentado un 15% en la última semana.",
                "He programado un recordatorio para la sesión de fotos del 20 de junio.",
                "Basado en tus datos de audiencia, te recomendaría enfocarte en promocionar más en TikTok, donde tienes un crecimiento del 45%.",
                "He detectado un aumento en la audiencia femenina entre 25-34 años. ¿Quieres que prepare una estrategia de marketing enfocada en este segmento?",
                "Tu canción 'Amanecer' está teniendo un buen rendimiento. ¿Deseas que analice las métricas específicas de este lanzamiento?"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addZeusMessage(randomResponse, 'assistant');
        }, 1000);
    }
}

// Add Zeus Message
function addZeusMessage(message, type) {
    const messagesContainer = document.getElementById('zeus-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('zeus-message', type);
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update Notification Badge
function updateNotificationBadge() {
    const unreadCount = demoData.notifications.filter(notification => !notification.read).length;
    const badge = document.getElementById('notifications-badge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Load Dashboard Data
function loadDashboardData() {
    // Update stats
    document.getElementById('projects-count').textContent = demoData.projects.length;
    document.getElementById('content-count').textContent = demoData.content.length;
    
    // Calculate total views/streams
    const totalViews = demoData.analytics.platforms.reduce((sum, platform) => {
        return sum + (platform.streams || platform.views || 0);
    }, 0);
    document.getElementById('views-count').textContent = formatNumber(totalViews);
    
    // Calculate average engagement
    const engagementRate = Math.round(Math.random() * 8 + 2); // Random between 2-10%
    document.getElementById('engagement-rate').textContent = `${engagementRate}%`;
    
    // Update activity list
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    demoData.activities.forEach(activity => {
        const dotClass = activity.type === 'project' ? 'purple' : 
                        activity.type === 'content' ? 'pink' : 'green';
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="activity-dot ${dotClass}"></div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span class="activity-time">hace ${activity.time}</span>
            </div>
        `;
        activityList.appendChild(li);
    });
    
    // Update events list
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    
    demoData.events.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="event-marker ${event.color}"></div>
            <div class="event-content">
                <h4>${event.title}</h4>
                <p>${event.date}</p>
            </div>
        `;
        eventsList.appendChild(li);
    });
}

// Load Projects Data
function loadProjectsData() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    demoData.projects.forEach(project => {
        const card = document.createElement('div');
        card.classList.add('project-card');
        card.setAttribute('data-id', project.id);
        
        let statusClass = '';
        let statusText = '';
        
        switch (project.status) {
            case 'in-progress':
                statusClass = 'in-progress';
                statusText = 'En Progreso';
                break;
            case 'planning':
                statusClass = 'planning';
                statusText = 'Planificación';
                break;
            case 'almost-done':
                statusClass = 'almost-done';
                statusText = 'Casi Terminado';
                break;
        }
        
        card.innerHTML = `
            <div class="project-header">
                <h3>${project.title}</h3>
                <span class="project-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="project-body">
                <div class="project-progress">
                    <div class="progress-label">
                        <span>Progreso</span>
                        <span>${project.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <p>${project.description}</p>
                <div class="project-details">
                    <p><i class="far fa-calendar"></i> Fecha límite: ${formatDate(project.deadline)}</p>
                    <p><i class="far fa-user"></i> Equipo: ${project.team.join(', ')}</p>
                </div>
            </div>
            <div class="project-footer">
                <button class="btn btn-text">Ver Detalles</button>
            </div>
        `;
        
        projectsGrid.appendChild(card);
        
        // Add click event
        card.addEventListener('click', () => {
            showProjectDetails(project.id);
        });
    });
}

// Show Project Details
function showProjectDetails(projectId) {
    const project = demoData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Here you would typically open a modal or navigate to a details page
    alert(`Detalles del proyecto "${project.title}"\n\nDescripción: ${project.description}\nProgreso: ${project.progress}%\nFecha límite: ${formatDate(project.deadline)}\nEquipo: ${project.team.join(', ')}`);
}

// Load Content Data
function loadContentData() {
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) return;
    
    contentGrid.innerHTML = '';
    
    demoData.content.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('content-card');
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-type', item.type);
        
        let icon = '';
        switch (item.type) {
            case 'audio':
                icon = '<i class="fas fa-music"></i>';
                break;
            case 'image':
                icon = '<i class="fas fa-image"></i>';
                break;
            case 'video':
                icon = '<i class="fas fa-video"></i>';
                break;
            case 'document':
                icon = '<i class="fas fa-file-alt"></i>';
                break;
        }
        
        card.innerHTML = `
            <div class="content-thumbnail ${item.type}">
                ${icon}
            </div>
            <div class="content-info">
                <h4>${item.title}</h4>
                <div class="content-meta">
                    <span>${formatDate(item.date)}</span>
                    <span>${item.size}</span>
                </div>
            </div>
        `;
        
        contentGrid.appendChild(card);
        
        // Add click event
        card.addEventListener('click', () => {
            showContentDetails(item.id);
        });
    });
}

// Filter Content
function filterContent(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-filter') === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filter content items
    document.querySelectorAll('.content-card').forEach(card => {
        if (type === 'all' || card.getAttribute('data-type') === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Toggle Content View
function toggleContentView(viewType) {
    // Update active view button
    document.querySelectorAll('.view-toggle').forEach(btn => {
        if (btn.getAttribute('data-view') === viewType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update content grid class
    const contentGrid = document.getElementById('content-grid');
    if (viewType === 'grid') {
        contentGrid.classList.remove('list-view');
    } else {
        contentGrid.classList.add('list-view');
    }
}

// Show Content Details
function showContentDetails(contentId) {
    const content = demoData.content.find(c => c.id === contentId);
    if (!content) return;
    
    // Here you would typically open a modal or navigate to a details page
    alert(`Detalles del contenido "${content.title}"\n\nTipo: ${content.type}\nFecha: ${formatDate(content.date)}\nTamaño: ${content.size}`);
}

// Load Analytics Data
function loadAnalyticsData() {
    // This would typically involve chart libraries like Chart.js
    // For this demo, we'll just populate some basic data
    
    // Platform stats
    const platformsTable = document.getElementById('platforms-table');
    if (platformsTable) {
        const tbody = platformsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        demoData.analytics.platforms.forEach(platform => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${platform.name}</td>
                <td>${formatNumber(platform.streams || platform.views || 0)}</td>
                <td>$${platform.revenue}</td>
                <td class="text-success">+${platform.growth}%</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Audience demographics would be rendered as charts
    // Monthly trends would be rendered as line chart
}

// Load Settings Data
function loadSettingsData() {
    // This would typically load user preferences from the database
    // For this demo, we'll just set some default values
    
    const notificationsSwitch = document.getElementById('notifications-switch');
    if (notificationsSwitch) {
        notificationsSwitch.checked = true;
    }
    
    const emailSwitch = document.getElementById('email-switch');
    if (emailSwitch) {
        emailSwitch.checked = true;
    }
}

// Save Settings
function saveSettings() {
    // This would typically save user preferences to the database
    // For this demo, we'll just show a success message
    
    alert('Configuración guardada correctamente');
}

// Helper Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateStr) {
    // Simple date formatting for demo
    // In a real app, you'd use a proper date library
    return dateStr;
}
