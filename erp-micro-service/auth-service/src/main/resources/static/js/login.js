/**
 * LBU ERP Login Page - Enhanced JavaScript
 * Provides improved UX features, validation, and interactions
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeLoginPage();
    });

    /**
     * Initialize all login page features
     */
    function initializeLoginPage() {
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');
        const submitBtn = document.getElementById('submitBtn');
        const usernameInput = document.getElementById('username');
        const companyCodeInput = document.getElementById('companyCode');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const forgotPasswordLink = document.getElementById('forgotPassword');
        
        // Initialize password visibility toggle
        if (passwordToggle && passwordInput) {
            initPasswordToggle(passwordToggle, passwordInput);
        }
        
        // Initialize form validation and submission
        if (loginForm) {
            initFormValidation(loginForm, usernameInput, companyCodeInput, passwordInput, submitBtn);
        }
        
        // Initialize real-time validation
        if (usernameInput) {
            initInputValidation(usernameInput);
        }
        
        if (companyCodeInput) {
            initInputValidation(companyCodeInput);
        }
        
        if (passwordInput) {
            initInputValidation(passwordInput);
        }
        
        // Initialize remember me functionality
        if (rememberMeCheckbox) {
            initRememberMe(rememberMeCheckbox);
        }
        
        // Initialize error message auto-dismiss
        initErrorDismissal(usernameInput, passwordInput);
        
        // Initialize forgot password link
        if (forgotPasswordLink) {
            initForgotPassword(forgotPasswordLink);
        }
        
        // Auto-focus company code field if empty (first field in form)
        if (companyCodeInput && !companyCodeInput.value.trim()) {
            setTimeout(() => {
                companyCodeInput.focus();
            }, 100);
        } else if (usernameInput && !usernameInput.value.trim()) {
            setTimeout(() => {
                usernameInput.focus();
            }, 100);
        }
        
        // Handle Enter key for better UX
        initEnterKeyHandling(loginForm, usernameInput, companyCodeInput, passwordInput);
    }

    /**
     * Initialize password visibility toggle
     */
    function initPasswordToggle(toggle, input) {
        toggle.addEventListener('click', function() {
            togglePasswordVisibility(input, toggle);
        });
        
        // Also handle keyboard events for accessibility
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePasswordVisibility(input, toggle);
            }
        });
    }

    /**
     * Toggle password visibility
     */
    function togglePasswordVisibility(input, toggle) {
        const isPassword = input.getAttribute('type') === 'password';
        const eyeOpen = toggle.querySelector('.eye-open');
        const eyeClosed = toggle.querySelector('.eye-closed');
        
        if (isPassword) {
            input.setAttribute('type', 'text');
            input.setAttribute('aria-label', 'Password (visible)');
            if (eyeOpen) eyeOpen.style.display = 'none';
            if (eyeClosed) eyeClosed.style.display = 'block';
            toggle.setAttribute('aria-label', 'Hide password');
        } else {
            input.setAttribute('type', 'password');
            input.setAttribute('aria-label', 'Password (hidden)');
            if (eyeOpen) eyeOpen.style.display = 'block';
            if (eyeClosed) eyeClosed.style.display = 'none';
            toggle.setAttribute('aria-label', 'Show password');
        }
    }

    /**
     * Initialize form validation and submission
     */
    function initFormValidation(form, usernameInput, companyCodeInput, passwordInput, submitBtn) {
        form.addEventListener('submit', function(e) {
            // Clear previous errors
            clearAllFieldErrors();
            
            // Validate fields
            let isValid = true;
            
            const username = usernameInput.value.trim();
            const companyCode = companyCodeInput ? companyCodeInput.value.trim() : '';
            const password = passwordInput.value.trim();
            
            if (!username) {
                showFieldError(usernameInput, 'Username is required');
                isValid = false;
            } else if (username.length < 3) {
                showFieldError(usernameInput, 'Username must be at least 3 characters');
                isValid = false;
            }
            
            if (companyCodeInput) {
                if (!companyCode) {
                    showFieldError(companyCodeInput, 'Company Code is required');
                    isValid = false;
                } else if (companyCode.length < 2) {
                    showFieldError(companyCodeInput, 'Company Code must be at least 2 characters');
                    isValid = false;
                }
            }
            
            if (!password) {
                showFieldError(passwordInput, 'Password is required');
                isValid = false;
            } else if (password.length < 4) {
                showFieldError(passwordInput, 'Password must be at least 4 characters');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
                // Focus first error field
                const firstError = form.querySelector('.form-input.error');
                if (firstError) {
                    firstError.focus();
                }
                return false;
            }
            
            // Concatenate company code with username in format: {companyCode}::{username}
            if (companyCodeInput && companyCode) {
                const originalUsername = username;
                const combinedUsername = `${companyCode}::${originalUsername}`;
                usernameInput.value = combinedUsername;
            }
            
            // Show loading state
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
            
            // Prevent double submission
            form.submitted = true;
            
            // Form will submit normally if validation passes
        });
    }

    /**
     * Initialize real-time input validation
     */
    function initInputValidation(input) {
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        // Clear errors on input
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError(this);
                this.setAttribute('aria-invalid', 'false');
            }
        });
        
        // Validate on paste
        input.addEventListener('paste', function() {
            setTimeout(() => {
                validateField(this);
            }, 10);
        });
    }

    /**
     * Validate a single field
     */
    function validateField(input) {
        const value = input.value.trim();
        const fieldName = input.id;
        
        if (!value) {
            let fieldLabel = 'Field';
            if (fieldName === 'username') fieldLabel = 'Username';
            else if (fieldName === 'companyCode') fieldLabel = 'Company Code';
            else if (fieldName === 'password') fieldLabel = 'Password';
            showFieldError(input, `${fieldLabel} is required`);
            return false;
        }
        
        if (fieldName === 'username' && value.length < 3) {
            showFieldError(input, 'Username must be at least 3 characters');
            return false;
        }
        
        if (fieldName === 'companyCode' && value.length < 2) {
            showFieldError(input, 'Company Code must be at least 2 characters');
            return false;
        }
        
        if (fieldName === 'password' && value.length < 4) {
            showFieldError(input, 'Password must be at least 4 characters');
            return false;
        }
        
        clearFieldError(input);
        input.setAttribute('aria-invalid', 'false');
        return true;
    }

    /**
     * Show error state on a form field
     */
    function showFieldError(input, message) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
        
        // Find or create error message element
        const errorId = input.id + '-error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            errorElement.id = errorId;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            input.parentElement.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    /**
     * Clear error state from a form field
     */
    function clearFieldError(input) {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
        
        const errorId = input.id + '-error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    /**
     * Clear all field errors
     */
    function clearAllFieldErrors() {
        const errorInputs = document.querySelectorAll('.form-input.error');
        errorInputs.forEach(input => {
            clearFieldError(input);
        });
    }

    /**
     * Initialize remember me functionality
     */
    function initRememberMe(checkbox) {
        // Load saved preference
        const savedUsername = localStorage.getItem('rememberedUsername');
        const savedRemember = localStorage.getItem('rememberMe') === 'true';
        
        if (savedRemember && savedUsername) {
            checkbox.checked = true;
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.value = savedUsername;
            }
        }
        
        // Save preference on change
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const usernameInput = document.getElementById('username');
                if (usernameInput && usernameInput.value.trim()) {
                    localStorage.setItem('rememberedUsername', usernameInput.value.trim());
                    localStorage.setItem('rememberMe', 'true');
                }
            } else {
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberMe');
            }
        });
    }

    /**
     * Initialize error message auto-dismissal
     */
    function initErrorDismissal(usernameInput, companyCodeInput, passwordInput) {
        const serverError = document.getElementById('serverError');
        
        if (serverError) {
            // Dismiss error when user starts typing
            const dismissOnInput = function() {
                if (serverError.style.display !== 'none') {
                    serverError.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    serverError.style.opacity = '0';
                    serverError.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        serverError.style.display = 'none';
                    }, 300);
                }
            };
            
            if (usernameInput) {
                usernameInput.addEventListener('input', dismissOnInput);
            }
            
            if (companyCodeInput) {
                companyCodeInput.addEventListener('input', dismissOnInput);
            }
            
            if (passwordInput) {
                passwordInput.addEventListener('input', dismissOnInput);
            }
        }
    }

    /**
     * Initialize forgot password link
     */
    function initForgotPassword(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: Implement forgot password functionality
            alert('Forgot password functionality will be implemented soon.');
            // You can redirect to a forgot password page or show a modal
            // window.location.href = '/forgot-password';
        });
    }

    /**
     * Initialize Enter key handling for better UX
     */
    function initEnterKeyHandling(form, usernameInput, companyCodeInput, passwordInput) {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                
                // If focus is on company code, move to username
                if (activeElement === companyCodeInput && usernameInput) {
                    e.preventDefault();
                    usernameInput.focus();
                }
                // If focus is on username, move to password
                else if (activeElement === usernameInput && passwordInput) {
                    e.preventDefault();
                    passwordInput.focus();
                }
                // If focus is on password, submit form
                else if (activeElement === passwordInput && form) {
                    // Let the form handle submission naturally
                }
            }
        });
    }

    /**
     * Utility: Debounce function for performance optimization
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility: Format validation message
     */
    function formatValidationMessage(fieldName, rule) {
        const messages = {
            required: `${fieldName} is required`,
            minLength: `${fieldName} is too short`,
            maxLength: `${fieldName} is too long`,
            invalid: `Invalid ${fieldName} format`
        };
        return messages[rule] || `${fieldName} is invalid`;
    }

    // Expose utility functions globally if needed (optional)
    window.LoginPage = {
        showFieldError: showFieldError,
        clearFieldError: clearFieldError,
        clearAllFieldErrors: clearAllFieldErrors
    };

})();
