/* =====================================================================
   Mahmoud Khorbatly – Executive Portfolio (Updated layout)
   FILE: portfolio.js
   ---------------------------------------------------------------------
   WHAT THIS FILE DOES
   All the interactive behavior of portfolio.html. It runs once, at the
   end of page load (the <script> tag is at the bottom of <body>, so all
   HTML elements already exist when this code runs).

   DEPENDENCIES
   - Bootstrap 5.3 JavaScript (bootstrap.bundle.min.js) must load BEFORE
     this file. We use its global "bootstrap" object for Toast, Tooltip,
     Collapse and Modal.

   HOW THIS FILE FINDS HTML ELEMENTS
   Almost everything is looked up by its id, e.g. $('#themeToggle') finds
   <button id="themeToggle">. If you RENAME an id in the HTML, search this
   file for the old name and update it here too, or that feature breaks.

   FEATURES (search for the number, e.g. "6." to jump there)
     0.  Helpers + toast notifications
     1.  Dark / light mode toggle
     2.  Scroll effects (navbar shrink, progress bar, back-to-top, mobile menu)
     3.  Typed rotating headline in the hero
     4.  Animated number counters
     5.  Scroll-reveal animations
     6.  Certificate filter + search
     7.  Experience "Expand all / Collapse all"
     8.  Project "Read more" pop-up (modal)
     9.  Copy email to clipboard
     10. Contact form validation + sending

   TIP: Open the browser's DevTools (F12) → Console tab to see any errors.
   ===================================================================== */

