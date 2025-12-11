/**
 * Text Selection Control
 * Prevents drag selection across the page
 * Only allows selection on product names and inputs
 */

// Prevent text selection on drag
document.addEventListener('selectstart', function(e) {
  // Allow selection only on product names and form elements
  const target = e.target;
  
  // Check if target is a product name or form element
  if (
    target.classList.contains('product-name') ||
    target.classList.contains('product-title') ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.contentEditable === 'true' ||
    target.closest('.product-name') ||
    target.closest('[contenteditable="true"]')
  ) {
    // Allow selection
    return;
  }
  
  // Prevent selection on everything else
  e.preventDefault();
}, true);

// Prevent context menu on non-product elements
document.addEventListener('contextmenu', function(e) {
  const target = e.target;
  
  // Allow context menu on product names and inputs
  if (
    target.classList.contains('product-name') ||
    target.classList.contains('product-title') ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.contentEditable === 'true'
  ) {
    return;
  }
  
  // Prevent on other elements
  e.preventDefault();
}, true);

// Add keyboard shortcut to enable/disable selection (for debugging)
let selectionEnabled = false;
document.addEventListener('keydown', function(e) {
  // Ctrl+Shift+S to toggle selection (debug mode)
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    selectionEnabled = !selectionEnabled;
    
    if (selectionEnabled) {
      document.body.style.userSelect = 'auto';
      console.log('🔓 Text selection ENABLED (debug mode)');
    } else {
      document.body.style.userSelect = 'none';
      console.log('🔒 Text selection DISABLED');
    }
  }
});

// Export for use in components
export const toggleSelection = (enabled) => {
  selectionEnabled = enabled;
  document.body.style.userSelect = enabled ? 'auto' : 'none';
};
