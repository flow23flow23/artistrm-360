// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD32w6JKRWbrlhgdQ1goCqC-EyHtMEVy-s",
    authDomain: "zamx-v1.firebaseapp.com",
    projectId: "zamx-v1",
    storageBucket: "zamx-v1.appspot.com",
    messagingSenderId: "609415718761",
    appId: "1:609415718761:web:a8b5c6d7e8f9g0h1i2j3k4"
};

// Initialize Firebase
let firebaseApp;
let db;
let auth;
let storage;
let currentUser = null;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    // Fallback to demo mode if Firebase initialization fails
    console.log("Running in demo mode");
}

// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    // Check for saved theme preference or use default dark theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(savedTheme + '-theme');
    body.classList.remove(savedTheme === 'dark' ? 'light-theme' : 'dark-theme');

    // Theme toggle event listener
    themeSwitch.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Navigation functionality
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active-section'));
            sections.forEach(section => section.classList.add('hidden-section'));
            
            // Add active class to clicked link
            e.target.closest('a').classList.add('active');
            
            // Show corresponding section
            const targetId = e.target.closest('a').getAttribute('href').substring(1);
            document.getElementById(targetId).classList.remove('hidden-section');
            document.getElementById(targetId).classList.add('active-section');
        });
    });

    // Zeus chat functionality
    const zeusInput = document.querySelector('.zeus-input input');
    const zeusSendButton = document.querySelector('.zeus-input .send-button');
    const zeusVoiceButton = document.querySelector('.zeus-input .voice-button');
    const zeusChat = document.querySelector('.zeus-chat');

    if (zeusInput && zeusSendButton) {
        zeusSendButton.addEventListener('click', () => {
            sendMessage();
        });

        zeusInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        if (zeusVoiceButton) {
            zeusVoiceButton.addEventListener('click', () => {
                alert('Funcionalidad de voz en desarrollo. Próximamente disponible.');
            });
        }
    }

    function sendMessage() {
        const message = zeusInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');
            zeusInput.value = '';

            // In a real app, this would call a Cloud Function or API
            // For now, we'll simulate a response
            showTypingIndicator();
            
            setTimeout(() => {
                removeTypingIndicator();
                
                // Check if we can use Firebase to process the message
                if (db && currentUser) {
                    // Store the message in Firestore
                    db.collection('messages').add({
                        text: message,
                        userId: currentUser.uid,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        type: 'user'
                    })
                    .then(() => {
                        console.log("Message saved to Firestore");
                        // In a real app, this would trigger a Cloud Function
                        processMessageWithZeus(message);
                    })
                    .catch(error => {
                        console.error("Error saving message:", error);
                        // Fallback to demo mode
                        processMessageWithZeus(message);
                    });
                } else {
                    // Demo mode
                    processMessageWithZeus(message);
                }
            }, 1000);
        }
    }

    function processMessageWithZeus(message) {
        // Analyze the message content to provide a more contextual response
        let response;
        
        if (message.toLowerCase().includes('análisis') || message.toLowerCase().includes('analisis') || 
            message.toLowerCase().includes('rendimiento') || message.toLowerCase().includes('performance')) {
            response = "He analizado los datos del último lanzamiento. Las reproducciones han aumentado un 23% respecto al mes anterior. TikTok muestra el mejor rendimiento con un crecimiento del 89%, seguido por Spotify con un 75%. Recomiendo aumentar la presencia en Apple Music donde el crecimiento es más lento (48%).";
        } else if (message.toLowerCase().includes('proyecto') || message.toLowerCase().includes('gira') || 
                  message.toLowerCase().includes('tour') || message.toLowerCase().includes('concierto')) {
            response = "He revisado el calendario de la Gira Mundial 2026. Actualmente hay 15 fechas confirmadas en 8 países. La venta de entradas comienza en 3 meses. ¿Deseas ver el desglose por ciudad o las proyecciones de ingresos?";
        } else if (message.toLowerCase().includes('contenido') || message.toLowerCase().includes('album') || 
                  message.toLowerCase().includes('canción') || message.toLowerCase().includes('cancion') || 
                  message.toLowerCase().includes('música') || message.toLowerCase().includes('musica')) {
            response = "El álbum 'Verano 2025' está teniendo un excelente rendimiento. La canción más popular es 'Atardecer' con 1.2M de reproducciones. He detectado un aumento en las menciones positivas en redes sociales, especialmente entre el público de 18-24 años.";
        } else if (message.toLowerCase().includes('redes') || message.toLowerCase().includes('social') || 
                  message.toLowerCase().includes('instagram') || message.toLowerCase().includes('tiktok')) {
            response = "El análisis de redes sociales muestra un crecimiento del 34% en seguidores este mes. TikTok es la plataforma con mayor engagement (12.3%), seguida por Instagram (8.7%). El contenido con mejor rendimiento son los videos cortos de estudio y los teasers de nuevas canciones.";
        } else {
            // Generic response for other queries
            const responses = [
                "Estoy analizando esa información. Dame un momento para procesar los datos más recientes.",
                "He encontrado varios puntos interesantes sobre ese tema. Según los datos, hay una tendencia positiva en los últimos 30 días.",
                "Basado en el análisis de tendencias, te recomendaría enfocarte en contenido visual para las próximas semanas.",
                "Los datos muestran una oportunidad de crecimiento en la plataforma de TikTok para este tipo de contenido.",
                "¿Te gustaría un análisis más detallado sobre algún aspecto específico de esta consulta?"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Add Zeus response to chat
        addMessage(response, 'zeus');
        
        // In a real app, save the response to Firestore as well
        if (db && currentUser) {
            db.collection('messages').add({
                text: response,
                userId: 'zeus-ai',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'zeus'
            }).catch(error => {
                console.error("Error saving Zeus response:", error);
            });
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message zeus-message typing-indicator';
        typingDiv.id = 'zeus-typing';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot';
        avatarDiv.appendChild(icon);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        contentDiv.appendChild(paragraph);
        
        typingDiv.appendChild(avatarDiv);
        typingDiv.appendChild(contentDiv);
        
        zeusChat.appendChild(typingDiv);
        zeusChat.scrollTop = zeusChat.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('zeus-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        avatarDiv.appendChild(icon);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        contentDiv.appendChild(paragraph);
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = 'Ahora';
        contentDiv.appendChild(timeSpan);
        
        if (sender === 'user') {
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatarDiv);
        } else {
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
        }
        
        zeusChat.appendChild(messageDiv);
        zeusChat.scrollTop = zeusChat.scrollHeight;
    }

    // Initialize data loading
    initializeDataLoading();
});

// Handle platform integration buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('integration-action')) {
        const action = e.target.textContent;
        const platform = e.target.closest('.integration-card').querySelector('h4').textContent;
        
        if (action === 'Conectar') {
            // In a real app, this would open an OAuth flow
            alert(`Iniciando proceso de conexión con ${platform}. Esta funcionalidad estará disponible próximamente.`);
            
            // Simulate successful connection for demo purposes
            setTimeout(() => {
                e.target.textContent = 'Configurar';
                e.target.classList.remove('primary');
                const statusElement = e.target.closest('.integration-card').querySelector('.integration-status');
                if (statusElement) {
                    statusElement.textContent = 'Conectado';
                    e.target.closest('.integration-card').classList.add('connected');
                }
            }, 2000);
            
        } else if (action === 'Configurar') {
            alert(`Abriendo configuración de ${platform}. Esta funcionalidad estará disponible próximamente.`);
        }
    }
});

