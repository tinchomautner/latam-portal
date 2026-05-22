/* ============================================================
   LATAM ConsultUs — Portal de Clientes
   Lógica de UI (navegación, login simulado, formularios)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- NAV móvil (home) ---------- */
  var navToggle = document.getElementById('navToggle');
  var navInner = document.getElementById('navInner');
  if (navToggle && navInner) {
    navToggle.addEventListener('click', function () {
      navInner.classList.toggle('expanded');
    });
  }

  /* ---------- Sesión ---------- */
  function getUser() {
    try {
      return localStorage.getItem('lc_user') || sessionStorage.getItem('lc_user') || '';
    } catch (err) { return ''; }
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- LOGIN ---------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var usuario = document.getElementById('usuario').value.trim();
      var clave = document.getElementById('clave').value.trim();
      var alertBox = document.getElementById('loginAlert');
      if (!EMAIL_RE.test(usuario) || !clave) {
        alertBox.classList.add('show');
        return;
      }
      alertBox.classList.remove('show');
      // Persistencia simple de sesión (UI). El email se reutiliza para la confirmación.
      try {
        var store = document.getElementById('recordar').checked ? localStorage : sessionStorage;
        store.setItem('lc_user', usuario);
      } catch (err) {}
      window.location.href = 'portal.html';
    });
  }

  /* ---------- PORTAL: candado de sesión ---------- */
  // Si se entra al portal sin sesión, volver al login (necesitamos el email para la confirmación).
  if (document.querySelector('.portal-shell') && !getUser()) {
    window.location.replace('index.html');
    return;
  }

  var userNameEl = document.getElementById('userName');
  var userAvatarEl = document.getElementById('userAvatar');
  if (userNameEl) {
    var u = getUser();
    if (u) {
      var display = u.indexOf('@') > -1 ? u.split('@')[0] : u;
      userNameEl.textContent = display;
      if (userAvatarEl) userAvatarEl.textContent = display.charAt(0).toUpperCase();
      var heroUser = document.getElementById('heroUser');
      if (heroUser) heroUser.textContent = ', ' + display;
    }
  }

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      try {
        localStorage.removeItem('lc_user');
        sessionStorage.removeItem('lc_user');
      } catch (err) {}
      window.location.href = 'index.html';
    });
  }

  /* ---------- PORTAL: navegación entre secciones ---------- */
  var sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  var crumbCurrent = document.getElementById('crumbCurrent');
  var sidebar = document.getElementById('sidebar');

  function showSection(name) {
    var sections = document.querySelectorAll('.form-section');
    for (var i = 0; i < sections.length; i++) sections[i].classList.remove('active');
    var target = document.getElementById('sec-' + name);
    if (target) target.classList.add('active');

    for (var j = 0; j < sidebarLinks.length; j++) {
      sidebarLinks[j].classList.toggle('active', sidebarLinks[j].getAttribute('data-section') === name);
      if (sidebarLinks[j].getAttribute('data-section') === name && crumbCurrent) {
        crumbCurrent.textContent = sidebarLinks[j].textContent.trim();
      }
    }
    if (sidebar) sidebar.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  for (var k = 0; k < sidebarLinks.length; k++) {
    sidebarLinks[k].addEventListener('click', function () {
      showSection(this.getAttribute('data-section'));
    });
  }

  // Tarjetas del dashboard que llevan a una sección
  var goCards = document.querySelectorAll('[data-go]');
  for (var m = 0; m < goCards.length; m++) {
    goCards[m].addEventListener('click', function () {
      showSection(this.getAttribute('data-go'));
    });
  }

  /* ---------- PORTAL: sidebar móvil ---------- */
  var sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  }
  function syncSidebarToggle() {
    if (sidebarToggle) sidebarToggle.style.display = window.innerWidth <= 860 ? 'block' : 'none';
  }
  if (sidebarToggle) { syncSidebarToggle(); window.addEventListener('resize', syncSidebarToggle); }

  /* ---------- File inputs personalizados ---------- */
  var fileInputs = document.querySelectorAll('input[type="file"]');
  for (var f = 0; f < fileInputs.length; f++) {
    fileInputs[f].addEventListener('change', function () {
      var label = document.querySelector('.file-name[data-for="' + this.id + '"]');
      if (!label) return;
      if (this.files && this.files.length) {
        label.textContent = this.files[0].name;
        label.classList.add('has-file');
      } else {
        label.textContent = 'Ningún archivo seleccionado';
        label.classList.remove('has-file');
      }
    });
  }

  /* ---------- Envío por email (FormSubmit) ---------- */
  // Las solicitudes llegan a este Gmail; la confirmación va al email del login.
  var FORM_ENDPOINT = 'https://formsubmit.co/martinmautner@gmail.com';
  var CONFIRMACION =
    'Estimado Asesor.\n\n' +
    'Su solicitud está siendo procesada.\n\n' +
    'En un plazo máximo de 24 hs hábiles quedará disponible en su biblioteca.\n\n' +
    'Atte.\nEl equipo de LATAM ConsultUs';

  function cleanLabel(t) { return (t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim(); }

  function fieldLabel(el, form) {
    // La etiqueta descriptiva es el primer <label> del contenedor .field
    // (ignorando el "Seleccionar archivo" de los inputs de archivo).
    var field = el.closest ? el.closest('.field') : null;
    if (field) {
      var lbl = field.querySelector('label:not(.file-trigger)');
      if (lbl) return cleanLabel(lbl.textContent);
    }
    if (el.id) {
      var l = form.querySelector('label[for="' + el.id + '"]');
      if (l && !l.classList.contains('file-trigger')) return cleanLabel(l.textContent);
    }
    return el.getAttribute('placeholder') || el.name || el.id || 'Campo';
  }

  function sendForm(form, subject) {
    var fd = new FormData();
    var email = getUser();
    var els = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'submit' || el.type === 'button') continue;
      var key = fieldLabel(el, form);
      if (el.type === 'file') {
        if (el.files && el.files.length) fd.append(key, el.files[0], el.files[0].name);
      } else if (el.type === 'checkbox') {
        fd.append(key, el.checked ? 'Sí' : 'No');
      } else {
        fd.append(key, el.value ? el.value : '—');
      }
    }
    fd.append('email', email);            // FormSubmit: destinatario de la confirmación + reply-to
    fd.append('_subject', subject || 'Nueva solicitud — Portal LATAM ConsultUs');
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    fd.append('_autoresponse', CONFIRMACION);
    try { fetch(FORM_ENDPOINT, { method: 'POST', body: fd, mode: 'no-cors' }); } catch (err) {}
  }

  function wireForm(formId, alertId, requiredIds, subject) {
    var form = document.getElementById(formId);
    if (!form) return;
    var alertEl = document.getElementById(alertId);
    var successMsg = alertEl ? alertEl.textContent.trim() : 'Solicitud enviada correctamente.';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      for (var i = 0; i < requiredIds.length; i++) {
        var el = document.getElementById(requiredIds[i]);
        if (!el) continue;
        var empty = el.type === 'file' ? !(el.files && el.files.length) : !el.value.trim();
        if (empty) { ok = false; el.style.borderColor = 'var(--red)'; }
        else { el.style.borderColor = ''; }
      }
      var alertBox = document.getElementById(alertId);
      if (!ok) {
        if (alertBox) {
          alertBox.classList.remove('alert-success');
          alertBox.classList.add('alert-error', 'show');
          alertBox.textContent = 'Por favor complete los campos obligatorios (*).';
        }
        return;
      }
      // Enviar el email ANTES de limpiar el formulario (para no perder valores/archivos)
      sendForm(form, subject);
      if (alertBox) {
        alertBox.classList.remove('alert-error');
        alertBox.classList.add('alert-success', 'show');
        alertBox.textContent = successMsg;
      }
      form.reset();
      var names = form.querySelectorAll('.file-name');
      for (var n = 0; n < names.length; n++) {
        names[n].textContent = 'Ningún archivo seleccionado';
        names[n].classList.remove('has-file');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mis Portafolios
  wireForm('form-portafolios', 'alert-portafolios', ['codigo', 'f-portafolio'], 'Nueva solicitud — Diagnóstico / Rentabilidad de Portafolio');
  wireForm('form-top10', 'alert-portafolios', ['f-top10'], 'Nueva solicitud — Top 10 Holdings');
  // Estrategias
  wireForm('form-medida', 'alert-medida', ['m-monto'], 'Nueva solicitud — Portafolio a medida');
  // Bonos
  wireForm('form-listado', 'alert-bonos', [], 'Nueva solicitud — Listado de bonos con condiciones');
  wireForm('form-bono-analisis', 'alert-bonos', ['ba-isin'], 'Nueva solicitud — Análisis de un bono');
  wireForm('form-swap', 'alert-bonos', ['sw-isin'], 'Nueva solicitud — How can I swap?');
  // Fondos Mutuos
  wireForm('form-factsheet', 'alert-fondos', ['fs-isin'], 'Nueva solicitud — Factsheet Delivery');
  wireForm('form-fondo-analisis', 'alert-fondos', ['fa-isin'], 'Nueva solicitud — Análisis de fondo');
  wireForm('form-fondo-comp', 'alert-fondos', ['fc-isins'], 'Nueva solicitud — Comparativo de fondos');
  // ETFs
  wireForm('form-etf-analisis', 'alert-etfs', ['ea-ticker'], 'Nueva solicitud — Análisis de ETF / sector');
  wireForm('form-etf-h2h', 'alert-etfs', ['h2h-a', 'h2h-b'], 'Nueva solicitud — Comparativo de ETFs (Head to Head)');
  // Acciones, Preferidas y Estructurados
  wireForm('form-accion-analisis', 'alert-acciones', ['aa-ticker'], 'Nueva solicitud — Análisis de una acción');
  wireForm('form-equity-snapshot', 'alert-acciones', ['es-ticker'], 'Nueva solicitud — Equity Snapshot');
  wireForm('form-estructurado-medida', 'alert-acciones', [], 'Nueva solicitud — Producto estructurado a medida');
  wireForm('form-estructurado-analisis', 'alert-acciones', ['f-ficha'], 'Nueva solicitud — Análisis de producto estructurado');

})();
