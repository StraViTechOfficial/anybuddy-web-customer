"use client";
import { useDataStore } from "@/api/store/store";
import SetProfile from "@/Components/(Auth)/SetProfile/SetProfile";
import AboutUsSec from "@/Components/CommonParts/AboutUsSec";
import SavedBuddiesSec from "@/Components/CommonParts/SavedBuddiesSec";
import HelpSupport from "@/Components/CommonParts/HelpSupport";
import PrivacyPolicySec from "@/Components/CommonParts/PrivacyPolicySec";
import TermsConditionSec from "@/Components/CommonParts/TermsConditionSec";
import ResetChangePasswordForm from "@/Components/Forms/(AuthForm)/ResetChangePasswordForm";
import Cookies from "@/Until/cookies";
import { useEffect, useState } from "react";
import NotificationList from "../../../Components/CommonParts/NotificationList";
import LeftMenuProfile from "./LeftMenuProfile";
import "./profile.css";

function EditProfilePage() {
  const [Type, setType] = useState(1);
  const [Title, setTitle] = useState("My profile");

  const profile = useDataStore((store) => store.getProfile);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [Type]);

  const LinksArr = [
    { id: 1, name: "My profile", icon: "user", group: "Account", sub: "Your name, contact details and home address." },
    { id: 2, name: "Saved Buddies", icon: "heart", group: "Account", sub: "Pros you've saved to book again." },
    { id: 9, name: "Change password", icon: "lock", group: "Account", sub: "Choose a new password for signing in." },
    { id: 6, name: "Help & support", icon: "chat", group: "Support", path: "/support" },
    { id: 3, name: "About us", icon: "help", group: "Support", path: "/about_us" },
    { id: 4, name: "Privacy policy", icon: "shield", group: "Support", path: "/privacy-policy" },
    { id: 5, name: "Terms & conditions", icon: "fileCheck", group: "Support", path: "/terms-conditions" },
    // Notifications (tab 8) have their own page at /notification.
    { id: 10, name: "Log out", icon: "logout", group: "end", logout: true }, // Logs out in one click (CommonParts/logout.js).
  ]; // About, Privacy, Terms and Help open their own page, as in the footer, rather than a copy inside this panel.

  useEffect(() => {
    const tab = Cookies.get("tabShow");
    const link = tab && LinksArr.find((fd) => fd?.id === Number(tab) && !fd.logout);
    if (link) {
      setType(link.id);
      setTitle(link.name);
    }
  }, []);

  const current = LinksArr.find((l) => l.id === Type);
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="ab-section ab-section--tight ab-acct">
      <div className="ab-container ab-acct__grid">
        <aside className="ab-acct__side" aria-label="Account menu">
          {fullName && (
            <div className="ab-acct__who">
              <span className="ab-avatar">
                {profile?.logoUrl?.includes("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt="" />
                ) : (
                  initials
                )}
              </span>
              <div style={{ minWidth: 0 }}>
                <p className="ab-acct__name">{fullName}</p>
                {profile?.email && <p className="ab-acct__mail">{profile.email}</p>}
              </div>
            </div>
          )}
          <LeftMenuProfile
            LinksArr={LinksArr}
            Type={Type}
            setType={setType}
            setTitle={setTitle}
          />
        </aside>

        <div className="ab-acct__main">
          <div className="ab-acct__panel">
            {Type !== 10 && (
              <header className="ab-acct__head">
                <h2>{Title}</h2>
                {current?.sub && <p>{current.sub}</p>}
              </header>
            )}

            {Type === 1 ? (
              <div className="ab-acct__form ab-acct__form--profile">
                <SetProfile page="profile" inAccount />
              </div>
            ) : Type === 2 ? (
              <SavedBuddiesSec />
            ) : Type === 3 ? (
              <AboutUsSec />
            ) : Type === 4 ? (
              <PrivacyPolicySec />
            ) : Type === 5 ? (
              <TermsConditionSec />
            ) : Type === 6 ? (
              <HelpSupport />
            ) : Type === 8 ? (
              <NotificationList />
            ) : Type === 9 ? (
              <div className="ab-acct__form">
                <ResetChangePasswordForm page="change" />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditProfilePage;
