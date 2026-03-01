/**
 * venjsX Native Core (v5.0.0)
 * JavaScript API for rendering native mobile UI via Android/iOS bridge engines.
 */

const venjs = {
  _eventHandlers: {},
  _eventHandlerIds: new WeakMap(),
  _eventIdSeed: 1,
  _rootComponent: null,
  _errorHandler: null,
  _nativeEventContext: null,
  _ANIM_TEXT_TAGS: { text: true, button: true, a: true },
  _FA_ICONS: {
    check: '\uf00c',
    close: '\uf00d',
    times: '\uf00d',
    plus: '\uf067',
    minus: '\uf068',
    home: '\uf015',
    user: '\uf007',
    cog: '\uf013',
    settings: '\uf013',
    search: '\uf002',
    trash: '\uf1f8',
    heart: '\uf004',
    star: '\uf005',
    bell: '\uf0f3',
    edit: '\uf044',
    save: '\uf0c7',
    arrowLeft: '\uf060',
    arrowRight: '\uf061'
  },

  _registerEventHandler: (handler) => {
    if (venjs._eventHandlerIds.has(handler)) {
      return venjs._eventHandlerIds.get(handler);
    }
    const id = venjs._eventIdSeed++;
    venjs._eventHandlers[id] = handler;
    venjs._eventHandlerIds.set(handler, id);
    return id;
  },

  _resetEventRegistry: () => {
    venjs._eventHandlers = {};
    venjs._eventHandlerIds = new WeakMap();
    venjs._eventIdSeed = 1;
  },

  _dispatchEvent: (eventId, payload) => {
    const handler = venjs._eventHandlers[eventId];
    if (typeof handler !== 'function') {
      console.warn(`venjsX: No handler found for event id ${eventId}.`);
      return;
    }
    const prevContext = venjs._nativeEventContext;
    venjs._nativeEventContext = payload && payload.type ? String(payload.type) : null;
    try {
      handler(payload);
    } catch (error) {
      console.error('venjsX: Error while executing event handler.', error);
    } finally {
      venjs._nativeEventContext = prevContext;
    }
  },

  _isPropsObject: (value) =>
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value.tag && typeof value.tag === 'string'),

  _normalizeChildren: (children) => {
    const list = Array.isArray(children) ? children : [children];
    const normalized = [];
    list.forEach((child) => {
      if (Array.isArray(child)) {
        normalized.push(...venjs._normalizeChildren(child));
        return;
      }
      if (child === null || child === undefined || child === false) {
        return;
      }
      if (typeof child === 'string' || typeof child === 'number') {
        normalized.push({ tag: 'text', props: { textContent: String(child) }, children: [] });
        return;
      }
      normalized.push(child);
    });
    return normalized;
  },

  _toTextContent: (children) => {
    const normalized = venjs._normalizeChildren(children);
    const text = normalized
      .map((child) => {
        if (child && child.tag === 'text' && child.props && child.props.textContent !== undefined) {
          return String(child.props.textContent);
        }
        return '';
      })
      .join('');
    return text;
  },

  _resolveFaIcon: (name) => {
    if (!name) return '';
    const key = String(name).trim();
    return venjs._FA_ICONS[key] || venjs._FA_ICONS[key.toLowerCase()] || '';
  },

  _serializeNode: (node) => {
    if (!node || typeof node !== 'object') {
      return node;
    }

    const props = { ...(node.props || {}) };
    const events = {};
    const sourceEvents = props.events && typeof props.events === 'object' ? props.events : {};

    if (typeof props.onClick === 'function') {
      events.click = venjs._registerEventHandler(props.onClick);
    }
    if (typeof props.onPress === 'function') {
      events.click = venjs._registerEventHandler(props.onPress);
    }
    if (typeof props.onChange === 'function') {
      events.change = venjs._registerEventHandler(props.onChange);
    }

    Object.keys(sourceEvents).forEach((name) => {
      if (typeof sourceEvents[name] === 'function') {
        events[name] = venjs._registerEventHandler(sourceEvents[name]);
      } else if (typeof sourceEvents[name] === 'number') {
        events[name] = sourceEvents[name];
      }
    });

    delete props.onClick;
    delete props.onPress;
    delete props.onChange;
    delete props.events;
    if (Object.keys(events).length > 0) {
      props.events = events;
    }

    return {
      tag: node.tag,
      props,
      children: venjs._normalizeChildren(node.children).map((child) => venjs._serializeNode(child))
    };
  },

  _transmit: (uiTree) => {
    const payload = JSON.stringify(uiTree);

    if (window.Android && typeof window.Android.processUINode === 'function') {
      window.Android.processUINode(payload);
      return;
    }

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.processUINode) {
      window.webkit.messageHandlers.processUINode.postMessage(payload);
      return;
    }

    console.warn('venjsX: No native engine detected. Rendering to console for debugging.');
    console.dir(uiTree);
  },

  _renderRoot: () => {
    if (typeof venjs._rootComponent !== 'function') {
      const err = new Error('venjsX: no root component mounted. Call venjs.mount(App) first.');
      if (typeof venjs._errorHandler === 'function') {
        venjs._errorHandler(err);
        return;
      }
      throw err;
    }
    try {
      venjs._resetEventRegistry();
      const tree = venjs._rootComponent();
      const serializedTree = venjs._serializeNode(tree);
      venjs._transmit(serializedTree);
    } catch (error) {
      if (typeof venjs._errorHandler === 'function') {
        venjs._errorHandler(error);
        return;
      }
      throw error;
    }
  },

  createElement: (tag, propsOrChildren = {}, ...childrenArgs) => {
    const hasProps = venjs._isPropsObject(propsOrChildren);
    const props = hasProps ? { ...propsOrChildren } : {};

    let rawChildren = hasProps ? childrenArgs : [propsOrChildren, ...childrenArgs];
    if (rawChildren.length === 1 && Array.isArray(rawChildren[0])) {
      rawChildren = rawChildren[0];
    }

    if (venjs._ANIM_TEXT_TAGS[tag] && (props.textContent === undefined || props.textContent === null)) {
      const inferredText = venjs._toTextContent(rawChildren);
      if (inferredText.length > 0) {
        props.textContent = inferredText;
      }
    }

    if (tag === 'icon') {
      props.style = props.style && typeof props.style === 'object' ? { ...props.style } : {};
      if (!props.style.fontFamily) {
        props.style.fontFamily = 'Font Awesome 6 Free';
      }
      if (props.textContent === undefined || props.textContent === null) {
        const glyph = venjs._resolveFaIcon(props.name);
        if (glyph) {
          props.textContent = glyph;
        }
      }
    }

    return {
      tag,
      props,
      children: venjs._normalizeChildren(rawChildren)
    };
  },

  // Shorthand API so developers can write venjs.text({}) etc.
  div: (...args) => venjs.createElement('div', ...args),
  text: (...args) => venjs.createElement('text', ...args),
  button: (...args) => venjs.createElement('button', ...args),
  image: (...args) => venjs.createElement('image', ...args),
  input: (...args) => venjs.createElement('input', ...args),
  checkbox: (...args) => venjs.createElement('checkbox', ...args),
  icon: (...args) => venjs.createElement('icon', ...args),
  activityIndicator: (...args) => venjs.createElement('activityIndicator', ...args),
  a: (...args) => venjs.createElement('a', ...args),

  api: {
    connect: async (request = {}) => {
      const options = typeof request === 'string' ? { url: request } : { ...(request || {}) };
      const url = typeof options.url === 'string' ? options.url.trim() : '';
      if (!url) {
        throw new Error('venjs.api.connect requires a url.');
      }

      const method = String(options.method || 'GET').toUpperCase();
      const headers = options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};
      const params = options.params && typeof options.params === 'object' ? options.params : null;
      const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : 15000;
      const responseType = String(options.responseType || 'json').toLowerCase();

      let finalUrl = url;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (value === undefined || value === null) return;
          searchParams.append(key, String(value));
        });
        const qs = searchParams.toString();
        if (qs) {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
        }
      }

      const fetchOptions = {
        method,
        headers,
        credentials: options.credentials || 'omit'
      };

      const hasBody = options.body !== undefined && options.body !== null && method !== 'GET' && method !== 'HEAD';
      if (hasBody) {
        const body = options.body;
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        const isPlainObject = body && typeof body === 'object' && !Array.isArray(body) && !isFormData;
        const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');

        if (isPlainObject) {
          fetchOptions.body = JSON.stringify(body);
          if (!hasContentType) {
            fetchOptions.headers['Content-Type'] = 'application/json';
          }
        } else {
          fetchOptions.body = body;
        }
      }

      let timeoutId = null;
      if (typeof AbortController !== 'undefined' && timeoutMs > 0) {
        const controller = new AbortController();
        fetchOptions.signal = controller.signal;
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      try {
        const response = await fetch(finalUrl, fetchOptions);
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data = null;
        if (responseType === 'text') {
          data = await response.text();
        } else if (responseType === 'blob') {
          data = await response.blob();
        } else if (responseType === 'arraybuffer') {
          data = await response.arrayBuffer();
        } else {
          const rawText = await response.text();
          if (rawText) {
            try {
              data = JSON.parse(rawText);
            } catch (_) {
              data = rawText;
            }
          }
        }

        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          statusText: error && error.name ? String(error.name) : 'NetworkError',
          headers: {},
          data: null,
          error: error && error.message ? String(error.message) : String(error)
        };
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }
  },

  // Simple reactive state holder for framework apps.
  state: (initialValue) => {
    let value = initialValue;
    return {
      get: () => value,
      set: (nextValue) => {
        value = typeof nextValue === 'function' ? nextValue(value) : nextValue;
        // Keep keyboard/focus stable while native input is typing.
        if (venjs._nativeEventContext !== 'change' && typeof venjs._rootComponent === 'function') {
          venjs.rerender();
        }
        return value;
      }
    };
  },

  createStore: (initialState = {}) => {
    let state = initialState;
    const listeners = new Set();

    const notify = () => {
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error('venjsX store listener error:', error);
        }
      });
    };

    return {
      getState: () => state,
      setState: (next) => {
        const computed = typeof next === 'function' ? next(state) : next;
        if (computed && typeof computed === 'object' && !Array.isArray(computed) && state && typeof state === 'object' && !Array.isArray(state)) {
          state = { ...state, ...computed };
        } else {
          state = computed;
        }
        notify();
        if (typeof venjs._rootComponent === 'function') {
          venjs.rerender();
        }
        return state;
      },
      subscribe: (listener) => {
        if (typeof listener !== 'function') {
          return () => {};
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  },

  createRouter: (routes = {}, options = {}) => {
    const normalize = (path) => {
      if (!path) return '/';
      const raw = String(path).trim();
      if (!raw || raw === '#') return '/';
      return raw.startsWith('/') ? raw : `/${raw.replace(/^#/, '')}`;
    };

    const current = venjs.state(normalize(options.initialRoute || '/'));
    const navigate = (to) => current.set(normalize(to));

    const resolve = () => {
      const path = current.get();
      const page = routes[path] || routes['*'] || options.notFound;
      if (!page) {
        return venjs.text({}, `Route "${path}" not found`);
      }
      return typeof page === 'function' ? page({ path, navigate }) : page;
    };

    return {
      path: current,
      navigate,
      push: navigate,
      replace: navigate,
      view: () => resolve(),
      resolve
    };
  },

  setErrorHandler: (handler) => {
    venjs._errorHandler = typeof handler === 'function' ? handler : null;
  },

  rerender: () => {
    venjs._renderRoot();
  },

  /**
   * Supports both signatures:
   * - venjs.mount(App)
   * - venjs.mount(null, App)
   */
  mount: (arg1, arg2, arg3) => {
    const component = typeof arg1 === 'function' ? arg1 : arg2;
    const options = typeof arg1 === 'function' ? arg2 : arg3;
    if (typeof component !== 'function') {
      throw new Error('venjsX.mount requires a component function.');
    }
    if (options && typeof options.onError === 'function') {
      venjs.setErrorHandler(options.onError);
    }
    venjs._rootComponent = component;
    venjs._renderRoot();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = venjs;
}

if (typeof window !== 'undefined') {
  window.venjs = venjs;
  window.venjsX = venjs;
  // Backward compatibility for legacy apps.
  window.venX = venjs;
  window.__venjsDispatchNativeEvent = (eventId, payload) => {
    venjs._dispatchEvent(Number(eventId), payload || {});
  };
}
