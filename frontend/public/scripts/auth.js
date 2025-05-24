// Authentication Module
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const userAvatarTop = document.getElementById('user-avatar-top');
    
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            handleSignedInUser(user);
        } else {
            // User is signed out
            handleSignedOutUser();
        }
    });
    
    // Handle signed in user
    function handleSignedInUser(user) {
        // Get user data from Firestore
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    updateUserUI(user, userData);
                } else {
                    // Create user document if it doesn't exist
                    const newUser = {
                        displayName: user.displayName || 'Usuario',
                        email: user.email,
                        photoURL: user.photoURL,
                        role: 'user',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    db.collection('users').doc(user.uid).set(newUser)
                        .then(() => {
                            updateUserUI(user, newUser);
                        })
                        .catch((error) => {
                            console.error("Error creating user document: ", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Error getting user document: ", error);
                // Fallback to basic user info
                updateUserUI(user, {
                    displayName: user.displayName || 'Usuario',
                    role: 'user'
                });
            });
    }
    
    // Handle signed out user
    function handleSignedOutUser() {
        // Update UI for signed out state
        userInfo.innerHTML = `
            <div class="user-avatar">?</div>
            <div class="user-details">
                <div class="user-name">Invitado</div>
                <button class="login-btn" id="login-btn">
                    <i class="fas fa-sign-in-alt"></i> Iniciar sesión
                </button>
            </div>
        `;
        
        userAvatarTop.textContent = '?';
        
        // Add event listener to login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                showLoginModal();
            });
        }
        
        // Load demo data
        loadDemoData();
    }
    
    // Update user UI
    function updateUserUI(user, userData) {
        const displayName = userData.displayName || 'Usuario';
        const initials = getInitials(displayName);
        const role = userData.role || 'user';
        
        userInfo.innerHTML = `
            <div class="user-avatar">${initials}</div>
            <div class="user-details">
                <div class="user-name">${displayName}</div>
                <div class="user-role">${formatRole(role)}</div>
            </div>
        `;
        
        userAvatarTop.textContent = initials;
        
        // Load user data
        loadUserData(user.uid);
    }
    
    // Get initials from name
    function getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    // Format role for display
    function formatRole(role) {
        const roles = {
            'admin': 'Administrador',
            'manager': 'Manager',
            'artist': 'Artista',
            'user': 'Usuario'
        };
        
        return roles[role] || 'Usuario';
    }
    
    // Load user data
    function loadUserData(userId) {
        // Load projects
        db.collection('projects')
            .where('userId', '==', userId)
            .get()
            .then((querySnapshot) => {
                const projectsCount = querySnapshot.size;
                document.getElementById('projects-count').textContent = projectsCount;
            })
            .catch((error) => {
                console.error("Error getting projects: ", error);
            });
        
        // Load content
        db.collection('content')
            .where('userId', '==', userId)
            .get()
            .then((querySnapshot) => {
                const contentCount = querySnapshot.size;
                document.getElementById('content-count').textContent = contentCount;
            })
            .catch((error) => {
                console.error("Error getting content: ", error);
            });
        
        // Load analytics
        db.collection('analytics')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(1)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const analytics = querySnapshot.docs[0].data();
                    document.getElementById('views-count').textContent = analytics.views || 0;
                    document.getElementById('engagement-rate').textContent = (analytics.engagement || 0) + '%';
                }
            })
            .catch((error) => {
                console.error("Error getting analytics: ", error);
            });
    }
    
    // Load demo data
    function loadDemoData() {
        // Set demo data for dashboard
        document.getElementById('projects-count').textContent = '5';
        document.getElementById('content-count').textContent = '23';
        document.getElementById('views-count').textContent = '12,458';
        document.getElementById('engagement-rate').textContent = '8.7%';
        
        // Load demo projects
        loadDemoProjects();
        
        // Load demo content
        loadDemoContent();
        
        // Load demo analytics
        loadDemoAnalytics();
    }
    
    // Show login modal
    function showLoginModal() {
        // Create modal if it doesn't exist
        if (!document.getElementById('login-modal')) {
            const modalHTML = `
                <div class="modal-backdrop" id="login-modal-backdrop"></div>
                <div class="modal" id="login-modal">
                    <div class="modal-header">
                        <h3>Iniciar sesión</h3>
                        <button id="login-modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label" for="login-email">Correo electrónico</label>
                            <input type="email" id="login-email" class="form-control" placeholder="correo@ejemplo.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="login-password">Contraseña</label>
                            <input type="password" id="login-password" class="form-control" placeholder="********">
                        </div>
                        <div class="alert alert-info">
                            <p>Para el modo demo, puedes usar cualquier correo y contraseña.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="login-modal-cancel">Cancelar</button>
                        <button class="btn btn-primary" id="login-modal-submit">Iniciar sesión</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add event listeners
            document.getElementById('login-modal-close').addEventListener('click', hideLoginModal);
            document.getElementById('login-modal-cancel').addEventListener('click', hideLoginModal);
            document.getElementById('login-modal-backdrop').addEventListener('click', hideLoginModal);
            document.getElementById('login-modal-submit').addEventListener('click', handleLogin);
        }
        
        // Show modal
        document.getElementById('login-modal-backdrop').classList.add('active');
        document.getElementById('login-modal').classList.add('active');
    }
    
    // Hide login modal
    function hideLoginModal() {
        document.getElementById('login-modal-backdrop').classList.remove('active');
        document.getElementById('login-modal').classList.remove('active');
    }
    
    // Handle login
    function handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (email && password) {
            // For demo purposes, create a user with any email/password
            const user = {
                uid: 'demo-user-' + Date.now(),
                email: email,
                displayName: email.split('@')[0]
            };
            
            // Simulate authentication
            handleSignedInUser(user);
            hideLoginModal();
        }
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut().then(() => {
                // Sign-out successful.
                console.log('User signed out');
            }).catch((error) => {
                // An error happened.
                console.error('Error signing out:', error);
            });
        });
    }
});
