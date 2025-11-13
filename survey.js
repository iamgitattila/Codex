/**
 * TRIPWIRE SURVEY - MAIN JAVASCRIPT
 * Handles survey flow, analytics, and offer presentation
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentQuestion: 0,
    answers: {},
    startTime: null,
    completionTime: null,
    tripwire: null,
    sessionId: generateSessionId()
};

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Survey initialized');

    // Load active tripwire
    state.tripwire = TRIPWIRES[ACTIVE_TRIPWIRE];

    if (!state.tripwire) {
        console.error('❌ No active tripwire found! Check config.js');
        return;
    }

    console.log('📦 Loaded tripwire:', state.tripwire.name);

    // Track page view
    trackEvent('page_view', {
        tripwire_id: state.tripwire.id,
        tripwire_name: state.tripwire.name
    });

    // Initialize survey
    initializeSurvey();

    // Record start time
    state.startTime = Date.now();
    trackEvent('survey_start');
});

// ============================================
// SURVEY INITIALIZATION
// ============================================
function initializeSurvey() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    SURVEY_CONFIG.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        container.appendChild(questionCard);
    });

    // Show first question
    showQuestion(0);

    // Setup event listeners
    setupEventListeners();
}

// ============================================
// CREATE QUESTION CARD
// ============================================
function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${index}`;
    card.style.display = 'none';

    const questionNumber = SURVEY_CONFIG.showQuestionNumbers
        ? `<div class="question-number">${index + 1}</div>`
        : '';

    const requiredIndicator = question.required
        ? '<span class="required-indicator">*</span>'
        : '';

    const optionsHTML = question.options.map((option, optIndex) => `
        <div class="answer-option" data-question="${index}" data-option="${optIndex}">
            <input
                type="radio"
                id="q${index}_opt${optIndex}"
                name="question_${index}"
                value="${option}"
                data-question="${index}"
            >
            <label for="q${index}_opt${optIndex}">${option}</label>
        </div>
    `).join('');

    card.innerHTML = `
        ${questionNumber}
        <h2 class="question-text">${question.question}${requiredIndicator}</h2>
        <div class="answer-options">
            ${optionsHTML}
        </div>
    `;

    return card;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Answer selection
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            handleAnswerSelection(radio);
        });
    });

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            handleAnswerSelection(this);
        });
    });

    // Next button
    document.getElementById('nextBtn').addEventListener('click', handleNextClick);

    // CTA button
    document.getElementById('ctaBtn').addEventListener('click', handleCTAClick);
}

// ============================================
// HANDLE ANSWER SELECTION
// ============================================
function handleAnswerSelection(radio) {
    const questionIndex = parseInt(radio.dataset.question);
    const answer = radio.value;

    // Store answer
    state.answers[`q${questionIndex}`] = answer;

    // Update UI
    const questionCard = document.getElementById(`question-${questionIndex}`);
    questionCard.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    radio.closest('.answer-option').classList.add('selected');

    // Enable next button
    document.getElementById('nextBtn').disabled = false;

    // Track answer
    trackEvent('question_answered', {
        question_index: questionIndex,
        question: SURVEY_CONFIG.questions[questionIndex].question,
        answer: answer
    });

    console.log('✅ Answer recorded:', {question: questionIndex, answer});
}

// ============================================
// HANDLE NEXT CLICK
// ============================================
function handleNextClick() {
    const currentQ = SURVEY_CONFIG.questions[state.currentQuestion];

    // Check if current question is required and answered
    if (currentQ.required && !state.answers[`q${state.currentQuestion}`]) {
        alert('Please answer this question to continue.');
        return;
    }

    // Move to next question
    const nextIndex = state.currentQuestion + 1;

    if (nextIndex < SURVEY_CONFIG.questions.length) {
        // Show next question
        showQuestion(nextIndex);
        state.currentQuestion = nextIndex;

        // Update progress
        updateProgress();

        // Track progress
        trackEvent('survey_progress', {
            question_index: nextIndex,
            progress_percent: Math.round((nextIndex / SURVEY_CONFIG.questions.length) * 100)
        });
    } else {
        // Survey complete - show offer
        completeSurvey();
    }
}

// ============================================
// SHOW QUESTION
// ============================================
function showQuestion(index) {
    // Hide all questions
    document.querySelectorAll('.question-card').forEach(card => {
        card.style.display = 'none';
        card.classList.remove('active');
    });

    // Show target question with animation
    const targetCard = document.getElementById(`question-${index}`);
    targetCard.style.display = 'block';
    setTimeout(() => targetCard.classList.add('active'), 10);

    // Disable next button until answer is selected
    const hasAnswer = state.answers[`q${index}`];
    document.getElementById('nextBtn').disabled = !hasAnswer;

    // Update button text for last question
    const nextBtn = document.getElementById('nextBtn');
    if (index === SURVEY_CONFIG.questions.length - 1) {
        nextBtn.innerHTML = `
            See My Exclusive Offer
            <svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// UPDATE PROGRESS BAR
// ============================================
function updateProgress() {
    const progress = ((state.currentQuestion + 1) / SURVEY_CONFIG.questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// ============================================
// COMPLETE SURVEY
// ============================================
function completeSurvey() {
    state.completionTime = Date.now();
    const timeSpent = Math.round((state.completionTime - state.startTime) / 1000);

    console.log('🎉 Survey completed in', timeSpent, 'seconds');

    // Track completion
    trackEvent('survey_complete', {
        time_spent_seconds: timeSpent,
        answers: state.answers
    });

    // Show offer
    showOffer();
}

// ============================================
// SHOW OFFER
// ============================================
function showOffer() {
    // Hide survey section
    document.getElementById('surveySection').classList.remove('active');

    // Populate offer details
    document.getElementById('offerHeadline').textContent = state.tripwire.headline;
    document.getElementById('offerSubheadline').textContent = state.tripwire.subheadline;
    document.getElementById('offerDescription').textContent = state.tripwire.description;
    document.getElementById('price').textContent = state.tripwire.price.toFixed(2);
    document.getElementById('urgency').textContent = state.tripwire.urgency;
    document.getElementById('ctaText').textContent = state.tripwire.cta;
    document.getElementById('guaranteeText').textContent = state.tripwire.guarantee;
    document.getElementById('productImage').src = state.tripwire.image;
    document.getElementById('productImage').alt = state.tripwire.name;

    // Populate benefits
    const benefitsList = document.getElementById('benefitsList');
    benefitsList.innerHTML = '';
    state.tripwire.benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        benefitsList.appendChild(li);
    });

    // Populate bullets
    const bulletsList = document.getElementById('bulletsList');
    bulletsList.innerHTML = '';
    state.tripwire.bullets.forEach(bullet => {
        const div = document.createElement('div');
        div.className = 'bullet-item';
        div.textContent = bullet;
        bulletsList.appendChild(div);
    });

    // Update progress bar to 100%
    document.getElementById('progressFill').style.width = '100%';

    // Show offer section with delay for smooth transition
    setTimeout(() => {
        document.getElementById('offerSection').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);

    // Track offer view
    trackEvent('offer_view', {
        tripwire_id: state.tripwire.id,
        tripwire_name: state.tripwire.name,
        price: state.tripwire.price
    });

    console.log('💰 Showing offer:', state.tripwire.name);
}

// ============================================
// HANDLE CTA CLICK
// ============================================
function handleCTAClick() {
    console.log('🛒 CTA clicked:', state.tripwire.name);

    // Track conversion
    trackEvent('cta_click', {
        tripwire_id: state.tripwire.id,
        tripwire_name: state.tripwire.name,
        price: state.tripwire.price,
        time_to_conversion: Math.round((Date.now() - state.startTime) / 1000)
    });

    // Show thank you screen
    showThankYou();

    // TODO: Replace with your actual checkout/payment URL
    // Redirect to checkout after 2 seconds
    setTimeout(() => {
        const checkoutURL = `https://your-checkout-url.com?product=${state.tripwire.id}&session=${state.sessionId}`;
        console.log('🔗 Would redirect to:', checkoutURL);

        // Uncomment to actually redirect:
        // window.location.href = checkoutURL;

        alert(`This is a demo. In production, you would redirect to:\n\n${checkoutURL}\n\nConfigure your checkout URL in survey.js line 348`);
    }, 2000);
}

// ============================================
// SHOW THANK YOU
// ============================================
function showThankYou() {
    document.getElementById('offerSection').classList.remove('active');

    setTimeout(() => {
        document.getElementById('thankYouSection').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

// ============================================
// ANALYTICS TRACKING
// ============================================
function trackEvent(eventName, data = {}) {
    if (!ANALYTICS_CONFIG.enabled) return;

    const event = {
        event: eventName,
        timestamp: new Date().toISOString(),
        session_id: state.sessionId,
        tripwire_id: state.tripwire?.id,
        tripwire_name: state.tripwire?.name,
        ...data
    };

    console.log('📊 Event tracked:', eventName, data);

    // Store in localStorage
    storeAnalytics(event);

    // TODO: Send to your analytics service
    // Example: Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }

    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, data);
    }

    // Example: Your custom API
    // fetch('/api/analytics', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(event)
    // });
}

// ============================================
// STORE ANALYTICS IN LOCALSTORAGE
// ============================================
function storeAnalytics(event) {
    try {
        const key = ANALYTICS_CONFIG.storageKey;
        const stored = localStorage.getItem(key);
        const analytics = stored ? JSON.parse(stored) : [];

        analytics.push(event);

        // Keep last 1000 events
        if (analytics.length > 1000) {
            analytics.splice(0, analytics.length - 1000);
        }

        localStorage.setItem(key, JSON.stringify(analytics));
    } catch (e) {
        console.warn('Could not store analytics:', e);
    }
}

// ============================================
// GET ANALYTICS DATA
// ============================================
function getAnalytics() {
    try {
        const key = ANALYTICS_CONFIG.storageKey;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Could not retrieve analytics:', e);
        return [];
    }
}

// ============================================
// CALCULATE CONVERSION METRICS
// ============================================
function calculateMetrics() {
    const events = getAnalytics();

    const metrics = {
        tripwires: {}
    };

    // Group by tripwire
    const tripwireIds = [...new Set(events.map(e => e.tripwire_id).filter(Boolean))];

    tripwireIds.forEach(tripwireId => {
        const tripwireEvents = events.filter(e => e.tripwire_id === tripwireId);
        const tripwireName = tripwireEvents[0]?.tripwire_name || tripwireId;

        const pageViews = tripwireEvents.filter(e => e.event === 'page_view').length;
        const surveyStarts = tripwireEvents.filter(e => e.event === 'survey_start').length;
        const surveyCompletes = tripwireEvents.filter(e => e.event === 'survey_complete').length;
        const offerViews = tripwireEvents.filter(e => e.event === 'offer_view').length;
        const ctaClicks = tripwireEvents.filter(e => e.event === 'cta_click').length;

        const startRate = pageViews > 0 ? (surveyStarts / pageViews * 100).toFixed(2) : 0;
        const completionRate = surveyStarts > 0 ? (surveyCompletes / surveyStarts * 100).toFixed(2) : 0;
        const conversionRate = offerViews > 0 ? (ctaClicks / offerViews * 100).toFixed(2) : 0;

        metrics.tripwires[tripwireId] = {
            name: tripwireName,
            pageViews,
            surveyStarts,
            surveyCompletes,
            offerViews,
            ctaClicks,
            startRate: `${startRate}%`,
            completionRate: `${completionRate}%`,
            conversionRate: `${conversionRate}%`
        };
    });

    return metrics;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Make functions available globally for admin dashboard
window.surveyApp = {
    getAnalytics,
    calculateMetrics,
    state
};

// ============================================
// PERFORMANCE MONITORING
// ============================================
if (window.performance && window.performance.timing) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('⚡ Page load time:', pageLoadTime + 'ms');

            trackEvent('performance', {
                page_load_time: pageLoadTime,
                dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.navigationStart
            });
        }, 0);
    });
}

console.log('✅ Survey script loaded successfully');
