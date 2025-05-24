// Interactividad y Validación para ArtistRM 360
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos principales
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const zeusButton = document.getElementById('zeus-floating-button');
    const zeusPopup = document.getElementById('zeus-chat-popup');
    const zeusCloseBtn = document.querySelector('#zeus-chat-popup .fa-times').parentElement;
    const zeusMinimizeBtn = document.querySelector('#zeus-chat-popup .fa-minus').parentElement;
    const zeusInput = document.querySelector('#zeus-chat-popup input');
    const zeusSendBtn = document.querySelector('#zeus-chat-popup .fa-paper-plane').parentElement;
    const zeusMicBtn = document.querySelector('#zeus-chat-popup .fa-microphone').parentElement;
    
    // Función para detectar tipo de dispositivo
    function detectDevice() {
        const width = window.innerWidth;
        if (width < 576) return 'mobile';
        if (width < 992) return 'tablet';
        return 'desktop';
    }
    
    // Inicialización basada en dispositivo
    function initByDevice() {
        const device = detectDevice();
        
        if (device === 'mobile' || device === 'tablet') {
            sidebar.classList.remove('active');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
            document.body.classList.add('mobile-view');
        } else {
            sidebar.classList.add('active');
            document.body.classList.remove('mobile-view');
        }
        
        // Ajustar altura de contenedores de chat según dispositivo
        const chatContainers = document.querySelectorAll('.chat-container');
        chatContainers.forEach(container => {
            if (device === 'mobile') {
                container.style.height = '400px';
            } else if (device === 'tablet') {
                container.style.height = '500px';
            } else {
                container.style.height = '600px';
            }
        });
    }
    
    // Inicializar al cargar
    initByDevice();
    
    // Reinicializar al cambiar tamaño de ventana
    window.addEventListener('resize', initByDevice);
    
    // Toggle del sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.toggle('active');
            }
        });
    }
    
    // Cerrar sidebar al hacer clic en backdrop
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarBackdrop.classList.remove('active');
        });
    }
    
    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el ID de la sección a mostrar
            const targetId = this.getAttribute('href').substring(1);
            
            // Actualizar clases activas en navegación
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // En móvil, cerrar sidebar después de seleccionar
            if (detectDevice() === 'mobile') {
                sidebar.classList.remove('active');
                if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
            }
            
            // Actualizar título de la página
            const pageTitle = document.querySelector('.header-title');
            if (pageTitle) {
                pageTitle.textContent = this.querySelector('.nav-text').textContent;
            }
        });
    });
    
    // Funcionalidad del botón flotante de Zeus
    if (zeusButton && zeusPopup) {
        zeusButton.addEventListener('click', function() {
            zeusPopup.style.display = 'flex';
            zeusInput.focus();
        });
    }
    
    // Cerrar popup de Zeus
    if (zeusCloseBtn) {
        zeusCloseBtn.addEventListener('click', function() {
            zeusPopup.style.display = 'none';
        });
    }
    
    // Minimizar popup de Zeus
    if (zeusMinimizeBtn) {
        zeusMinimizeBtn.addEventListener('click', function() {
            zeusPopup.style.display = 'none';
        });
    }
    
    // Enviar mensaje en chat de Zeus
    if (zeusSendBtn && zeusInput) {
        zeusSendBtn.addEventListener('click', sendZeusMessage);
        zeusInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendZeusMessage();
            }
        });
    }
    
    // Función para enviar mensaje a Zeus
    function sendZeusMessage() {
        const message = zeusInput.value.trim();
        if (message) {
            // Crear elemento de mensaje del usuario
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            messageContainer.style.alignSelf = 'flex-end';
            messageContainer.style.textAlign = 'right';
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-user';
            messageElement.style.maxWidth = '80%';
            messageElement.style.backgroundColor = 'var(--primary)';
            messageElement.style.color = 'white';
            messageElement.style.padding = '0.75rem';
            messageElement.style.borderRadius = '12px 12px 0 12px';
            messageElement.style.alignSelf = 'flex-end';
            
            const messageText = document.createElement('p');
            messageText.textContent = message;
            
            messageElement.appendChild(messageText);
            messageContainer.appendChild(messageElement);
            
            // Añadir mensaje a la conversación
            const chatMessages = zeusPopup.querySelector('.chat-messages');
            chatMessages.appendChild(messageContainer);
            
            // Limpiar input
            zeusInput.value = '';
            
            // Scroll al final de la conversación
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simular respuesta de Zeus después de un breve retraso
            setTimeout(simulateZeusResponse, 1000);
        }
    }
    
    // Función para simular respuesta de Zeus
    function simulateZeusResponse() {
        const responses = [
            "Estoy analizando tu solicitud...",
            "Puedo ayudarte con eso. ¿Necesitas información específica?",
            "He encontrado algunos datos relevantes para tu consulta.",
            "Basado en el análisis de tus datos, te recomendaría considerar las siguientes acciones...",
            "¿Hay algo más en lo que pueda ayudarte?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Crear elemento de respuesta de Zeus
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-assistant';
        messageElement.style.maxWidth = '80%';
        messageElement.style.backgroundColor = 'var(--card-bg)';
        messageElement.style.padding = '0.75rem';
        messageElement.style.borderRadius = '12px 12px 12px 0';
        messageElement.style.alignSelf = 'flex-start';
        
        const messageText = document.createElement('p');
        messageText.textContent = randomResponse;
        
        messageElement.appendChild(messageText);
        messageContainer.appendChild(messageElement);
        
        // Añadir respuesta a la conversación
        const chatMessages = zeusPopup.querySelector('.chat-messages');
        chatMessages.appendChild(messageContainer);
        
        // Scroll al final de la conversación
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Activar micrófono de Zeus
    if (zeusMicBtn) {
        zeusMicBtn.addEventListener('click', function() {
            // Simular activación de micrófono
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.style.color = 'var(--primary)';
                zeusInput.placeholder = 'Escuchando...';
                zeusInput.disabled = true;
                
                // Simular fin de grabación después de 3 segundos
                setTimeout(() => {
                    this.classList.remove('active');
                    this.style.color = '';
                    zeusInput.placeholder = 'Escribe un mensaje...';
                    zeusInput.disabled = false;
                    
                    // Simular mensaje recibido por voz
                    zeusInput.value = "Necesito un análisis de tendencias";
                    
                    // Simular envío después de un breve retraso
                    setTimeout(sendZeusMessage, 500);
                }, 3000);
            } else {
                this.style.color = '';
                zeusInput.placeholder = 'Escribe un mensaje...';
                zeusInput.disabled = false;
            }
        });
    }
    
    // Validación de formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular validación y envío
            const inputs = form.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    input.classList.add('invalid');
                    isValid = false;
                } else {
                    input.classList.remove('invalid');
                }
            });
            
            if (isValid) {
                // Simular éxito
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Guardado';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }
            }
        });
    });
    
    // Tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            
            // Crear tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '0.5rem 0.75rem';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '0.875rem';
            tooltip.style.zIndex = '1000';
            tooltip.style.pointerEvents = 'none';
            
            document.body.appendChild(tooltip);
            
            // Posicionar tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 5 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + window.scrollX}px`;
            
            // Guardar referencia al tooltip
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
        });
    });
    
    // Dropdowns
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Cerrar otros dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
                if (openMenu !== menu) {
                    openMenu.classList.remove('show');
                }
            });
            
            // Toggle actual dropdown
            menu.classList.toggle('show');
        });
    });
    
    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });
    
    // Tabs
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabGroup = this.closest('[data-tab-group]');
            const tabName = this.getAttribute('data-tab');
            
            // Actualizar botones
            tabGroup.querySelectorAll('[data-tab]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Actualizar contenido
            tabGroup.querySelectorAll('[data-tab-content]').forEach(content => {
                if (content.getAttribute('data-tab-content') === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Modales
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('show');
                document.body.classList.add('modal-open');
            }
        });
    });
    
    // Cerrar modales
    const modalCloseButtons = document.querySelectorAll('[data-dismiss="modal"]');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        });
    });
    
    // Cerrar modal al hacer clic en backdrop
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
            e.target.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });
    
    // Prevenir cierre al hacer clic en contenido del modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Validación de accesibilidad
    function validateAccessibility() {
        // Verificar contraste
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Aquí se podría implementar un algoritmo de verificación de contraste
            // Por simplicidad, solo registramos elementos potencialmente problemáticos
            if (color === bgColor) {
                console.warn('Posible problema de contraste:', element);
            }
        });
        
        // Verificar atributos alt en imágenes
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                console.warn('Imagen sin atributo alt:', img);
            }
        });
        
        // Verificar roles ARIA
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
                // No es un error crítico, pero es buena práctica
                console.info('Elemento interactivo sin etiqueta ARIA:', element);
            }
        });
    }
    
    // Ejecutar validación de accesibilidad
    setTimeout(validateAccessibility, 2000);
    
    // Detección de navegador para optimizaciones específicas
    function detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName;
        
        if (userAgent.match(/chrome|chromium|crios/i)) {
            browserName = "chrome";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browserName = "firefox";
        } else if (userAgent.match(/safari/i)) {
            browserName = "safari";
        } else if (userAgent.match(/opr\//i)) {
            browserName = "opera";
        } else if (userAgent.match(/edg/i)) {
            browserName = "edge";
        } else {
            browserName = "unknown";
        }
        
        document.body.setAttribute('data-browser', browserName);
        
        // Aplicar fixes específicos por navegador si es necesario
        if (browserName === 'safari') {
            // Fix para flexbox en Safari
            document.querySelectorAll('.flex').forEach(flex => {
                flex.style.display = '-webkit-flex';
            });
        }
    }
    
    // Detectar navegador
    detectBrowser();
    
    // Simular carga de datos para gráficos
    function initCharts() {
        const chartPlaceholders = document.querySelectorAll('[id$="-chart"]');
        
        chartPlaceholders.forEach(placeholder => {
            // Simular carga completada
            const loadingIndicator = placeholder.querySelector('div');
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i><p>Datos cargados correctamente</p>';
            }
        });
    }
    
    // Inicializar gráficos después de un retraso
    setTimeout(initCharts, 1500);
    
    // Verificar soporte de características avanzadas
    function checkFeatureSupport() {
        // Verificar soporte para CSS Grid
        if (!CSS.supports('display', 'grid')) {
            console.warn('Este navegador no soporta CSS Grid. Se usará fallback.');
            document.body.classList.add('no-grid-support');
        }
        
        // Verificar soporte para Flexbox
        if (!CSS.supports('display', 'flex')) {
            console.warn('Este navegador no soporta Flexbox. Se usará fallback.');
            document.body.classList.add('no-flex-support');
        }
        
        // Verificar soporte para variables CSS
        if (!CSS.supports('--test', '0')) {
            console.warn('Este navegador no soporta variables CSS. Se usará fallback.');
            document.body.classList.add('no-css-vars-support');
        }
    }
    
    // Verificar soporte de características
    checkFeatureSupport();
    
    // Inicializar tema según preferencia del sistema
    function initTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.add('light-theme');
        }
        
        // Escuchar cambios en la preferencia de tema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            }
        });
    }
    
    // Inicializar tema
    initTheme();
    
    // Registrar eventos de interacción para análisis
    function logInteraction(element, action) {
        // En producción, esto enviaría datos a un sistema de analytics
        console.log(`Interacción: ${action} en ${element}`);
    }
    
    // Registrar clics en elementos importantes
    document.querySelectorAll('button, .nav-link, .card-header').forEach(element => {
        element.addEventListener('click', function() {
            const elementType = this.tagName.toLowerCase();
            const elementText = this.textContent.trim();
            logInteraction(elementType, `clic en "${elementText}"`);
        });
    });
    
    // Verificar rendimiento
    function checkPerformance() {
        // Medir tiempo de carga
        const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
        console.log(`Tiempo de carga: ${loadTime}ms`);
        
        // Verificar número de elementos DOM
        const domElements = document.querySelectorAll('*').length;
        console.log(`Elementos DOM: ${domElements}`);
        
        // Advertir si hay demasiados elementos
        if (domElements > 1500) {
            console.warn('Alto número de elementos DOM. Considerar optimización.');
        }
    }
    
    // Verificar rendimiento después de carga completa
    window.addEventListener('load', checkPerformance);
    
    // Inicializar estado de la aplicación
    console.log('ArtistRM 360 UI inicializada correctamente');
});
