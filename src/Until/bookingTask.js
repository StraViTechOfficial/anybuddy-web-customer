import Cookies from "js-cookie";
import { TOKEN_NAME } from "@/Until";

// The task step (address, task size, description) is saved on the server per customer, not per service,
// so the browser remembers which service it was filled in for during this visit. Booking a pro needs it:
// the price is the pro's rate × the task size.
const KEY = "ab-task";
export const markTaskDone = (serviceSlug) => {
  try {
    sessionStorage.setItem(KEY, serviceSlug);
  } catch {}
};
export const taskDoneFor = (serviceSlug) => {
  try {
    return sessionStorage.getItem(KEY) === serviceSlug;
  } catch {
    return false;
  }
};

// The pro the customer chose ("Select & Continue" on the list, "Book" on the pro's profile). It is kept through log-in
// and the task step, so the customer lands on that pro's open times instead of picking them again from the list.
const PRO = "ab-task-pro";
export const rememberPro = (serviceSlug, pro) => {
  try {
    sessionStorage.setItem(PRO, JSON.stringify({ serviceSlug, pro }));
  } catch {}
};
export const peekPro = (serviceSlug) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PRO) || "null");
    return saved?.serviceSlug === serviceSlug ? saved.pro : null;
  } catch {
    return null;
  }
};
export const takePro = (serviceSlug) => {
  const pro = peekPro(serviceSlug);
  try {
    sessionStorage.removeItem(PRO);
  } catch {}
  return pro;
};

// Book this pro for this service: log-in first, then the task step, then the list page opens the pro's times.
export const bookWith = (push, category, service, pro) => {
  const taskPage = `/service/${category}/${service}/book`;
  rememberPro(service, pro);
  if (!Cookies.get(TOKEN_NAME)) {
    Cookies.set("path", taskPage); // login returns to the task step
    return push("/login");
  }
  push(taskDoneFor(service) ? `/service/${category}/${service}` : taskPage);
};

// The payment step, kept for a payment method that leaves the site (Cash App Pay): /booking/return rebuilds the same
// step from it when the customer comes back. Never holds the client secret (Stripe adds it to the return address).
const CHECKOUT = "ab-checkout";
export const saveCheckout = (ctx) => {
  try {
    sessionStorage.setItem(CHECKOUT, JSON.stringify(ctx));
  } catch {}
};
export const readCheckout = (bookingId) => {
  try {
    const ctx = JSON.parse(sessionStorage.getItem(CHECKOUT) || "null");
    return ctx && String(ctx.bookingId) === String(bookingId) ? ctx : null;
  } catch {
    return null;
  }
};
export const clearCheckout = () => {
  try {
    sessionStorage.removeItem(CHECKOUT);
  } catch {}
};
