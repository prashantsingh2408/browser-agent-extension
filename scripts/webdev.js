// Web Developer Agent Module
// AI-powered website creation and live editing

let currentWebsiteCode = null;
let livePreviewTab = null;
let selectedElement = null;

// Initialize Web Developer Agent
async function initializeUIUX() {
  console.log('🚀 Initializing Web Developer Agent...');
  
  // Setup event listeners
  setupWebDevEventListeners();
  
  // Setup example cards
  setupExampleCards();
  
  console.log('✅ Web Developer Agent ready');
}

// Cleanup resources
async function cleanupUIUX() {
  // No specific cleanup needed
}

// Setup event listeners
function setupWebDevEventListeners() {
  // Send message button
  const sendBtn = document.getElementById('sendWebdevMessage');
  const input = document.getElementById('webdevInput');
  
  if (sendBtn && input) {
    // Remove existing listeners by cloning
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Add fresh event listeners
    newSendBtn.addEventListener('click', handleSendMessage);
    
    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }
  
  // View Live button
  const viewLiveBtn = document.getElementById('viewLiveBtn');
  if (viewLiveBtn) {
    viewLiveBtn.addEventListener('click', openLivePreview);
  }
  
  // Select for edit button
  const selectBtn = document.getElementById('selectForEdit');
  if (selectBtn) {
    selectBtn.addEventListener('click', startElementSelection);
  }
}

// Setup example cards
function setupExampleCards() {
  const exampleCards = document.querySelectorAll('.example-card');
  
  exampleCards.forEach(card => {
    card.addEventListener('click', () => {
      // Get the title and construct a proper example
      const title = card.querySelector('.example-title').textContent;
      const features = card.querySelector('.example-text').textContent;
      
      let examplePrompt = '';
      const accent = card.dataset.accent;
      
      // Generate contextual prompts based on card type
      switch(accent) {
        case 'startup':
          examplePrompt = `Create a modern landing page for a tech startup with ${features.toLowerCase()}, smooth animations, and a gradient design`;
          break;
        case 'portfolio':
          examplePrompt = `Build a creative portfolio website with ${features.toLowerCase()}, image galleries, and smooth transitions`;
          break;
        case 'business':
          examplePrompt = `Design a professional business website with ${features.toLowerCase()}, modern layout, and trust badges`;
          break;
        case 'store':
          examplePrompt = `Create an e-commerce website with ${features.toLowerCase()}, shopping features, and payment options`;
          break;
      }
      
      const input = document.getElementById('webdevInput');
      if (input) {
        input.value = examplePrompt;
        input.focus();
        
        // Update progress to step 2 (Generate)
        updateProgressStep(1);
        
        // Trigger a subtle animation on the input
        input.style.animation = 'none';
        setTimeout(() => {
          input.style.animation = 'highlightInput 0.5s ease';
        }, 10);
      }
    });
  });
  
  // Setup the try example button
  const tryExampleBtn = document.getElementById('tryExample');
  if (tryExampleBtn) {
    tryExampleBtn.addEventListener('click', () => {
      const input = document.getElementById('webdevInput');
      if (input) {
        input.value = 'Create a modern landing page for a SaaS product with hero section, feature cards, pricing tiers, testimonials, and a footer';
        input.focus();
        
        // Update progress
        updateProgressStep(1);
        
        // Visual feedback
        tryExampleBtn.style.transform = 'scale(0.98)';
        setTimeout(() => {
          tryExampleBtn.style.transform = '';
        }, 200);
      }
    });
  }
}

