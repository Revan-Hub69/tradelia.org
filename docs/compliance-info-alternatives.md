# Alternative Compliance Info - Più Leggere

## Analisi Peso Attuale

- **JS**: 249 righe (~8KB)
- **CSS**: 126 righe (~3KB)
- **Totale**: ~375 righe (~11KB)

## Opzioni Alternative

### Opzione 1: Solo `title=""` HTML Nativo (LEGGERISSIMO)

```html
<label for="password">
  Password
  <span
    class="info-icon"
    title="NIST 800-63B: password più lunghe sono più sicure"
    aria-label="Info standard accademici"
    >ℹ️</span
  >
</label>
```

**Pro**: Zero JS, zero CSS aggiuntivo, tooltip browser nativo  
**Contro**: Meno controllo styling, meno informazioni

---

### Opzione 2: Testo Piccolo Inline (SEMPLICE)

```html
<label for="password" class="access-label">
  Password
  <small class="compliance-hint"> (Min. 12 caratteri - NIST 800-63B) </small>
</label>
```

**Pro**: Semplicissimo, sempre visibile, zero JS  
**Contro**: Può essere verboso

---

### Opzione 3: Link Discreto a Documentazione (MINIMALE)

```html
<label for="password" class="access-label">
  Password
  <a href="/docs/compliance.md#password" class="compliance-link" target="_blank"> ℹ️ </a>
</label>
```

**Pro**: Link diretto, zero JS, leggero  
**Contro**: Apre nuova pagina

---

### Opzione 4: Solo Punti Critici (STRATEGICO)

Usare il componente solo per:

- Password (min 12 caratteri) - punto critico
- Privacy checkbox - obbligatorio GDPR
- Rate limiting - sicurezza

**Pro**: Utile solo dove serve, non ovunque  
**Contro**: Inconsistenza

---

### Opzione 5: Rimuovere Completamente (ZERO)

- Documentazione completa in `/docs/`
- Footer con link "Standard Accademici"
- Niente tooltip inline

**Pro**: Zero overhead, documentazione centralizzata  
**Contro**: Meno visibile

---

## Raccomandazione

**Opzione 2 + 5**: Testo piccolo inline solo per punti critici (password, privacy), resto in documentazione.

```html
<label for="password" class="access-label">
  Password
  <small class="compliance-hint">(Min. 12 caratteri - NIST 800-63B)</small>
</label>
```

**CSS minimo**:

```css
.compliance-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 0.25rem;
  font-weight: 400;
}
```

**Vantaggi**:

- ✅ Zero JS
- ✅ Sempre visibile
- ✅ Leggerissimo
- ✅ Accessibile
