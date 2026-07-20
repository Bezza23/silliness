const introScreen = document.getElementById('intro-screen');
const landingScreen = document.getElementById('landing-screen');
const loadingScreen = document.getElementById('loading-screen');
const musicScreen = document.getElementById('music-screen');
const finalScreen = document.getElementById('final-screen');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const choiceArea = document.getElementById('choice-area');
const heartLayer = document.getElementById('heart-layer');
const loadingCopy = document.getElementById('loading-copy');
const loaderFill = document.getElementById('loader-fill');
const loadingResult = document.getElementById('loading-result');
const prevSlide = document.getElementById('prev-slide');
const nextSlide = document.getElementById('next-slide');
const finishButton = document.getElementById('finish-button');
const finalMessage = document.getElementById('final-message');
const restartButton = document.getElementById('restart-button');
const finalYesButtons = document.querySelectorAll('[data-final-yes]');
const cards = Array.from(document.querySelectorAll('.gallery-card'));

let noChaseCount = 0;
let noLocked = false;
let activeSlide = 1;
let heartIntervalId = null;
let introTimerId = null;
let heartsStarted = false;
let yesArmed = false;

function showScreen(targetScreen) {
  [introScreen, landingScreen, loadingScreen, musicScreen, finalScreen].forEach((screen) => {
    const isActive = screen === targetScreen;
    screen.classList.toggle('screen--active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
  });
}

function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = '♥';
  const size = 18 + Math.random() * 24;
  const left = Math.random() * 100;
  const duration = 6500 + Math.random() * 3000;
  heart.style.left = `${left}%`;
  heart.style.setProperty('--size', `${size}px`);
  heart.style.setProperty('--duration', `${duration}ms`);
  heart.style.opacity = '0';
  heartLayer.appendChild(heart);
  window.setTimeout(() => heart.remove(), duration);
}

function startHearts() {
  if (heartsStarted) {
    return;
  }

  heartsStarted = true;
  spawnHeart();
  heartIntervalId = window.setInterval(spawnHeart, 700);
}

function stopHearts() {
  if (heartIntervalId !== null) {
    window.clearInterval(heartIntervalId);
    heartIntervalId = null;
  }

  heartsStarted = false;
}

function enterLandingScreen() {
  showScreen(landingScreen);
  startHearts();
}

function positionNoButton() {
  if (window.innerWidth <= 640) {
    return;
  }

  const areaRect = choiceArea.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, areaRect.width - buttonRect.width);
  const maxY = Math.max(0, areaRect.height - buttonRect.height);
  const nextLeft = Math.random() * maxX;
  const nextTop = Math.random() * maxY;

  noButton.style.left = `${nextLeft}px`;
  noButton.style.top = `${nextTop}px`;
}

function updateNoButtonLabel() {
  const labels = ['No', 'Nope', 'Be Serious', 'Wrong Answer Bitch', 'Just Press Yes'];
  const nextLabel = labels[Math.min(noChaseCount, labels.length - 1)];
  noButton.textContent = nextLabel;

  if (noChaseCount >= 4) {
    noLocked = true;
    noButton.classList.add('is-locked');
    noButton.setAttribute('aria-disabled', 'true');
    noButton.tabIndex = -1;
  }
}

function chaseNoButton() {
  if (noLocked) {
    return;
  }

  noChaseCount += 1;
  updateNoButtonLabel();
  positionNoButton();
}

function startLoadingSequence() {
  loadingCopy.querySelectorAll('p').forEach((step) => {
    step.style.opacity = '1';
  });
  loaderFill.style.width = '0';
  loadingResult.style.opacity = '0';
  showScreen(loadingScreen);
  const steps = loadingCopy.querySelectorAll('p');
  const progress = [20, 48, 76, 100];

  steps.forEach((step, index) => {
    step.style.opacity = '0.2';
    window.setTimeout(() => {
      step.style.opacity = '1';
    }, index * 650);
  });

  progress.forEach((value, index) => {
    window.setTimeout(() => {
      loaderFill.style.width = `${value}%`;
    }, 300 + index * 700);
  });

  window.setTimeout(() => {
    loadingResult.style.opacity = '1';
  }, 2950);

  window.setTimeout(() => {
    showScreen(musicScreen);
  }, 3900);
}

function setActiveSlide(nextSlideNumber) {
  activeSlide = nextSlideNumber;
  cards.forEach((card) => {
    const isActive = Number(card.dataset.slide) === activeSlide;
    card.classList.toggle('gallery-card--active', isActive);
    card.setAttribute('aria-hidden', String(!isActive));
  });

  prevSlide.disabled = activeSlide === 1;
  nextSlide.textContent = activeSlide === cards.length ? 'Done' : 'Next';
}

function goToNextSlide() {
  if (activeSlide < cards.length) {
    setActiveSlide(activeSlide + 1);
    return;
  }

  showScreen(finalScreen);
}

function goToPreviousSlide() {
  if (activeSlide > 1) {
    setActiveSlide(activeSlide - 1);
  }
}

function finishGallery() {
  showScreen(finalScreen);
}

function resetFlow() {
  if (introTimerId !== null) {
    window.clearTimeout(introTimerId);
    introTimerId = null;
  }

  stopHearts();
  noChaseCount = 0;
  noLocked = false;
  yesArmed = false;
  activeSlide = 1;

  noButton.classList.remove('is-locked');
  noButton.removeAttribute('aria-disabled');
  noButton.tabIndex = 0;
  noButton.textContent = 'No';
  noButton.style.left = '';
  noButton.style.top = '';

  finalMessage.textContent = '';
  restartButton.hidden = true;
  loadingResult.style.opacity = '0';
  loaderFill.style.width = '0';
  loadingCopy.querySelectorAll('p').forEach((step) => {
    step.style.opacity = '1';
  });

  setActiveSlide(1);
  updateNoButtonLabel();
  positionNoButton();
  showScreen(introScreen);
  introTimerId = window.setTimeout(enterLandingScreen, 2000);
}

yesButton.addEventListener('pointerdown', () => {
  yesArmed = true;
});

yesButton.addEventListener('click', (event) => {
  if (!event.isTrusted || !yesArmed) {
    return;
  }

  yesArmed = false;
  startLoadingSequence();
});

noButton.addEventListener('pointerenter', chaseNoButton);
noButton.addEventListener('focus', chaseNoButton);
noButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  chaseNoButton();
});
noButton.addEventListener('click', (event) => {
  event.preventDefault();
  chaseNoButton();
});

nextSlide.addEventListener('click', goToNextSlide);
prevSlide.addEventListener('click', goToPreviousSlide);
finishButton.addEventListener('click', finishGallery);
restartButton.addEventListener('click', resetFlow);

finalYesButtons.forEach((button) => {
  button.addEventListener('click', () => {
    finalMessage.textContent = 'Good choice!!! There was never another option anyway';
    restartButton.hidden = false;
  });
});

window.addEventListener('resize', () => {
  if (!noLocked) {
    positionNoButton();
  }
});

setActiveSlide(1);
updateNoButtonLabel();
positionNoButton();

introTimerId = window.setTimeout(enterLandingScreen, 2000);
