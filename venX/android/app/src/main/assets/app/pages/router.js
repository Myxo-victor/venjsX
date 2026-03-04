(function () {
  let router;

  router = venjs.createRouter({
    '/home': () => {
      if (typeof window.renderHomeScreen === 'function') {
        return window.renderHomeScreen({ navigate: router.navigate });
      }
      return venjs.text({}, 'Home screen is not available.');
    },
    '/login': () => {
      if (typeof window.renderLoginScreen === 'function') {
        return window.renderLoginScreen({ navigate: router.navigate });
      }
      return venjs.text({}, 'Login screen is not available.');
    },
    '/register': () => {
      if (typeof window.renderRegisterScreen === 'function') {
        return window.renderRegisterScreen({ navigate: router.navigate });
      }
      return venjs.text({}, 'Register screen is not available.');
    },
    '*': () => {
      if (typeof window.renderHomeScreen === 'function') {
        return window.renderHomeScreen({ navigate: router.navigate });
      }
      if (typeof window.renderLoginScreen === 'function') {
        return window.renderLoginScreen({ navigate: router.navigate });
      }
      return venjs.text({}, 'App routes are not available.');
    }
  }, { initialRoute: '/login' });

  const App = () => router.view();
  window.__venjsRouterMounted = true;
  venjs.mount(App);
})();
