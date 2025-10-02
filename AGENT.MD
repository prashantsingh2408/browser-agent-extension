# AGENT REFERENCE GUIDE

## 🤖 For AI Assistant Development

This file serves as a reference guide for AI assistants working on the Memory Agent project. It contains essential links, principles, and guidelines to ensure consistent, high-quality UI/UX development.

---

## 📚 Essential UX/UI References

### Primary UX Resource
**🎯 Laws of UX**: https://lawsofux.com/
- **Primary Reference**: Always consult this when making UI/UX decisions
- **Implementation**: See `/docs/UX-LAWS-COMPREHENSIVE.md` for how we've applied these laws
- **Key Principles Applied**:
  - Aesthetic-Usability Effect
  - Choice Overload Prevention
  - Cognitive Load Reduction
  - Fitts's Law (44px minimum touch targets)
  - Miller's Law (7±2 items limit)
  - Von Restorff Effect (highlight important actions)
  - Serial Position Effect
  - Peak-End Rule

### Inspiration Projects
**🧠 Memory Palace**: https://devpost.com/software/memory-palace-qyat7g
- **Context**: Winner of OpenAI's Open Model Hackathon
- **Features Inspired**: Multimodal memory, AI-powered intelligence, proactive suggestions
- **Implementation**: See `/docs/MEMORY_FEATURES.md`

**🎓 Orma**: https://devpost.com/software/orma
- **Context**: Chrome Built-in AI Challenge Winner
- **Features Inspired**: Web content capture, learning memory system
- **Implementation**: See `/docs/WEB-CONTENT-CAPTURE.md`

---

## 🎨 Design System

### Color Palette
```css
:root {
  --primary: #4285f4;
  --primary-dark: #1a73e8;
  --primary-light: #e8f0fe;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #4285f4 100%);
  --success: #34a853;
  --warning: #fbbc04;
  --danger: #ea4335;
}
```

### Spacing System
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### Touch Targets (Fitts's Law)
```css
:root {
  --min-touch-target: 44px;
  --button-padding: 12px 20px;
  --icon-button-size: 40px;
}
```

---

## 🏗️ Architecture Guidelines

### File Structure
```
browser-agent-extension/
├── scripts/
│   ├── memory.js              # Core memory management
│   ├── web-capture.js         # Web content capture
│   ├── learning-memory.js     # Learning system
│   └── chrome-adapter.js      # Web app compatibility
├── styles/
│   └── sidepanel.css         # Main styles with UX laws applied
├── docs/
│   ├── UX-LAWS-COMPREHENSIVE.md
│   ├── WEB-CONTENT-CAPTURE.md
│   └── MEMORY_FEATURES.md
└── AGENT.MD                  # This file
```

### Component Organization (Miller's Law)
**Memory Sub-Tabs** (6 total - within 7±2 limit):
1. **Capture** - Screenshot, video, voice
2. **Search** - Semantic search, filters
3. **Chat** - AI conversation with memories
4. **Gallery** - Visual memory browser
5. **Insights** - Pattern analysis, connections
6. **Browsing** - Web content capture while browsing

---

## 🎯 UX Principles to Always Follow

### 1. Aesthetic-Usability Effect
- Beautiful interfaces are perceived as more usable
- Use consistent gradients, shadows, and animations
- Apply modern design patterns

### 2. Choice Overload Prevention
- Limit options per screen
- Group related functionality
- Use progressive disclosure for advanced features

### 3. Cognitive Load Reduction
- Clear visual hierarchy
- Consistent iconography
- Meaningful labels and descriptions

### 4. Fitts's Law
- Minimum 44px touch targets
- Larger buttons for primary actions
- Optimal spacing between clickable elements

### 5. Miller's Law
- Limit information chunks to 7±2 items
- Current implementation: 6 sub-tabs, 3 control sections

### 6. Von Restorff Effect
- Highlight primary actions (screenshot button has star ⭐)
- Use distinctive styling for important features
- Apply `.primary-action` class to key buttons

---

## 🚀 Development Guidelines

### When Adding New Features

1. **Consult Laws of UX**: https://lawsofux.com/
2. **Check Miller's Law**: Don't exceed 7±2 items in any group
3. **Apply Fitts's Law**: Ensure 44px minimum touch targets
4. **Use Von Restorff Effect**: Highlight important new features
5. **Consider Cognitive Load**: Keep interfaces simple and clear

### CSS Class Conventions
```css
/* Primary actions (Von Restorff Effect) */
.primary-action { }

/* Touch targets (Fitts's Law) */
.control-btn { min-height: 44px; }

/* Visual feedback (Doherty Threshold) */
.fade-in { animation: fadeIn 0.4s ease-out; }

/* Progressive disclosure (Tesler's Law) */
.advanced-options { max-height: 0; overflow: hidden; }
.advanced-options.expanded { max-height: 500px; }
```

