/* ==========================================================================
   ATRSSASAW - INTERACTIVE JAVASCRIPT
   Pastel Spongebob Aesthetic Features & Audio Synthesizer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Audio System (Web Audio API)
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('atrssasaw_sound') !== 'muted';

  const soundToggleBtn = document.getElementById('sound-toggle');

  function updateSoundButtonUI() {
    if (soundToggleBtn) {
      soundToggleBtn.innerHTML = isSoundEnabled ? '🔊' : '🔇';
      soundToggleBtn.title = isSoundEnabled ? 'Suara aktif (klik untuk mute)' : 'Suara bisu (klik untuk aktifkan)';
    }
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Cute Bubble Pop Sound
  function playPopSound(freq = 600) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Pitch envelope: quick upward sweep then drop
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Audio fallback silent
    }
  }

  // Cute Success Chime (for copying or saving)
  function playChimeSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch (e) {}
  }

  if (soundToggleBtn) {
    updateSoundButtonUI();
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('atrssasaw_sound', isSoundEnabled ? 'active' : 'muted');
      updateSoundButtonUI();
      if (isSoundEnabled) {
        playPopSound(750);
        showToast('Suara efek aktif! 🫧');
      } else {
        showToast('Suara efek dimatikan 🔇');
      }
    });
  }

  // 2. Floating Bubbles Generator
  const bubbleContainer = document.getElementById('bubble-container');
  if (bubbleContainer) {
    const maxBubbles = 14;

    function createBubble() {
      if (document.querySelectorAll('.floating-bubble').length >= maxBubbles) return;

      const bubble = document.createElement('div');
      bubble.classList.add('floating-bubble');

      const size = Math.floor(Math.random() * 32) + 22; // 22px to 54px
      const leftPos = Math.random() * 96; // 0% to 96%
      const duration = Math.random() * 9 + 8; // 8s to 17s

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${leftPos}%`;
      bubble.style.animationDuration = `${duration}s`;

      const shine = document.createElement('div');
      shine.classList.add('bubble-shine');
      bubble.appendChild(shine);

      // Click to pop
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        playPopSound(Math.floor(Math.random() * 300) + 500);

        // Pop burst animation
        bubble.style.transform = 'scale(1.4)';
        bubble.style.opacity = '0';
        bubble.style.transition = 'all 0.12s ease-out';
        setTimeout(() => bubble.remove(), 120);
      });

      bubbleContainer.appendChild(bubble);

      setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
      }, duration * 1000);
    }

    // Spawn initial batch
    for (let i = 0; i < 6; i++) {
      setTimeout(createBubble, i * 450);
    }
    // Continue periodic spawn
    setInterval(createBubble, 1400);
  }

  // 3. Spongebob Quotes / Mood Generator
  const quotes = [
    { text: "Aku siap! Aku siap! Menghadapi hari dengan senyuman terbaik! 🧽✨", author: "SpongeBob SquarePants" },
    { text: "Pengetahuan tidak bisa menggantikan persahabatan yang tulus. 🌸", author: "Patrick Star" },
    { text: "Kalau kamu butuh teman cerita, aku selalu di sini kok! 🫧", author: "Sastra (atrssasaw)" },
    { text: "Hidup itu seru kalau dinikmati dengan santai dan penuh rasa syukur. 🌊", author: "Bikini Bottom Wisdom" },
    { text: "Kabel LAN udah di-crimping rapi, tinggal nge-ping ke masa depan cerah! 💻", author: "Anak TKJ Moklet" },
    { text: "Tersenyumlah! Siapa tahu senyummu bisa bikin hari seseorang jadi lebih indah. ✨", author: "SpongeBob SquarePants" },
    { text: "Jangan lupa istirahat dan dengerin musik favoritmu hari ini ya! 🎵", author: "Sastra" }
  ];

  const quoteTextElem = document.getElementById('spongebob-quote-text');
  const quoteAuthorElem = document.getElementById('spongebob-quote-author');
  const quoteBtn = document.getElementById('new-quote-btn');

  if (quoteBtn && quoteTextElem && quoteAuthorElem) {
    let currentQuoteIdx = 0;
    quoteBtn.addEventListener('click', () => {
      playPopSound(680);
      currentQuoteIdx = (currentQuoteIdx + 1) % quotes.length;
      
      quoteTextElem.style.opacity = '0';
      quoteAuthorElem.style.opacity = '0';
      
      setTimeout(() => {
        quoteTextElem.textContent = `"${quotes[currentQuoteIdx].text}"`;
        quoteAuthorElem.textContent = `— ${quotes[currentQuoteIdx].author}`;
        quoteTextElem.style.opacity = '1';
        quoteAuthorElem.style.opacity = '1';
      }, 200);
    });
  }

  // 4. Toast Notification
  const toastElem = document.getElementById('toast-notification');
  let toastTimer = null;

  function showToast(message) {
    if (!toastElem) return;
    toastElem.querySelector('.toast-message').textContent = message;
    toastElem.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElem.classList.remove('show');
    }, 2800);
  }

  // 5. Copy to Clipboard
  document.querySelectorAll('.copy-handle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-handle');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          playChimeSound();
          showToast(`Tersalin! "${textToCopy}" ✨`);
        }).catch(() => {
          showToast(`Username: ${textToCopy}`);
        });
      }
    });
  });

  // 6. Interactive Guestbook / Virtual Notes
  const guestbookForm = document.getElementById('guestbook-form');
  const noteTextInput = document.getElementById('guestbook-note-input');
  const noteNameInput = document.getElementById('guestbook-name-input');
  const notesContainer = document.getElementById('guestbook-notes');

  const defaultNotes = [
    { text: "Hai Tara! Semangat terus belajarnya di SMK Telkom Malang! ✨", name: "Sahabat Moklet", time: "Kemarin" },
    { text: "Websitenya lucu banget aesthetic pastel! Spongebob vibes banget 🧽🌸", name: "Visitor Manis", time: "Hari ini" },
    { text: "Salam kenal dari sesama anak IT & TKJ! Sukses selalu yaa 💻🔌", name: "Teman Networking", time: "Baru saja" }
  ];

  function loadGuestbookNotes() {
    if (!notesContainer) return;
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('atrssasaw_guestbook') || '[]');
    } catch (e) {
      stored = [];
    }

    const allNotes = [...stored, ...defaultNotes];
    notesContainer.innerHTML = '';

    allNotes.forEach(item => {
      const card = document.createElement('div');
      card.className = 'sticky-note';
      card.innerHTML = `
        <p class="note-text">"${escapeHtml(item.text)}"</p>
        <div class="note-meta">
          <span class="note-author">~ ${escapeHtml(item.name || 'Teman')}</span>
          <span>${escapeHtml(item.time || 'Baru saja')}</span>
        </div>
      `;
      notesContainer.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (guestbookForm && noteTextInput && noteNameInput) {
    guestbookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = noteTextInput.value.trim();
      const name = noteNameInput.value.trim() || 'Teman Online';

      if (!text) {
        showToast('Ketik pesan singkat dulu yaa! 💌');
        return;
      }

      playChimeSound();

      let stored = [];
      try {
        stored = JSON.parse(localStorage.getItem('atrssasaw_guestbook') || '[]');
      } catch (err) {
        stored = [];
      }

      const newEntry = {
        text: text,
        name: name,
        time: 'Baru saja'
      };

      stored.unshift(newEntry);
      // Keep max 10 user notes
      if (stored.length > 10) stored.pop();
      localStorage.setItem('atrssasaw_guestbook', JSON.stringify(stored));

      noteTextInput.value = '';
      loadGuestbookNotes();
      showToast('Pesan manismu berhasil ditempel! 🎀✨');
    });

    loadGuestbookNotes();
  }

  // 7. Lightbox / Polaroid Zoom Modal
  const imageModal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  document.querySelectorAll('.polaroid-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.polaroid-img');
      const caption = card.querySelector('.polaroid-caption');
      if (imageModal && modalImg && img) {
        playPopSound(500);
        modalImg.src = img.src;
        if (modalCaption && caption) {
          modalCaption.textContent = caption.textContent;
        }
        imageModal.classList.add('active');
      }
    });
  });

  // Hero Childhood Photo Zoom
  const heroChildhoodCard = document.querySelector('.hero-childhood-card');
  if (heroChildhoodCard && imageModal && modalImg) {
    heroChildhoodCard.addEventListener('click', () => {
      const img = heroChildhoodCard.querySelector('.hero-childhood-img');
      const caption = heroChildhoodCard.querySelector('.hero-childhood-caption');
      if (img) {
        playPopSound(500);
        modalImg.src = img.src;
        if (modalCaption && caption) {
          modalCaption.textContent = caption.textContent;
        }
        imageModal.classList.add('active');
      }
    });
  }

  if (modalCloseBtn && imageModal) {
    modalCloseBtn.addEventListener('click', () => {
      imageModal.classList.remove('active');
    });
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        imageModal.classList.remove('active');
      }
    });
  }

  // Button pop sounds on all .btn-pastel
  document.querySelectorAll('.btn-pastel').forEach(btn => {
    btn.addEventListener('click', () => {
      playPopSound(720);
    });
  });
});
