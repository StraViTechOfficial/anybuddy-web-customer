import Cookies from "@/Until/cookies";
import { SIGNED_IN } from "@/Until";

// The task step (address, task size, description) is saved on the server per customer, not per service.
// So the browser remembers which service it was filled in for during this visit. Booking a Buddy needs it,
// because the price is the Buddy's rate multiplied by the task size.
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

// The Buddy the customer chose ("Select & Continue" on the list, or "Book" on the Buddy's profile). It is kept through
// login and the task step, so the customer lands on that Buddy's open times instead of picking them again.
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

// Books this Buddy for this service. The customer logs in first, then fills in the task step, and then the list
// page opens the Buddy's open times.
export const bookWith = (push, category, service, pro) => {
  const taskPage = `/service/${category}/${service}/book`;
  rememberPro(service, pro);
  if (!Cookies.get(SIGNED_IN)) {
    Cookies.set("path", taskPage); // After login, the customer comes back to the task step.
    return push("/login");
  }
  push(taskDoneFor(service) ? `/service/${category}/${service}` : taskPage);
};

// The payment step, kept for payment methods that leave the site (Cash App Pay). When the customer comes back,
// /booking/return rebuilds the same step from it. It never holds the client secret, because Stripe adds that to the
// return address.
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
