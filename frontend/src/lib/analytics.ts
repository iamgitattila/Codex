// Google Analytics 4
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const FB_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) return

  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `
  document.head.appendChild(script2)
}

// Initialize Facebook Pixel
export const initFBPixel = () => {
  if (!FB_PIXEL_ID) return

  const script = document.createElement('script')
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `
  document.head.appendChild(script)
}

// Track page view
export const trackPageView = (url: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track events
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// E-commerce tracking
export const trackPurchase = (courseId: number, courseName: string, price: number) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [
        {
          item_id: courseId,
          item_name: courseName,
          price: price,
          quantity: 1,
        },
      ],
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: price,
      currency: 'USD',
      content_name: courseName,
      content_ids: [courseId],
      content_type: 'product',
    })
  }
}

// Track course view
export const trackCourseView = (courseId: number, courseName: string) => {
  trackEvent('view_item', {
    item_id: courseId,
    item_name: courseName,
  })

  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: courseName,
      content_ids: [courseId],
      content_type: 'product',
    })
  }
}

// Track add to cart
export const trackAddToCart = (courseId: number, courseName: string, price: number) => {
  trackEvent('add_to_cart', {
    item_id: courseId,
    item_name: courseName,
    price: price,
  })

  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: price,
      currency: 'USD',
      content_name: courseName,
      content_ids: [courseId],
      content_type: 'product',
    })
  }
}

// Track registration
export const trackRegistration = () => {
  trackEvent('sign_up', {
    method: 'email',
  })

  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration')
  }
}

// Track login
export const trackLogin = () => {
  trackEvent('login', {
    method: 'email',
  })
}

// Track exam completion
export const trackExamCompletion = (courseId: number, courseName: string, passed: boolean, score: number) => {
  trackEvent('exam_completion', {
    course_id: courseId,
    course_name: courseName,
    passed: passed,
    score: score,
  })

  if (passed && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: courseName,
      value: score,
    })
  }
}

// Initialize analytics on app load
export const initAnalytics = () => {
  initGA()
  initFBPixel()
}
