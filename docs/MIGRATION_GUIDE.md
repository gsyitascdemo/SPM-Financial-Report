# 🔧 SPM Financial Pivot Report — Guida alla Migrazione

## 1. Overview

Questa guida descrive come esportare l'applicazione **SPM Financial Pivot Report** da un'istanza ServiceNow sorgente e importarla su un'istanza target. Il documento copre le considerazioni relative allo scope, i prerequisiti, le problematiche comuni e le verifiche post-import.

**Target audience:** ServiceNow Administrator, Platform Developer, DevOps Engineer.

---

## 2. Prerequisiti sull'Istanza Target

Prima di procedere con l'import, verificare che l'istanza target disponga dei seguenti elementi:

### Plugin Richiesti

| Plugin | ID | Descrizione |
|--------|------|-------------|
| **IT Business Management** (ITBM) o **Strategic Portfolio Management** (SPM) | `com.snc.it_business_management` | Fornisce le tabelle core per il portfolio management |

### Tabelle Necessarie (OOB)

L'app interroga le seguenti tabelle — devono essere presenti e accessibili:

| Tabella | Descrizione |
|---------|-------------|
| `pm_project` | Progetti |
| `pm_portfolio` | Portfolio |
| `pm_program` | Programmi |
| `cost_plan` | Piani di costo |
| `cost_plan_breakdown` | Breakdown mensili dei costi |
| `fiscal_period` | Periodi fiscali |

### Configurazione Fiscal Calendar

- ✅ Almeno un **Fiscal Year** definito
- ✅ Periodi fiscali mensili configurati per ogni anno fiscale
- ✅ Le date dei periodi devono essere allineate con i `cost_plan_breakdown`

### Dati Minimi

- Almeno **un portfolio** con progetti attivi
- Almeno un progetto con **Cost Plan** e relativi `cost_plan_breakdown` records
- I record `cost_plan_breakdown` devono avere `breakdown_type = 'task'`

---

## 3. Metodo di Export

### Opzione A: Update Set (consigliato per ambienti non connessi)

1. Navigare a **System Update Sets → Local Update Sets**
2. Creare un nuovo Update Set o utilizzare quello associato allo scope `x_snc_spm_financia`
3. Completare l'Update Set (stato: `Complete`)
4. Navigare a **Retrieved Update Sets** sull'istanza target
5. Importare il file XML dell'Update Set
6. Fare Preview e Commit

### Opzione B: Source Control (App Repository)

1. L'app è sviluppata con **Now SDK** — il codice sorgente è nel repository
2. Collegare l'istanza target allo stesso repository Git
3. Importare l'app tramite **Studio** o **Application Manager**
4. L'istanza target creerà i record di metadata automaticamente

### Opzione C: Application Repository (ServiceNow Store)

1. Pubblicare l'app nell'Application Repository interno
2. Installare sull'istanza target tramite **Application Manager**

---

## 4. Considerazioni sul Scope Prefix

> ⚠️ **SEZIONE CRITICA** — Leggere attentamente prima di procedere.

### Il Problema dello Scope

L'applicazione utilizza:

```
Scope Name:   x_snc_spm_financia
Scope Prefix: x_snc_
```

Il prefix `x_snc_` indica che l'app è stata creata sotto il namespace ServiceNow ("snc"). Ogni istanza ServiceNow assegna un **company prefix** univoco (es. `x_acme_`, `x_cust_`, `x_corp_`).

### Regola Fondamentale

> **Le scoped app in ServiceNow sono legate indissolubilmente al loro scope name. NON è possibile semplicemente rinominare uno scope.**

Questo significa che tutti gli artifact dell'app (REST API paths, ruoli, ACL, Script Include) contengono il namespace `x_snc_spm_financia` hardcoded.

### Opzioni di Migrazione

#### Opzione A: Installare "as-is" (✅ Raccomandata)

Se l'istanza target permette l'installazione di app da altri vendor/scope:

