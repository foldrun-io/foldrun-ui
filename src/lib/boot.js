// Before the first paint: mark html.js (disclosures and menus hide only when
// there is script to open them) and apply the theme switch's saved choice.
// BaseLayout runs this inline, or, for a page under a strict CSP with no
// 'unsafe-inline' (foldrun.ir), as this file (`strictCsp`).
document.documentElement.classList.add("js");
try { var t = localStorage.getItem("theme"); if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t); } catch (e) {}
