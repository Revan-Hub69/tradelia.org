# Form Components & Validation - Documentazione Implementazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo di form components con validazione Zod e React Hook Form, accessibile e conforme a WCAG 2.1 AAA.

---

## 🎨 COMPONENTI UI

### 1. FormInput (`components/ui/FormInput.tsx`)
**Funzionalità**:
- Validazione con error states
- Accessibilità completa (ARIA labels, roles)
- Required indicator
- Helper text
- Focus management

**Props**:
```typescript
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}
```

**Usage**:
```tsx
<FormInput
  label="Email"
  type="email"
  error={errors.email}
  helperText="Inserisci la tua email"
  required
/>
```

### 2. FormTextarea (`components/ui/FormTextarea.tsx`)
**Funzionalità**:
- Stesso pattern di FormInput
- Resize verticale
- Min height configurabile

**Usage**:
```tsx
<FormTextarea
  label="Note"
  rows={6}
  error={errors.notes}
  maxLength={1000}
/>
```

### 3. FormSelect (`components/ui/FormSelect.tsx`)
**Funzionalità**:
- Select nativo con styling
- Options con disabled support
- Placeholder support
- Accessibilità completa

**Usage**:
```tsx
<FormSelect
  label="Tipo"
  options={[
    { value: 'buy', label: 'Acquisto' },
    { value: 'sell', label: 'Vendita' },
  ]}
  error={errors.type}
/>
```

### 4. SelectAdvanced (`components/ui/SelectAdvanced.tsx`)
**Funzionalità**:
- Search/filter integrato
- Multi-select support
- Grouping options
- Keyboard navigation
- Click outside to close

**Usage**:
```tsx
<SelectAdvanced
  label="Asset"
  options={options}
  searchable
  multiSelect
  value={selected}
  onChange={setSelected}
/>
```

### 5. DatePicker (`components/ui/DatePicker.tsx`)
**Funzionalità**:
- Date input nativo
- Localizzazione (IT/EN)
- Calendar icon
- Accessibilità completa

**Usage**:
```tsx
<DatePicker
  label="Data Entry"
  value={entryDate}
  onChange={(e) => setEntryDate(e.target.value)}
  locale="it-IT"
/>
```

### 6. FileUpload (`components/ui/FileUpload.tsx`)
**Funzionalità**:
- Drag & drop
- Multiple files support
- File validation (size, type)
- Progress indicator
- Preview con icon
- Remove file

**Usage**:
```tsx
<FileUpload
  label="Carica Documento"
  accept=".pdf,.doc,.docx"
  maxSize={5 * 1024 * 1024} // 5MB
  multiple
  onUpload={handleUpload}
/>
```

### 7. RichTextEditor (`components/ui/RichTextEditor.tsx`)
**Funzionalità**:
- ContentEditable based
- Toolbar con formattazione (bold, italic, underline, lists, links)
- Character count
- Max length validation
- HTML output

**Usage**:
```tsx
<RichTextEditor
  label="Descrizione"
  value={description}
  onChange={setDescription}
  maxLength={5000}
/>
```

---

## ✅ VALIDAZIONE ZOD

### Schemas (`lib/validation/schemas.ts`)

**Portfolio Position**:
```typescript
portfolioPositionSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z]+$/),
  quantity: z.number().positive().min(0.01),
  price: z.number().positive().min(0.01),
  notes: z.string().optional(),
});
```

**Alert**:
```typescript
alertSchema = z.object({
  name: z.string().min(3).max(100),
  type: z.enum(['price', 'volume', 'custom']),
  symbol: z.string().regex(/^[A-Z]{1,10}$/).optional(),
  condition: z.enum(['above', 'below', 'equals']),
  value: z.number().positive(),
}).refine(...); // Custom validation
```

**Trading Journal**:
```typescript
tradingJournalSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z]+$/),
  trade_type: z.enum(['buy', 'sell', 'long', 'short']),
  entry_date: z.string().datetime(),
  // ... altri campi
});
```

**Altri schemas**:
- `courseNotesSchema`
- `analysisRequestSchema`
- `assetProposalSchema`
- `settingsSchema`
- `passwordChangeSchema`

---

## 🔗 INTEGRAZIONE REACT HOOK FORM

### useFormValidation Hook (`lib/hooks/useFormValidation.ts`)

**Usage**:
```tsx
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { portfolioPositionSchema } from '@/lib/validation/schemas';

function PortfolioForm() {
  const { register, handleSubmit, formState: { errors }, getError } = 
    useFormValidation(portfolioPositionSchema);

  const onSubmit = async (data) => {
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Simbolo"
        {...register('symbol')}
        error={getError('symbol')}
      />
      {/* ... altri campi */}
    </form>
  );
}
```

---

## ♿ ACCESSIBILITÀ

### WCAG 2.1 AAA Compliance

**Tutti i componenti includono**:
- `aria-label` o `aria-labelledby` per labels
- `aria-invalid` per error states
- `aria-describedby` per helper text e error messages
- `aria-required` per campi obbligatori
- `role="alert"` per error messages
- Keyboard navigation completa
- Focus management

**Esempio**:
```tsx
<input
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? errorId : helperId}
  aria-required={required}
/>
```

---

## 📚 BEST PRACTICES

### 1. Error Handling
- Error messages chiari e specifici
- Visual feedback immediato
- Focus su campo errore dopo submit

### 2. Validation Strategy
- Client-side validation (Zod) per UX
- Server-side validation per sicurezza
- Validazione in tempo reale (`mode: 'onChange'`)

### 3. User Experience
- Helper text per guidare l'utente
- Placeholder text informativi
- Loading states durante submit
- Success feedback dopo submit

### 4. Type Safety
- TypeScript types da Zod schemas
- Type inference automatico
- Compile-time type checking

---

## 🧪 TESTING

### Unit Tests (TODO)
- Validation logic
- Error states
- Accessibility attributes

### Integration Tests (TODO)
- Form submission flow
- Error handling
- Multi-step forms

---

## 📖 ESEMPI COMPLETI

### Portfolio Form
```tsx
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { portfolioPositionSchema } from '@/lib/validation/schemas';
import { FormInput } from '@/components/ui/FormInput';
import { FormTextarea } from '@/components/ui/FormTextarea';

function AddPositionForm() {
  const { register, handleSubmit, getError, formState: { isSubmitting } } = 
    useFormValidation(portfolioPositionSchema);

  const onSubmit = async (data) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Simbolo"
        {...register('symbol')}
        error={getError('symbol')}
        required
      />
      <FormInput
        label="Quantità"
        type="number"
        step="0.01"
        {...register('quantity', { valueAsNumber: true })}
        error={getError('quantity')}
        required
      />
      <FormInput
        label="Prezzo"
        type="number"
        step="0.01"
        {...register('price', { valueAsNumber: true })}
        error={getError('price')}
        required
      />
      <FormTextarea
        label="Note"
        {...register('notes')}
        error={getError('notes')}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvataggio...' : 'Aggiungi'}
      </button>
    </form>
  );
}
```

---

## 🚀 ROADMAP FUTURO

### Miglioramenti Possibili
- [ ] TipTap integration per Rich Text Editor avanzato
- [ ] Auto-complete per SelectAdvanced
- [ ] Image preview per FileUpload
- [ ] Form wizard/multi-step support
- [ ] Conditional field rendering
- [ ] Form persistence (draft save)

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

