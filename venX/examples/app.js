/**
 * venjs Example Gallery
 * These snippets demonstrate different UI patterns using the venjs Native Engine.
 */

// 1. SIMPLE COUNTER (State Management Example)
const CounterApp = () => {
    // In a real venjs app, you'd use a state store, 
    // but here is the structural representation.
    return venjs.createElement('div', { style: { padding: '40', alignItems: 'center' } }, [
        venjs.createElement('text', { 
            textContent: 'Counter Example',
            style: { fontSize: '24', marginBottom: '20' } 
        }),
        venjs.createElement('text', { 
            textContent: '0', 
            style: { fontSize: '60', fontWeight: 'bold', color: '#2563EB' } 
        }),
        venjs.createElement('button', { 
            textContent: 'Increment',
            style: { marginTop: '20', backgroundColor: '#2563EB', color: '#FFF', padding: '15' }
        })
    ]);
};

// 2. PROFILE CARD (Layout & Styling Example)
const ProfileCard = () => {
    return venjs.createElement('div', { 
        style: { margin: '20', padding: '20', borderRadius: '15', backgroundColor: '#FFF', shadow: 'true' } 
    }, [
        venjs.createElement('div', { style: { flexDirection: 'row', alignItems: 'center' } }, [
            venjs.createElement('div', { 
                style: { width: '60', height: '60', borderRadius: '30', backgroundColor: '#DDD' } 
            }),
            venjs.createElement('div', { style: { marginLeft: '15' } }, [
                venjs.createElement('text', { 
                    textContent: 'Myxo Victor', 
                    style: { fontSize: '20', fontWeight: 'bold' } 
                }),
                venjs.createElement('text', { 
                    textContent: 'Founder of Aximon', 
                    style: { fontSize: '14', color: '#666' } 
                })
            ])
        ]),
        venjs.createElement('text', { 
            textContent: 'Building the future of cross-platform native development with venjs.',
            style: { marginTop: '15', lineHeight: '20' } 
        })
    ]);
};

// 3. LOGIN SCREEN (Input & Form Example)
const LoginScreen = () => {
    return venjs.createElement('div', { style: { padding: '30', flex: 1, justifyContent: 'center' } }, [
        venjs.createElement('text', { 
            textContent: 'Welcome Back', 
            style: { fontSize: '30', fontWeight: 'bold', marginBottom: '40' } 
        }),
        venjs.createElement('div', { style: { marginBottom: '20' } }, [
            venjs.createElement('text', { textContent: 'Email Address', style: { marginBottom: '5' } }),
            venjs.createElement('div', { style: { borderBottom: '1', borderColor: '#CCC', height: '40' } })
        ]),
        venjs.createElement('div', { style: { marginBottom: '40' } }, [
            venjs.createElement('text', { textContent: 'Password', style: { marginBottom: '5' } }),
            venjs.createElement('div', { style: { borderBottom: '1', borderColor: '#CCC', height: '40' } })
        ]),
        venjs.createElement('button', { 
            textContent: 'Login',
            style: { backgroundColor: '#000', color: '#FFF', padding: '18', borderRadius: '10' }
        })
    ]);
};

// Exporting examples for the developer to switch between
const Examples = {
    Counter: CounterApp,
    Profile: ProfileCard,
    Login: LoginScreen
};
