import { getData, postRawData, putRawData } from "./index";
import { getSavedLocation } from "@/Until/searchLocation";

// Adds the customer's saved location, the same way fetchHomepage sends it, so the API adds fromPriceNearby and
// priceUnitNearby.
const withPoint = (payload) => {
  const at = getSavedLocation();
  return at ? { lat: at.lat, long: at.long, ...payload } : payload;
};

export const LoginApi = async (payload) => postRawData("user/auth/login", payload);
export const LoginPhoneApi = async (payload) => postRawData("user/auth/login", payload);

export const forgotPasswordApi = async (payload) => putRawData("user/auth/forget-password", payload);

export const OTPVerificationApi = async (payload) => postRawData("user/auth/verify-otp", payload);
// Confirms the email by link. Both are verified: the phone by a code at sign-up, and the email by a link.
export const VerifyEmailApi = async (payload) => postRawData("user/auth/verify-email", payload);
export const ResendEmailLinkApi = async () => postRawData("user/auth/resend-email-link", {});
// The first Google or Apple sign-in. Using the restricted token, the customer adds a phone number (a code is texted
// to it) and accepts the Terms.
export const SocialCompleteApi = async (payload) => postRawData("user/auth/social-complete", payload);
export const ResendOTPApi = async (payload) => postRawData("user/auth/resend-otp", payload);

export const resetPasswordApi = async (payload) => postRawData("user/auth/reset-password", payload);

export const changePasswordApi = async (payload) => putRawData("user/auth/change-password", payload);

export const logoutApi = async (payload) => postRawData("user/auth/logout", payload);
// Asks the backend for an upload link that lasts 5 minutes, so the browser never holds storage keys.
export const getUploadLinkApi = async (payload) => postRawData("uploads/presign", payload);
export const RegisterApi = async (payload) => postRawData("user/auth/signup", payload);
export const SetProfileApi = async (payload) => putRawData("user/auth/update-profile", payload);
export const getProfileApi = async (payload) => getData("user/auth/list-profile", payload);
export const HomepageApi = async (payload) => getData("user/homepage", payload);
export const CategoryListApi = async (payload) => getData("user/homepage/list-categories", payload);
export const ServiceListApi = async (payload) => getData("user/services/list", payload);
export const ServiceDetailApi = async (payload) => getData("user/services/list-filter-service", payload);
// Finds categories, services and Buddies by name. The backend uses Atlas Search, which tolerates typos.
export const SiteSearchApi = async (q) => getData("user/homepage/search", withPoint({ q }));
// The services one Buddy offers, with name and price. Used on the Buddy's profile page.
export const ProviderServicesApi = async (payload) => getData("user/services/list-vendor-services", payload);

export const ProviderDetailApi = async (payload) => getData("user/services/details", payload);
export const GetCMSApi = async (payload) => getData("user/cms/list", payload);
export const BookingListApi = async (payload) => getData("user/booking/list-booking", payload);
export const BookingDetailApi = async (payload) => getData("user/booking/detail", payload);
export const AddressListApi = async (payload) => getData("user/address/list", payload);
export const AddressDetailApi = async (payload) => getData("user/address/detail", payload);
export const SendHelpApi = async (payload) => postRawData("user/support/send-message", payload);
// Saved Buddies. Favourites are Buddies, not services.
export const SaveBuddyApi = async (payload) => postRawData("user/wishlist/save-buddy", payload);
export const RemoveBuddyApi = async (payload) => putRawData("user/wishlist/remove-buddy", payload);
export const SavedBuddiesApi = async () => getData("user/wishlist/list-buddies");
export const SubCateListApi = async (payload) => getData("user/sub-categories/list", withPoint(payload));
export const NotificationListApi = async (payload) => getData("user/notification/listing", payload);
export const NotificationContApi = async (payload) => putRawData("user/notification/list-unread", payload);
// Hides every current notification for this customer (list and unread count then leave them out).
export const ClearNotificationsApi = async () => putRawData("user/notification/clear-all");
export const BookProccedApi = async (payload) => postRawData("user/services/booking-processed-data", payload);
export const SlotServiceApi = async (payload) => getData("user/booking/list-service-slots", payload);
export const ConfirmPaymentApi = async (payload) => postRawData("user/booking/confirm-payment", payload);
export const ReleaseCheckoutApi = async (payload) => postRawData("user/booking/release-checkout", payload);
export const SlotProviderBookApi = async (payload) => postRawData("user/booking/book-confirm-slots", payload);
export const BookingCancelApi = async (payload) => postRawData("user/booking/cancel-booking", payload);
export const RatingReviewListApi = async (payload) => getData("user/services/list-rating-reviews", payload);
export const AddRatingReviewApi = async (payload) => postRawData("user/rating-review/add", payload);
export const LocationApi = async (payload) => getData("list-location", payload);
