// Debug script to help identify styling conflicts

// Function to toggle the reset styles
function toggleResetStyles() {
  const existingLink = document.getElementById('reset-styles');
  
  if (existingLink) {
    // Remove the reset styles if they're already applied
    existingLink.remove();
    console.log('Reset styles removed');
    return false;
  } else {
    // Add the reset styles
    const link = document.createElement('link');
    link.id = 'reset-styles';
    link.rel = 'stylesheet';
    link.href = '/reset-styles.css';
    document.head.appendChild(link);
    console.log('Reset styles applied');
    
    // Highlight elements with !important styles
    highlightImportantStyles();
    return true;
  }
}

// Function to find elements with !important styles
function highlightImportantStyles() {
  // Get all elements
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    // Get computed style
    const style = window.getComputedStyle(el);
    
    // Check if any font-related properties have !important
    const hasImportant = checkForImportant(el);
    
    if (hasImportant) {
      el.classList.add('has-important-style');
      console.log('Element with !important style:', el);
    }
  });
}

// Helper function to check if an element has !important in its inline style
function checkForImportant(element) {
  const inlineStyle = element.getAttribute('style');
  if (!inlineStyle) return false;
  
  // Check for font-related properties with !important
  const fontProperties = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'text-transform'
  ];
  
  return fontProperties.some(prop => 
    inlineStyle.includes(`${prop}`) && inlineStyle.includes('!important')
  );
}

// Add a button to toggle the reset styles
function addToggleButton() {
  const button = document.createElement('button');
  button.textContent = 'Toggle Reset Styles';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#333';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', () => {
    const isActive = toggleResetStyles();
    button.textContent = isActive ? 'Remove Reset Styles' : 'Apply Reset Styles';
  });
  
  document.body.appendChild(button);
}

// Run when the page is fully loaded
window.addEventListener('load', () => {
  addToggleButton();
  console.log('Style debugging tools loaded');
});
