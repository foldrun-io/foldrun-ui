// In the browser: what the app says about sign-up and its plans, asked
// once per page. GET <app>/api/signup →
//   { free: boolean, paid: boolean, plans: CatalogPlan[] }
// (amounts in minor units; any number may be null; plans may be empty).
//
// One fetch, one place. Components register what they fill from the answer
// (whenSignup); the sign-up buttons are switched last (applyCtas), so a plan
// card's button filled from the catalogue is switched too. An unreachable
// endpoint or a malformed answer is `null`: components show their fallback,
// buttons stay as rendered ("Get started" → the app's sign-up page, which
// tells the truth itself).

export interface CatalogPlan {
  id: string;
  name: string;
  price: { amount: number | null; currency: string | null; interval: string | null } | null;
  credits: number | null;
  storageGb: number | null;
  vcpu: number | null;
  memoryGiB: number | null;
  priority: boolean | null;
}
export interface Signup { free: boolean; paid: boolean; plans: CatalogPlan[] }

const meta = (name: string) => document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
export const signupUrl = () => meta("foldrun-signup-url") ?? "";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" && v ? v : null);

function parse(j: unknown): Signup | null {
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  if (typeof o.free !== "boolean" || typeof o.paid !== "boolean") return null;
  const plans = Array.isArray(o.plans) ? o.plans : [];
  const out: CatalogPlan[] = [];
  for (const p of plans) {
    if (!p || typeof p !== "object") continue;
    const q = p as Record<string, unknown>;
    const id = str(q.id), name = str(q.name);
    if (!id || !name) continue;
    const pr = q.price && typeof q.price === "object" ? (q.price as Record<string, unknown>) : null;
    out.push({
      id, name,
      price: pr ? { amount: num(pr.amount), currency: str(pr.currency), interval: str(pr.interval) } : null,
      credits: num(q.credits), storageGb: num(q.storageGb), vcpu: num(q.vcpu), memoryGiB: num(q.memoryGiB),
      priority: typeof q.priority === "boolean" ? q.priority : null,
    });
  }
  return { free: o.free, paid: o.paid, plans: out };
}

let started = false;
let done = false;
let answer: Signup | null = null;
const fillers: ((s: Signup | null) => void)[] = [];

/** The sign-up buttons (Button.astro marks them data-signup). */
export function applyCtas(s: Signup | null) {
  if (!s) return;
  const base = signupUrl();
  // Where the plans are (BaseLayout's pricingUrl; the docs point at the
  // marketing site's). On that very page, the plans section itself.
  const pricing = new URL(meta("foldrun-pricing-url") ?? "/pricing/", location.href);
  const plans = pricing.origin === location.origin && location.pathname.startsWith(pricing.pathname) ? "#plans" : pricing.href;
  for (const b of document.querySelectorAll<HTMLAnchorElement>("a[data-signup]")) {
    const kind = b.dataset.signup ?? "";
    if (kind === "primary") {
      if (s.free) continue;
      if (s.paid) { b.textContent = "Choose a plan"; b.href = plans; }
      else { b.textContent = "Request access"; b.href = base; }
    } else if (kind === "free" && !s.free) {
      // the Free plan's own card: closed means asking, whatever paid does
      b.textContent = "Request access";
      b.href = base;
    } else if (kind.startsWith("plan:") && !s.paid) {
      b.textContent = "Request access";
      b.href = base;
    }
  }
}

function settle(s: Signup | null) {
  answer = s;
  done = true;
  for (const f of fillers) { try { f(s); } catch { /* one component's mistake is not another's */ } }
  applyCtas(s);
}

/** Ask (once). Safe to call from every component that needs the answer. */
export function startSignup() {
  if (started) return;
  started = true;
  const api = meta("foldrun-signup-api");
  if (!api) { settle(null); return; }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  fetch(api, { signal: ctl.signal, cache: "no-store", credentials: "omit" })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => settle(parse(j)))
    .catch(() => settle(null))
    .finally(() => clearTimeout(timer));
}

/** Run `fn` with the answer (null when there is none), then switch buttons. */
export function whenSignup(fn: (s: Signup | null) => void) {
  if (done) { fn(answer); applyCtas(answer); return; }
  fillers.push(fn);
  startSignup();
}

// ---- formatting, so every component writes a number the same way ----

const nf = new Intl.NumberFormat("en-US");

export function money(price: CatalogPlan["price"]): string | null {
  if (!price || price.amount === null || !price.currency) return null;
  try {
    const currency = price.currency.toUpperCase();
    const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
    const value = price.amount / 10 ** digits;
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: Number.isInteger(value) ? 0 : digits, maximumFractionDigits: digits }).format(value);
  } catch {
    return null;
  }
}
export const per = (price: CatalogPlan["price"]) => (price?.interval ? `per ${price.interval}` : "");
export const credits = (n: number | null) => (n === null ? null : `${nf.format(n)} credits`);
export const storage = (gb: number | null) => (gb === null ? null : gb >= 1000 && gb % 1000 === 0 ? `${gb / 1000} TB` : `${nf.format(gb)} GB`);
export const pool = (p: CatalogPlan) => (p.vcpu === null || p.memoryGiB === null ? null : `${p.vcpu} vCPU · ${p.memoryGiB} GiB`);
export const isFree = (p: CatalogPlan) => p.price?.amount === 0;
