document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');

  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  // Show register form with smooth transition
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
      registerSection.style.animation = 'fadeInUp 0.5s ease-out';
    }, 300);
    loginError.textContent = '';
    registerError.textContent = '';
  });

  // Show login form with smooth transition
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
      loginSection.style.animation = 'fadeInUp 0.5s ease-out';
    }, 300);
    loginError.textContent = '';
    registerError.textContent = '';
  });

  // Login handler with loading state
  loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous error
    loginError.textContent = '';

    if (!username || !password) {
      loginError.textContent = 'Please fill in all fields.';
      return;
    }

    // Add loading state
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    loginBtn.disabled = true;

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username);

      if (!user) {
        loginError.textContent = 'Username not registered. Please register first.';
        loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
        loginBtn.disabled = false;
        return;
      }

      if (user.password !== password) {
        loginError.textContent = 'Incorrect password. Please try again.';
        loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
        loginBtn.disabled = false;
        return;
      }

      // Successful login
      localStorage.setItem('currentUser', username);
      loginBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
      
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 500);
    }, 800);
  });

  // Register handler with validation
  registerBtn.addEventListener('click', () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !password || !confirmPassword) {
      registerError.textContent = 'Please fill in all fields.';
      return;
    }

    if (username.length < 3) {
      registerError.textContent = 'Username must be at least 3 characters long.';
      return;
    }

    if (password.length < 6) {
      registerError.textContent = 'Password must be at least 6 characters long.';
      return;
    }

    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match.';
      return;
    }

    // Add loading state
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    registerBtn.disabled = true;

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userExists = users.some(u => u.username === username);

      if (userExists) {
        registerError.textContent = 'Username already exists. Please choose another.';
        registerBtn.innerHTML = '<i class="fas fa-user-check"></i> Create Account';
        registerBtn.disabled = false;
        return;
      }

      users.push({ username, password });
      localStorage.setItem('users', JSON.stringify(users));
      
      registerBtn.innerHTML = '<i class="fas fa-check"></i> Account Created!';
      
      setTimeout(() => {
        alert('Registration successful! You can now log in.');
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        loginSection.style.animation = 'fadeInUp 0.5s ease-out';
        registerError.textContent = '';

        // Clear registration fields
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        registerBtn.innerHTML = '<i class="fas fa-user-check"></i> Create Account';
        registerBtn.disabled = false;
      }, 1000);
    }, 800);
  });

  // Enter key support
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  document.getElementById('confirm-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerBtn.click();
  });
});

// Add fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(fadeOutStyle);