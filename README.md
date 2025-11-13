# 🎯 Tripwire Survey System

A fast, mobile-responsive survey system for testing different $4.95 tripwire offers and maximizing conversion rates.

## ✨ Features

- **Lightning Fast** - Pure HTML/CSS/JS, no build process, loads in milliseconds
- **Mobile First** - Optimized for all devices (phone, tablet, desktop)
- **Easy Tripwire Swapping** - Change offers in seconds by editing one variable
- **Built-in Analytics** - Track conversion rates for each tripwire
- **Conversion Optimized** - Compelling copywriting and UX best practices
- **Admin Dashboard** - Visual analytics to compare tripwire performance
- **A/B Testing Ready** - Test 3 different tripwires to find your winner

## 🚀 Quick Start

### 1. Setup

Simply open `index.html` in your browser - that's it! No installation, no dependencies, no build process.

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server (recommended for testing)
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 2. Swap Tripwire Offers

Edit `config.js` and change the `ACTIVE_TRIPWIRE` constant:

```javascript
const ACTIVE_TRIPWIRE = 'tripwire1'; // Change to 'tripwire2' or 'tripwire3'
```

**That's it!** Your survey now shows a different offer. Test each one to see which converts best.

### 3. View Analytics

Open `admin.html` in your browser to see:
- Conversion rates for each tripwire
- Page views, survey completions, and CTA clicks
- Overall performance metrics
- Recent events timeline

## 📁 File Structure

```
├── index.html          # Main survey page (user-facing)
├── admin.html          # Analytics dashboard (internal use)
├── config.js           # Tripwire configuration (EDIT THIS)
├── survey.js           # Survey logic and analytics
├── styles.css          # Mobile-responsive styles
└── README.md           # This file
```

## ⚙️ Configuration Guide

### Adding Your Own Tripwire

Edit `config.js` and add a new tripwire object:

```javascript
const TRIPWIRES = {
  tripwire4: {  // New tripwire
    id: 'tripwire4',
    name: 'Your Product Name',
    price: 4.95,
    headline: 'Your Compelling Headline',
    subheadline: 'Supporting benefit statement',
    description: 'Detailed description of what they get...',
    benefits: [
      'Benefit 1 - Focus on outcomes',
      'Benefit 2 - Solve specific pain points',
      'Benefit 3 - Time/money savings',
    ],
    bullets: [
      '✓ Feature 1',
      '✓ Feature 2',
      '✓ Feature 3',
    ],
    urgency: 'Limited time: Only $4.95 (Regular $29)',
    cta: 'Yes! I Want This Now',
    image: 'https://your-image-url.com/product.jpg',
    guarantee: 'Your risk-free guarantee statement...'
  }
};
```

Then activate it:
```javascript
const ACTIVE_TRIPWIRE = 'tripwire4';
```

### Customizing Survey Questions

Edit the `SURVEY_CONFIG` object in `config.js`:

```javascript
const SURVEY_CONFIG = {
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Your question here?',
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4'
      ],
      required: true  // Set to false for optional questions
    },
    // Add more questions...
  ]
};
```

### Connecting to Your Checkout

Edit `survey.js` around line 348:

```javascript
function handleCTAClick() {
    // ... tracking code ...

    setTimeout(() => {
        // REPLACE THIS with your actual checkout URL
        const checkoutURL = `https://your-stripe-link.com?product=${state.tripwire.id}`;
        window.location.href = checkoutURL;
    }, 2000);
}
```

**Popular checkout options:**
- Stripe Payment Links
- ThriveCart
- Gumroad
- PayPal
- Your custom checkout page

### Analytics Integration

The system automatically tracks events to `localStorage`. To send data to external services, edit `survey.js`:

```javascript
function trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, data);
    }

    // Your custom API
    fetch('https://your-api.com/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, ...data })
    });
}
```

## 📊 Understanding Analytics

### Key Metrics

The dashboard tracks these important metrics for each tripwire:

1. **Page Views** - How many people landed on the survey
2. **Survey Starts** - How many began answering questions
3. **Survey Completes** - How many finished all questions
4. **Offer Views** - How many saw the tripwire offer
5. **CTA Clicks** - How many clicked the buy button
6. **Conversion Rate** - (CTA Clicks / Offer Views) × 100

### Benchmarks

- **Good conversion rate**: 15-25%
- **Great conversion rate**: 25-40%
- **Exceptional conversion rate**: 40%+

### Testing Strategy

1. **Week 1**: Run tripwire1, collect 100+ offer views
2. **Week 2**: Run tripwire2, collect 100+ offer views
3. **Week 3**: Run tripwire3, collect 100+ offer views
4. **Week 4**: Use the winner with highest conversion rate

## 🎨 Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4F46E5;     /* Main brand color */
    --success-color: #10B981;     /* CTA button color */
    --text-primary: #1F2937;      /* Main text color */
    /* ... more variables ... */
}
```

### Adding Your Logo

Edit `index.html` and add an image in the header:

