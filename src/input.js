// Keyboard input state manager
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

// Map key names to actions
const keyMap = {
  'w': 'forward',
  'W': 'forward',
  'ArrowUp': 'forward',
  's': 'backward',
  'S': 'backward',
  'ArrowDown': 'backward',
  'a': 'left',
  'A': 'left',
  'ArrowLeft': 'left',
  'd': 'right',
  'D': 'right',
  'ArrowRight': 'right'
};

// Handle keydown events
window.addEventListener('keydown', (e) => {
  const action = keyMap[e.key];
  if (action) {
    keys[action] = true;
    
    // Prevent default for arrow keys to stop page scrolling
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
    }
  }
});

// Handle keyup events
window.addEventListener('keyup', (e) => {
  const action = keyMap[e.key];
  if (action) {
    keys[action] = false;
  }
});

// Expose input state for debugging
window.__DEBUG_INPUT = keys;

export { keys };
