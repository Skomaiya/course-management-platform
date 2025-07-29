i18next.init({
  lng: 'en',
  resources
}, function(err, t) {
  updateContent();
});

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = i18next.t(el.getAttribute('data-i18n'));
  });

  // Update textarea placeholders
  const placeholderText = i18next.t('placeholder');
  document.getElementById('answer1').placeholder = placeholderText;
  document.getElementById('answer2').placeholder = placeholderText;
  document.getElementById('answer3').placeholder = placeholderText;

  // Reset saved message if it exists
  const savedMsg = document.getElementById('saved-msg');
  if (savedMsg) {
    savedMsg.innerText = '';
    savedMsg.style.display = 'none';
  }
}

function changeLanguage(lng) {
  i18next.changeLanguage(lng, () => {
    updateContent();
  });
  localStorage.setItem('preferredLang', lng);
}

// Load saved language on page load
const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
  changeLanguage(savedLang);
}

// Submit form and simulate saving response
document.getElementById('submit-btn').addEventListener('click', () => {
  const answer1 = document.getElementById('answer1').value.trim();
  const answer2 = document.getElementById('answer2').value.trim();
  const answer3 = document.getElementById('answer3').value.trim();

  // Don't save if all answers are empty
  if (!answer1 && !answer2 && !answer3) return;

  const responses = {
    answer1,
    answer2,
    answer3,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('reflectionResponses', JSON.stringify(responses));

  // Clear form
  document.getElementById('answer1').value = '';
  document.getElementById('answer2').value = '';
  document.getElementById('answer3').value = '';

  // Show success message
  let msg = document.getElementById('saved-msg');
  if (!msg) {
    msg = document.createElement('p');
    msg.id = 'saved-msg';
    msg.style.color = 'green';
    document.body.appendChild(msg);
  }
  msg.innerText = i18next.t('savedNote') || 'Responses saved locally!';
  msg.style.display = 'block';

  // Hide message after 4 seconds
  setTimeout(() => {
    msg.style.display = 'none';
  }, 5000);
});