- Lo scope rimane `x_snc_spm_financia`
- Nessuna modifica necessaria
- Tutti i path REST, ruoli e ACL funzionano senza alterazioni
- L'app viene trattata come "third-party" sull'istanza target

**Quando funziona:**
- L'istanza target non ha restrizioni sugli scope prefix
- Si accetta di avere un'app con prefix `x_snc_` in un ambiente non-SNC

**Come procedere:**
1. Importare via Update Set o App Repository
2. L'app manterrà tutti i suoi riferimenti intatti

#### Opzione B: Ricreare sotto Nuovo Scope (⚠️ Effort significativo)

Se l'istanza target **richiede** che tutte le app usino il proprio prefix (es. `x_acme_`):

**L'intera applicazione deve essere ricreata** sotto il nuovo scope. Non è sufficiente modificare delle stringhe — ServiceNow valida lo scope a livello di piattaforma.

**Impatto della ricreazione:**

| Artifact | Valore Attuale | Nuovo Valore (esempio) |
|----------|---------------|----------------------|
| Scope Name | `x_snc_spm_financia` | `x_acme_spm_financia` |
| REST API Base Path | `/api/x_snc_spm_financia/financial_report` | `/api/x_acme_spm_financia/financial_report` |
| Role | `x_snc_spm_financia.viewer` | `x_acme_spm_financia.viewer` |
| UI Page | `x_snc_spm_financia_report` | `x_acme_spm_financia_report` |
| Script Include | `SPMFinancialAggregator` (registrato sotto lo scope) | Stesso nome, scope diverso |
| Client REST URL | `/api/x_snc_spm_financia/financial_report/...` | `/api/x_acme_spm_financia/financial_report/...` |
| ACL | Riferimenti allo scope `x_snc_spm_financia` | Riferimenti al nuovo scope |
| Type Declarations | `x_snc_spm_financia.d.ts` | `x_acme_spm_financia.d.ts` |

**Passi per la ricreazione:**

1. Creare un nuovo Scoped Application con scope `x_acme_spm_financia`
2. Ricreare il REST API (Scripted REST) sotto il nuovo scope
3. Ricreare lo Script Include sotto il nuovo scope
4. Ricreare la UI Page sotto il nuovo scope
5. Aggiornare tutti i riferimenti client-side (file `FinancialService.ts`)
6. Ricreare ruoli e ACL
7. Aggiornare le type declarations

---

## 5. Checklist degli Artifact Scope-Dependent

Utilizzare questa checklist durante la migrazione per verificare ogni elemento:

### REST API

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| Base Path | `/api/x_snc_spm_financia/financial_report` | `src/fluent/rest-api/financial-report.now.ts` |
| Endpoint Pivot | `/api/x_snc_spm_financia/financial_report/pivot` | `src/server/rest-handlers/pivot-handler.js` |
| Endpoint Detail | `/api/x_snc_spm_financia/financial_report/detail` | `src/server/rest-handlers/detail-handler.js` |

### Security

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| Role | `x_snc_spm_financia.viewer` | `src/fluent/security/security.now.ts` |
| ACL REST API | Protegge `/api/x_snc_spm_financia/...` | `src/fluent/security/security.now.ts` |
| ACL UI Page | Protegge `x_snc_spm_financia_report.do` | `src/fluent/security/security.now.ts` |

### Script Include

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| Class Name | `SPMFinancialAggregator` | `src/server/SPMFinancialAggregator.js` |
| Scope Registration | Registrato sotto `x_snc_spm_financia` | `src/fluent/script-includes/spm-financial-aggregator.now.ts` |

### UI Page

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| Page Name | `x_snc_spm_financia_report` | `src/fluent/ui-pages/spm-financial-report.now.ts` |
| URL di accesso | `/x_snc_spm_financia_report.do` | — |

