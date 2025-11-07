# Prepper Codex Survey Funnel

A two-page interactive survey funnel designed for Facebook Ads traffic. Visitors complete a preparedness assessment, receive a unique reference number, and can claim a free survival ebook.

## 📁 Project Structure

```
/survey/
├── index.html          → Main Survey Page (10 questions)
├── thank-you.html      → Thank You / Claim Page
├── survey.css          → Shared Stylesheet
├── survey.js           → Form Logic & Navigation
└── README.md           → This file
```

## 🚀 Setup Instructions

### 1. Facebook Pixel Configuration

Update the Facebook Pixel ID in both HTML files:

**index.html** (line 13):
```javascript
fbq('init','YOUR_PIXEL_ID');
```

**thank-you.html** (line 13):
```javascript
fbq('init','YOUR_PIXEL_ID');
```

### 2. Formspree Configuration

Update the form submission endpoint in **thank-you.html** (line 39):
```html
<form id="claimForm" method="POST" action="https://formspree.io/f/YOUR_FORMSPREE_ID">
```

To get a Formspree ID:
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Replace `YOUR_FORMSPREE_ID` with your form's ID

### 3. Shopify Store Link

Update your Shopify domain in **thank-you.html** (line 29):
```html
href="https://YOURSHOPIFYDOMAIN.com/collections/books?utm_source=survey&utm_medium=thankyou&utm_campaign=freebook"
```

## ✨ Features

### Survey Flow
- **10 preparedness questions** covering:
  - Overall confidence level
  - Water storage
  - Food stockpile
  - Bug-out bag readiness
  - Medical preparedness
  - Self-defense capabilities
  - Alternative power sources
  - Wilderness/survival skills
  - Communication plan
  - Plan review frequency

- **Smooth UX**:
  - One question per screen
  - Animated transitions
  - Progress bar tracking
  - Back/Next navigation
  - Mobile-optimized

### Data Management
- Generates unique reference codes (PC-XXXXXX)
- Saves responses to localStorage
- Calculates preparedness score (0-50)
- Assigns preparedness level (Beginner to Elite)
- Pre-fills email on thank-you page

### Thank You Page
- Displays unique reference number
- Link to Shopify bookstore with UTM parameters
- Claim form with auto-filled data
- Facebook Pixel "Lead" event on submission
- Success message after form submission

## 🎨 Design

**Color Scheme:**
- Olive Green: `#556B2F`
- Sand/Tan: `#C2B280`
- Dark Charcoal: `#0D0D0D`
- Accent Gold: `#E9B44C`

**Typography:**
- System fonts for fast loading
- Large, readable type
- Mobile-optimized sizes

**Style:**
- Military/survival aesthetic
- High contrast for readability
- Rugged, tactical feel

## 📱 Mobile Responsive

Fully optimized for:
- Desktop (960px+)
- Tablet (768px - 959px)
- Mobile (< 768px)
- Small mobile (< 480px)

## 🔧 Customization

### Adding/Removing Questions

1. In **index.html**, add a new question block:
```html
<div class="q" data-q="X">
  <label class="q-title">Your question here?</label>
  <div class="options">
    <label><input type="radio" name="qX" value="1" required> Option 1</label>
    <!-- More options -->
  </div>
  <div class="nav">
    <button type="button" class="btn prev">Back</button>
    <button type="button" class="btn btn-primary next">Next</button>
  </div>
</div>
```

2. Update the score calculation in **survey.js** if needed.

### Changing Auto-Advance Behavior

In **survey.js** (lines 179-183), uncomment to enable auto-advance after selecting a radio button:
```javascript
setTimeout(() => {
  handleNext();
}, 300);
```

### Custom Webhook Instead of Formspree

Replace the form submission in **thank-you.html**:
```javascript
const response = await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(Object.fromEntries(formData))
});
```

## 📊 Analytics & Tracking

### Facebook Pixel Events

**PageView** - Fires on both pages automatically

**CompleteRegistration** - Fires when survey is completed (survey.js:135)
```javascript
fbq('track', 'CompleteRegistration', {
  content_name: 'Prepper Survey',
  status: 'completed',
  value: score,
});
```

**Lead** - Fires when claim form is submitted (thank-you.html:69)
```javascript
fbq('track', 'Lead', {
  content_name: 'Free Ebook Claim',
  content_category: 'Survey Completion',
  value: 0.00,
  currency: 'USD'
});
```

## ✅ Testing Checklist

- [ ] All 10 questions load correctly
- [ ] Progress bar updates smoothly
- [ ] Next/Back navigation works
- [ ] Form validation prevents skipping questions
- [ ] Reference code generates and displays
- [ ] localStorage saves data
- [ ] Redirect to thank-you page works
- [ ] Reference number shows on thank-you page
- [ ] Email pre-fills in claim form
- [ ] Claim form submits successfully
- [ ] Success message appears after submission
- [ ] Facebook Pixel events fire (check with Pixel Helper)
- [ ] Mobile layout displays correctly
- [ ] Shopify link works with UTM parameters

## 🌐 Deployment

### Option 1: Static Hosting (Recommended)
- Upload to: Netlify, Vercel, GitHub Pages, or AWS S3
- No server required
- Works with any static host

### Option 2: Shopify Pages
- Create a new page in Shopify
- Paste the HTML content
- Link CSS/JS as external files or inline

### Option 3: Custom Domain
- Upload to your web host
- Point to `/survey/` directory
- Configure SSL certificate

## 🔒 Privacy & Compliance

Remember to add:
- Privacy policy link
- Terms of service
- GDPR compliance (if applicable)
- Cookie consent (if tracking users)

## 📈 Optimization Tips

1. **Load Speed**: All assets load inline for fast first paint
2. **SEO**: Add meta description and OG tags for social sharing
3. **A/B Testing**: Test different question orders or wording
4. **Lead Quality**: Add qualification questions early
5. **Conversion**: Test different CTA button text

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Verify Facebook Pixel ID is correct
3. Test Formspree endpoint separately
4. Ensure localStorage is enabled in browser

## 📄 License

Customize and use for your Prepper Codex business.

---

**Built for Prepper Codex** | Ready for Facebook Ads Traffic
