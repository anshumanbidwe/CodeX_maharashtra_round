'use strict';

    /*
     * FAIR DROP — standalone frontend demo
     * -------------------------------------
     * This file runs without a server. Demo accounts and reservations are stored
     * in this browser's localStorage. No real email/SMS OTP or payment is sent.
     * Replace the demo storage helpers with fetch() calls to your backend API
     * when connecting this interface to a production service.
     */

    // Sample concert catalogue. Prices and availability are demo values.
    const SHOWS = [
      {
        id: 'moonlight', name: 'Moonlight Sessions', artist: 'Anuv Jain',
        date: '14 Nov 2026', venue: 'Jio World Garden, Mumbai', price: 2499,
        seats: 500, advisory: 'All ages welcome. Under 16s must be accompanied by an adult.',
        description: 'An intimate open-air evening of heartfelt indie anthems, warm lights and a sky full of stars.'
      },
      {
        id: 'neon', name: 'Neon Frequency', artist: 'Ritviz',
        date: '21 Nov 2026', venue: 'Phoenix Marketcity, Bengaluru', price: 1899,
        seats: 500, advisory: 'Strobe lighting and loud sound effects. 18+ recommended.',
        description: 'A high-voltage dance floor where Indian electronica, bold visuals and big-room energy meet.'
      },
      {
        id: 'echoes', name: 'Echoes of the City', artist: 'When Chai Met Toast',
        date: '05 Dec 2026', venue: 'Bandra Fort Amphitheatre, Mumbai', price: 1599,
        seats: 500, advisory: 'Outdoor venue. Please plan for weather and arrive early.',
        description: 'Sing along to feel-good indie pop at a sunset show made for friends, fresh air and great music.'
      }
    ];

    const STORAGE_KEYS = { session: 'fairDropDemoSession', account: 'fairDropDemoAccount', bookings: 'fairDropDemoBookings', inventory: 'fairDropDemoInventory' };
    const app = document.querySelector('#app');
    let account = readStorage(STORAGE_KEYS.account, null);
    let user = readStorage(STORAGE_KEYS.session, null);
    let bookings = readStorage(STORAGE_KEYS.bookings, []);
    let inventory = readStorage(STORAGE_KEYS.inventory, {});
    let activeShow = null;
    let ticketQuantity = 1;

    // Safely parse stored demo state. Invalid browser data falls back to defaults.
    function readStorage(key, fallback) {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
      } catch {
        return fallback;
      }
    }

    // Escape user-provided text before adding it to HTML templates.
    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[character]);
    }

    // Get demo availability, using browser storage for reservations made here.
    function availableSeats(show) {
      const sold = Number(inventory[show.id] || 0);
      return Math.max(0, show.seats - sold);
    }

    // Show a small status message at the bottom of the screen.
    function showToast(message, isError = false) {
      const toast = document.querySelector('#toast');
      toast.textContent = message;
      toast.className = `toast show${isError ? ' error' : ''}`;
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => { toast.className = 'toast'; }, 3500);
    }

    // Render the top navigation, including the signed-in user's profile button.
    function renderHeader() {
      const profile = user
        ? `<button class="profile-button" data-action="profile"><span class="avatar">${escapeHTML(user.name.slice(0, 1).toUpperCase())}</span>${escapeHTML(user.name.split(' ')[0])}</button>`
        : '<button class="btn small-btn" data-action="auth">Sign in</button>';

      return `<header class="nav">
        <a class="brand" href="#top"><span class="logo">↗</span>fair drop<span style="color:var(--acid)">.</span></a>
        <nav class="navlinks" aria-label="Main navigation">
          <a href="#shows">Live shows</a><a href="#about">Why Fair Drop</a>${profile}
        </nav>
      </header>`;
    }

    // Render one illustrated concert card. Clicking the artwork opens details.
    function renderShowCard(show, index) {
      const available = availableSeats(show);
      const soldOut = available === 0;
      const artWords = ['MOON', 'NEON', 'ECHO'];
      const venueShort = show.venue.split(',')[0];

      return `<article class="event">
        <div class="event-art" data-action="details" data-id="${show.id}" role="button" tabindex="0" aria-label="View ${escapeHTML(show.name)} details">
          <div class="shape"></div><div class="glyph">${artWords[index % artWords.length]}</div>
          <span class="art-label">FAIR DROP LIVE</span><span class="art-num">0${index + 1} / 03</span>
        </div>
        <div class="event-meta">
          <div class="tag">${escapeHTML(show.date)} &nbsp;·&nbsp; ${escapeHTML(venueShort)}</div>
          <h3>${escapeHTML(show.name)}</h3><p class="artist">with ${escapeHTML(show.artist)}</p>
          <div class="event-line">◷ &nbsp; Doors open 6:30 PM</div>
          <div class="event-line">⌖ &nbsp; ${escapeHTML(show.venue)}</div>
          <div class="event-bottom">
            <div class="price">₹${show.price.toLocaleString('en-IN')}<small>per ticket · all fees included</small></div>
            <button class="btn primary small-btn" data-action="details" data-id="${show.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Get tickets'}</button>
          </div>
          <div class="stock ${available < 50 ? 'low' : ''}">${soldOut ? 'DROP CLOSED' : `${available} of ${show.seats} tickets left`}</div>
        </div>
      </article>`;
    }

    // Paint the complete landing page and the current inventory counts.
    function renderPage() {
      app.innerHTML = `<div class="shell" id="top">
        ${renderHeader()}
        <main>
          <section class="hero">
            <div>
              <div class="eyebrow">The fair way to get in</div>
              <h1>Good music.<br>Good people.<br><span class="serif">Fair chances.</span></h1>
              <p class="hero-copy">A better way to get tickets to the shows you love. One fair queue, a clear price, and a real chance for every fan.</p>
              <div class="hero-actions"><a class="btn primary" href="#shows">Explore live shows &nbsp;↗</a><button class="btn" data-action="how">How it works</button></div>
            </div>
            <div class="hero-art" aria-label="Fair Drop live 2026 poster">
              <span class="art-top">FAIR DROP · LIVE 2026</span><div class="art-disc"></div>
              <div class="art-lines"><div><span>SHOW</span><span>UP.</span></div></div>
              <span class="art-foot">YOUR NEXT NIGHT OUT →</span>
            </div>
          </section>

          <div class="ticker"><span>One fan, one fair chance</span><b>✳</b><span>Transparent prices</span><b>✳</b><span>Protected ticket drops</span><b>✳</b><span>Made for music people</span></div>

          <section class="section" id="shows">
            <div class="section-head"><div><div class="eyebrow">Find your next show</div><h2>Coming up live</h2></div><p>Limited seats. Everyone gets a fair shot.</p></div>
            <div class="events">${SHOWS.map(renderShowCard).join('')}</div>
          </section>

          <section class="trust" id="about">
            <div class="trust-item"><span class="trust-icon">◎</span><div><strong>A fair queue for all</strong><span>Everyone gets the same chance. Refreshing won't move you forward.</span></div></div>
            <div class="trust-item"><span class="trust-icon">₹</span><div><strong>Price is the price</strong><span>No surprise fees at checkout. What you see is what you pay.</span></div></div>
            <div class="trust-item"><span class="trust-icon">✓</span><div><strong>Your place is protected</strong><span>One reservation per fan, with live seat counts and no overselling.</span></div></div>
          </section>
        </main>
        <footer class="footer"><span>© 2026 Fair Drop. Made for fans, fairly.</span><span>Fair access · Clear prices · Live music</span></footer>
      </div>`;
    }

    // Create or replace a reusable accessible dialog.
    function openModal(content) {
      closeModal();
      document.body.insertAdjacentHTML('beforeend', `<div class="overlay" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`);
      document.querySelector('.modal .close')?.focus();
    }

    function closeModal() { document.querySelector('.overlay')?.remove(); }

    // Draw registration or sign-in form. HTML input checks provide basic validation.
    function showAuthForm(mode = 'register') {
      const registering = mode === 'register';
      openModal(`<button class="close" data-action="close" aria-label="Close">×</button>
        <div class="eyebrow">${registering ? 'Your fair chance starts here' : 'Welcome back'}</div>
        <h2>${registering ? 'Join Fair Drop' : 'Sign in'}</h2>
        <p>${registering ? 'Create your fan profile to join upcoming ticket drops.' : 'Sign in to see your upcoming shows and tickets.'}</p>
        <form id="auth-form">
          ${registering ? `<div class="form-grid">
            <div class="field"><label for="name">Full name</label><input id="name" name="name" autocomplete="name" required minlength="2" placeholder="Your name"></div>
            <div class="field"><label for="age">Age</label><input id="age" name="age" type="number" min="13" max="120" required placeholder="18"></div>
            <div class="field"><label for="mobile">Mobile number</label><input id="mobile" name="mobile" type="tel" autocomplete="tel" pattern="[+0-9 ()-]{10,}" required placeholder="+91 98765 43210"></div>
            <div class="field"><label for="email">Email ID</label><input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
            <div class="field full"><label for="password">Password</label><input id="password" name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></div>
          </div><p class="form-note">Demo verification checks your details in this browser. No email or SMS code is sent.</p>`
          : `<div class="field"><label for="email">Email ID</label><input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
            <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required placeholder="Your password"></div>`}
          <button class="btn primary full" type="submit">${registering ? 'Create my account' : 'Sign in'} &nbsp;↗</button>
        </form>
        <p class="switch">${registering ? 'Already have an account?' : 'New to Fair Drop?'} <button class="text-btn" data-action="switch-auth" data-mode="${registering ? 'login' : 'register'}">${registering ? 'Sign in' : 'Create an account'}</button></p>`);
      document.querySelector('#auth-form').addEventListener('submit', handleAuthSubmit);
    }

    // Demo-only sign-up/sign-in. Never use localStorage passwords in production.
    function handleAuthSubmit(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const values = Object.fromEntries(new FormData(form));
      const isRegistration = Boolean(values.name);
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      button.textContent = 'Checking your details…';

      if (isRegistration) {
        const email = values.email.trim().toLowerCase();
        if (account?.email === email) {
          button.disabled = false;
          button.textContent = 'Create my account ↗';
          showToast('That email already has an account. Sign in instead.', true);
          return;
        }
        // Keep only the fields needed by this frontend demo. Real apps must hash passwords on a server.
        account = { name: values.name.trim(), age: Number(values.age), mobile: values.mobile.trim(), email, password: values.password };
        user = { name: account.name, age: account.age, mobile: account.mobile, email: account.email };
        localStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account));
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
        closeModal(); renderPage(); showToast('Your profile is verified. Welcome to Fair Drop!');
        return;
      }

      const email = values.email.trim().toLowerCase();
      if (!account || account.email !== email || account.password !== values.password) {
        button.disabled = false;
        button.textContent = 'Sign in ↗';
        showToast('Email or password is incorrect.', true);
        return;
      }
      user = { name: account.name, age: account.age, mobile: account.mobile, email: account.email };
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
      closeModal(); renderPage(); showToast('You’re signed in. Welcome back!');
    }

    // Show event details, content advisory, ticket quantity and total price.
    function showDetails(show) {
      activeShow = show;
      ticketQuantity = 1;
      openModal(`<button class="close" data-action="close" aria-label="Close">×</button>
        <div class="detail-art">${escapeHTML(show.name.split(' ').slice(0, 2).join(' ').toUpperCase())}</div>
        <div class="eyebrow">${escapeHTML(show.artist)} · LIVE</div><h2>${escapeHTML(show.name)}</h2><p>${escapeHTML(show.description)}</p>
        <div class="detail-row"><span>Date</span><b>${escapeHTML(show.date)} · 6:30 PM</b></div>
        <div class="detail-row"><span>Venue</span><b>${escapeHTML(show.venue)}</b></div>
        <div class="detail-row"><span>Content advisory</span><b>${escapeHTML(show.advisory)}</b></div>
        <div class="detail-row"><span>Tickets</span><span class="quantity"><button data-action="quantity-minus" aria-label="Remove one ticket">−</button><b id="quantity">1</b><button data-action="quantity-plus" aria-label="Add one ticket">+</button></span></div>
        <div class="detail-row"><span>Total · all fees included</span><b id="total">₹${show.price.toLocaleString('en-IN')}</b></div>
        <button class="btn primary full" data-action="purchase">${user ? 'Join the fair queue' : 'Sign in to continue'} &nbsp;↗</button>
        <p class="form-note" style="text-align:center;margin-top:13px">One reservation per fan · Max 4 tickets per order</p>`);
    }

    // Show profile details and tickets saved in this browser.
    function showProfile() {
      if (!user) { showAuthForm('login'); return; }
      const myBookings = bookings.filter(booking => booking.email === user.email);
      const ticketRows = myBookings.length
        ? myBookings.map(booking => `<div class="booking"><strong>${escapeHTML(booking.showName)}</strong><p>${escapeHTML(booking.date)} · ${escapeHTML(booking.venue)}<br>${booking.quantity} ticket${booking.quantity > 1 ? 's' : ''} · ₹${booking.total.toLocaleString('en-IN')} · Reserved<br>Booking ref: ${escapeHTML(booking.id)}</p></div>`).join('')
        : '<div class="empty">No tickets yet. Your next show is waiting.</div>';

      openModal(`<button class="close" data-action="close" aria-label="Close">×</button>
        <div class="eyebrow">Your Fair Drop account</div><h2>Your profile</h2>
        <div class="user-card"><div><span>Name</span>${escapeHTML(user.name)}</div><div><span>Age</span>${escapeHTML(user.age)}</div><div><span>Email</span>${escapeHTML(user.email)}</div><div><span>Mobile</span>${escapeHTML(user.mobile)}</div></div>
        <div class="eyebrow">Your tickets</div>${ticketRows}<button class="btn full" data-action="logout">Sign out</button>`);
    }

    // Save a demo reservation in this browser and reduce the displayed inventory.
    function reserveTickets() {
      if (!user) {
        closeModal(); showAuthForm('login');
        showToast('Sign in to join this ticket drop.');
        return;
      }

      // Enforce the one-order-per-fan rule in this browser demo.
      const existing = bookings.some(booking => booking.email === user.email && booking.showId === activeShow.id);
      if (existing) { showToast('You already have a reservation for this show.', true); return; }

      const remaining = availableSeats(activeShow);
      if (ticketQuantity > remaining) { showToast('Those tickets just sold out. Try a smaller quantity.', true); renderPage(); closeModal(); return; }

      // A short queue animation makes the reservation step visible in the demo.
      openModal('<div style="text-align:center;padding:16px"><div class="eyebrow" style="justify-content:center">Fair Drop queue</div><h2>Finding your fair chance…</h2><p>Checking availability and saving your demo reservation.</p></div>');
      setTimeout(() => {
        // Recheck before saving in case another tab updated localStorage meanwhile.
        inventory = readStorage(STORAGE_KEYS.inventory, {});
        if (ticketQuantity > availableSeats(activeShow)) {
          closeModal(); renderPage(); showToast('Those tickets just sold out. Please try again.', true); return;
        }

        inventory[activeShow.id] = Number(inventory[activeShow.id] || 0) + ticketQuantity;
        const booking = {
          id: `FD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          email: user.email, showId: activeShow.id, showName: activeShow.name,
          date: activeShow.date, venue: activeShow.venue, quantity: ticketQuantity,
          total: activeShow.price * ticketQuantity
        };
        bookings.push(booking);
        localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
        localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));

        openModal(`<button class="close" data-action="close" aria-label="Close">×</button><div class="eyebrow">You’re on the list</div><h2>It’s a date. ✳</h2><p>Your demo reservation is confirmed. Keep your booking reference handy.</p>
          <div class="booking"><strong>${escapeHTML(booking.showName)}</strong><p>${escapeHTML(booking.date)} · ${escapeHTML(booking.venue)}<br>${booking.quantity} ticket${booking.quantity > 1 ? 's' : ''} · ₹${booking.total.toLocaleString('en-IN')}<br>Ref: ${escapeHTML(booking.id)}</p></div>
          <button class="btn primary full" data-action="profile">View my tickets</button>`);
        renderPage();
      }, 900);
    }

    // One delegated click handler keeps interactions working after each rerender.
    document.addEventListener('click', event => {
      const control = event.target.closest('[data-action]');
      if (!control) return;
      const action = control.dataset.action;

      if (action === 'backdrop' && event.target === control) closeModal();
      if (action === 'close') closeModal();
      if (action === 'auth') showAuthForm('register');
      if (action === 'switch-auth') showAuthForm(control.dataset.mode);
      if (action === 'profile') showProfile();
      if (action === 'logout') {
        user = null;
        localStorage.removeItem(STORAGE_KEYS.session);
        closeModal(); renderPage(); showToast('You’re signed out.');
      }
      if (action === 'details') {
        const show = SHOWS.find(item => item.id === control.dataset.id);
        if (show) showDetails(show);
      }
      if (action === 'quantity-minus' && ticketQuantity > 1) {
    ticketQuantity--;
    document.querySelector('#quantity').textContent = ticketQuantity;
    document.querySelector('#total').textContent =
        `${(activeShow.price * ticketQuantity).toLocaleString('en-IN')}`;
}

if (action === 'quantity-plus' && ticketQuantity < 4 && ticketQuantity < availableSeats(activeShow)) {
    ticketQuantity++;
    document.querySelector('#quantity').textContent = ticketQuantity;
    document.querySelector('#total').textContent =
        `${(activeShow.price * ticketQuantity).toLocaleString('en-IN')}`;
}
});

renderPage();