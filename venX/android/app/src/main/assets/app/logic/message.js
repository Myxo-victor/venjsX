(function () {
  const ensureModal = () => {
    let overlay = document.getElementById('app-message-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'app-message-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.45)';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';

    const box = document.createElement('div');
    box.style.width = '86%';
    box.style.maxWidth = '360px';
    box.style.background = '#ffffff';
    box.style.borderRadius = '12px';
    box.style.padding = '14px';
    box.style.boxSizing = 'border-box';

    const title = document.createElement('div');
    title.id = 'app-message-title';
    title.textContent = 'Message';
    title.style.fontSize = '17px';
    title.style.fontWeight = '700';
    title.style.marginBottom = '10px';
    title.style.fontFamily = 'myfont, sans-serif';

    const content = document.createElement('div');
    content.id = 'app-message-content';
    content.style.fontSize = '14px';
    content.style.lineHeight = '1.45';
    content.style.color = '#222';
    content.style.marginBottom = '14px';
    content.style.fontFamily = 'myfont, sans-serif';

    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.justifyContent = 'flex-end';

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '8px 14px';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '8px';
    okButton.style.background = '#111';
    okButton.style.color = '#fff';
    okButton.style.fontFamily = 'myfont, sans-serif';
    okButton.style.fontSize = '14px';
    okButton.onclick = () => {
      overlay.style.display = 'none';
    };

    actionRow.appendChild(okButton);
    box.appendChild(title);
    box.appendChild(content);
    box.appendChild(actionRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    return overlay;
  };

  const show = (message, title = 'Message') => {
    const overlay = ensureModal();
    const titleNode = document.getElementById('app-message-title');
    const contentNode = document.getElementById('app-message-content');
    if (titleNode) titleNode.textContent = String(title || 'Message');
    if (contentNode) contentNode.textContent = String(message || '');
    overlay.style.display = 'flex';
  };

  window.appMessage = { show };
})();