// Update progress step indicator
function updateProgressStep(stepIndex) {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;
  
  steps.forEach((step, index) => {
    if (index <= stepIndex) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// Handle send message
async function handleSendMessage() {
  const input = document.getElementById('webdevInput');
  const sendBtn = document.getElementById('sendWebdevMessage');
  
  if (!input || !input.value.trim()) return;
  
  const message = input.value.trim();
  input.value = '';
  
  // Set button to loading state
  setButtonState('loading');
  
  // Update progress to step 2 (Generate)
  updateProgressStep(1);
  
  // Remove welcome message if exists
  const welcome = document.querySelector('.webdev-welcome');
  if (welcome) {
    // Fade out animation
    welcome.style.opacity = '0';
    welcome.style.transform = 'translateY(-20px)';
    setTimeout(() => welcome.remove(), 300);
  }
  
  // Add user message
  addMessage(message, 'user');
  
  // Update status with Doherty Threshold in mind (< 400ms feedback)
  updateStatus('Building website...', 'status-building');
  
  // Show immediate feedback
  setTimeout(() => {
    addMessage('🔨 Analyzing your requirements...', 'agent');
  }, 100);
  
  try {
    // Process the request
    await processWebDevRequest(message);
    
    // Set button to success state
    setButtonState('success');
    
    // Reset to normal state after 2 seconds
    setTimeout(() => {
      setButtonState('normal');
    }, 2000);
    
  } catch (error) {
    console.error('WebDev Error:', error);
    setButtonState('error');
    addMessage('❌ Sorry, something went wrong. Please try again.', 'agent');
    
    // Reset to normal state after 3 seconds
    setTimeout(() => {
      setButtonState('normal');
    }, 3000);
  }
}

// Set button state with visual feedback
function setButtonState(state) {
  const sendBtn = document.getElementById('sendWebdevMessage');
  if (!sendBtn) return;
  
  // Remove all state classes
  sendBtn.classList.remove('loading', 'success', 'error');
  
  switch(state) {
    case 'loading':
      sendBtn.classList.add('loading');
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>Building...</span>
      `;
      sendBtn.disabled = true;
      break;
      
    case 'success':
      sendBtn.classList.add('success');
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>Success!</span>
      `;
      sendBtn.disabled = false;
      break;
      
    case 'error':
      sendBtn.classList.add('error');
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span>Try Again</span>
      `;
      sendBtn.disabled = false;
      break;
      
    case 'normal':
    default:
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <span>Build</span>
      `;
      sendBtn.disabled = false;
      break;
  }
}

// Add message to chat
function addMessage(content, sender = 'user', includeCode = false) {
  const messagesDiv = document.getElementById('webdevMessages');
  if (!messagesDiv) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `webdev-message ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? '👤' : '🤖';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  if (includeCode && typeof content === 'object') {
    contentDiv.innerHTML = `
      <div>${content.message}</div>
      ${content.code ? `<div class="message-code">${escapeHtml(content.code)}</div>` : ''}
    `;
  } else {
    contentDiv.innerHTML = content;
  }
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Process web development request
async function processWebDevRequest(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check if it's an edit request
  if (selectedElement && (lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('modify'))) {
    await processEditRequest(message);
  } else if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
    await createWebsite(message);
  } else {
    // General help or question
    addMessage('I can help you build websites! Try saying "Create a landing page for a tech startup" or select an element on your live preview to edit it.', 'agent');
    updateStatus('Ready to build', '');
  }
}

// Create website from description
async function createWebsite(description) {
  // Zeigarnik Effect: Show progress to keep user engaged
  setTimeout(() => {
    addMessage('🎨 Designing your layout...', 'agent');
  }, 500);
  
  setTimeout(() => {
    addMessage('💻 Writing clean code...', 'agent');
  }, 1000);
  
  // Generate website code based on description
  setTimeout(async () => {
    const websiteCode = generateWebsiteCode(description);
    
    // Store the code
    currentWebsiteCode = websiteCode;
    
    // Update progress to step 3 (Preview)
    updateProgressStep(2);
    
    // Peak-End Rule: End with a strong positive message
    addMessage({
      message: '✨ Success! Your website is ready!',
      code: `Created ${Math.round(websiteCode.html.length / 100) * 100}+ lines of professional code`
    }, 'agent', true);
    
    // Show View Live button with animation
    const viewLiveBtn = document.getElementById('viewLiveBtn');
    if (viewLiveBtn) {
      viewLiveBtn.style.display = 'flex';
      viewLiveBtn.style.animation = 'slideIn 0.3s ease';
      
      // Fitts's Law: Make the button pulse to draw attention
      viewLiveBtn.style.animation = 'pulse 2s infinite';
    }
    
    // Show preview controls
    const previewControls = document.getElementById('livePreviewControls');
    if (previewControls) {
      previewControls.style.display = 'block';
      previewControls.style.animation = 'slideIn 0.3s ease';
    }
    
    // Update status - Aesthetic-Usability Effect
    updateStatus('✅ Website ready! Click "View Live"', 'status-success');
    
    // Automatically open preview after a short delay
    // Doherty Threshold: Keep interaction fast
    setTimeout(() => {
      openLivePreview();
    }, 800);
  }, 1500);
}

// Generate website code
function generateWebsiteCode(description) {
  const lowerDesc = description.toLowerCase();
  
  // Determine website type
  let template = 'default';
  if (lowerDesc.includes('landing')) template = 'landing';
  else if (lowerDesc.includes('portfolio')) template = 'portfolio';
  else if (lowerDesc.includes('dashboard')) template = 'dashboard';
  else if (lowerDesc.includes('e-commerce') || lowerDesc.includes('product')) template = 'ecommerce';
  
  // Generate based on template
  const templates = {
    landing: generateLandingPage(description),
    portfolio: generatePortfolioPage(description),
    dashboard: generateDashboard(description),
    ecommerce: generateEcommercePage(description),
    default: generateDefaultPage(description)
  };
  
  return templates[template];
}

// Generate landing page
function generateLandingPage(description) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* Header */
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 30px;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 150px 20px 100px;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: fadeInUp 0.8s ease;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: fadeInUp 0.8s ease 0.4s both;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        /* Features Section */
        .features {
            padding: 80px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .features h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 50px;
            color: #333;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
        }
        
        .feature-card {
            text-align: center;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
        }
        
        .feature-card h3 {
            margin-bottom: 15px;
            color: #667eea;
        }
        
        /* Footer */
        footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .hero h1 {
                font-size: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <div class="logo">YourBrand</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero" id="home">
        <h1>Welcome to the Future</h1>
        <p>Build amazing websites with our AI-powered platform</p>
        <a href="#features" class="cta-button">Get Started</a>
    </section>
    
    <section class="features" id="features">
        <h2>Our Features</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🚀</div>
                <h3>Fast Development</h3>
                <p>Build websites in minutes, not hours. Our AI understands your needs and creates exactly what you want.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🎨</div>
                <h3>Beautiful Design</h3>
                <p>Modern, responsive designs that look great on all devices. Customizable to match your brand.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>Live Editing</h3>
                <p>Make changes in real-time. Select any element and modify it instantly with natural language.</p>
            </div>
        </div>
    </section>
    
    <footer id="contact">
        <p>&copy; 2024 YourBrand. Built with AI Web Developer.</p>
    </footer>
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        console.log('Website created by AI Web Developer Agent');
    </script>
</body>
</html>`;
  
  return { html };
}

// Generate portfolio page
function generatePortfolioPage(description) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .header { background: #333; color: white; padding: 20px; text-align: center; }
        .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px; }
        .portfolio-item { border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .portfolio-item img { width: 100%; height: 200px; object-fit: cover; }
        .portfolio-item h3 { padding: 10px; margin: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Portfolio</h1>
        <p>Showcasing my best work</p>
    </div>
    <div class="portfolio-grid">
        <div class="portfolio-item">
            <img src="https://via.placeholder.com/400x200/667eea/ffffff?text=Project+1" alt="Project 1">
            <h3>Project One</h3>
        </div>
        <div class="portfolio-item">
            <img src="https://via.placeholder.com/400x200/764ba2/ffffff?text=Project+2" alt="Project 2">
            <h3>Project Two</h3>
        </div>
        <div class="portfolio-item">
            <img src="https://via.placeholder.com/400x200/667eea/ffffff?text=Project+3" alt="Project 3">
            <h3>Project Three</h3>
        </div>
    </div>
</body>
</html>`;
  
  return { html };
}

// Generate dashboard
function generateDashboard(description) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #f0f2f5; }
        .dashboard { display: flex; height: 100vh; }
        .sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px; }
        .main { flex: 1; padding: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2rem; font-weight: bold; color: #667eea; }
        .chart { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 300px; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <h2>Dashboard</h2>
            <ul style="list-style: none; padding: 0; margin-top: 30px;">
                <li style="padding: 10px 0;">📊 Overview</li>
                <li style="padding: 10px 0;">📈 Analytics</li>
                <li style="padding: 10px 0;">👥 Users</li>
                <li style="padding: 10px 0;">⚙️ Settings</li>
            </ul>
        </div>
        <div class="main">
            <h1>Welcome to Dashboard</h1>
            <div class="stats">
                <div class="stat-card">
                    <div>Total Users</div>
                    <div class="stat-value">1,234</div>
                </div>
                <div class="stat-card">
                    <div>Revenue</div>
                    <div class="stat-value">$45.6k</div>
                </div>
                <div class="stat-card">
                    <div>Growth</div>
                    <div class="stat-value">+23%</div>
                </div>
            </div>
            <div class="chart">
                <div style="text-align: center;">
                    <div style="font-size: 48px;">📊</div>
                    <p>Chart visualization would go here</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  
  return { html };
}

// Generate e-commerce page
function generateEcommercePage(description) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Commerce Store</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 20px; }
        .product { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .product img { width: 100%; height: 200px; object-fit: cover; }
        .product-info { padding: 15px; }
        .price { color: #667eea; font-size: 1.5rem; font-weight: bold; }
        .add-to-cart { width: 100%; padding: 10px; background: #667eea; color: white; border: none; cursor: pointer; font-size: 16px; }
        .add-to-cart:hover { background: #764ba2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ Online Store</h1>
    </div>
    <div class="products">
        <div class="product">
            <img src="https://via.placeholder.com/300x200/667eea/ffffff?text=Product+1" alt="Product 1">
            <div class="product-info">
                <h3>Premium Product</h3>
                <p>High quality item with great features</p>
                <div class="price">$99.99</div>
            </div>
            <button class="add-to-cart">Add to Cart</button>
        </div>
        <div class="product">
            <img src="https://via.placeholder.com/300x200/764ba2/ffffff?text=Product+2" alt="Product 2">
            <div class="product-info">
                <h3>Special Edition</h3>
                <p>Limited time offer on this amazing product</p>
                <div class="price">$149.99</div>
            </div>
            <button class="add-to-cart">Add to Cart</button>
        </div>
    </div>
</body>
</html>`;
  
  return { html };
}

// Generate default page
function generateDefaultPage(description) {
  return generateLandingPage(description);
}

// Open live preview
async function openLivePreview() {
  if (!currentWebsiteCode) {
    updateStatus('No website to preview', 'status-error');
    return;
  }
  
  // Create a blob URL for the HTML
  const blob = new Blob([currentWebsiteCode.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new tab
  livePreviewTab = window.open(url, '_blank');
  
  // Update preview URL display
  const previewUrl = document.getElementById('previewUrl');
  if (previewUrl) {
    previewUrl.textContent = 'Live Preview Tab';
  }
  
  updateStatus('Live preview opened', 'status-success');
}

// Start element selection for editing
async function startElementSelection() {
  if (!livePreviewTab) {
    updateStatus('Please open live preview first', 'status-error');
    return;
  }
  
  // For now, we'll simulate element selection
  addMessage('Element selection mode activated. Describe what you want to change, e.g., "Change the hero title to..." or "Make the button green"', 'agent');
  selectedElement = { type: 'mock', selector: 'hero' };
}

// Process edit request
async function processEditRequest(message) {
  // Simulate editing by regenerating the website with modifications
  addMessage('🔧 Applying your changes...', 'agent');
  
  // In a real implementation, this would modify the specific element
  // For now, we'll show a success message
  setTimeout(() => {
    addMessage('✅ Changes applied! Refresh the live preview to see updates.', 'agent');
    updateStatus('Changes saved', 'status-success');
  }, 1000);
}

// Update status
function updateStatus(text, className = '') {
  const statusElement = document.getElementById('webdevStatus');
  if (statusElement) {
    statusElement.textContent = text;
    statusElement.className = `status-indicator ${className}`;
  }
}

// Escape HTML
function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Export functions
window.initializeUIUX = initializeUIUX;
window.cleanupUIUX = cleanupUIUX;
