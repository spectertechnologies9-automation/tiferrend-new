// Enquiry form: inline validation, error summary, honest submission.
// With site.formEndpoint set it POSTs JSON and reports success only on a 2xx response.
// Without an endpoint it opens the visitor's email app with the message filled in, and says exactly that.
import { $, $$ } from './env.js';

const rules = {
  name: (v) => (v.trim() ? '' : 'Please tell us your name.'),
  email: (v) => (!v.trim() ? 'We need an email to reply to.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email doesn’t look right — check for typos.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'A line or two about the project helps us reply properly (10+ characters).'),
};

export function init() {
  const form = $('[data-form]');
  if (!form) return;
  const summary = $('[data-form-errors]', form);
  const status = $('[data-form-status]', form);
  const btn = $('[data-submit]', form);
  const label = $('[data-submit-label]', form);
  const endpoint = form.dataset.endpoint;

  const check = (input) => {
    const rule = rules[input.name];
    if (!rule) return '';
    const msg = rule(input.value);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = document.getElementById(`${input.id}-err`);
    if (err) err.textContent = msg;
    return msg;
  };

  // Validate on blur, then live once a field has been flagged.
  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('blur', () => input.value && check(input));
    input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && check(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form__status';
    const fields = ['name', 'email', 'message'].map((n) => form.elements[n]);
    const errors = fields.map((f) => [f, check(f)]).filter(([, m]) => m);
    if (errors.length) {
      summary.hidden = false;
      summary.innerHTML = `<strong>Please fix ${errors.length === 1 ? 'one thing' : `${errors.length} things`}:</strong><ul>${errors
        .map(([f, m]) => `<li><a href="#${f.id}">${m}</a></li>`)
        .join('')}</ul>`;
      summary.focus();
      return;
    }
    summary.hidden = true;
    if (form.elements._gotcha.value) return; // bot

    const data = Object.fromEntries(new FormData(form));
    data.services = $$('input[name="services"]:checked', form).map((c) => c.value).join(', ');
    delete data._gotcha;

    if (!endpoint) {
      const body = [`Name: ${data.name}`, `Email: ${data.email}`, data.company && `Company: ${data.company}`, data.phone && `Phone: ${data.phone}`, data.services && `Services: ${data.services}`, data.timeline && `Timeline: ${data.timeline}`, '', data.message]
        .filter((x) => x !== undefined && x !== '')
        .join('\n');
      const href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Project enquiry — ${data.name}`)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      status.classList.add('is-ok');
      status.innerHTML = `Your email app should now be open with the message ready. <strong>It isn’t sent until you press send there.</strong> No email app? Write to <a href="mailto:${form.dataset.email}">${form.dataset.email}</a>.`;
      return;
    }

    btn.disabled = true;
    label.textContent = 'Sending…';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.classList.add('is-ok');
      status.textContent = 'Thank you — your enquiry has been received. We’ll reply within a few working days.';
    } catch {
      status.classList.add('is-err');
      status.innerHTML = `Sorry, that didn’t go through and nothing was sent. Please try again, or email <a href="mailto:${form.dataset.email}">${form.dataset.email}</a>.`;
    } finally {
      btn.disabled = false;
      label.textContent = 'Send enquiry';
      status.focus?.();
    }
  });
}