// Firebase authentication
function initializeAuth() {
    if (auth) {
        // Set up auth state change listener
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("Usuario autenticado:", user.email);
                currentUser = user;
                
                // Update UI for logged in user
                updateUserProfile(user);
                
                // Load user-specific data
                loadUserData(user.uid);
                
                // Hide login form if it exists
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.style.display = 'none';
                }
                
                // Show logout button
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.style.display = 'block';
                }
            } else {
                console.log("Usuario no autenticado");
                currentUser = null;
                
                // Update UI for logged out user
                updateUserProfile(null);
                
                // Show login form if it exists
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.style.display = 'block';
                }
                
                // Hide logout button
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.style.display = 'none';
                }
                
                // For demo purposes, auto-login with a demo account
                // In a production app, you would redirect to a login page
                simulateLogin();
            }
        });
        
        // Set up login form listener
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (email && password) {
                    auth.signInWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            console.log("Login successful");
                        })
                        .catch(error => {
                            console.error("Login error:", error);
                            alert(`Error de inicio de sesión: ${error.message}`);
                        });
                }
            });
        }
        
        // Set up logout button listener
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                auth.signOut()
                    .then(() => {
                        console.log("Logout successful");
                    })
                    .catch(error => {
                        console.error("Logout error:", error);
                    });
            });
        }
    }
}

function simulateLogin() {
    // For demo purposes only - create a simulated user
    currentUser = {
        uid: 'demo-user-123',
        email: 'demo@artistrm.com',
        displayName: 'Usuario Demo',
        photoURL: 'user-avatar.png'
    };
    
    // Update UI with demo user
    updateUserProfile(currentUser);
    
    // Load demo data
    loadDemoData();
}

