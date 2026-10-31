
const BASE_URL = "http://127.0.0.1:8000";

export interface NotificationData {
  notification_id: string;
  title: string;
  message: string;
  type: string;
  color: string;
  sended_at: string;
  time_live: number;
  account_type: string;
  gmail: string;
}

export interface NotificationResponse {
  detail: string;
  notifcation_info: NotificationData;
}

export async function fetchWelcomeSignIn(user_id: number, gmail: string, account_type: string): Promise<NotificationResponse> {
  const res = await fetch(`${BASE_URL}/welcome_notification_signin?user_id=${user_id}&gmail=${gmail}&account_type=${account_type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch sign in notification");
  return res.json();
}

export async function fetchWelcomeLogin(user_id: number, gmail: string, account_type: string): Promise<NotificationResponse> {
  const res = await fetch(`${BASE_URL}/welcome_notification_login?user_id=${user_id}&gmail=${gmail}&account_type=${account_type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch login notification");
  return res.json();
}

export async function deleteNotificationById(notification_id: string, user_id: number, gmail: string, account_type: string,token:string) {
  const res = await fetch(`${BASE_URL}/delete/${notification_id}?user_id=${user_id}&gmail=${gmail}&account_type=${account_type}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
}

export async function deleteAllNotifications(user_id: number, gmail: string, account_type: string,token:string) {
  const res = await fetch(`${BASE_URL}/delete_all?user_id=${user_id}&gmail=${gmail}&account_type=${account_type}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to delete all notifications");
  return res.json();
}