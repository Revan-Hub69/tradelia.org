# Esempio Integrazione Compliance Info

## Come Usare

### 1. Importa CSS e JS

```html
<!-- In accesso.html o dashboard.html -->
<link rel="stylesheet" href="/assets/css/components/compliance-info.css" />
<script type="module" src="/assets/js/components/compliance-info.js"></script>
```

### 2. Aggiungi Info Icon ai Label

```html
<!-- Esempio: Password field -->
<label for="password" class="access-label">
  Password
  <!-- Aggiungi info icon -->
</label>
<input type="password" id="password" name="password" />

<script type="module">
  import { createComplianceInfo } from "/assets/js/components/compliance-info.js";

  // Aggiungi info icon al label password
  const passwordLabel = document.querySelector('label[for="password"]');
  if (passwordLabel) {
    const infoIcon = createComplianceInfo("password-min-12", "top");
    if (infoIcon) {
      passwordLabel.appendChild(infoIcon);
    }
  }
</script>
```

### 3. Esempi Completi

#### Password Minimo 12 Caratteri

```html
<label for="password" class="access-label">
  Password
  <span id="password-info"></span>
</label>
<input type="password" id="password" name="password" minlength="12" />

<script type="module">
  import { createComplianceInfo } from "/assets/js/components/compliance-info.js";

  const infoIcon = createComplianceInfo("password-min-12", "top");
  document.getElementById("password-info").appendChild(infoIcon);
</script>
```

#### Privacy Checkbox

```html
<label class="access-checkbox-label">
  <input type="checkbox" id="privacy" name="privacy" required />
  <span>
    Accetto la privacy policy
    <span id="privacy-info"></span>
  </span>
</label>

<script type="module">
  import { createComplianceInfo } from "/assets/js/components/compliance-info.js";

  const infoIcon = createComplianceInfo("privacy-checkbox", "top");
  document.getElementById("privacy-info").appendChild(infoIcon);
</script>
```

#### Rate Limiting (Feedback)

```html
<div class="rate-limiting-feedback">
  Tentativi rimanenti: <span id="attempts">5</span>/5
  <span id="rate-limiting-info"></span>
</div>

<script type="module">
  import { createComplianceInfo } from "/assets/js/components/compliance-info.js";

  const infoIcon = createComplianceInfo("rate-limiting", "right");
  document.getElementById("rate-limiting-info").appendChild(infoIcon);
</script>
```

## Chiavi Disponibili

- `password-min-12` - Perché minimo 12 caratteri
- `password-strength` - Perché strength indicator
- `password-no-complexity` - Perché non forziamo simboli
- `email-realtime-validation` - Perché validazione real-time
- `privacy-checkbox` - Perché checkbox non pre-selezionata
- `rate-limiting` - Perché max 5 tentativi
- `billing-progressive-disclosure` - Perché fatturazione solo prima checkout
- `modal-focus-trap` - Perché focus trap nei modali
- `modal-aria` - Perché role="dialog"
- `modal-escape` - Perché Escape chiude
- `label-explicit` - Perché label espliciti
- `error-field-association` - Perché errori associati ai campi

## Personalizzazione

Aggiungi nuove spiegazioni in `compliance-info.js`:

```javascript
const COMPLIANCE_EXPLANATIONS = {
  "nuova-chiave": {
    title: "Titolo semplice",
    explanation: "Spiegazione chiara e breve",
    source: "Standard/Fonte",
    link: "/docs/path.md#section",
  },
};
```
