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

  /* ---------- LOGIN ---------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var usuario = document.getElementById('usuario').value.trim();
      var clave = document.getElementById('clave').value.trim();
      var alertBox = document.getElementById('loginAlert');
      if (!usuario || !clave) {
        alertBox.classList.add('show');
        return;
      }
      alertBox.classList.remove('show');
      // Persistencia simple de sesión (UI). Reemplazar por auth real en backend.
      try {
        var store = document.getElementById('recordar').checked ? localStorage : sessionStorage;
        store.setItem('lc_user', usuario);
      } catch (err) {}
      window.location.href = 'portal.html';
    });
  }

  /* ---------- PORTAL: sesión / usuario ---------- */
  function getUser() {
    try {
      return localStorage.getItem('lc_user') || sessionStorage.getItem('lc_user') || '';
    } catch (err) { return ''; }
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
      window.location.href = 'https://www.latamconsultus.com/';
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

  /* ---------- Envío de formularios (simulado) ---------- */
  function wireForm(formId, alertId, requiredIds) {
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
      if (alertBox) {
        alertBox.classList.remove('alert-error');
        alertBox.classList.add('alert-success', 'show');
        alertBox.textContent = successMsg;
      }
      form.reset();
      // Resetea labels de archivos
      var names = form.querySelectorAll('.file-name');
      for (var n = 0; n < names.length; n++) {
        names[n].textContent = 'Ningún archivo seleccionado';
        names[n].classList.remove('has-file');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mis Portafolios
  wireForm('form-portafolios', 'alert-portafolios', ['codigo', 'f-portafolio']);
  wireForm('form-top10', 'alert-portafolios', ['f-top10']);
  // Estrategias
  wireForm('form-medida', 'alert-medida', ['m-monto']);
  // Bonos
  wireForm('form-listado', 'alert-bonos', []);
  wireForm('form-bono-analisis', 'alert-bonos', ['ba-isin']);
  wireForm('form-swap', 'alert-bonos', ['sw-isin']);
  // Fondos Mutuos
  wireForm('form-factsheet', 'alert-fondos', ['fs-isin']);
  wireForm('form-fondo-analisis', 'alert-fondos', ['fa-isin']);
  wireForm('form-fondo-comp', 'alert-fondos', ['fc-isins']);
  // ETFs
  wireForm('form-etf-analisis', 'alert-etfs', ['ea-ticker']);
  wireForm('form-etf-h2h', 'alert-etfs', ['h2h-a', 'h2h-b']);
  // Acciones, Preferidas y Estructurados
  wireForm('form-accion-analisis', 'alert-acciones', ['aa-ticker']);
  wireForm('form-equity-snapshot', 'alert-acciones', ['es-ticker']);
  wireForm('form-estructurado-medida', 'alert-acciones', []);
  wireForm('form-estructurado-analisis', 'alert-acciones', ['f-ficha']);
  // Contacto (home)
  wireForm('contactForm', 'contactAlert', ['c-nombre', 'c-email', 'c-mensaje']);

})();