### JavaScript Patterns
```javascript
// Immediate feedback (Doherty Threshold)
function showActionFeedback(icon, message, progress) {
  // Provide feedback within 400ms
}

// Progressive enhancement (Jakob's Law)
function enhanceWithFamiliarPatterns() {
  // Use standard interaction patterns
}
```

---

## 📊 Performance Standards

### Doherty Threshold
- All interactions must provide feedback within **400ms**
- Use loading states for longer operations
- Implement optimistic UI updates

### Animation Guidelines
- Entrance animations: **0.3-0.4s**
- Hover effects: **0.2s**
- Loading states: **1.5s infinite**

---

## 🎨 Visual Design Checklist

### Before Implementing Any UI:
- [ ] Consulted https://lawsofux.com/ for relevant principles
- [ ] Applied appropriate Laws of UX
- [ ] Ensured 44px minimum touch targets
- [ ] Limited choices to prevent overload
- [ ] Used consistent spacing system
- [ ] Applied proper visual hierarchy
- [ ] Included loading/feedback states
- [ ] Tested keyboard navigation
- [ ] Verified color contrast ratios

### Component Checklist:
- [ ] Hover states defined
- [ ] Focus states accessible
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Mobile-responsive design
- [ ] Consistent with design system

---

## 🔄 Continuous Improvement

### Regular Reviews
1. **UX Audit**: Monthly review against Laws of UX
2. **Performance Check**: Ensure Doherty Threshold compliance
3. **Accessibility Test**: Keyboard navigation and screen readers
4. **User Feedback**: Integrate real user insights

### Future Enhancements
- **User Testing**: Validate UX improvements
- **Analytics**: Measure interaction patterns
- **A/B Testing**: Compare design variations
- **Accessibility**: WCAG compliance improvements

---

## 🎯 Quick Reference Commands

### Development Workflow
```bash
# Start web app for testing
python3 -m http.server 8000

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select browser-agent-extension folder
```

### Key Files to Modify
- **UI Changes**: `sidepanel.html` + `styles/sidepanel.css`
- **Functionality**: `scripts/memory.js`
- **Web Compatibility**: `scripts/chrome-adapter.js`
- **Documentation**: `docs/` folder

---

## 🎨 Design Inspiration

### Color Psychology
- **Blue (#4285f4)**: Trust, reliability, intelligence
- **Green (#34a853)**: Success, growth, harmony
- **Orange (#fbbc04)**: Energy, enthusiasm, creativity
- **Red (#ea4335)**: Urgency, importance, attention

### Typography Hierarchy
```css
h1 { font-size: 1.5em; font-weight: 700; }    /* Page titles */
h2 { font-size: 1.3em; font-weight: 600; }    /* Section headers */
h3 { font-size: 1.1em; font-weight: 600; }    /* Subsection headers */
p  { font-size: 0.9em; font-weight: 400; }    /* Body text */
small { font-size: 0.8em; font-weight: 400; } /* Meta information */
```

---

## 🎯 Success Metrics

### UX Quality Indicators
- **Task Completion Rate**: >95%
- **User Satisfaction**: >4.5/5
- **Error Rate**: <2%
- **Time to Complete Tasks**: <30 seconds
- **Accessibility Score**: WCAG AA compliant

### Performance Targets
- **First Paint**: <200ms
- **Interaction Response**: <400ms (Doherty Threshold)
- **Animation Frame Rate**: 60fps
- **Memory Usage**: <50MB

---

## 📝 Notes for AI Assistants

### Always Remember:
1. **Laws of UX First**: https://lawsofux.com/ is the primary reference
2. **User-Centered Design**: Every decision should benefit the user
3. **Consistency**: Follow established patterns and conventions
4. **Accessibility**: Design for all users, including those with disabilities
5. **Performance**: Fast, responsive interactions are crucial

### When in Doubt:
1. Refer to https://lawsofux.com/
2. Check existing implementation in `/docs/UX-LAWS-COMPREHENSIVE.md`
3. Follow established patterns in the codebase
4. Prioritize user needs over technical convenience

### Common Mistakes to Avoid:
- Adding too many options (Choice Overload)
- Making buttons too small (Fitts's Law violation)
- Inconsistent visual hierarchy (Cognitive Load)
- Slow feedback (Doherty Threshold violation)
- Hiding important actions (Von Restorff Effect ignored)

---

**Remember**: Great UX is invisible. Users should accomplish their goals effortlessly, without thinking about the interface itself.

**Primary Reference**: https://lawsofux.com/ - Always consult this for UI/UX decisions!
