// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentArea = document.getElementById('content-area');
    const zeusToggle = document.getElementById('zeus-toggle');
    const zeusModal = document.getElementById('zeus-modal');
    const zeusClose = document.getElementById('zeus-close');
    const notificationsToggle = document.getElementById('notifications-toggle');
    const notificationsPanel = document.getElementById('notifications-panel');
    const notificationsClose = document.getElementById('notifications-close');
    const appContainer = document.getElementById('app-container');

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Sidebar Management ---
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });

    // Close sidebar when clicking outside on mobile
    appContainer.addEventListener('click', function(event) {
        if (window.innerWidth <= 992 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('active');
            }
        }
    });

    // --- Navigation Management ---
    const modules = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fa-tachometer-alt', file: 'dashboard.js', css: 'dashboard.css' },
        { id: 'projects', name: 'Proyectos', icon: 'fa-project-diagram', file: 'projects.js', css: 'projects.css' },
        { id: 'content', name: 'Contenido', icon: 'fa-photo-video', file: 'content.js', css: 'content.css' },
        { id: 'finances', name: 'Finanzas', icon: 'fa-wallet', file: 'finances.js', css: 'finances.css' },
        { id: 'contracts', name: 'Contratos', icon: 'fa-file-contract', file: 'contracts.js', css: 'contracts.css' },
        { id: 'events', name: 'Eventos', icon: 'fa-calendar-alt', file: 'events.js', css: 'events.css' },
        { id: 'analytics', name: 'Analytics', icon: 'fa-chart-bar', file: 'analytics.js', css: 'analytics.css' },
        { id: 'crm', name: 'CRM Fans', icon: 'fa-users', file: 'crm.js', css: 'crm.css' },
        { id: 'automation', name: 'Automatización', icon: 'fa-cogs', file: 'automation.js', css: 'automation.css' },
        { id: 'settings', name: 'Configuración', icon: 'fa-cog', file: 'settings.js', css: 'settings.css' }
    ];

    function loadNavigation() {
        let navHTML = '<ul>';
        modules.forEach(module => {
            navHTML += `
                <li>
                    <a href="#${module.id}" class="nav-link" data-section="${module.id}">
                        <i class="fas ${module.icon}"></i>
                        ${module.name}
                    </a>
                </li>
            `;
        });
        navHTML += '</ul>';
        sidebarNav.innerHTML = navHTML;

        // Add event listeners to new links
        const navLinks = sidebarNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const sectionId = this.getAttribute('data-section');
                navigateTo(sectionId);

                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    function navigateTo(sectionId) {
        // Update active link
        const navLinks = sidebarNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Load section content
        loadSection(sectionId);

        // Update URL hash
        window.location.hash = sectionId;
    }

    async function loadSection(sectionId) {
        // Show loading state
        contentArea.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

        const module = modules.find(m => m.id === sectionId);
        if (!module) {
            contentArea.innerHTML = '<h2>Sección no encontrada</h2>';
            return;
        }

        try {
            // Fetch HTML content for the section
            const response = await fetch(`sections/${sectionId}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const htmlContent = await response.text();
            contentArea.innerHTML = htmlContent;

            // Load module-specific CSS if it exists
            if (module.css) {
                loadCSS(`styles/modules/${module.css}`);
            }

            // Load module-specific JavaScript if it exists
            if (module.file) {
                loadScript(`scripts/modules/${module.file}`);
            }

        } catch (error) {
            console.error('Error loading section:', error);
            contentArea.innerHTML = '<h2>Error al cargar la sección</h2><p>Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }

    function loadScript(src) {
        // Remove existing module script if any
        const existingScript = document.getElementById('module-script');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = src;
        script.id = 'module-script';
        script.defer = true;
        document.body.appendChild(script);
    }

    function loadCSS(href) {
        // Check if CSS is already loaded
        if (document.querySelector(`link[href="${href}"]`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // --- Zeus AI Modal Management ---
    zeusToggle.addEventListener('click', function() {
        zeusModal.classList.toggle('active');
    });

    zeusClose.addEventListener('click', function() {
        zeusModal.classList.remove('active');
    });

    // --- Notifications Panel Management ---
    notificationsToggle.addEventListener('click', function() {
        notificationsPanel.classList.toggle('active');
    });

    notificationsClose.addEventListener('click', function() {
        notificationsPanel.classList.remove('active');
    });

    // --- Initial Load ---
    loadNavigation();

    // Handle initial navigation based on URL hash
    const initialSection = window.location.hash.substring(1) || 'dashboard';
    const validInitialSection = modules.some(m => m.id === initialSection);
    navigateTo(validInitialSection ? initialSection : 'dashboard');

});
