(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  /* ---------- Menus: one open at a time, tap outside to close ---------- */
  var toggles = document.querySelectorAll('.menu-toggle');

  function closeAll() {
    toggles.forEach(function (t) { t.checked = false; });
  }

  toggles.forEach(function (t) {
    t.addEventListener('change', function () {
      if (t.checked) {
        toggles.forEach(function (other) {
          if (other !== t) other.checked = false;
        });
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('menu-toggle')) return;
    if (e.target.closest('label')) return;
    if (e.target.closest('a')) closeAll();

    if (!e.target.closest('.contact-wrap') &&
        !e.target.closest('.lang-wrap') &&
        !e.target.closest('.main-bar') &&
        !e.target.closest('.mobile-menu') &&
        !e.target.closest('.search-panel') &&
        !e.target.closest('.account-panel')) {
      closeAll();
    }
  });

  /* ---------- Language (remembered across pages) ---------- */
  var langCurrent = document.querySelector('.lang-current');
  var textEls = document.querySelectorAll('[data-sw]');
  var phEls = document.querySelectorAll('[data-sw-placeholder]');
  var altEls = document.querySelectorAll('[data-sw-alt]');

  textEls.forEach(function (el) { el.dataset.en = el.textContent.trim(); });
  phEls.forEach(function (el) { el.dataset.enPlaceholder = el.placeholder; });
  altEls.forEach(function (el) { el.dataset.enAlt = el.alt; });

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    textEls.forEach(function (el) {
      el.textContent = lang === 'sw' ? el.dataset.sw : el.dataset.en;
    });
    phEls.forEach(function (el) {
      el.placeholder = lang === 'sw' ? el.dataset.swPlaceholder : el.dataset.enPlaceholder;
    });
    altEls.forEach(function (el) {
      el.alt = lang === 'sw' ? el.dataset.swAlt : el.dataset.enAlt;
    });
    if (langCurrent) {
      langCurrent.textContent = lang === 'sw' ? 'Swahili' : 'English (UK)';
    }
    try { localStorage.setItem('breezeLang', lang); } catch (e) {}
  }

  document.querySelectorAll('.lang-menu a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      setLanguage(link.dataset.lang === 'Swahili' ? 'sw' : 'en');
      closeAll();
    });
  });

  var saved = null;
  try { saved = localStorage.getItem('breezeLang'); } catch (e) {}
  if (saved === 'sw') setLanguage('sw');

  /* ---------- Top strip slides away on scroll down, returns on scroll up ---------- */
  var lastY = window.pageYOffset;
  var hidden = false;
  var ticking = false;

  function setHidden(value) {
    if (hidden === value) return;
    hidden = value;
    header.classList.toggle('top-hidden', value);
    document.body.classList.toggle('header-collapsed', value);
  }

  function onScroll() {
    var y = window.pageYOffset;
    var diff = y - lastY;

    if (y < 80) {
      setHidden(false);
      lastY = y;
    } else if (diff > 8) {
      setHidden(true);
      lastY = y;
    } else if (diff < -8) {
      setHidden(false);
      lastY = y;
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    closeAll();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* ---------- Search across the site ---------- */
  // [title, short description, link, keywords in both languages]
  var ITEMS = [
    ['Fresh Clothes, Spotless Spaces, Back to You in 24 Hours', 'Expert care for every fabric, with free pickup and delivery across the city.', 'index.html#home', 'nguo safi nyumba safi saa 24 huduma'],
    ['Wash & Fold', 'Everyday clothes washed, dried and neatly folded, ready to go back into your wardrobe.', 'index.html#services', 'osha na kukunja kufua nguo'],
    ['Dry Cleaning', 'Special care for suits, dresses and other garments that need a gentler cleaning process.', 'index.html#services', 'kusafisha kikavu suti magauni'],
    ['Ironing & Pressing', 'Get your clothes looking neat and presentable with professional pressing and finishing.', 'index.html#services', 'kupiga pasi pasi'],
    ['Bedding & Household', 'Freshen up bedsheets, duvet covers, blankets and other household fabrics.', 'index.html#services', 'mashuka na vitu vya nyumbani duvet blanketi'],
    ['How long does it take?', 'Most orders are ready within 24 hours. Dry cleaning and large items may take up to 48 hours.', 'index.html#faq', 'inachukua muda gani saa'],
    ['Do you offer free pickup and delivery?', 'Yes. We collect and return your items at no extra cost within our service area.', 'index.html#faq', 'je mnatoa kuchukua na kurudisha bure pickup delivery'],
    ['Which areas do you cover?', 'We currently serve the main neighbourhoods of Nairobi.', 'index.html#faq', 'mnahudumia maeneo gani eneo nairobi'],
    ['How do I pay?', 'You can pay by M-Pesa, cash on delivery, or card.', 'index.html#faq', 'ninalipaje malipo mpesa pesa taslimu kadi'],
    ['What if I\'m not home at pickup time?', 'Leave clear instructions with the guard or a neighbour, or message us to reschedule.', 'index.html#faq', 'nisipokuwepo wakati wa kuchukuliwa je'],
    ['Do you handle delicate or special fabrics?', 'Silk, wool, leather, and beaded pieces get individual care.', 'index.html#faq', 'mnashughulikia vitambaa maridadi au maalum hariri sufu ngozi'],
    ['What if a stain doesn\'t come out?', 'We treat every stain before washing and tell you honestly before we finish.', 'index.html#faq', 'vipi kama doa halitoki madoa'],
    ['What if an item gets damaged or lost?', 'Please contact us within 48 hours of delivery.', 'index.html#faq', 'vipi kama kitu kimeharibika au kupotea'],
    ['Can I cancel or change my booking?', 'Yes, free of charge up to 2 hours before pickup.', 'index.html#faq', 'naweza kughairi au kubadilisha oda yangu'],
    ['How It Works', 'Book your service, we collect your laundry, professional cleaning, fresh laundry delivered.', 'how-it-works.html', 'jinsi inavyofanya kazi hatua'],
    ['Book a Pickup', 'Book your laundry pickup, choose a service, and schedule a time.', 'booking.html', 'omba kuchukuliwa oda weka booking'],
    ['Feedback and Complaints', 'Send feedback, a complaint or a suggestion, and leave your phone number.', 'feedback.html', 'maoni na malalamiko pendekezo pongezi']
  ];

  var input = document.querySelector('.search-input');
  var panel = document.querySelector('.search-panel');

  if (input && panel) {
    var results = document.createElement('div');
    results.className = 'search-results';
    panel.appendChild(results);

    function search(query) {
      results.innerHTML = '';
      var words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;

      var matches = ITEMS.filter(function (item) {
        var haystack = (item[0] + ' ' + item[1] + ' ' + item[3]).toLowerCase();
        return words.every(function (w) { return haystack.indexOf(w) !== -1; });
      });

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = 'No results for "' + query.trim() + '". Try another word, such as services, pricing, pickup or FAQ.';
        results.appendChild(empty);
        return;
      }

      matches.slice(0, 8).forEach(function (item) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = item[2];

        var title = document.createElement('strong');
        title.textContent = item[0];

        var snippet = document.createElement('span');
        snippet.textContent = item[1].length > 110 ? item[1].slice(0, 110) + '…' : item[1];

        link.appendChild(title);
        link.appendChild(snippet);
        results.appendChild(link);
      });
    }

    input.addEventListener('input', function () { search(input.value); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = results.querySelector('.search-result');
        if (first) first.click();
      }
    });
  }
})();
