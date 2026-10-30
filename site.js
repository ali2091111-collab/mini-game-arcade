// Mini Game Arcade — site-only script (contact placeholder).
// This file does NOT send anything anywhere. It only shows an on-page
// note when the placeholder contact form is submitted.
(function () {
  "use strict";
  var form = document.getElementById("contactForm");
  var note = document.getElementById("contactNote");
  if (!form || !note) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    note.textContent = "Not sent: this contact form is a placeholder and is not connected to an email service yet. Nothing you typed has left your browser.";
  });
})();