// The whole file is wrapped in a function that runs immediately – an
// "IIFE" (Immediately Invoked Function Expression). This keeps all our
// variables private so they can't clash with other scripts on the page.
(function () {
    'use strict';   // Strict mode: turns silent mistakes (e.g. typos in variable names) into visible errors

    // Safety check: if Bootstrap's JS failed to load (e.g. no internet / CDN
    // down), stop here. Removing the "js" class makes all .reveal content
    // visible (see section 13 of portfolio.css), so the page still works,
    // just without the animations and interactive extras.
    if (typeof bootstrap === 'undefined') {
        document.documentElement.classList.remove('js');
        return;
    }

    /* =================================================================
       0. HELPERS
       ================================================================= */

    // Short-hand selectors (like jQuery's $):
    //   $('#id')        -> the FIRST matching element (or null)
    //   $$('.class')    -> an ARRAY of ALL matching elements
    // Optional 2nd argument = search only inside that element.
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // true if the visitor's OS is set to "reduce motion".
    // We skip animations for them (accessibility).
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Toast helper ----------
       A "toast" is the small message that pops up at the bottom of the
       screen for 3 seconds. HTML: <div id="siteToast"> near the end of
       portfolio.html.
       Usage anywhere below:  showToast('Your message here');           */
    const toastEl = $('#siteToast');
    const toast = toastEl ? bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }) : null;  // delay = ms on screen
    function showToast(message) {
        if (!toast) return;
        $('#siteToastBody').textContent = message;   // textContent (not innerHTML) = safe, no HTML injection
        toast.show();
    }


    /* =================================================================
       1. DARK / LIGHT MODE TOGGLE
       -----------------------------------------------------------------
       How it works:
       - The <html> tag carries data-bs-theme="light" or "dark".
         Bootstrap and portfolio.css both read that attribute to pick colors.
       - A tiny script in the <head> of portfolio.html sets the starting
         theme BEFORE the page draws (to avoid a white flash). It uses:
           1) the visitor's saved choice (localStorage "mk-theme"), else
           2) their operating system's dark/light setting.
       - Here we wire up the button and keep the icon in sync.
       ================================================================= */
    const root = document.documentElement;   // the <html> element
    const themeIcon = $('#themeIcon');       // the <i> icon inside the toggle button

    // Switches the page to the given theme ('light' or 'dark') and updates the button
    function applyTheme(theme) {
        root.setAttribute('data-bs-theme', theme);
        // Show a SUN in dark mode (click to go light) and a MOON in light mode (click to go dark)
        themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
        // Screen-reader label describing what the button will do
        $('#themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        // Colors the browser's address bar on mobile to match the theme
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f4f6f9');
    }
    // Sync the icon with whatever theme the <head> script already chose
    applyTheme(root.getAttribute('data-bs-theme') || 'light');

    // When the button is clicked: flip the theme and remember the choice
    $('#themeToggle').addEventListener('click', () => {
        const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        // localStorage keeps the value between visits. Wrapped in try/catch
        // because some browsers (private mode, blocked cookies) throw an error.
        try { localStorage.setItem('mk-theme', next); } catch (e) { /* storage unavailable – ignore */ }
    });

    // If the visitor changes their OS theme while the page is open, follow it –
    // but ONLY if they never clicked the toggle (no saved choice).
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem('mk-theme'); } catch (err) { /* ignore */ }
        if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    });

    /* ---------- Bootstrap tooltips ----------
       Bootstrap tooltips are opt-in: they must be switched on with JS.
       This activates every element that has data-bs-toggle="tooltip"
       (the theme button and copy-email button). Text comes from title="…". */
    $$('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));


    /* =================================================================
       2. SCROLL EFFECTS
       ================================================================= */
    const nav = $('#mainNav');              // the top navbar
    const progress = $('#scrollProgress');  // thin bar at the very top
    const backToTop = $('#backToTop');      // round ↑ button bottom-right

    // Runs every time the page scrolls
    function onScroll() {
        const y = window.scrollY;                                                  // pixels scrolled from the top
        const max = document.documentElement.scrollHeight - window.innerHeight;    // total scrollable distance
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';              // progress bar width in %
        nav.classList.toggle('scrolled', y > 40);         // slimmer navbar after 40px  (CSS: .site-nav.scrolled)
        backToTop.classList.toggle('show', y > 600);      // show ↑ button after 600px  (CSS: .back-to-top.show)
    }
    // { passive: true } tells the browser we won't block scrolling = smoother performance
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();   // run once now, in case the page was loaded already scrolled (e.g. after refresh)

    // ↑ button scrolls back to the top
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

    // On phones the menu is a collapsible dropdown. Close it automatically
    // after a link is tapped, so it doesn't cover the section we jumped to.
    const navCollapse = $('#navLinks');
    $$('#navLinks .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navCollapse.classList.contains('show')) {   // "show" = menu currently open
                bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
            }
        });
    });


    /* =================================================================
       3. TYPED ROTATING HEADLINE
       -----------------------------------------------------------------
       In the hero: "Servant Leader & <role>|"
       The role is deleted letter by letter, then the next one is typed.
       TO CHANGE THE ROLES: edit the "roles" list below. The FIRST item
       must match the text already inside <span id="typedText"> in the HTML
       (that's what visitors see before the animation starts).
       ================================================================= */
    const typedEl = $('#typedText');
    const roles = ['Technology Executive', 'Strategic Advisor', 'Cybersecurity Leader', 'AI Strategist', 'Transformation Leader'];

    if (typedEl && !prefersReducedMotion) {   // skip animation for reduced-motion visitors
        let roleIdx = 0;                      // which role we're on
        let charIdx = roles[0].length;        // how many letters are currently shown
        let deleting = true;                  // start by deleting the first (already shown) role

        // tick() draws one frame, then schedules itself again with setTimeout
        const tick = () => {
            const word = roles[roleIdx];
            typedEl.textContent = word.slice(0, charIdx);   // show the first charIdx letters
            if (deleting) {
                charIdx--;
                if (charIdx < 0) {                          // fully deleted → move to the next role
                    deleting = false;
                    roleIdx = (roleIdx + 1) % roles.length; // % wraps back to 0 after the last role
                    charIdx = 0;
                }
                setTimeout(tick, 45);                       // deleting speed (ms per letter)
            } else {
                charIdx++;
                if (charIdx > roles[roleIdx].length) {      // fully typed → pause, then start deleting
                    deleting = true;
                    setTimeout(tick, 2000);                 // pause on the full word (ms)
                    return;
                }
                setTimeout(tick, 85);                       // typing speed (ms per letter)
            }
        };
        setTimeout(tick, 2200);   // wait 2.2s after page load before the first delete
    }


    /* =================================================================
       4. ANIMATED NUMBER COUNTERS
       -----------------------------------------------------------------
       The hero stats count up from 0 to their final value.
       HTML example:  <span class="counter" data-target="26">0</span>+
       TO CHANGE A NUMBER: edit data-target="…" in the HTML only.
       ================================================================= */
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10) || 0;     // reads data-target="26" → 26
        if (prefersReducedMotion) { el.textContent = target; return; }
        const duration = 1400;                                   // animation length in ms
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);     // progress 0 → 1
            const eased = 1 - Math.pow(1 - p, 3);                // "ease-out": fast at first, slows at the end
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);              // keep going until done (~60 times/second)
        };
        requestAnimationFrame(step);
    }


    /* =================================================================
       5. SCROLL-REVEAL ANIMATIONS
       -----------------------------------------------------------------
       Elements with class="reveal" fade in when scrolled into view.
       IntersectionObserver is a browser feature that tells us when an
       element enters the screen – much cheaper than checking on every scroll.
       TO ANIMATE A NEW ELEMENT: just add class="reveal" to it in the HTML.
       ================================================================= */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;                // not on screen yet
                entry.target.classList.add('visible');            // CSS fades it in (portfolio.css section 13)
                $$('.counter', entry.target).forEach(animateCounter);  // start any counters inside it
                obs.unobserve(entry.target);                      // animate only once
            });
        }, {
            threshold: 0.12,                    // trigger when 12% of the element is visible
            rootMargin: '0px 0px -40px 0px'     // ...and at least 40px above the bottom edge
        });
        $$('.reveal').forEach(el => io.observe(el));
    } else {
        // Very old browsers: just show everything immediately
        $$('.reveal').forEach(el => el.classList.add('visible'));
        $$('.counter').forEach(el => { el.textContent = el.dataset.target; });
    }


    /* =================================================================
       6. CERTIFICATE FILTER + SEARCH (Education & Skills section)
       -----------------------------------------------------------------
       Each certificate in the HTML looks like:
         <div class="col cert-item" data-cat="security">…</div>
       data-cat must match a filter button's data-filter value:
         "security" | "management" | "tech"   ("all" shows everything)
       TO ADD A CERTIFICATE: copy one .cert-item block in the HTML and set
       its data-cat. The count badge updates automatically.
       TO ADD A NEW CATEGORY: add a new button with data-filter="newname"
       in the HTML and use data-cat="newname" on its certificates.
       ================================================================= */
    const certItems = $$('.cert-item');
    const certSearch = $('#certSearch');     // search text box
    const certCount = $('#certCount');       // grey number badge next to the title
    const certEmpty = $('#certEmpty');       // "No certificates match…" message
    let activeFilter = 'all';                // currently selected category

    // Shows only certificates that match BOTH the selected category AND the search text
    function filterCerts() {
        const q = certSearch.value.trim().toLowerCase();
        let shown = 0;
        certItems.forEach(item => {
            const matchCat = activeFilter === 'all' || item.dataset.cat === activeFilter;
            const matchText = !q || item.textContent.toLowerCase().includes(q);   // case-insensitive search
            const visible = matchCat && matchText;
            item.classList.toggle('d-none', !visible);   // d-none = Bootstrap's "display: none"
            if (visible) shown++;
        });
        certCount.textContent = shown;
        certEmpty.classList.toggle('d-none', shown > 0);   // show "no results" only when 0 shown
    }

    // Category buttons: highlight the clicked one and re-filter
    $$('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.btn-filter').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');    // tells screen readers which button is selected
            activeFilter = btn.dataset.filter;
            filterCerts();
        });
    });
    // Re-filter on every keystroke in the search box
    certSearch.addEventListener('input', filterCerts);


    /* =================================================================
       7. EXPERIENCE: "EXPAND ALL / COLLAPSE ALL" BUTTON
       -----------------------------------------------------------------
       Each job is a Bootstrap accordion panel (.accordion-collapse).
       Bootstrap handles opening/closing a single job on click; this adds
       one button to open or close all of them at once.
       NOTE: the accordion does NOT have data-bs-parent, so several jobs can
       be open at the same time. Add data-bs-parent="#expAccordion" to each
       .accordion-collapse if you want only one open at a time (but then
       "Expand all" will no longer make sense).
       ================================================================= */
    const toggleAllBtn = $('#toggleAllExp');
    const expPanels = $$('#expAccordion .accordion-collapse');

    toggleAllBtn.addEventListener('click', () => {
        // If at least one job is closed → open all. Otherwise → close all.
        const anyClosed = expPanels.some(p => !p.classList.contains('show'));
        expPanels.forEach(p => {
            const c = bootstrap.Collapse.getOrCreateInstance(p, { toggle: false });
            anyClosed ? c.show() : c.hide();
        });
        updateToggleAllLabel(anyClosed);
    });

    // Updates the button text + icon. allOpen = true → "Collapse all"
    function updateToggleAllLabel(allOpen) {
        toggleAllBtn.querySelector('span').textContent = allOpen ? 'Collapse all' : 'Expand all';
        toggleAllBtn.querySelector('i').className = allOpen ? 'bi bi-arrows-collapse' : 'bi bi-arrows-expand';
    }

    // Keep the button label correct when the visitor opens/closes jobs one by one.
    // "shown.bs.collapse" / "hidden.bs.collapse" are events Bootstrap fires after the animation.
    expPanels.forEach(p => {
        p.addEventListener('shown.bs.collapse', () => updateToggleAllLabel(expPanels.every(x => x.classList.contains('show'))));
        p.addEventListener('hidden.bs.collapse', () => updateToggleAllLabel(expPanels.every(x => x.classList.contains('show'))));
    });


    /* =================================================================
       8. PROJECT "READ MORE" POP-UP (Bootstrap modal)
       -----------------------------------------------------------------
       There is ONE modal (<div id="projectModal">) shared by all projects.
       When it opens, we copy the title, image, tags and full description
       from the card whose "Read more" button was clicked.
       => To add a project you only need to add a new card in the HTML;
          no JavaScript changes are needed.
       ================================================================= */
    const projectModal = $('#projectModal');
    projectModal.addEventListener('show.bs.modal', (event) => {
        // event.relatedTarget = the "Read more" button that opened the modal
        const card = event.relatedTarget.closest('.project-card');   // walk up to its card
        const icon = $('.project-icon', card);
        $('#projectModalTitle').textContent = $('.card-title', card).textContent;
        $('#projectModalBody').textContent = $('.card-text', card).textContent;
        $('#projectModalIcon').src = icon ? icon.src : '';
        // Copy the tag pills into the modal
        const tags = $('#projectModalTags');
        tags.innerHTML = '';                                          // clear tags from a previous project
        $$('.tag', card).forEach(t => tags.appendChild(t.cloneNode(true)));
    });


    /* =================================================================
       9. COPY EMAIL TO CLIPBOARD (Contact section)
       -----------------------------------------------------------------
       Copies the text of <a id="emailLink">. If you change the email
       address, update it in the HTML only (both href and text).
       ================================================================= */
    $('#copyEmail').addEventListener('click', async () => {
        const email = $('#emailLink').textContent.trim();
        try {
            await navigator.clipboard.writeText(email);   // modern clipboard API (needs https or localhost)
            showToast('Email address copied to clipboard');
        } catch (e) {
            showToast('Copy failed – email: ' + email);   // e.g. opened as file:// or permission denied
        }
    });

    /* ---------- Footer year ----------
       Fills <span id="year"> with the current year, so the © never goes out of date. */
    $('#year').textContent = new Date().getFullYear();


    /* =================================================================
       10. CONTACT FORM VALIDATION + SENDING
       -----------------------------------------------------------------
       The <form> has the "novalidate" attribute, which turns OFF the
       browser's built-in pop-up errors so we can show our own nicer,
       consistent messages under each field.

       HOW IT WORKS
       - "fields" (below) lists every field to check. Each entry has:
           el        → the input element (found by its id)
           validate  → a function that returns an ERROR MESSAGE string,
                       or '' (empty string) when the value is OK.
       - setFieldState() runs a field's validate(), writes the message
         into the matching <div id="<field>Error">, and adds Bootstrap's
         .is-invalid (red) or .is-valid (green) class to the input.
       - Errors appear after the visitor LEAVES a field (blur), then update
         live as they type, so they aren't nagged while typing the first time.
       - On submit, ALL fields are checked. If any fail, the form shakes and
         focus moves to the first bad field. If all pass, the form is sent
         to Formspree in the background (no page reload).

       TO ADD A NEW FIELD:
         1. In the HTML add the input with an id (e.g. id="company") and,
            right after it, <div class="invalid-feedback" id="companyError"></div>
            The error div's id MUST be the field id + "Error".
         2. Add an entry to "fields" below with the same key ("company").
       TO CHANGE A RULE OR MESSAGE: edit that field's validate() function.
       ================================================================= */
    const form = $('#contactForm');

    const fields = {
        // ---- Full name (required) ----
        name: {
            el: $('#name'),
            validate(v) {
                v = v.trim();   // ignore spaces at the start/end
                if (!v) return 'Please enter your name.';
                if (v.length < 2) return 'Name must be at least 2 characters.';
                if (v.length > 80) return 'Name must be 80 characters or fewer.';
                // Regular expression: must start with a letter, then letters, spaces, ' . or -
                // \p{L} = any letter in any language (é, ü, Arabic, etc.); the "u" flag enables it
                if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(v)) return 'Name can only contain letters, spaces, apostrophes, periods and hyphens.';
                return '';
            }
        },
        // ---- Email (required) ----
        email: {
            el: $('#email'),
            validate(v) {
                v = v.trim();
                if (!v) return 'Please enter your email address.';
                // Simple pattern: something@something.xx (at least 2 letters after the last dot)
                if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return 'Please enter a valid email address (e.g. name@company.com).';
                return '';
            }
        },
        // ---- Phone (OPTIONAL – only checked if something was typed) ----
        phone: {
            el: $('#phone'),
            validate(v) {
                v = v.trim();
                if (!v) return '';   // empty is allowed
                // Only digits, spaces, + ( ) . -
                if (!/^\+?[\d\s().-]+$/.test(v)) return 'Phone can only contain digits, spaces, +, -, ( and ).';
                const digits = v.replace(/\D/g, '');   // strip everything except digits, then count them
                if (digits.length < 10 || digits.length > 15) return 'Phone number must have 10 to 15 digits.';
                return '';
            }
        },
        // ---- Reason dropdown (required) ----
        // The first <option> has value="" so "Choose…" counts as empty.
        subject: {
            el: $('#subject'),
            validate(v) { return v ? '' : 'Please choose a reason for contacting me.'; }
        },
        // ---- Message (required, 20–1000 characters) ----
        // If you change 1000 here, also change maxlength="1000" on the
        // <textarea> and the "/ 1000" text in the character counter below.
        message: {
            el: $('#message'),
            validate(v) {
                v = v.trim();
                if (!v) return 'Please enter a message.';
                if (v.length < 20) return `Message must be at least 20 characters (${20 - v.length} more needed).`;
                if (v.length > 1000) return 'Message must be 1000 characters or fewer.';
                return '';
            }
        },
        // ---- Consent checkbox (required) ----
        // Checkboxes don't have a useful "value", so we read el.checked instead.
        consent: {
            el: $('#consent'),
            validate(_, el) { return el.checked ? '' : 'Please confirm you agree before sending.'; }
        }
    };

    // Validates ONE field, shows/hides its error. Returns true if valid.
    function setFieldState(key) {
        const f = fields[key];
        const msg = f.validate(f.el.value, f.el);    // '' means valid
        const errorEl = $('#' + key + 'Error');      // e.g. #nameError
        errorEl.textContent = msg;
        f.el.classList.toggle('is-invalid', !!msg);  // red border + shows .invalid-feedback (Bootstrap)
        // Green "valid" border only for fields that actually have content
        // (so an empty optional phone field doesn't turn green)
        f.el.classList.toggle('is-valid', !msg && (f.el.type === 'checkbox' ? f.el.checked : f.el.value.trim() !== ''));
        // Accessibility: tells screen readers the field is invalid and where its error text is
        f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        f.el.setAttribute('aria-describedby', key + 'Error');
        return !msg;
    }

    // Attach listeners to every field.
    // data-touched="true" marks fields the visitor has already left once.
    Object.keys(fields).forEach(key => {
        const el = fields[key].el;
        el.dataset.touched = 'false';
        // Leaving the field → check it
        el.addEventListener('blur', () => { el.dataset.touched = 'true'; setFieldState(key); });
        // Typing (text fields) or changing (dropdown/checkbox) → re-check live,
        // but for text fields only after they've been touched once
        el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', () => {
            if (el.dataset.touched === 'true' || el.type === 'checkbox' || el.tagName === 'SELECT') setFieldState(key);
        });
    });

    /* ---------- Character counter under the message box ("123 / 1000") ---------- */
    const msgEl = fields.message.el;
    const charCount = $('#charCount');
    const updateCount = () => {
        const len = msgEl.value.length;
        charCount.textContent = `${len} / 1000`;
        charCount.classList.toggle('text-danger', len > 950);   // turns red near the limit
    };
    msgEl.addEventListener('input', updateCount);

    /* ---------- Alert box under the form (overall success / error message) ----------
       type = Bootstrap alert color: 'success' (green) or 'danger' (red).
       html is inserted with innerHTML, so only pass text WE wrote or have escaped. */
    const alertBox = $('#formAlert');
    function showAlert(type, html) {
        alertBox.className = `alert alert-${type} mt-3`;
        alertBox.innerHTML = html;
    }
    function hideAlert() { alertBox.className = 'alert mt-3 d-none'; alertBox.innerHTML = ''; }

    // Turns the Send button into a "Sending…" spinner (and back), and
    // disables it so the visitor can't send the same message twice.
    function setSubmitting(on) {
        $('#submitBtn').disabled = on;
        $('#submitSpinner').classList.toggle('d-none', !on);
        $('#submitLabel').innerHTML = on ? 'Sending…' : '<i class="bi bi-send"></i> Send Message';
    }

    /* ---------- "Clear" button (type="reset") ----------
       The browser empties the fields itself; we also clear our red/green
       states, error messages and the alert box. */
    form.addEventListener('reset', () => {
        Object.keys(fields).forEach(key => {
            const el = fields[key].el;
            el.classList.remove('is-invalid', 'is-valid');
            el.removeAttribute('aria-invalid');
            el.dataset.touched = 'false';
            $('#' + key + 'Error').textContent = '';
        });
        hideAlert();
        // setTimeout 0 = run after the browser has finished emptying the fields,
        // so the counter correctly shows "0 / 1000"
        setTimeout(updateCount, 0);
    });

    /* ---------- "Send Message" (form submit) ---------- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();   // stop the normal submit (which would leave the page for Formspree's site)
        hideAlert();

        // Check every field; collect the keys of the ones that fail
        const invalid = Object.keys(fields).filter(key => {
            fields[key].el.dataset.touched = 'true';
            return !setFieldState(key);
        });

        if (invalid.length) {
            const first = fields[invalid[0]].el;
            first.focus();                        // move the cursor to the first problem
            // Restart the shake animation: remove the class, force the browser
            // to recalculate layout (reading offsetWidth does that), add it back
            form.classList.remove('shake');
            void form.offsetWidth;
            form.classList.add('shake');
            showAlert('danger', `<i class="bi bi-exclamation-triangle-fill me-1"></i> Please fix the ${invalid.length} highlighted field${invalid.length > 1 ? 's' : ''} and try again.`);
            return;                               // don't send
        }

        // All fields valid → send to Formspree in the background (AJAX).
        // The destination URL is the form's action="…" attribute in the HTML.
        // To use a different Formspree form, change action="…" there.
        setSubmitting(true);
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),                 // packs all named inputs (name="…") automatically
                headers: { Accept: 'application/json' }   // ask Formspree to reply with JSON instead of a web page
            });
            if (res.ok) {
                // Success (HTTP 200–299)
                form.reset();
                showAlert('success', '<i class="bi bi-check-circle-fill me-1"></i> Thank you! Your message has been sent. I will get back to you soon.');
                showToast('Message sent successfully');
            } else {
                // Formspree rejected it (e.g. spam check, form disabled). Show its reason if it gave one.
                const data = await res.json().catch(() => ({}));
                const raw = data.errors ? data.errors.map(er => er.message).join(', ') : 'The server could not accept the message.';
                // Escape special characters so server text can't inject HTML into our page
                const detail = raw.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
                showAlert('danger', `<i class="bi bi-x-circle-fill me-1"></i> Sorry, something went wrong: ${detail} Please try again or email me directly.`);
            }
        } catch (err) {
            // fetch() itself failed – usually no internet connection
            showAlert('danger', '<i class="bi bi-wifi-off me-1"></i> Network error. Please check your connection and try again, or email me directly.');
        } finally {
            // Runs whether it succeeded or failed: restore the Send button
            setSubmitting(false);
        }
    });
})();
