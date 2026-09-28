import { getData, postRawData, putRawData } from "./index";

export const LoginApi = async (payload) => {
  return postRawData("user/auth/login", payload).then((data) => {
    return data;
  });
};
export const LoginPhoneApi = async (payload) => {
  return postRawData("user/auth/login", payload).then((data) => {
    return data;
  });
};

export const forgotPasswordApi = async (payload) => {
  return putRawData("user/auth/forget-password", payload).then((data) => {
    return data;
  });
};

export const OTPVerificationApi = async (payload) => {
  return postRawData("user/auth/verify-otp", payload).then((data) => {
    return data;
  });
};
// Email confirmation by link (verify both: phone by code at sign-up, email by link).
export const VerifyEmailApi = async (payload) => postRawData("user/auth/verify-email", payload);
export const ResendEmailLinkApi = async () => postRawData("user/auth/resend-email-link", {});
// Google / Apple first sign-in: add the phone (texted a code) and accept the Terms, with the restricted token.
export const SocialCompleteApi = async (payload) => postRawData("user/auth/social-complete", payload);
export const ResendOTPApi = async (payload) => {
  return postRawData("user/auth/resend-otp", payload).then((data) => {
    return data;
  });
};

export const resetPasswordApi = async (payload) => {
  return postRawData("user/auth/reset-password", payload).then((data) => {
    return data;
  });
};

export const changePasswordApi = async (payload) => {
  return putRawData("user/auth/change-password", payload).then((data) => {
    return data;
  });
};

export const logoutApi = async (payload) => {
  return postRawData("user/auth/logout", payload).then((data) => {
    return data;
  });
};
// SEC-05: ask the backend for a 5-minute upload link instead of holding storage keys.
export const getUploadLinkApi = async (payload) => {
  return postRawData("uploads/presign", payload).then((data) => {
    return data;
  });
};
export const RegisterApi = async (payload) => {
  return postRawData("user/auth/signup", payload).then((data) => {
    return data;
  });
};
export const SetProfileApi = async (payload) => {
  return putRawData("user/auth/update-profile", payload).then((data) => {
    return data;
  });
};
export const getProfileApi = async (payload) => {
  return getData("user/auth/list-profile", payload).then((data) => {
    return data;
  });
};
export const updatDeviceTokenApi = async (payload) => {
  return putRawData("user/auth/update-device-details", payload).then((data) => {
    return data;
  });
};
export const HomepageApi = async (payload) => {
  return getData("user/homepage", payload).then((data) => {
    return data;
  });
};
export const CategoryListApi = async (payload) => {
  return getData("user/homepage/list-categories", payload).then((data) => {
    return data;
  });
};
export const ServiceListApi = async (payload) => {
  return getData("user/services/list", payload).then((data) => {
    return data;
  });
};
export const ServiceDetailApi = async (payload) => {
  return getData("user/services/list-filter-service", payload).then((data) => {
    return data;
  });
};
// Services one pro offers (name, price) — used on the provider profile.
// C16: categories, services and pros by name (Atlas Search on the backend; typo tolerant).
export const SiteSearchApi = async (q) => getData("user/homepage/search", { q });
export const ProviderServicesApi = async (payload) => getData("user/services/list-vendor-services", payload);

export const ProviderDetailApi = async (payload) => {
  return getData("user/services/details", payload).then((data) => {
    return data;
  });
};
export const GetCMSApi = async (payload) => {
  return getData("user/cms/list", payload).then((data) => {
    return data;
  });
};
export const BookingListApi = async (payload) => {
  return getData("user/booking/list-booking", payload).then((data) => {
    return data;
  });
};
export const BookingDetailApi = async (payload) => {
  return getData("user/booking/detail", payload).then((data) => {
    return data;
  });
};
export const AddressListApi = async (payload) => {
  return getData("user/address/list", payload).then((data) => {
    return data;
  });
};
export const AddressDetailApi = async (payload) => {
  return getData("user/address/detail", payload).then((data) => {
    return data;
  });
};
export const SendHelpApi = async (payload) => {
  return postRawData("user/support/send-message", payload).then((data) => {
    return data;
  });
};
// Saved Buddies (contract C-16: favourites are pros, not services).
export const SaveBuddyApi = async (payload) => postRawData("user/wishlist/save-buddy", payload);
export const RemoveBuddyApi = async (payload) => putRawData("user/wishlist/remove-buddy", payload);
export const SavedBuddiesApi = async () => getData("user/wishlist/list-buddies");
export const SubCateListApi = async (payload) => {
  return getData("user/sub-categories/list", payload).then((data) => {
    return data;
  });
};
export const NotificationListApi = async (payload) => {
  return getData("user/notification/listing", payload).then((data) => {
    return data;
  });
};
export const NotificationContApi = async (payload) => {
  return putRawData("user/notification/list-unread", payload).then((data) => {
    return data;
  });
};
// Hides every current notification for this customer (list and unread count then leave them out).
export const ClearNotificationsApi = async () => {
  return putRawData("user/notification/clear-all").then((data) => {
    return data;
  });
};
export const BookProccedApi = async (payload) => {
  return postRawData("user/services/booking-processed-data", payload).then(
    (data) => {
      return data;
    }
  );
};
export const SlotServiceApi = async (payload) => {
  return getData("user/booking/list-service-slots", payload).then((data) => {
    return data;
  });
};
export const ConfirmPaymentApi = async (payload) => postRawData("user/booking/confirm-payment", payload);
export const ReleaseCheckoutApi = async (payload) => postRawData("user/booking/release-checkout", payload);
export const SlotProviderBookApi = async (payload) => {
  return postRawData("user/booking/book-confirm-slots", payload).then(
    (data) => {
      return data;
    }
  );
};
export const BookingCancelApi = async (payload) => {
  return postRawData("user/booking/cancel-booking", payload).then((data) => {
    return data;
  });
};
export const RatingReviewListApi = async (payload) => {
  return getData("user/services/list-rating-reviews", payload).then((data) => {
    return data;
  });
};
export const AddRatingReviewApi = async (payload) => {
  return postRawData("user/rating-review/add", payload).then((data) => {
    return data;
  });
};
export const LocationApi = async (payload) => {
  return getData("list-location", payload).then((data) => {
    return data;
  });
};