```html
<div class="survey-header">
    <img src="your-logo.png" alt="Your Brand" style="max-width: 200px; margin-bottom: 20px;">
    <h1 class="survey-title">Help Us Help You Better</h1>
    <!-- ... -->
</div>
```

### Changing Images

Replace the placeholder image URLs in `config.js`:

```javascript
image: 'https://via.placeholder.com/400x300/...'  // Change this
```

**Recommended image specs:**
- Size: 400×300 pixels (or 800×600 for retina)
- Format: JPG or PNG
- File size: Under 200KB for fast loading
- Content: Show the product/mockup

## 🚀 Deployment

### Option 1: Simple Hosting

Upload all files to any web host:
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Your cPanel hosting
- AWS S3 + CloudFront

### Option 2: GitHub Pages (Free)

```bash
git add .
git commit -m "Add tripwire survey"
git push origin main

# Then enable GitHub Pages in your repo settings
```

Your survey will be live at: `https://yourusername.github.io/repository-name/`

### Option 3: Netlify (Free + Custom Domain)

1. Drag and drop your folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your site is live instantly
3. Optional: Add custom domain in settings

## 📈 Optimization Tips

### Increase Conversion Rates

1. **Match offer to survey answers** - Show relevant tripwires based on responses
2. **Test urgency copy** - Try different scarcity/urgency statements
3. **Improve headlines** - Focus on outcomes, not features
4. **Add social proof** - Include testimonials or user counts
5. **Reduce friction** - Make questions easy and quick to answer
6. **Strengthen guarantee** - Be more specific about your promise

### Speed Optimization

The system is already optimized for speed, but you can:

1. **Compress images** - Use TinyPNG or similar tools
2. **Use a CDN** - Host images on Cloudflare or AWS CloudFront
3. **Enable caching** - Set proper cache headers on your server
4. **Minimize file sizes** - Remove unused CSS/JS if you customize

## 🔒 Privacy & GDPR

To comply with privacy laws:

1. Add a privacy policy link in the footer
2. Add cookie consent if using third-party analytics
3. Store minimal data (current setup only uses localStorage)
4. Add a "Delete My Data" button if required in your jurisdiction

Example footer addition:

```html
<div class="footer">
    <a href="/privacy">Privacy Policy</a> |
    <a href="/terms">Terms of Service</a>
</div>
```

## 🐛 Troubleshooting

### Analytics Not Showing

- Make sure you've visited `index.html` first to generate data
- Check browser console for errors (F12)
- Ensure localStorage is enabled in browser settings

### Tripwire Not Changing

- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Verify you edited `config.js` correctly
- Check browser console for JavaScript errors

### Images Not Loading

- Verify image URLs are publicly accessible
- Check for HTTPS/HTTP mixed content issues
- Test image URL in browser address bar

### Slow Loading

- Compress images (should be under 200KB)
- Check your hosting server response time
- Use browser developer tools Network tab to identify bottlenecks

## 📱 Testing Checklist

Before launching, test:

- [ ] Survey works on mobile (iOS Safari, Android Chrome)
- [ ] Survey works on tablet (iPad, Android tablet)
- [ ] Survey works on desktop (Chrome, Firefox, Safari, Edge)
- [ ] All tripwires load correctly
- [ ] Analytics tracking works
- [ ] CTA button redirects correctly
- [ ] Images load fast
- [ ] Text is readable on all devices
- [ ] Questions are clear and concise
- [ ] Guarantee and urgency copy is compelling

## 💡 Advanced Features

### Add Email Capture

Insert before the offer:

```html
<div class="email-capture">
    <h3>Enter your email to see your personalized offer:</h3>
    <input type="email" id="email" placeholder="your@email.com" required>
    <button onclick="captureEmail()">Continue</button>
</div>
```

### Dynamic Tripwire Selection

Show different tripwires based on survey answers:

```javascript
function selectTripwireBasedOnAnswers() {
    const answer1 = state.answers.q0;

    if (answer1.includes('time')) {
        return TRIPWIRES.tripwire1;  // Productivity offer
    } else if (answer1.includes('results')) {
        return TRIPWIRES.tripwire2;  // Performance offer
    } else {
        return TRIPWIRES.tripwire3;  // Default offer
    }
}
```

### Countdown Timer

Add urgency with a countdown:

```javascript
let timeLeft = 300; // 5 minutes
setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}, 1000);
```

## 🤝 Support

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Review this README for troubleshooting steps
3. Verify all file paths are correct
4. Test in a different browser
5. Clear cache and try again

## 📄 License

This is a commercial tool for your business. Use it to sell as many tripwires as you want!

---

## 🎯 Quick Checklist to Get Started

1. [ ] Open `config.js` and customize your tripwire offers
2. [ ] Replace placeholder images with your product images
3. [ ] Update survey questions to match your audience
4. [ ] Configure your checkout URL in `survey.js`
5. [ ] Test the survey on mobile and desktop
6. [ ] Deploy to your hosting service
7. [ ] Start sending traffic and tracking conversions!

---

**Built for speed, optimized for conversions. Now go make some sales! 🚀**
