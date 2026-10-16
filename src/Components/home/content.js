// Home page content: copy, photos and timings in one place.
export const HERO_STEP_MS = 7000; // The hero photo and headline change every 7 seconds, and the ring on the pause button shows the progress.
export const HOW_STEP_MS = 5000; // Keep this in step with the progress bar in home.css (hm-how-progress).

// The hero photo for each trade shows the thing the trade works on (sink, stairs, paint, washer...), with no people.
// Each entry is [Unsplash id, focus point]. The photo is cropped to fill, so the focus point keeps the subject in
// frame whatever the screen shape (a wide laptop or a tall phone).
export const HERO_PHOTO = {
  "assembly": ["photo-1620388640952-35a1d22d158d", "50% 50%"],
  "mounting": ["photo-1771371428960-35a50c2d4e7c", "50% 50%"],
  "plumbing": ["photo-1757787697646-e84d5490add1", "50% 50%"],
  "painting": ["photo-1789352050099-add5a055b233", "50% 50%"],
  "outdoor-help": ["photo-1570129477492-45c003edd2be", "50% 60%"],
  "cleaning": ["photo-1554995207-c18c203602cb", "50% 50%"],
  "trending": ["photo-1702995878564-17fef6fa4e57", "50% 50%"],
};
export const heroPhoto = (c) => {
  const [id, focus] = HERO_PHOTO[c.slug] || [];
  return id ? { src: `https://images.unsplash.com/${id}`, focus } : { src: c.image, focus: "50% 50%" };
};

// The hero headline for each trade is its own sentence (there is no shared template), shown with its photo.
// They were written for the live categories, since no original copy exists for these, and still need client approval.
export const HERO_LINE = {
  "cleaning": "Come home to a spotless house.",
  "mounting": "TVs, shelves and art, mounted to stay.",
  "assembly": "Furniture built right, without the headache.",
  "plumbing": "Leaks fixed by plumbers you can trust.",
  "painting": "Fresh walls from careful local painters.",
  "outdoor-help": "A yard you love coming home to.",
  "trending": "Popular help around the home, booked fast.",
};

export const CATEGORY_ICON = {
  "cleaning": "sparkle",
  "mounting": "tv",
  "assembly": "hammer",
  "plumbing": "wrench",
  "painting": "roller",
  "outdoor-help": "leaf",
  "trending": "trending",
};

// Section photos: American homes, no people.
export const PRO_PHOTO = "https://images.unsplash.com/photo-1725597199755-de76c90ad531"; // A Buddy's work truck, which fits "grow your business".

// The app section: the client's original copy, word for word.
export const APP_COPY =
  "Download the Any-Buddy app and manage your bookings, track your Buddy in real time, and chat with your pro — all from your phone.";

// Why Any-Buddy: the client's original copy, word for word (do not rewrite). The one exception is the shield card. It
// used to promise background checks, which the Terms of Use (section 32) say are not done, so it now describes the ID
// review that does happen.
export const WHY_LEAD =
  "Every Buddy on our platform goes through a thorough vetting process — so you never have to wonder who's coming to your home.";
export const TRUST = [
  { icon: "shield", title: "ID-verified Buddies", text: "Every Buddy submits a government photo ID and a live selfie, which the Any-Buddy team reviews before approving them. Your safety is non-negotiable." },
  { icon: "star", title: "Rated & Reviewed", text: "Read real reviews from real customers in your area before you book. Our rating system means only the best Buddies keep working." },
  { icon: "tag", title: "Transparent Pricing", text: "See the full price before you confirm. No surprise fees, no awkward conversations at the door." },
  { icon: "lock", title: "Secure Payments", text: "Pay safely through the Any-Buddy app or website using your card or digital wallet. No cash required." },
  { icon: "chat", title: "5-Star Support", text: "Something not right? Our support team is a message away. We stand behind every job booked on Any-Buddy." },
];

// How it works: the client's original copy, word for word (do not rewrite).
// The product flow, for reference: find a service, pick a verified Buddy and a time, and pay. Then share the emailed
// code at the visit, which the Buddy uses to check in and complete the job.
// The photos tell the story without people: the problem (a dripping faucet), then the Buddy's tools, then a relaxed,
// finished home.
export const STEPS = [
  { photo: "https://images.unsplash.com/photo-1779968130487-f619b788ad84", title: "Tell us what you need", text: "Choose from our list of home services, pick a date and time that works for you, and describe the job. Takes less than 2 minutes" },
  { photo: "https://images.unsplash.com/photo-1680648305742-1a8fd94ab8d5", title: "Meet your Buddy", text: "We match you with a local pro whose photo ID and live selfie our team has reviewed. See their profile, ratings, and past reviews before you confirm." },
  { photo: "https://images.unsplash.com/photo-1666585958641-4f70887372a1", title: "Sit back and relax", text: "Your Buddy shows up on time, gets the job done, and you pay securely through the app. It's that simple." },
];

// Real app screens: the images from the business's own App Store listing (app id 6770849160), in listing order.
export const APP_SHOTS = [
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ff/4b/7c/ff4b7cad-f8d9-bc15-c88e-b4cb8a3542a9/1.jpg/600x1300bb.webp",
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/01/c4/ed/01c4eda4-e941-c2b3-dc3f-fe5d445bad6a/2.jpg/600x1300bb.webp",
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/84/b6/55/84b655c5-9c0d-58eb-a4cb-5bc4f2e4a4cc/3.jpg/600x1300bb.webp",
  "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/b9/1c/92/b91c9214-933c-5d7b-a1db-217b4fb537da/4.jpg/600x1300bb.webp",
];

// Customer reviews from the original site that are confirmed as real, word for word. They are shown first, and real
// reviews from the database (homepage API) follow when there are any.
export const OWNER_REVIEWS = [
  {
    _id: "owner-lara",
    name: "Lara M., Weston MA",
    rating: 5,
    feedBack: "We use Any-Buddy every two weeks for home cleaning. Consistent, reliable, and always the same friendly face. Worth every penny.",
  },
  {
    _id: "owner-sarah",
    name: "Sarah B., Boston MA",
    rating: 5,
    feedBack: "I booked a handyman last minute and my Buddy showed up within two hours. Fixed my leaky faucet and even cleaned up after himself. Incredible service.",
  },
];