### Client Code

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| REST URL nel client | `/api/x_snc_spm_financia/financial_report/...` | `src/client/services/FinancialService.ts` |
| g_ck token usage | Header `X-UserToken` | `src/client/services/FinancialService.ts` |

### Type Declarations

| Elemento | Valore | File Sorgente |
|----------|--------|---------------|
| Type definition file | `x_snc_spm_financia.d.ts` | `src/server/types/x_snc_spm_financia.d.ts` |

---

## 6. Passi Post-Import

Dopo aver importato l'app sull'istanza target, eseguire le seguenti verifiche:

### 6.1 Assegnazione Ruoli

```
Navigare a: System Security → Users and Groups → Roles
Cercare: x_snc_spm_financia.viewer
Assegnare a: utenti o gruppi che necessitano accesso
```

### 6.2 Verifica REST API

Testare l'endpoint con un tool (es. Postman o REST API Explorer):

```http
GET /api/x_snc_spm_financia/financial_report/pivot?portfolios=<sys_id>&fiscalYears=<sys_id>
Headers:
  Accept: application/json
  X-UserToken: <g_ck value>
```

**Risposta attesa:** HTTP 200 con JSON contenente i dati pivot.

### 6.3 Test UI Page

Accedere alla URL:

```
https://<target-instance>.service-now.com/x_snc_spm_financia_report.do
```

Verificare:
- ✅ La pagina si carica senza errori
- ✅ I filtri (Portfolio, Fiscal Year) si popolano correttamente
- ✅ Il submit dei filtri restituisce dati nella tabella

### 6.4 Verifica Accessibilità Tabelle SPM

Verificare che lo scope dell'app possa leggere le tabelle OOB:

```
Navigare a: System Definition → Tables
Aprire: pm_project
Tab: Application Access
Verificare: "Can read" è abilitato per altri scope
```

Ripetere per: `pm_portfolio`, `pm_program`, `cost_plan`, `cost_plan_breakdown`, `fiscal_period`.

### 6.5 Verifica Cross-Scope Privileges

```
Navigare a: sys_scope_privilege.list
Filtrare: source_scope = x_snc_spm_financia
Verificare: esistano record di accesso per le tabelle necessarie
```

---

## 7. Cross-Scope Access

### Tabelle Interrogate dall'App

L'app **non crea** tabelle custom. Interroga esclusivamente tabelle OOB/SPM:

| Tabella | Operazione | Motivo |
|---------|-----------|--------|
| `pm_project` | READ | Elenco progetti nel portfolio |
| `pm_portfolio` | READ | Elenco portfolio per i filtri |
| `pm_program` | READ | Associazione progetto-programma |
| `cost_plan` | READ | Cost Plan per progetto |
| `cost_plan_breakdown` | READ | Breakdown mensili (dati pivot) |
| `fiscal_period` | READ | Periodi fiscali per colonne |

### Configurazione Application Cross-Scope Access

Se l'accesso cross-scope non è automaticamente disponibile, creare i record necessari:

```
Navigare a: System Definition → Application Cross-Scope Access
```

Per ogni tabella, creare un record:

| Campo | Valore |
|-------|--------|
| **Source Scope** | SPM Financial Report (`x_snc_spm_financia`) |
| **Target Scope** | Global (o lo scope che possiede la tabella) |
| **Target Name** | Nome della tabella (es. `pm_project`) |
| **Target Type** | Table |
| **Operation** | Read |
| **Status** | Allowed |

### Verifica Programmatica

