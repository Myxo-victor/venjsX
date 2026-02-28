/**
 * venjs UI Toolkit
 * Advanced Component Patterns for the venjs Framework
 * Path: examples/toolkit.js
 */

// 1. SCROLLABLE VIEW (Native ScrollView)
// Wraps children in a container that allows vertical scrolling
const ScrollView = (children) => {
    return venjs.createElement('div', { 
        style: { 
            overflowY: 'scroll', 
            flex: 1,
            padding: '10' 
        } 
    }, children);
};

// 2. IMAGE COMPONENT (Native Image Loader)
// Supports remote URLs; handled by Glide (Android) or Kingfisher (iOS)
const NativeImage = (src, width = 100, height = 100) => {
    return venjs.createElement('image', {
        src: src,
        style: {
            width: width.toString(),
            height: height.toString(),
            borderRadius: '10',
            resizeMode: 'cover' 
        }
    });
};

// 3. TEXT INPUT (Native TextField)
// Captures user input and triggers a callback
const InputField = (placeholder, onChange) => {
    return venjs.createElement('input', {
        placeholder: placeholder,
        style: {
            borderBottom: '1',
            borderColor: '#CCCCCC',
            padding: '10',
            fontSize: '16',
            color: '#333333'
        },
        events: {
            change: (val) => onChange(val)
        }
    });
};

// 4. CARD COMPONENT
// A pre-styled container with a shadow effect
const Card = (children, style = {}) => {
    return venjs.createElement('div', {
        style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '12',
            padding: '16',
            margin: '8',
            shadowColor: '#000000',
            elevation: '3', // Android shadow
            ...style
        }
    }, children);
};

// 5. LOADING SPINNER
// Renders a native activity indicator
const Spinner = () => {
    return venjs.createElement('activityIndicator', {
        style: {
            alignSelf: 'center',
            margin: '20'
        }
    });
};

// --- EXAMPLE: A "SOCIAL FEED" UI USING THE TOOLKIT ---

const SocialFeedApp = () => {
    const posts = [
        { id: 1, user: 'Myxo', text: 'venjs is taking over!' },
        { id: 2, user: 'VenJS_Bot', text: 'Brother framework connected.' },
        { id: 3, user: 'Dev_User', text: 'Wait, this is actual native code?' }
    ];

    return venjs.createElement('div', { style: { flex: 1, backgroundColor: '#FAFAFA' } }, [
        // App Header
        venjs.createElement('div', { 
            style: { 
                padding: '20', 
                backgroundColor: '#2563EB', 
                borderBottom: '1' 
            } 
        }, [
            venjs.createElement('text', { 
                textContent: 'venjs Social', 
                style: { fontWeight: 'bold', color: '#FFFFFF', fontSize: '20' } 
            })
        ]),

        // Main Scrollable Content
        ScrollView(
            posts.map(post => (
                Card([
                    venjs.createElement('text', { 
                        textContent: post.user, 
                        style: { color: '#2563EB', fontWeight: 'bold' } 
                    }),
                    venjs.createElement('text', { 
                        textContent: post.text, 
                        style: { marginTop: '8', fontSize: '15' } 
                    })
                ])
            ))
        )
    ]);
};

// Exporting toolkit for use in app/main.js
const Toolkit = { 
    ScrollView, 
    NativeImage, 
    InputField, 
    Card, 
    Spinner, 
    SocialFeedApp 
};

