/**
 * Standalone Mobile DevTools Console Module with Floating Toggle Trigger
 */
export function initDevTools() {
  if (document.getElementById('mobile-debug-console')) return;

  // 1. Create the persistent floating trigger button
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'mobile-console-toggle';
  toggleBtn.innerText = '⚙';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5555', // Change to '#2a3a3a' if you want it to perfectly match your pad colors
    color: '#ffffff',
    fontSize: '20px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: '9999999',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    touchAction: 'manipulation',
    transition: 'background-color 0.2s ease'
  });

  // 2. Create UI output overlay container
  const consoleContainer = document.createElement('div');
  consoleContainer.id = 'mobile-debug-console';
  Object.assign(consoleContainer.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '40vh',
    overflowY: 'auto',
    backgroundColor: '#111111',
    borderTop: '2px solid #333333',
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '8px',
    boxSizing: 'border-box',
    zIndex: '9999998',
    whiteSpace: 'pre-wrap',
    opacity: '0.95',
    display: 'none' // Hidden by default, toggled via trigger button
  });

  // Toggle functional action map logic
  toggleBtn.onclick = () => {
    const isHidden = consoleContainer.style.display === 'none';
    consoleContainer.style.display = isHidden ? 'block' : 'none';
    toggleBtn.style.backgroundColor = isHidden ? '#445555' : '#ff5555';
    toggleBtn.innerText = isHidden ? '×' : '⚙';
  };
  // Create Bar Control Layout
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    paddingBottom: '4px',
    borderBottom: '1px solid #222222',
    fontWeight: 'bold',
    color: '#aaa'
  });

  const title = document.createElement('span');
  title.innerText = 'CONSOLE LOGS / ERRORS';

  const clearBtn = document.createElement('span');
  clearBtn.innerText = '[Clear]';
  clearBtn.style.cursor = 'pointer';
  clearBtn.onclick = (e) => { 
    e.stopPropagation();
    logArea.innerHTML = ''; 
  };

  header.appendChild(title);
  header.appendChild(clearBtn);
  consoleContainer.appendChild(header);

  const logArea = document.createElement('div');
  consoleContainer.appendChild(logArea);

  function printToScreen(type, content, stack = '') {
    const item = document.createElement('div');
    item.style.padding = '4px 0';
    item.style.borderBottom = '1px solid #1a1a1a';
    
    if (type === 'error') {
      item.style.color = '#ff5555';
    } else if (type === 'warn') {
      item.style.color = '#ffb86c';
    } else {
      item.style.color = '#888888';
    }

    item.innerText = `[${type.toUpperCase()}] ${new Date().getTime()} ${content}${stack ? '\n' + stack : ''}`;
    logArea.appendChild(item);
    consoleContainer.scrollTop = consoleContainer.scrollHeight;
    
    // Auto-reveal console panel if a critical application crash occurs
    if (type === 'error') {
      consoleContainer.style.display = 'block';
      toggleBtn.style.backgroundColor = '#445555';
      toggleBtn.innerText = '×';
    }
  }

  // Intercept standard global execution system parameters
  window.onerror = function(message, source, lineno, colno, error) {
    const stack = error && error.stack ? error.stack : `Line: ${lineno}, Col: ${colno}`;
    printToScreen('error', `${message} (${source})`, stack);
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const stack = reason && reason.stack ? reason.stack : '';
    printToScreen('error', `Unhandled Rejection: ${reason}`, stack);
  });

  // Intercept native console print functions
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = function(...args) {
    originalLog.apply(console, args);
    printToScreen('log', args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
  };

  console.warn = function(...args) {
    originalWarn.apply(console, args);
    printToScreen('warn', args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
  };

  console.error = function(...args) {
    originalError.apply(console, args);
    printToScreen('error', args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
  };

  // Safely mount nodes when DOM tree parameters resolve fully
  const mount = () => {
    document.body.appendChild(toggleBtn);
    document.body.appendChild(consoleContainer);
    console.log("DevTools initialized successfully.");
  };

  if (document.body) {
    mount();
  } else {
    window.addEventListener('DOMContentLoaded', mount);
  }
}
