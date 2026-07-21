# 📊 SPM Financial Pivot Report — Manuale Utente

> **Quick Start** 🚀
>
> 1. Accedi alla pagina: `https://<instance>.service-now.com/x_snc_spm_financia_report.do`
> 2. Seleziona uno o più **Portfolio** e uno o più **Fiscal Year**
> 3. Clicca **Applica Filtri**
> 4. Leggi la tabella pivot: ogni riga è un progetto, ogni colonna un periodo fiscale
> 5. Clicca su una riga progetto per il dettaglio (Cost Plan e Committed Lines)

---

## 1. Overview

Il **SPM Financial Pivot Report** è un report interattivo che presenta i dati finanziari dei progetti SPM (Strategic Portfolio Management) in formato tabella pivot.

**A chi è destinato:**
- Portfolio Manager
- Finance Controller
- Program Manager
- Business Analyst

**Cosa permette di fare:**
- Visualizzare Budget, Planned, Actual, Committed e Forecast per progetto e periodo
- Confrontare la spesa prevista con il budget allocato
- Identificare rapidamente progetti a rischio di overspend (🔴) o sotto-utilizzo (🟡)
- Filtrare per portfolio e anno fiscale
- Distinguere tra spese OpEx e CapEx

---

## 2. Accesso al Report

### URL

```
https://<tua-istanza>.service-now.com/x_snc_spm_financia_report.do
```

### Ruolo Richiesto

Per accedere al report è necessario il ruolo:

```
x_snc_spm_financia.viewer
```

Se non riesci ad accedere, contatta il tuo ServiceNow Administrator per richiedere l'assegnazione del ruolo.

---

## 3. Utilizzo dei Filtri

Il pannello filtri si trova nella parte superiore della pagina.

| Filtro | Tipo | Descrizione |
|--------|------|-------------|
| **Portfolio** | Multi-select | Seleziona uno o più portfolio da analizzare (max 10) |
| **Fiscal Year** | Multi-select | Seleziona uno o più anni fiscali (max 5) |

### Come applicare i filtri

1. Clicca sul campo **Portfolio** e seleziona i portfolio desiderati
2. Clicca sul campo **Fiscal Year** e seleziona gli anni fiscali
3. Clicca il pulsante **Applica** (o equivalente) per aggiornare il report

> 💡 **Suggerimento:** Selezionando più portfolio e anni fiscali, il report aggrega tutti i progetti contenuti nei portfolio selezionati per i periodi scelti.

---

## 4. Comprendere le Metriche

Il report mostra 5 metriche finanziarie per ogni progetto e periodo:

| Metrica | Significato | Esempio |
|---------|-------------|---------|
| **Budget** | Il budget totale allocato per l'anno fiscale. Rappresenta il tetto di spesa autorizzato. | €500K allocati per FY2024 |
| **Planned** | Costi futuri pianificati ma non ancora sostenuti. Sono le spese previste nei periodi futuri che non sono ancora state realizzate. | €120K pianificati per Q3-Q4 |
| **Actual** | Costi già sostenuti (periodi passati incluso il mese corrente). Rappresenta la spesa effettiva registrata. | €200K già spesi da Gen a oggi |
| **Committed** | Costi futuri già contrattualizzati. Ordini d'acquisto emessi, contratti firmati ma non ancora fatturati. | €80K in PO emessi |
| **Forecast** | Previsione totale di spesa = Planned + Actual + Committed. Indica quanto ci si aspetta di spendere entro fine anno. | €400K = €120K + €200K + €80K |

### Formula chiave

```
Forecast = Planned + Actual + Committed
```

Il Forecast rappresenta la **migliore stima** della spesa totale a fine anno, combinando ciò che è già stato speso (Actual), ciò che è già impegnato (Committed) e ciò che è ancora pianificato (Planned).

---

## 5. Toggle Chips (Total / OpEx / CapEx)

Nella parte superiore del report sono presenti tre chip di toggle:

| Chip | Descrizione |
|------|-------------|
| **Total** | Mostra i valori aggregati (OpEx + CapEx) |
| **OpEx** | Mostra solo le spese operative (costi ricorrenti, licenze, servizi) |
| **CapEx** | Mostra solo le spese in conto capitale (investimenti, sviluppo, asset) |

### Regole di utilizzo

- ✅ Puoi attivare/disattivare ogni chip cliccandoci sopra
- ✅ Puoi avere più chip attivi contemporaneamente
- ⚠️ **Almeno un chip deve rimanere attivo** — non è possibile disattivarli tutti

> 💡 **Suggerimento:** Per confrontare rapidamente OpEx vs CapEx, attiva entrambi e disattiva Total.

---

## 6. Summary Cards

Le **Summary Cards** nella parte superiore del report mostrano i totali aggregati per tutti i progetti filtrati:

- **Budget totale** — Somma di tutti i budget dei progetti selezionati
- **Forecast totale** — Somma di tutti i forecast
- **Varianza** — Differenza tra Budget e Forecast (positiva = sotto budget, negativa = sopra budget)

Le card forniscono una visione immediata dello stato finanziario complessivo del portfolio.

---

## 7. Lettura della Tabella Pivot

