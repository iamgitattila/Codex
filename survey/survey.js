/**
 * Prepper Codex Survey - Main JavaScript
 * Handles multi-step form navigation, validation, and data persistence
 */

// DOM Elements
const form = document.getElementById('surveyForm');
const questions = [...form.querySelectorAll('.q')];
const progressBar = document.getElementById('progressBar');

// State
let currentQuestion = 0;

/**
 * Show a specific question by index
 * @param {number} index - Question index to display
 */
function showQuestion(index) {
  // Remove active class from all questions
  questions.forEach(q => q.classList.remove('active'));

  // Add active class to current question
  questions[index].classList.add('active');

  // Update progress bar
  const progress = ((index + 1) / questions.length) * 100;
  progressBar.style.width = progress + '%';

  // Scroll to top smoothly
  const surveySection = document.getElementById('survey');
  if (surveySection) {
    surveySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Validate current question before proceeding
 * @returns {boolean} - True if valid
 */
function validateCurrentQuestion() {
  const currentQ = questions[currentQuestion];
  const inputs = currentQ.querySelectorAll('input[required], textarea[required]');

  for (let input of inputs) {
    if (input.type === 'radio') {
      const name = input.name;
      const checked = currentQ.querySelector(`input[name="${name}"]:checked`);
      if (!checked) {
        alert('Please select an answer before continuing.');
        return false;
      }
    } else if (!input.value.trim()) {
      alert('Please fill in all required fields.');
      input.focus();
      return false;
    }
  }

  return true;
}

/**
 * Handle next button click
 */
function handleNext() {
  if (!validateCurrentQuestion()) {
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(currentQuestion);
  }
}

/**
 * Handle previous button click
 */
function handlePrevious() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
}

/**
 * Generate unique reference code
 * @returns {string} - Reference code in format PC-XXXXXX
 */
function generateReferenceCode() {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'PC-' + randomString;
}

/**
 * Calculate preparedness score from survey answers
 * @param {Object} data - Survey form data
 * @returns {number} - Score from 0-50
 */
function calculateScore(data) {
  let score = 0;
  for (let i = 1; i <= 10; i++) {
    const answer = data['q' + i];
    if (answer) {
      score += parseInt(answer);
    }
  }
  return score;
}

/**
 * Get preparedness level based on score
 * @param {number} score - Total score
 * @returns {string} - Preparedness level description
 */
function getPreparednessLevel(score) {
  if (score <= 15) return 'Beginner Prepper';
  if (score <= 25) return 'Intermediate Prepper';
  if (score <= 35) return 'Advanced Prepper';
  if (score <= 45) return 'Expert Prepper';
  return 'Elite Survivalist';
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
function handleSubmit(e) {
  e.preventDefault();

  // Validate final question
  if (!validateCurrentQuestion()) {
    return;
  }

  // Collect all form data
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Generate reference code
  const referenceCode = generateReferenceCode();
  data.ref = referenceCode;

  // Calculate score and level
  const score = calculateScore(data);
  data.score = score;
  data.level = getPreparednessLevel(score);

  // Add timestamp
  data.timestamp = new Date().toISOString();

  // Save to localStorage
  localStorage.setItem('prepper_ref', referenceCode);
  localStorage.setItem('prepper_survey', JSON.stringify(data));

  // Track with Facebook Pixel if available
  if (typeof fbq !== 'undefined') {
    fbq('track', 'CompleteRegistration', {
      content_name: 'Prepper Survey',
      status: 'completed',
      value: score,
    });
  }

  // Redirect to thank you page
  window.location.href = 'thank-you.html?ref=' + referenceCode;
}

/**
 * Event delegation for button clicks
 */
form.addEventListener('click', function(e) {
  // Handle Next button
  if (e.target.classList.contains('next')) {
    e.preventDefault();
    handleNext();
  }

  // Handle Previous button
  if (e.target.classList.contains('prev')) {
    e.preventDefault();
    handlePrevious();
  }
});

/**
 * Handle form submission
 */
form.addEventListener('submit', handleSubmit);

/**
 * Allow Enter key to advance on radio selections
 */
form.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.type === 'radio') {
    e.preventDefault();
    handleNext();
  }
});

/**
 * Auto-advance when radio button is selected (optional enhancement)
 */
const radioInputs = form.querySelectorAll('input[type="radio"]');
radioInputs.forEach(radio => {
  radio.addEventListener('change', function() {
    // Optional: Auto-advance after a short delay
    // Uncomment the following lines to enable auto-advance:
    // setTimeout(() => {
    //   handleNext();
    // }, 300);
  });
});

/**
 * Set current year in footer
 */
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/**
 * Initialize - show first question
 */
showQuestion(currentQuestion);

/**
 * Smooth scroll for "Start Survey" link
 */
document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.querySelector('a[href="#survey"]');
  if (startButton) {
    startButton.addEventListener('click', function(e) {
      e.preventDefault();
      const surveySection = document.getElementById('survey');
      if (surveySection) {
        surveySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateReferenceCode,
    calculateScore,
    getPreparednessLevel,
  };
}
