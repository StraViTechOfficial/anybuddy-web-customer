"use client";
import NotificationList from "@/Components/CommonParts/NotificationList";
import "../profile/profile.css";

// The title comes from the page head (the breadcrumb and "Notifications"). The list sits under it, left-aligned with it.
function Notification() {
  return (
    <section className="ab-section ab-section--tight">
      <div className="ab-container">
        <div className="ab-notes-page">
          <p className="ab-notes-page__lead">Updates about your bookings and your account.</p>
          <NotificationList />
        </div>
      </div>
    </section>
  );
}

export default Notification;