La tabella pivot è organizzata come segue:

### Colonne

Le colonne sono raggruppate per **periodo fiscale** (tipicamente mesi). Per ogni periodo vengono mostrate le metriche selezionate (Budget, Planned, Actual, Committed, Forecast).

### Righe

- Ogni **riga** rappresenta un **progetto**
- L'ultima riga mostra i **Totali** (somma di tutti i progetti per ogni periodo e metrica)

### Struttura tipo

```
| Progetto     | Gen Budget | Gen Actual | Gen Forecast | Feb Budget | Feb Actual | ... |
|--------------|-----------|-----------|-------------|-----------|-----------|-----|
| Progetto A   | €50K      | €45K      | €48K        | €50K      | €30K      | ... |
| Progetto B   | €100K     | €90K      | €95K        | €100K     | €85K      | ... |
| **TOTALE**   | €150K     | €135K     | €143K       | €150K     | €115K     | ... |
```

---

## 8. Codifica a Colori (Color Coding)

Il valore **Forecast** utilizza una codifica a colori per segnalare lo stato rispetto al Budget:

| Colore | Condizione | Significato | Azione suggerita |
|--------|-----------|-------------|-----------------|
| 🔴 **Rosso** | Forecast > Budget | Rischio di overspend — la spesa prevista supera il budget allocato | Verificare i costi, valutare riduzioni o richiedere budget aggiuntivo |
| 🟡 **Giallo** | Forecast < Budget | Sotto-utilizzo del budget — la spesa prevista è inferiore al budget | Valutare riallocazione fondi o accelerazione attività |
| ⚪ **Nessun colore** | Forecast ≈ Budget | In linea con il piano — la spesa è allineata al budget | Nessuna azione necessaria |

> ⚠️ **Attenzione:** Il colore rosso non significa necessariamente un problema grave, ma indica che serve attenzione e possibilmente un'azione correttiva.

---

## 9. Drill-Down di Dettaglio

Cliccando su una **riga progetto** si apre il pannello di dettaglio che mostra:

### Cost Plans
Lista dei Cost Plan associati al progetto, con i relativi importi suddivisi per periodo.

### Committed Lines
Linee di spesa già committate (ordini d'acquisto, contratti firmati), con dettaglio di:
- Fornitore/Descrizione
- Importo
- Data prevista

> 💡 **Suggerimento:** Usa il drill-down per capire *da dove* vengono i numeri aggregati nella tabella pivot.

---

## 10. Valuta

Tutti i valori nel report sono espressi in:

| Proprietà | Valore |
|-----------|--------|
| **Valuta** | EUR (€) — Euro |
| **Formato** | Compatto |

### Formato compatto

| Abbreviazione | Significato | Esempio |
|--------------|-------------|---------|
| **K** | Migliaia (×1.000) | €150K = €150.000 |
| **M** | Milioni (×1.000.000) | €2.5M = €2.500.000 |

> ℹ️ I valori originali in USD (valuta di sistema) vengono convertiti in EUR utilizzando il tasso di cambio (`exchange_rate`) presente nei record `cost_plan_breakdown`.

---

## 11. FAQ e Suggerimenti

### ❓ Perché il mese corrente è incluso negli Actual?

Il mese corrente viene considerato come periodo "passato" perché i costi del mese in corso sono già stati (almeno parzialmente) sostenuti. Questo approccio fornisce una visione più accurata della spesa reale.

### ❓ Quanti portfolio posso selezionare contemporaneamente?

Massimo **10 portfolio** per query. Selezionando più di 10 portfolio, il sistema mostrerà un avviso.

### ❓ Quanti anni fiscali posso selezionare?

Massimo **5 anni fiscali** per query.

### ❓ Perché non vedo dati per un certo progetto?

Possibili cause:
- Il progetto non ha Cost Plan associati
- Il progetto non ha record `cost_plan_breakdown` con `breakdown_type = 'task'`
- I periodi fiscali non sono configurati correttamente
- Il progetto non è attivo o non appartiene ai portfolio selezionati

### ❓ I numeri non corrispondono a quanto vedo in SPM. Perché?

Il report aggrega i dati dalla tabella `cost_plan_breakdown`. Se i valori sembrano errati:
- Verificare che il campo `exchange_rate` sia popolato nei breakdown
- Controllare che i periodi fiscali siano allineati con il Fiscal Calendar configurato

### ❓ Posso esportare i dati?

Attualmente il report non include una funzione di export nativa. Per esportare i dati, puoi:
- Copiare la tabella manualmente
- Usare le API REST sottostanti per integrazioni programmatiche

### 💡 Suggerimenti utili

- **Confronto multi-anno:** Seleziona 2-3 anni fiscali per vedere l'andamento nel tempo
- **Focus OpEx/CapEx:** Usa i toggle per analizzare separatamente le due categorie di spesa
- **Monitoraggio settimanale:** Controlla regolarmente i progetti in rosso per interventi tempestivi
- **Drill-down:** Usa sempre il dettaglio per validare i numeri aggregati prima di prendere decisioni

---

*Ultimo aggiornamento: 2024 | App: SPM Financial Pivot Report | Scope: x_snc_spm_financia*