function updateUserProfile(user) {
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    const userAvatar = document.querySelector('.avatar');
    
    if (user) {
        // Update user name
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email || 'Usuario';
        }
        
        // Update user role (in a real app, this would come from Firestore)
        if (userRoleElement) {
            userRoleElement.textContent = 'Administrador';
        }
        
        // Update user avatar
        if (userAvatar && user.photoURL) {
            userAvatar.src = user.photoURL;
        } else if (userAvatar) {
            userAvatar.src = 'images/user-avatar.png';
        }
    } else {
        // Reset to default values
        if (userNameElement) {
            userNameElement.textContent = 'Usuario';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = 'Invitado';
        }
        
        if (userAvatar) {
            userAvatar.src = 'images/user-avatar.png';
        }
    }
}

// Data loading functions
function initializeDataLoading() {
    if (db && auth && auth.currentUser) {
        // User is authenticated, load real data
        loadUserData(auth.currentUser.uid);
    } else {
        // No authentication, load demo data
        loadDemoData();
    }
    
    // Initialize auth
    initializeAuth();
}

function loadUserData(userId) {
    if (!db) return;
    
    console.log("Loading user data for:", userId);
    
    // Load projects
    db.collection('projects')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                updateProjectsUI(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } else {
                console.log("No projects found, loading demo data");
                loadDemoProjects();
            }
        })
        .catch(error => {
            console.error("Error loading projects:", error);
            loadDemoProjects();
        });
    
    // Load content
    db.collection('content')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                updateContentUI(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } else {
                console.log("No content found, loading demo data");
                loadDemoContent();
            }
        })
        .catch(error => {
            console.error("Error loading content:", error);
            loadDemoContent();
        });
    
    // Load analytics
    db.collection('analytics')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                updateAnalyticsUI(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))[0]);
            } else {
                console.log("No analytics found, loading demo data");
                loadDemoAnalytics();
            }
        })
        .catch(error => {
            console.error("Error loading analytics:", error);
            loadDemoAnalytics();
        });
}

function loadDemoData() {
    console.log("Loading demo data");
    loadDemoProjects();
    loadDemoContent();
    loadDemoAnalytics();
}

function loadDemoProjects() {
    const demoProjects = [
        {
            id: 'project-1',
            name: 'Álbum Verano 2025',
            type: 'Album',
            status: 'En progreso',
            progress: 75,
            dueDate: '2025-08-15',
            collaborators: 8
        },
        {
            id: 'project-2',
            name: 'Gira Mundial 2026',
            type: 'Tour',
            status: 'Planificación',
            progress: 30,
            dueDate: '2026-03-01',
            collaborators: 15
        },
        {
            id: 'project-3',
            name: 'Colaboración Internacional',
            type: 'Single',
            status: 'Completado',
            progress: 100,
            dueDate: '2025-04-10',
            collaborators: 5
        }
    ];
    
    updateProjectsUI(demoProjects);
}

function loadDemoContent() {
    const demoContent = [
        {
            id: 'content-1',
            title: 'Atardecer',
            type: 'Audio',
            format: 'MP3',
            duration: '3:45',
            uploadDate: '2025-05-15',
            plays: 1200000
        },
        {
            id: 'content-2',
            title: 'Detrás de Cámaras - Sesión de Estudio',
            type: 'Video',
            format: 'MP4',
            duration: '12:30',
            uploadDate: '2025-05-10',
            views: 450000
        },
        {
            id: 'content-3',
            title: 'Entrevista Exclusiva',
            type: 'Audio',
            format: 'MP3',
            duration: '25:18',
            uploadDate: '2025-05-05',
            plays: 320000
        }
    ];
    
    updateContentUI(demoContent);
}

function loadDemoAnalytics() {
    const demoAnalytics = {
        totalPlays: 2500000,
        totalViews: 1800000,
        totalFollowers: 850000,
        growthRate: 23,
        topPlatforms: [
            { name: 'TikTok', percentage: 89 },
            { name: 'Spotify', percentage: 75 },
            { name: 'YouTube', percentage: 62 },
            { name: 'Apple Music', percentage: 48 }
        ],
        recentActivity: [
            { 
                type: 'upload', 
                description: 'Nuevo contenido subido: "Álbum Verano 2025"', 
                time: 'Hace 2 horas' 
            },
            { 
                type: 'chart', 
                description: 'Pico de reproducciones en Spotify: +15K', 
                time: 'Hace 5 horas' 
            },
            { 
                type: 'comment', 
                description: 'Zeus IA: Análisis de sentimiento completado', 
                time: 'Hace 1 día' 
            },
            { 
                type: 'calendar', 
                description: 'Nuevo proyecto creado: "Gira Mundial 2026"', 
                time: 'Hace 2 días' 
            }
        ]
    };
    
    updateAnalyticsUI(demoAnalytics);
}