Dalla Script Background (nel scope dell'app):

```javascript
var gr = new GlideRecord('pm_project');
gr.setLimit(1);
gr.query();
gs.info('Can access pm_project: ' + gr.hasNext());
```

Se restituisce `false`, è necessario configurare il cross-scope access.

---

## 8. Considerazioni sulle Performance

### Limiti Configurati

| Parametro | Limite | Motivazione |
|-----------|--------|-------------|
| Progetti per query | **Max 200** | Previene timeout su query pesanti |
| Portfolio per request | **Max 10** | Limita la cardinalità delle query aggregate |
| Fiscal Year per request | **Max 5** | Limita il numero di periodi (5 anni × 12 mesi = 60 colonne max) |

### Raccomandazioni

- ✅ Limitare le query a **progetti attivi** (`active = true`)
- ✅ Creare **indici** sulle colonne frequentemente filtrate:
  - `cost_plan_breakdown.task` (reference a pm_project)
  - `cost_plan_breakdown.fiscal_period`
  - `cost_plan_breakdown.breakdown_type`
- ✅ Se il volume di dati è elevato (>500 progetti nel portfolio), valutare l'uso di **scheduled job** per pre-calcolare gli aggregati
- ⚠️ Il report carica tutti i dati in una singola chiamata REST — portfolio molto grandi possono risultare lenti

### Timeout

Il timeout di default per le Scripted REST API è di **300 secondi**. Se si verificano timeout:
- Ridurre il numero di portfolio/anni selezionati
- Verificare la presenza di indici sulle tabelle
- Considerare la paginazione lato server

---

## 9. Troubleshooting

### Problemi Comuni e Soluzioni

#### 🔴 Errore 403 sulla REST API

**Sintomo:** La chiamata a `/api/x_snc_spm_financia/financial_report/pivot` restituisce HTTP 403.

**Cause possibili:**
1. L'utente non ha il ruolo `x_snc_spm_financia.viewer`
2. L'ACL sulla REST API non è configurata correttamente
3. Il token `X-UserToken` (g_ck) non è valido o mancante

**Soluzione:**
```
1. Verificare: User → Roles → cercare x_snc_spm_financia.viewer
2. Verificare: ACL list → filtrare per x_snc_spm_financia
3. Assicurarsi che il client invii l'header X-UserToken con il valore di g_ck
```

---

#### 🔴 Dropdown Portfolio Vuoto

**Sintomo:** Il filtro Portfolio non mostra alcuna opzione.

**Cause possibili:**
1. La tabella `pm_portfolio` non è accessibile cross-scope
2. Non esistono portfolio attivi nell'istanza
3. L'utente non ha permessi di lettura su `pm_portfolio`

**Soluzione:**
```
1. Verificare Application Cross-Scope Access per pm_portfolio
2. Navigare a pm_portfolio.list e verificare che esistano record
3. Verificare ACL sulla tabella pm_portfolio per il ruolo dell'utente
```

---

#### 🔴 Nessun Dato Restituito (Tabella Vuota)

**Sintomo:** I filtri sono applicati ma la tabella pivot è vuota.

**Cause possibili:**
1. Non esistono record `cost_plan_breakdown` con `breakdown_type = 'task'`
2. I periodi fiscali non sono configurati per l'anno selezionato
3. I progetti nel portfolio non hanno Cost Plan associati
4. Il campo `task` in `cost_plan_breakdown` non referenzia i progetti selezionati

**Soluzione:**
```
1. Verificare: cost_plan_breakdown.list → filtrare breakdown_type=task
2. Verificare: fiscal_period.list → cercare periodi per l'anno fiscale
3. Verificare: cost_plan.list → filtrare per il progetto
4. Eseguire query manuale:
   GlideRecord('cost_plan_breakdown')
   .addQuery('breakdown_type', 'task')
   .addQuery('task.pm_portfolio', '<portfolio_sys_id>')
   .query()
```

---

#### 🔴 Valori di Currency Errati

**Sintomo:** Gli importi visualizzati non corrispondono ai valori attesi.

**Cause possibili:**
1. Il campo `exchange_rate` non è popolato nei record `cost_plan_breakdown`
2. La conversione USD → EUR non è corretta
3. I valori sono in valuta di sistema (USD) anziché funzionale (EUR)

**Soluzione:**
```
1. Verificare: cost_plan_breakdown.list → controllare colonna exchange_rate
2. Se exchange_rate è vuoto/0, i valori non verranno convertiti correttamente
3. Verificare la configurazione della functional currency nell'istanza
```

---

#### 🔴 UI Page Non Si Carica

**Sintomo:** La URL `/x_snc_spm_financia_report.do` restituisce errore o pagina bianca.

**Cause possibili:**
1. La UI Page non è stata importata correttamente
2. L'ACL blocca l'accesso alla pagina
3. Errori JavaScript nella console del browser

**Soluzione:**
```
1. Verificare: sys_ui_page.list → cercare "x_snc_spm_financia_report"
2. Controllare ACL per tipo "UI Page"
3. Aprire Developer Tools (F12) → Console per errori JS
4. Verificare che i file CSS/JS siano caricati correttamente
```

---

#### 🟡 Performance Lenta

**Sintomo:** Il report impiega più di 10 secondi a caricarsi.

**Soluzioni:**
```
1. Ridurre il numero di portfolio/anni selezionati
2. Verificare indici su cost_plan_breakdown (task, fiscal_period, breakdown_type)
3. Verificare che non ci siano Business Rule pesanti sulle tabelle interrogate
4. Controllare i log di performance: System Diagnostics → Stats
```

---

## 10. Compatibilità di Versione

### Versioni ServiceNow Testate

| Release | Stato | Note |
|---------|-------|------|
| **Vancouver** | ✅ Testato | Versione di sviluppo primaria |
| **Washington DC** | ✅ Compatibile | Nessun issue noto |
| **Xanadu** | ✅ Compatibile | Nessun issue noto |
| **Utah** | ⚠️ Non testato | Potrebbe funzionare ma non garantito |
| **< Utah** | ❌ Non supportato | API mancanti |

### Dipendenze Plugin

| Plugin | Versione Minima | Note |
|--------|----------------|------|
| SPM/ITBM | Vancouver+ | Tabelle `cost_plan_breakdown` con campi necessari |
| Scripted REST API | Base platform | Incluso in tutte le release supportate |
| Fiscal Calendar | Base platform | Deve essere configurato con periodi mensili |

### Now SDK

L'app è stata sviluppata con **Now SDK** (Fluent DSL). Per modifiche al codice sorgente:

```json
{
  "@servicenow/sdk": "versione compatibile con l'istanza target"
}
```

Verificare che la versione del SDK sia allineata con la release dell'istanza target.

---

## Appendice: Script di Verifica Post-Import

Eseguire i seguenti script dalla **Scripts - Background** (nel scope globale) per verificare l'installazione:

### Verifica Esistenza App

```javascript
var app = new GlideRecord('sys_scope');
app.addQuery('scope', 'x_snc_spm_financia');
app.query();
if (app.next()) {
    gs.info('✅ App trovata: ' + app.getValue('name'));
} else {
    gs.info('❌ App non trovata');
}
```

### Verifica REST API

```javascript
var rest = new GlideRecord('sys_ws_definition');
rest.addQuery('sys_scope.scope', 'x_snc_spm_financia');
rest.query();
gs.info('REST API trovate: ' + rest.getRowCount());
```

### Verifica Ruolo

```javascript
var role = new GlideRecord('sys_user_role');
role.addQuery('name', 'x_snc_spm_financia.viewer');
role.query();
if (role.next()) {
    gs.info('✅ Ruolo trovato: ' + role.getValue('name'));
} else {
    gs.info('❌ Ruolo non trovato');
}
```

### Verifica UI Page

```javascript
var page = new GlideRecord('sys_ui_page');
page.addQuery('name', 'x_snc_spm_financia_report');
page.query();
if (page.next()) {
    gs.info('✅ UI Page trovata: ' + page.getValue('name'));
} else {
    gs.info('❌ UI Page non trovata');
}
```

---

*Ultimo aggiornamento: 2024 | App: SPM Financial Pivot Report | Scope: x_snc_spm_financia*
