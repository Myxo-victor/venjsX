/*
*@author Myxo victor
*@file_type Venjs
*@handler design of basic home page (mobile-adapted)
*@file_name home.js
*/

(function () {
  const page = venjs.state('Home');
  const postsData = venjs.state([]);
  const isCommentOpen = venjs.state(false);
  const currentPostComments = venjs.state([]);
  const isCommentsLoading = venjs.state(false);

  const closeComments = () => {
    isCommentOpen.set(false);
  };

  const NavButton = (name, icon) => {
    const isActive = page.get() === name;
    return venjs.div(
      {
        className: `navItem ${isActive ? 'active' : ''}`,
        onClick: () => page.set(name)
      },
      [
        venjs.createElement('icon', { name: icon }),
        venjs.text({}, name)
      ]
    );
  };

  const Navigator = () =>
    venjs.div({ className: 'navBar' }, [
      venjs.div({ className: 'navBrandWrap' }, [venjs.text({ className: 'mobileHeader' }, 'Space')]),
      NavButton('Home', 'house'),
      NavButton('Knowledge', 'book-open'),
      NavButton('Okla', 'brain'),
      NavButton('Wallet', 'wallet'),
      NavButton('Games', 'gamepad'),
      NavButton('Profile', 'user')
    ]);

  const Nav = (name, icon) => {
    const active = page.get() === name;
    return venjs.div(
      {
        className: `navBtn ${active ? 'active' : ''}`,
        onClick: () => page.set(name)
      },
      [venjs.createElement('icon', { name: icon })]
    );
  };

  const BottomNav = () =>
    venjs.div({ className: 'bottomNav' }, [
      Nav('Home', 'house'),
      Nav('Knowledge', 'book-open'),
      Nav('Wallet', 'wallet'),
      Nav('Games', 'gamepad'),
      Nav('Okla', 'brain'),
      Nav('Profile', 'user')
    ]);

  const Explore = () => venjs.div({ className: 'exploreSection' }, []);

  const CommentsModal = () =>
    venjs.div(
      {
        className: 'overlayCom',
        style: { display: isCommentOpen.get() ? 'block' : 'none' },
        onClick: () => closeComments()
      },
      [
        venjs.div(
          {
            className: 'modalComment',
            style: {
              marginBottom: isCommentOpen.get() ? '0px' : '-80vh',
              transition: 'all 0.5s ease-out'
            }
          },
          [
            venjs.div(
              { className: 'commentScroll' },
              [
                isCommentsLoading.get()
                  ? venjs.text({ className: 'postLoader' }, 'Searching Space for comments...')
                  : null,
                !isCommentsLoading.get() && currentPostComments.get().length === 0
                  ? venjs.text({ className: 'postLoader' }, 'No comments yet. Be the first!')
                  : null
              ].filter(Boolean)
            ),
            venjs.div({ className: 'opinionDiv' }, [
              venjs.input({ className: 'opinionInput', type: 'text', placeholder: 'Write a Comment...' }),
              venjs.button({ className: 'postBtn', onClick: () => {} }, 'Post')
            ])
          ]
        )
      ]
    );

  const HomeFeed = () => {
    const data = postsData.get();
    return venjs.div({ className: 'feedContainer' }, [
      data.length > 0
        ? data.map((post) =>
            venjs.div({ className: 'postHolder' }, [
              venjs.div({ className: 'postHeader' }, [
                venjs.text({ className: 'pName' }, post.display_name || 'Anonymous'),
                venjs.text({ className: 'pTime' }, post.created_at || 'Recently')
              ]),
              venjs.div({ className: 'mediaSketch' }, [venjs.text({}, post.content || '')]),
              venjs.div({ className: 'postFooter' }, [
                venjs.text({}, `${post.likes_count || 0} likes`),
                venjs.text({}, `${post.comments_count || 0} comments`)
              ])
            ])
          )
        : venjs.text({ className: 'postLoader' }, 'Loading Posts...')
    ]);
  };

  const HomeTab = () =>
    venjs.div({ className: 'mainBody' }, [
      venjs.div({ className: 'top' }, [
        venjs.text({ className: 'mobileHeader' }, 'Space'),
        venjs.div({ className: 'iconBox' }, [
          venjs.createElement('icon', { name: 'search', className: 'iconBtn' }),
          venjs.createElement('icon', { name: 'bell', className: 'iconBtn' }),
          venjs.createElement('icon', { name: 'cog', className: 'iconBtn' })
        ])
      ]),
      CommentsModal(),
      venjs.div({ className: 'createContainer' }, [
        venjs.input({
          className: 'postInput',
          type: 'text',
          placeholder: "What's poping on Space?"
        })
      ]),
      venjs.div({ className: 'axis' }, [venjs.text({}, 'Axis')]),
      HomeFeed(),
      venjs.button({ className: 'jBtn', onClick: () => {} }, 'Load more posts')
    ]);

  const PlaceholderPage = (title, subtitle) =>
    venjs.div({ className: 'mainBody' }, [
      venjs.text({ className: 'auth-title' }, title),
      venjs.text({ className: 'auth-subtitle' }, subtitle)
    ]);

  const renderPage = () => {
    const tab = page.get();
    if (tab === 'Home') return HomeTab();
    if (tab === 'Knowledge') return PlaceholderPage('Knowledge', 'Knowledge tab is loading...');
    if (tab === 'Wallet') return PlaceholderPage('Wallet', 'Wallet tab is loading...');
    if (tab === 'Games') return PlaceholderPage('Games', 'Games tab is loading...');
    if (tab === 'Profile') return PlaceholderPage('Profile', 'Profile tab is loading...');
    if (tab === 'Okla') {
      return venjs.div({ className: 'okla' }, [
        venjs.text({ className: 'okla-head' }, 'Welcome to Okla!'),
        venjs.text({ className: 'okla-sub' }, 'Get your exam questions prediction before the exams start.'),
        venjs.text(
          { className: 'okla-info' },
          "Okla does not have access to your school's exam paper, but uses prediction algorithms."
        ),
        venjs.button({ className: 'okla-btn' }, 'Get started')
      ]);
    }
    return venjs.text({}, '404 Page not found!');
  };

  const renderHomeScreen = ({ navigate } = {}) =>
    venjs.div({ className: 'home-shell' }, [
      Navigator(),
      BottomNav(),
      renderPage(),
      Explore()
    ]);

  window.renderHomeScreen = renderHomeScreen;

  if (
    !window.__venjsRouterMounted &&
    window.venjs &&
    typeof window.venjs.mount === 'function' &&
    !window.__venjsHomeMounted
  ) {
    window.__venjsHomeMounted = true;
    window.venjs.mount(() => renderHomeScreen({ navigate: null }));
  }
})();