// UI update functions
function updateProjectsUI(projects) {
    console.log("Updating projects UI with:", projects);
    
    // Update projects count in dashboard
    const projectsCountElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (projectsCountElement) {
        projectsCountElement.textContent = projects.length;
    }
    
    // In a real app, you would update the projects section with the data
    // For now, we'll just log it
}

function updateContentUI(content) {
    console.log("Updating content UI with:", content);
    
    // Update content count in dashboard
    const contentCountElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (contentCountElement) {
        contentCountElement.textContent = content.length;
    }
    
    // In a real app, you would update the content section with the data
    // For now, we'll just log it
}

function updateAnalyticsUI(analytics) {
    console.log("Updating analytics UI with:", analytics);
    
    // Update platform stats
    if (analytics.topPlatforms) {
        const platformStats = document.querySelector('.platform-stats');
        if (platformStats) {
            analytics.topPlatforms.forEach((platform, index) => {
                const platformElement = platformStats.children[index];
                if (platformElement) {
                    const progressBar = platformElement.querySelector('.platform-progress');
                    if (progressBar) {
                        progressBar.style.width = `${platform.percentage}%`;
                        progressBar.textContent = `${platform.percentage}%`;
                    }
                }
            });
        }
    }
    
    // Update recent activity
    if (analytics.recentActivity) {
        const activityFeed = document.querySelector('.activity-feed');
        if (activityFeed) {
            analytics.recentActivity.forEach((activity, index) => {
                const activityElement = activityFeed.children[index];
                if (activityElement) {
                    const description = activityElement.querySelector('p');
                    const time = activityElement.querySelector('.activity-time');
                    
                    if (description) {
                        description.textContent = activity.description;
                    }
                    
                    if (time) {
                        time.textContent = activity.time;
                    }
                }
            });
        }
    }
    
    // Update performance stat
    const performanceElement = document.querySelector('.stat-card:nth-child(4) .stat-number');
    if (performanceElement && analytics.growthRate) {
        performanceElement.textContent = `+${analytics.growthRate}%`;
    }
}

// File upload functionality
function initializeFileUpload() {
    const fileUploadForm = document.getElementById('file-upload-form');
    if (fileUploadForm && storage) {
        fileUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('file-input');
            const file = fileInput.files[0];
            
            if (file) {
                // Create a storage reference
                const storageRef = storage.ref();
                const fileRef = storageRef.child(`content/${currentUser.uid}/${file.name}`);
                
                // Upload the file
                const uploadTask = fileRef.put(file);
                
                // Monitor upload progress
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Progress
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress}%`);
                        
                        // Update progress bar if it exists
                        const progressBar = document.getElementById('upload-progress');
                        if (progressBar) {
                            progressBar.value = progress;
                        }
                    }, 
                    (error) => {
                        // Error
                        console.error("Upload error:", error);
                        alert(`Error al subir el archivo: ${error.message}`);
                    }, 
                    () => {
                        // Complete
                        console.log("Upload complete");
                        
                        // Get download URL
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log("File available at", downloadURL);
                            
                            // In a real app, you would save the file metadata to Firestore
                            if (db) {
                                db.collection('content').add({
                                    userId: currentUser.uid,
                                    title: file.name,
                                    type: getFileType(file),
                                    format: getFileFormat(file),
                                    size: file.size,
                                    uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                                    url: downloadURL
                                })
                                .then(() => {
                                    console.log("File metadata saved to Firestore");
                                    alert("Archivo subido correctamente");
                                    
                                    // Reset form
                                    fileUploadForm.reset();
                                    
                                    // Reload content
                                    loadUserData(currentUser.uid);
                                })
                                .catch(error => {
                                    console.error("Error saving file metadata:", error);
                                });
                            }
                        });
                    }
                );
            }
        });
    }
}

function getFileType(file) {
    if (file.type.startsWith('audio/')) {
        return 'Audio';
    } else if (file.type.startsWith('video/')) {
        return 'Video';
    } else if (file.type.startsWith('image/')) {
        return 'Imagen';
    } else {
        return 'Documento';
    }
}

function getFileFormat(file) {
    return file.name.split('.').pop().toUpperCase();
}

// Initialize everything
try {
    initializeAuth();
    initializeFileUpload();
} catch (error) {
    console.error("Initialization error:", error);
    console.log("Running in demo mode");
    loadDemoData();
}
