"use client";
import { create } from "zustand";
import {
  AddressDetailApi,
  AddressListApi,
  BookingDetailApi,
  BookingListApi,
  CategoryListApi,
  GetCMSApi,
  getProfileApi,
  HomepageApi,
  NotificationContApi,
  NotificationListApi,
  ProviderDetailApi,
  RatingReviewListApi,
  ServiceDetailApi,
  ServiceListApi,
  SlotServiceApi,
  SubCateListApi,
} from "../setting";

export const useDataStore = create((set) => ({
  getProfile: {},
  fetchgetProfile: async (data) => {
    const res = await getProfileApi(data);
    set({ getProfile: await res?.data });
  },

  Homepage: {},
  fetchHomepage: async (data) => {
    const res = await HomepageApi(data);
    set({ Homepage: await res?.data });
  },

  CategoryList: {},
  fetchCategoryList: async (data) => {
    const res = await CategoryListApi(data);
    set({ CategoryList: await res });
    return res;
  },

  ServiceList: {},
  fetchServiceList: async (data) => {
    const res = await ServiceListApi(data);
    set({ ServiceList: await res });
  },

  ServiceDetail: {},
  fetchServiceDetail: async (data) => {
    const res = await ServiceDetailApi(data);
    set({ ServiceDetail: await res?.data });
    return res;
  },

  BookingList: {},
  fetchBookingList: async (data) => {
    const res = await BookingListApi(data);
    set({ BookingList: await res });
  },

  BookingDetail: {},
  fetchBookingDetail: async (data) => {
    const res = await BookingDetailApi(data);
    set({ BookingDetail: await res?.data });
  },

  AddressList: {},
  fetchAddressList: async (data) => {
    const res = await AddressListApi(data);
    set({ AddressList: await res?.data });
  },

  AddressDetail: {},
  fetchAddressDetail: async (data) => {
    const res = await AddressDetailApi(data);
    set({ AddressDetail: await res?.data });
  },

  SubCateList: {},
  fetchSubCateList: async (data) => {
    const res = await SubCateListApi(data);
    set({ SubCateList: await res });
  },

  GetCMS: {},
  fetchGetCMS: async (data) => {
    const res = await GetCMSApi(data);
    set({ GetCMS: await res?.data });
  },

  NotificationList: {},
  fetchNotificationList: async (data) => {
    const res = await NotificationListApi(data);
    set({ NotificationList: await res });
  },

  NotificationCont: {},
  fetchNotificationCont: async (data) => {
    const res = await NotificationContApi(data);
    set({ NotificationCont: await res?.data });
  },

  SlotService: {},
  fetchSlotService: async (data) => {
    const res = await SlotServiceApi(data);
    // Keep the server's reason (e.g. task step missing) so the calendar never says "no times" by mistake.
    set({ SlotService: res?.status === 1 ? res.data : { error: res?.message || "We couldn't load this pro's times. Please try again." } });
  },

  ProviderDetail: {},
  fetchProviderDetail: async (data) => {
    const res = await ProviderDetailApi(data);
    set({ ProviderDetail: await res?.data });
  },

  RatingReviewList: {},
  fetchRatingReviewList: async (data) => {
    const res = await RatingReviewListApi(data);
    set({ RatingReviewList: await res });
  },
}));
