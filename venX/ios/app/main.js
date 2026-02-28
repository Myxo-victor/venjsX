const username = venjs.state('');
const taps = venjs.state(0);

const App = () => venjs.div({
  style: {
    padding: '20',
    backgroundColor: '#FFFFFF'
  }
}, [
  venjs.text({
    textContent: 'venjsX Phase 5 Demo',
    style: {
      fontSize: '24',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8'
    }
  }),
  venjs.text({
    textContent: `Hello ${username.get() || 'Developer'}`,
    style: {
      fontSize: '16',
      color: '#374151',
      marginBottom: '12'
    }
  }),
  venjs.input({
    placeholder: 'Type your name',
    value: username.get(),
    style: {
      fontSize: '16',
      color: '#1F2937',
      marginBottom: '12'
    },
    onChange: (payload) => {
      username.set(payload.value || '');
    }
  }),
  venjs.image({
    src: 'https://picsum.photos/600/320',
    style: {
      width: '100%',
      height: '160',
      borderRadius: '10',
      marginBottom: '12'
    }
  }),
  venjs.activityIndicator({
    style: {
      marginBottom: '12'
    }
  }),
  venjs.button({
    textContent: `Tap Count: ${taps.get()}`,
    style: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      borderRadius: '12',
      padding: '14'
    },
    onClick: () => {
      taps.set((current) => current + 1);
    }
  })
]);

venjs.mount(App);
