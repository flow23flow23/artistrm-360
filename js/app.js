document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentArea = document.getElementById('content-area');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const appContainer = document.getElementById('app-container');
    const themeToggle = document.getElementById('theme-toggle');
    const zeusToggle = document.getElementById('zeus-toggle');
    const zeusModal = document.getElementById('zeus-modal');
    const zeusClose = document.getElementById('zeus-close');
    const notificationsToggle = document.getElementById('notifications-toggle');
    const notificationsPanel = document.getElementById('notifications-panel');
    const notificationsClose = document.getElementById('notifications-close');

    // --- Navigation --- 
    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fa-chart-line', path: 'pages/dashboard.html' },
        { id: 'projects', name: 'Proyectos', icon: 'fa-project-diagram', path: 'pages/projects.html' },
        { id: 'content', name: 'Contenido', icon: 'fa-photo-video', path: 'pages/content.html' },
        { id: 'analytics', name: 'Analytics', icon: 'fa-chart-pie', path: 'pages/analytics.html' },
        { id: 'finances', name: 'Finanzas', icon: 'fa-money-bill-wave', path: 'pages/finances.html' },
        { id: 'events', name: 'Eventos', icon: 'fa-calendar-alt', path: 'pages/events.html' },
        { id: 'contracts', name: 'Contratos', icon: 'fa-file-contract', path: 'pages/contracts.html' },
        { id: 'fans', name: 'CRM Fans', icon: 'fa-users', path: 'pages/fans.html' },
        { id: 'settings', name: 'Configuración', icon: 'fa-cog', path: 'pages/settings.html' }
    ];

    // Load navigation items
    function loadNavigation() {
        const ul = document.createElement('ul');
        navItems.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('nav-item');
            li.innerHTML = `
                <a href="#${item.id}" class="nav-link" data-page="${item.path}">
                    <i class="fas ${item.icon} nav-icon"></i>
                    <span class="nav-text">${item.name}</span>
                </a>
            `;
            ul.appendChild(li);
        });
        sidebarNav.appendChild(ul);
    }

    // Load page content
    async function loadPage(pagePath) {
        try {
            contentArea.innerHTML = `<section id="loading-section" class="section active"><div class="section-header"><h2 class="section-title">Cargando ${pagePath}...</h2></div></section>`; // Show loading state
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            contentArea.innerHTML = content;
            // Optionally, run scripts specific to the loaded page here
        } catch (error) {
            console.error('Error loading page:', error);
            contentArea.innerHTML = `<section id="error-section" class="section active"><div class="section-header"><h2 class="section-title">Error al cargar la página</h2><p>${error.message}</p></div></section>`;
        }
    }

    // Handle navigation clicks
    sidebarNav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            const pagePath = link.dataset.page;
            const pageId = link.hash.substring(1);
            
            // Update active link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Load page content
            loadPage(pagePath);
            
            // Update URL hash
            window.location.hash = pageId;
            
            // Close sidebar on mobile after click
            if (window.innerWidth <= 768) {
                appContainer.classList.remove('sidebar-collapsed');
            }
        }
    });

    // Initial page load based on hash or default to dashboard
    function initialLoad() {
        const hash = window.location.hash.substring(1);
        const initialItem = navItems.find(item => item.id === hash) || navItems[0]; // Default to dashboard
        if (initialItem) {
            loadPage(initialItem.path);
            const activeLink = sidebarNav.querySelector(`a[href="#${initialItem.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    // --- UI Interactions ---

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
    });
    sidebarClose.addEventListener('click', () => {
        appContainer.classList.remove('sidebar-collapsed');
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLightTheme = document.body.classList.contains('light-theme');
        themeToggle.innerHTML = `<i class="fas ${isLightTheme ? 'fa-moon' : 'fa-sun'}"></i>`;
        // Optionally save theme preference to localStorage
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    });

    // Load saved theme
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.remove('light-theme'); // Default is dark
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Zeus modal toggle
    zeusToggle.addEventListener('click', () => {
        zeusModal.classList.add('active');
    });
    zeusClose.addEventListener('click', () => {
        zeusModal.classList.remove('active');
    });

    // Notifications panel toggle
    notificationsToggle.addEventListener('click', () => {
        notificationsPanel.classList.add('active');
    });
    notificationsClose.addEventListener('click', () => {
        notificationsPanel.classList.remove('active');
    });
    
    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.zeus-modal') && !e.target.closest('#zeus-toggle')) {
            zeusModal.classList.remove('active');
        }
        if (!e.target.closest('.notifications-panel') && !e.target.closest('#notifications-toggle')) {
            notificationsPanel.classList.remove('active');
        }
        // Close sidebar on mobile when clicking outside
        if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('#sidebar-toggle')) {
             appContainer.classList.remove('sidebar-collapsed');
        }
    });

    // --- Initialization ---
    loadNavigation();
    loadTheme();
    initialLoad();

});

