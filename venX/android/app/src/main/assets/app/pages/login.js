(function () {
  /*
 * Space mobile app login screen
 * version v1.0 - for mobile app web -- v5.0
*/
  const showPassword = venjs.state(false);
  const email = venjs.state('');
  const password = venjs.state('');
  const isSubmitting = venjs.state(false);
  const signInButtonText = venjs.state('Sign in');
  let navigatingToRegister = false;
  const notify = (message) => {
    if (window.appMessage && typeof window.appMessage.show === 'function') {
      window.appMessage.show(message, 'Message');
      return;
    }
    alert(message);
  };

  const submitLogin = async ({ navigate } = {}) => {
    if (isSubmitting.get()) {
      return;
    }

    const currentEmail = email.get().trim();
    const currentPassword = password.get();
    if (!currentEmail || !currentPassword) {
      notify('Email and password are required.');
      return;
    }

    if (!window.loginLogic || typeof window.loginLogic.login !== 'function') {
      notify('Login service is not available.');
      return;
    }

    isSubmitting.set(true);
    signInButtonText.set('Processing...');

    try {
      const result = await window.loginLogic.login({
        email: currentEmail,
        password: currentPassword,
        rememberMe: false
      });

      if (result && result.success) {
        const savedId = typeof window.loginLogic.storeStudentId === 'function'
          ? window.loginLogic.storeStudentId(result)
          : '';
        if (!savedId) {
          notify('Login succeeded, but student_id could not be saved on this device.');
        }

        signInButtonText.set('Lauching App...');
        setTimeout(() => {
          if (typeof navigate === 'function') {
            navigate('/home');
          }
          isSubmitting.set(false);
          signInButtonText.set('Sign in');
        }, 250);
        return;
      }

      notify((result && result.message) || 'Login failed.');
    } catch (error) {
      notify((error && error.message) || 'Unable to connect to server.');
    }

    isSubmitting.set(false);
    signInButtonText.set('Sign in');
  };


  window.renderLoginScreen = ({ navigate } = {}) => venjs.div({
    className: 'auth-screen'
  }, [
    venjs.button({
      className: 'auth-premium-btn',
      onClick: () => venjs.openExternalURL('https://www.space.aximon.ng/premium.html')
    }, 'Go premium'),

    venjs.image({
      className: 'auth-logo',
      src: './images/logo.png'
    }),

    venjs.text({
      className: 'auth-title'
    }, 'Sign in'),

    venjs.input({
      className: 'auth-field',
      type: 'email',
      value: email.get(),
      id: 'email',
      placeholder: 'Email address',
      onChange: (payload) => {
        email.set((payload && payload.value) || '');
      }
    }),

    venjs.text({
      className: 'auth-forgot-link',
      onClick: () => notify('Forgot password flow coming soon')
    }, 'Forgot password?'),

    venjs.input({
      className: 'auth-field',
      type: showPassword.get() ? 'text' : 'password',
      value: password.get(),
      id: 'password',
      placeholder: 'Password',
      onChange: (payload) => {
        password.set((payload && payload.value) || '');
      }
    }),

    venjs.div({
      className: 'auth-toggle-row'
    }, [
      venjs.input({
        type: 'checkbox',
        checked: showPassword.get(),
        className: 'auth-checkbox',
        onClick: () => {
          showPassword.set((current) => !current);
        }
      }),

      venjs.text({
        className: 'auth-toggle-label'
      }, 'Show Password')
    ]),

    venjs.button({
      className: 'auth-primary-btn',
      disabled: isSubmitting.get(),
      onClick: () => submitLogin({ navigate })
    }, signInButtonText.get()),

    venjs.text({
      className: 'auth-divider'
    }, ' ___________________or____________________'),

    venjs.button({
      className: 'auth-secondary-btn',
      onClick: () => {
        if (typeof navigate === 'function') {
          if (navigatingToRegister) {
            return;
          }
          navigatingToRegister = true;
          // Defer route switch to the next tick so Android click handling can complete first.
          setTimeout(() => {
            navigate('/register');
            navigatingToRegister = false;
          }, 0);
          return;
        }
        notify('Create account flow coming soon');
      }
    }, 'Create a new account'),

    venjs.image({
      src: './images/from Aximon (Black).png',
      className: 'auth-brand-image'
    }),

    venjs.text({
      className: 'auth-footer'
    }, '(c) 2026 Aximon Platforms. All rights reserved')
  ]);
})();
