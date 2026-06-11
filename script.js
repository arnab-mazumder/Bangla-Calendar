/**
 * ============================================================
 * BENGALI CALENDAR 2026 - Main JavaScript
 * Handles calendar rendering, navigation, theming, PDF export
 * ============================================================
 */

(function () {
  'use strict';

  // ─── CONSTANTS & CONFIGURATION ────────────────────────────

  /** Bengali month names */
  const BENGALI_MONTHS = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];

  /** English Gregorian month names */
  const ENGLISH_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /** Bengali month names in English transliteration */
  const BENGALI_MONTHS_EN = [
    'Boishakh', 'Jyoishtho', 'Asharh', 'Shrabon', 'Bhadro', 'Ashwin',
    'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Choitro'
  ];

  /** Bengali numeral characters */
  const BN_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  /** Day names */
  const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Storage keys */
  const STORAGE_DARK_MODE = 'bengaliCalendarDarkMode';
  const STORAGE_LANG = 'bengaliCalendarLang';

  // ─── STATE ────────────────────────────────────────────────

  let calendarData = [];        // Raw JSON data for all 365 days
  let currentYear = 2026;       // Display year
  let currentMonth = 0;         // Display month (0-indexed)
  let currentLang = 'bn';       // 'bn' or 'en'
  let isDarkMode = false;       // Dark mode state
  let tooltipTimeout = null;    // Tooltip show timeout

  // ─── DOM REFERENCES ───────────────────────────────────────

  const $id = (id) => document.getElementById(id);
  const $all = (sel) => document.querySelectorAll(sel);

  // ─── INITIALIZATION ───────────────────────────────────────

  document.addEventListener('DOMContentLoaded', init);

  /**
   * Main initialization function:
   * - Load saved preferences
   * - Fetch calendar data
   * - Set up event listeners
   * - Render the initial view
   */
  async function init() {
    loadPreferences();
    applyTheme();
    applyLanguage();
    setupEventListeners();
    await loadCalendarData();
    determineInitialMonth();
    populateMonthSelect();
    renderCalendar(currentYear, currentMonth);
  }

  // ─── DATA LOADING ─────────────────────────────────────────

  /**
   * Fetch the calendar2026.json data file.
   * Shows an error message in the calendar area if loading fails.
   */
  async function loadCalendarData() {
    try {
      const response = await fetch('calendar2026.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      calendarData = await response.json();
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      const grid = $id('calendarGrid');
      grid.innerHTML = `
        <div class="out-of-range" style="grid-column: 1 / -1;">
          <span class="out-of-range-icon">⚠️</span>
          <p>${currentLang === 'bn'
            ? 'ক্যালেন্ডার ডেটা লোড করা যায়নি। অনুগ্রহ করে calendar2026.json ফাইলটি পরীক্ষা করুন।'
            : 'Failed to load calendar data. Please check the calendar2026.json file.'}</p>
        </div>`;
    }
  }

  /**
   * Determine which month to show initially.
   * If today is in 2026, show the current month; otherwise show January 2026.
   */
  function determineInitialMonth() {
    const today = new Date();
    if (today.getFullYear() === 2026) {
      currentMonth = today.getMonth();
    } else {
      currentMonth = 0; // January
    }
    currentYear = 2026;
  }

  // ─── PREFERENCES ──────────────────────────────────────────

  /** Load dark mode and language preferences from localStorage */
  function loadPreferences() {
    const savedDark = localStorage.getItem(STORAGE_DARK_MODE);
    if (savedDark !== null) {
      isDarkMode = savedDark === 'true';
    }

    const savedLang = localStorage.getItem(STORAGE_LANG);
    if (savedLang) {
      currentLang = savedLang;
    }
  }

  // ─── THEMING ──────────────────────────────────────────────

  const SVG_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const SVG_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  /** Apply dark/light theme to the document */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    const icon = $id('darkIcon');
    if (icon) icon.innerHTML = isDarkMode ? SVG_SUN : SVG_MOON;
  }

  /** Toggle dark mode and save preference */
  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(STORAGE_DARK_MODE, isDarkMode);
    applyTheme();
  }

  // ─── LANGUAGE ─────────────────────────────────────────────

  /** Apply the current language to all elements with data-lang-* attributes */
  function applyLanguage() {
    const langKey = `data-lang-${currentLang}`;
    $all(`[${langKey}]`).forEach((el) => {
      el.textContent = el.getAttribute(langKey);
    });

    // Update language toggle label
    const langLabel = $id('langLabel');
    if (langLabel) {
      langLabel.textContent = currentLang === 'bn' ? 'EN' : 'বাং';
    }

    // Update month select options
    populateMonthSelect();
  }

  /** Toggle between Bengali and English and re-render */
  function toggleLanguage() {
    currentLang = currentLang === 'bn' ? 'en' : 'bn';
    localStorage.setItem(STORAGE_LANG, currentLang);
    applyLanguage();
    renderCalendar(currentYear, currentMonth);
  }

  // ─── UTILITY FUNCTIONS ────────────────────────────────────

  /**
   * Convert an English number to Bengali numeral string.
   * @param {number|string} num - The number to convert
   * @returns {string} Bengali numeral string
   */
  function toBengaliNumeral(num) {
    return String(num).replace(/\d/g, (d) => BN_NUMERALS[parseInt(d)]);
  }

  /**
   * Get data for a specific date from the loaded calendar data.
   * @param {number} year - Gregorian year
   * @param {number} month - Month (0-indexed)
   * @param {number} day - Day of month
   * @returns {Object|null} The day data object or null
   */
  function getDateData(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData.find((d) => d.englishDate === dateStr) || null;
  }

  /**
   * Check if a given date is today.
   * @param {number} year
   * @param {number} month - 0-indexed
   * @param {number} day
   * @returns {boolean}
   */
  function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  }

  /**
   * Get the number of days in a given month.
   * @param {number} year
   * @param {number} month - 0-indexed
   * @returns {number}
   */
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get the day of the week for the first of the month (0=Sun, 6=Sat).
   * @param {number} year
   * @param {number} month - 0-indexed
   * @returns {number}
   */
  function firstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  // ─── POPULATE MONTH SELECT ────────────────────────────────

  /** Fill the month dropdown with appropriate language names */
  function populateMonthSelect() {
    const monthSelect = $id('monthSelect');
    if (!monthSelect) return;

    const months = currentLang === 'bn'
      ? ENGLISH_MONTHS.map((m, i) => `${m} (${toBengaliNumeral(i + 1)})`)
      : ENGLISH_MONTHS;

    monthSelect.innerHTML = months.map((name, i) =>
      `<option value="${i}" ${i === currentMonth ? 'selected' : ''}>${name}</option>`
    ).join('');
  }

  // ─── CALENDAR RENDERING ───────────────────────────────────

  /**
   * Main render function for the calendar grid.
   * Handles month transitions with fade animation.
   * @param {number} year
   * @param {number} month - 0-indexed
   */
  function renderCalendar(year, month) {
    // Check if year is valid (only 2026 data available)
    if (year !== 2026) {
      showOutOfRange();
      return;
    }

    currentYear = year;
    currentMonth = month;

    const grid = $id('calendarGrid');

    // Animate out
    grid.classList.add('fade-out');

    setTimeout(() => {
      // Render day headers
      renderDayHeaders();

      // Render month title
      renderMonthTitle();

      // Render header subtitle
      renderHeaderSubtitle();

      // Build the grid cells
      const totalDays = daysInMonth(year, month);
      const startDay = firstDayOfMonth(year, month);

      let html = '';

      // Empty cells before the first day
      for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-cell empty" aria-hidden="true"></div>';
      }

      // Day cells
      for (let day = 1; day <= totalDays; day++) {
        const data = getDateData(year, month, day);
        const isSunday = new Date(year, month, day).getDay() === 0;
        const todayClass = isToday(year, month, day) ? ' today' : '';
        const sundayClass = isSunday ? ' sunday' : '';
        let holidayClass = '';

        if (data && data.holiday && data.holidayType) {
          holidayClass = ` holiday-${data.holidayType}`;
        }

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Cell content
        const englishDateDisplay = day;
        const bengaliInfo = data
          ? `${data.bengaliDateBn} ${data.bengaliMonth}`
          : '';

        // Exact PDF text
        let holidayName = '';
        if (data && data.eventTextBn) {
          const textHtml = data.eventTextBn.replace(/\n/g, '<br>');
          holidayName = `<div class="cell-holiday-name">${textHtml}</div>`;
        }

        let moonPhaseHtml = '';
        if (data && data.amavasya) {
          moonPhaseHtml = `<div class="moon-phase amavasya" aria-label="Amavasya">অমাবস্যা</div>`;
        } else if (data && data.purnima) {
          moonPhaseHtml = `<div class="moon-phase purnima" aria-label="Purnima">পূর্ণিমা</div>`;
        } else if (data && data.ekadashi) {
          moonPhaseHtml = `<div class="moon-phase ekadashi" aria-label="Ekadashi">একাদশী</div>`;
        }

        // Accessibility label
        const dayName = currentLang === 'bn'
          ? (data ? data.englishDayBn : DAYS_BN[new Date(year, month, day).getDay()])
          : (data ? data.englishDay : DAYS_EN[new Date(year, month, day).getDay()]);
        const ariaLabel = `${dayName}, ${ENGLISH_MONTHS[month]} ${day}, ${year}${data && data.holiday ? ` - ${data.holidayName}` : ''}`;

        html += `
          <div class="calendar-cell${todayClass}${sundayClass}${holidayClass}"
               data-date="${dateStr}"
               tabindex="0"
               role="gridcell"
               aria-label="${ariaLabel}"
               onmouseenter="window._showTooltip(event, '${dateStr}')"
               onmouseleave="window._hideTooltip()"
               onfocus="window._showTooltip(event, '${dateStr}')"
               onblur="window._hideTooltip()">
            <div class="cell-english-date">${englishDateDisplay}</div>
            <div class="cell-bengali-info">${bengaliInfo}</div>
            ${holidayName}
            ${moonPhaseHtml}
          </div>`;
      }

      // Trailing empty cells to complete the last row
      const totalCells = startDay + totalDays;
      const remainder = totalCells % 7;
      if (remainder !== 0) {
        for (let i = 0; i < 7 - remainder; i++) {
          html += '<div class="calendar-cell empty" aria-hidden="true"></div>';
        }
      }

      grid.innerHTML = html;

      // Update month select
      const monthSelect = $id('monthSelect');
      if (monthSelect) monthSelect.value = month;

      // Render holiday panel
      renderHolidayPanel(year, month);

      // Animate in
      grid.classList.remove('fade-out');
      grid.classList.add('fade-in');
      setTimeout(() => grid.classList.remove('fade-in'), 300);

    }, 200); // Wait for fade-out to complete
  }

  /** Render day-of-week headers */
  function renderDayHeaders() {
    const headers = $id('dayHeaders');
    const days = currentLang === 'bn' ? DAYS_BN : DAYS_EN;
    headers.innerHTML = days.map((d, i) =>
      `<div class="day-header${i === 0 ? ' sunday' : ''}">${d}</div>`
    ).join('');
  }

  /** Render the month title above the calendar */
  function renderMonthTitle() {
    const titleEl = $id('monthTitle');
    if (currentLang === 'bn') {
      titleEl.textContent = `${ENGLISH_MONTHS[currentMonth]} ${toBengaliNumeral(currentYear)}`;
    } else {
      titleEl.textContent = `${ENGLISH_MONTHS[currentMonth]} ${currentYear}`;
    }
  }

  /** Render the subtitle in the header showing Bengali month/year info */
  function renderHeaderSubtitle() {
    const subtitleEl = $id('headerSubtitle');
    if (!calendarData.length) {
      subtitleEl.textContent = '';
      return;
    }

    // Find the first and last day of this Gregorian month in the data
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const monthData = calendarData.filter((d) => d.englishDate.startsWith(`2026-${monthStr}`));

    if (monthData.length === 0) {
      subtitleEl.textContent = '';
      return;
    }

    const first = monthData[0];
    const last = monthData[monthData.length - 1];

    if (currentLang === 'bn') {
      subtitleEl.textContent = `${first.bengaliMonth} – ${last.bengaliMonth}, ${first.bengaliYearBn} বঙ্গাব্দ`;
    } else {
      subtitleEl.textContent = `${first.bengaliMonthEn} – ${last.bengaliMonthEn}, ${first.bengaliYear} BS`;
    }
  }

  /** Show out-of-range message when navigating outside 2026 */
  function showOutOfRange() {
    const grid = $id('calendarGrid');
    grid.innerHTML = `
      <div class="out-of-range" style="grid-column: 1 / -1;">
        <span class="out-of-range-icon">📅</span>
        <p>${currentLang === 'bn'
          ? 'এই ক্যালেন্ডারে শুধুমাত্র ২০২৬ সালের তথ্য রয়েছে।'
          : 'This calendar only contains data for the year 2026.'}</p>
      </div>`;

    // Clear holiday panel
    $id('holidayList').innerHTML = '';
  }

  // ─── HOLIDAY PANEL ────────────────────────────────────────

  /**
   * Render the holiday list panel for the given month.
   * @param {number} year
   * @param {number} month - 0-indexed
   */
  function renderHolidayPanel(year, month) {
    const listEl = $id('holidayList');
    const monthStr = String(month + 1).padStart(2, '0');

    // Filter holidays for this month
    const holidays = calendarData.filter((d) =>
      d.englishDate.startsWith(`${year}-${monthStr}`) && d.holiday
    );

    if (holidays.length === 0) {
      listEl.innerHTML = `
        <div class="no-holidays">
          <span class="no-holidays-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <p>${currentLang === 'bn' ? 'এই মাসে কোনো ছুটি বা উৎসব নেই' : 'No holidays or festivals this month'}</p>
        </div>
      `;return;
    }

    listEl.innerHTML = holidays.map((h) => {
      const day = parseInt(h.englishDate.split('-')[2]);
      const dayName = currentLang === 'bn' ? h.englishDayBn : h.englishDay;
      const typeLabelMap = {
        'national': currentLang === 'bn' ? 'জাতীয়' : 'National',
        'bengali_festival': currentLang === 'bn' ? 'বাংলা উৎসব' : 'Bengali Festival'
      };

      return `
        <div class="holiday-item">
          <div class="holiday-date-badge ${h.holidayType}">
            ${day}
            <span class="badge-day">${dayName.substring(0, 3)}</span>
          </div>
          <div class="holiday-info">
            <div class="holiday-name-en">${currentLang === 'bn' ? h.holidayNameBn : h.holidayName}</div>
            <div class="holiday-name-bn">${currentLang === 'bn' ? h.holidayName : h.holidayNameBn}</div>
            <span class="holiday-type-badge ${h.holidayType}">${typeLabelMap[h.holidayType] || h.holidayType}</span>
          </div>
        </div>`;
    }).join('');
  }

  // ─── NAVIGATION ───────────────────────────────────────────

  /**
   * Navigate to the previous or next month.
   * @param {number} direction - -1 for prev, +1 for next
   */
  function navigateMonth(direction) {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    renderCalendar(newYear, newMonth);
  }

  /** Jump to today's month (or January 2026 if not in 2026) */
  function goToToday() {
    const today = new Date();
    if (today.getFullYear() === 2026) {
      renderCalendar(2026, today.getMonth());
    } else {
      renderCalendar(2026, 0);
    }
  }

  /**
   * Jump to a specific date string.
   * @param {string} dateStr - ISO date string (YYYY-MM-DD)
   */
  function jumpToDate(dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    renderCalendar(year, month);
  }

  // ─── TOOLTIP ──────────────────────────────────────────────

  /**
   * Show the tooltip for a given date.
   * Positioned near the cursor/element.
   * @param {Event} event
   * @param {string} dateStr - ISO date string
   */
  function showTooltip(event, dateStr) {
    const data = calendarData.find((d) => d.englishDate === dateStr);
    if (!data) return;

    const tooltip = $id('tooltip');

    const dayName = currentLang === 'bn' ? data.englishDayBn : data.englishDay;
    const bengaliDate = `${data.bengaliDateBn} ${data.bengaliMonth}, ${data.bengaliYearBn}`;
    const englishDate = `${data.englishDay}, ${ENGLISH_MONTHS[parseInt(data.englishDate.split('-')[1]) - 1]} ${parseInt(data.englishDate.split('-')[2])}, ${data.englishDate.split('-')[0]}`;

    let holidayHtml = '';
    if (data.holiday) {
      const hName = currentLang === 'bn' ? data.holidayNameBn : data.holidayName;
      holidayHtml = `
        <div class="tooltip-holiday">
          <div class="tooltip-holiday-name ${data.holidayType}">🎊 ${hName}</div>
        </div>`;
    }

    tooltip.innerHTML = `
      <div class="tooltip-english-date">${englishDate}</div>
      <div class="tooltip-bengali-date">${bengaliDate}</div>
      <div class="tooltip-day">${dayName}</div>
      ${holidayHtml}`;

    // Position tooltip
    const rect = event.target.closest('.calendar-cell').getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 150;

    let left = rect.right + 8;
    let top = rect.top;

    // Keep within viewport
    if (left + tooltipWidth > window.innerWidth) {
      left = rect.left - tooltipWidth - 8;
    }
    if (top + tooltipHeight > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - 16;
    }
    if (top < 8) top = 8;
    if (left < 8) left = 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.add('visible');
      tooltip.setAttribute('aria-hidden', 'false');
    }, 100);
  }

  /** Hide the tooltip */
  function hideTooltip() {
    clearTimeout(tooltipTimeout);
    const tooltip = $id('tooltip');
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // Expose tooltip functions globally for inline event handlers
  window._showTooltip = showTooltip;
  window._hideTooltip = hideTooltip;

  // ─── PRINT ────────────────────────────────────────────────

  /** Trigger the browser's print dialog */
  function printCalendar() {
    window.print();
  }

  // ─── PDF LIBRARY LAZY LOADER ─────────────────────────────

  /** Cache for the PDF library loading promise */
  let _pdfLibsPromise = null;

  /**
   * Dynamically load a script from a URL and return a Promise.
   * @param {string} src - Script URL
   * @returns {Promise<void>}
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { resolve(); return; }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Ensure html2canvas and jsPDF are loaded. Lazy-loads from CDN on first call.
   * Returns a cached promise on subsequent calls.
   * @returns {Promise<void>}
   */
  function ensurePdfLibs() {
    if (_pdfLibsPromise) return _pdfLibsPromise;

    _pdfLibsPromise = Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
    ]).catch((err) => {
      // Reset so user can retry
      _pdfLibsPromise = null;
      throw err;
    });

    return _pdfLibsPromise;
  }

  // ─── PDF GENERATION ───────────────────────────────────────

  /**
   * Show the loading overlay with optional custom text.
   * @param {string} [text]
   */
  function showLoading(text) {
    const overlay = $id('loadingOverlay');
    if (text) {
      $id('loadingText').textContent = text;
    }
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  /** Hide the loading overlay */
  function hideLoading() {
    const overlay = $id('loadingOverlay');
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  /**
   * Download the currently displayed month as a landscape PDF.
   * Uses html2canvas to capture the calendar and jsPDF to create the PDF.
   */
  async function downloadMonthPDF() {
    showLoading(currentLang === 'bn' ? 'PDF তৈরি হচ্ছে...' : 'Generating PDF...');

    try {
      // Lazy-load PDF libraries
      await ensurePdfLibs();

      // Small delay to let overlay render
      await new Promise((r) => setTimeout(r, 100));

      const section = $id('calendarSection');
      const monthDisplay = $id('monthDisplay');

      // Create a temporary wrapper for capture
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;background:#fff;padding:32px;width:1000px;';
      wrapper.appendChild(monthDisplay.cloneNode(true));
      wrapper.appendChild(section.cloneNode(true));
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.setAttribute('data-theme', 'light');
          // Disable all transitions so theme switch is instant
          const style = clonedDoc.createElement('style');
          style.textContent = '* { transition: none !important; animation: none !important; }';
          clonedDoc.head.appendChild(style);
        }
      });

      document.body.removeChild(wrapper);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availWidth = pageWidth - 2 * margin;
      const availHeight = pageHeight - 2 * margin;

      const imgRatio = canvas.width / canvas.height;
      let imgWidth = availWidth;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > availHeight) {
        imgHeight = availHeight;
        imgWidth = imgHeight * imgRatio;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const monthName = ENGLISH_MONTHS[currentMonth];
      pdf.save(`Bengali_Calendar_${monthName}_2026.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(currentLang === 'bn'
        ? 'PDF তৈরি করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।'
        : 'Failed to generate PDF. Please check your internet connection.');
    } finally {
      hideLoading();
    }
  }

  /**
   * Download all 12 months as a multi-page landscape PDF.
   * Iterates through each month, temporarily renders it, captures, and adds to PDF.
   */
  async function downloadYearPDF() {

    showLoading(currentLang === 'bn' ? 'সম্পূর্ণ বছরের PDF তৈরি হচ্ছে...' : 'Generating full year PDF...');

    const savedMonth = currentMonth;

    try {
      // Lazy-load PDF libraries
      await ensurePdfLibs();

      await new Promise((r) => setTimeout(r, 100));

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availWidth = pageWidth - 2 * margin;
      const availHeight = pageHeight - 2 * margin;

      for (let m = 0; m < 12; m++) {
        // Update loading text
        const progress = currentLang === 'bn'
          ? `${ENGLISH_MONTHS[m]} তৈরি হচ্ছে... (${toBengaliNumeral(m + 1)}/১২)`
          : `Generating ${ENGLISH_MONTHS[m]}... (${m + 1}/12)`;
        $id('loadingText').textContent = progress;

        // Render month temporarily (synchronously set grid)
        renderCalendarSync(2026, m);
        await new Promise((r) => setTimeout(r, 300));

        const section = $id('calendarSection');
        const monthDisplay = $id('monthDisplay');

        // Create temp wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;background:#fff;padding:32px;width:1000px;';
        wrapper.appendChild(monthDisplay.cloneNode(true));
        wrapper.appendChild(section.cloneNode(true));
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            clonedDoc.documentElement.setAttribute('data-theme', 'light');
            // Disable all transitions so theme switch is instant
            const style = clonedDoc.createElement('style');
            style.textContent = '* { transition: none !important; animation: none !important; }';
            clonedDoc.head.appendChild(style);
          }
        });

        document.body.removeChild(wrapper);

        if (m > 0) pdf.addPage();

        const imgRatio = canvas.width / canvas.height;
        let imgWidth = availWidth;
        let imgHeight = imgWidth / imgRatio;

        if (imgHeight > availHeight) {
          imgHeight = availHeight;
          imgWidth = imgHeight * imgRatio;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }

      pdf.save('Bengali_Calendar_2026_Full_Year.pdf');
    } catch (err) {
      console.error('Year PDF generation failed:', err);
      alert(currentLang === 'bn'
        ? 'PDF তৈরি করতে সমস্যা হয়েছে।'
        : 'Failed to generate year PDF.');
    } finally {
      // Restore original month
      renderCalendar(2026, savedMonth);
      hideLoading();
    }
  }

  /**
   * Synchronous render (no animation) for PDF generation.
   * @param {number} year
   * @param {number} month - 0-indexed
   */
  function renderCalendarSync(year, month) {
    currentYear = year;
    currentMonth = month;

    renderDayHeaders();
    renderMonthTitle();
    renderHeaderSubtitle();

    const grid = $id('calendarGrid');
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    let html = '';

    for (let i = 0; i < startDay; i++) {
      html += '<div class="calendar-cell empty" aria-hidden="true"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
      const data = getDateData(year, month, day);
      const isSunday = new Date(year, month, day).getDay() === 0;
      const todayClass = isToday(year, month, day) ? ' today' : '';
      const sundayClass = isSunday ? ' sunday' : '';
      let holidayClass = '';

      if (data && data.holiday && data.holidayType) {
        holidayClass = ` holiday-${data.holidayType}`;
      }

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const bengaliInfo = data ? `${data.bengaliDateBn} ${data.bengaliMonth}` : '';

      let holidayName = '';
      if (data && data.eventTextBn) {
        const textHtml = data.eventTextBn.replace(/\n/g, '<br>');
        holidayName = `<div class="cell-holiday-name">${textHtml}</div>`;
      }

      let moonPhaseHtml = '';
      if (data && data.amavasya) {
        moonPhaseHtml = `<div class="moon-phase amavasya" aria-label="Amavasya">অমাবস্যা</div>`;
      } else if (data && data.purnima) {
        moonPhaseHtml = `<div class="moon-phase purnima" aria-label="Purnima">পূর্ণিমা</div>`;
      } else if (data && data.ekadashi) {
        moonPhaseHtml = `<div class="moon-phase ekadashi" aria-label="Ekadashi">একাদশী</div>`;
      }

      html += `
        <div class="calendar-cell${todayClass}${sundayClass}${holidayClass}" data-date="${dateStr}">
          <div class="cell-english-date">${day}</div>
          <div class="cell-bengali-info">${bengaliInfo}</div>
          ${holidayName}
          ${moonPhaseHtml}
        </div>`;
    }

    const totalCells = startDay + totalDays;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        html += '<div class="calendar-cell empty" aria-hidden="true"></div>';
      }
    }

    grid.innerHTML = html;
    renderHolidayPanel(year, month);
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────

  /** Set up all event listeners for interactive elements */
  function setupEventListeners() {
    // Month navigation
    $id('prevMonth').addEventListener('click', () => navigateMonth(-1));
    $id('nextMonth').addEventListener('click', () => navigateMonth(1));
    $id('todayBtn').addEventListener('click', goToToday);

    // Month/Year selects
    $id('monthSelect').addEventListener('change', (e) => {
      renderCalendar(currentYear, parseInt(e.target.value));
    });

    $id('yearSelect').addEventListener('change', (e) => {
      renderCalendar(parseInt(e.target.value), currentMonth);
    });

    // Jump to date
    $id('jumpDate').addEventListener('change', (e) => {
      jumpToDate(e.target.value);
    });

    // Language toggle
    $id('langToggle').addEventListener('click', toggleLanguage);

    // Dark mode toggle
    $id('darkToggle').addEventListener('click', toggleDarkMode);

    // Print
    $id('printBtn').addEventListener('click', printCalendar);

    // PDF dropdown toggle
    $id('pdfBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      $id('pdfDropdown').classList.toggle('open');
    });

    // PDF download options
    $id('downloadMonthPdf').addEventListener('click', () => {
      $id('pdfDropdown').classList.remove('open');
      downloadMonthPDF();
    });

    $id('downloadYearPdf').addEventListener('click', () => {
      $id('pdfDropdown').classList.remove('open');
      downloadYearPDF();
    });

    // Mobile PDF download options
    $id('mobileDownloadMonthPdf').addEventListener('click', () => {
      $id('navBar').classList.remove('open');
      $id('hamburgerBtn').classList.remove('active');
      downloadMonthPDF();
    });

    $id('mobileDownloadYearPdf').addEventListener('click', () => {
      $id('navBar').classList.remove('open');
      $id('hamburgerBtn').classList.remove('active');
      downloadYearPDF();
    });

    // Close PDF dropdown on outside click
    document.addEventListener('click', () => {
      $id('pdfDropdown').classList.remove('open');
    });

    // Hamburger menu for mobile
    $id('hamburgerBtn').addEventListener('click', () => {
      const btn = $id('hamburgerBtn');
      const nav = $id('navBar');
      btn.classList.toggle('active');
      nav.classList.toggle('open');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        navigateMonth(-1);
      } else if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        navigateMonth(1);
      } else if (e.key === 'Escape') {
        hideTooltip();
        $id('pdfDropdown').classList.remove('open');
      }
    });
  }

})();
