import apiClient from "@/hooks/Axios";

export interface NotificationAuthor {
  name: string;
  avatar?: string;
}

export interface NotificationItem {
  _id: string;
  product: string;
  title: string;
  content: string;
  createdAt: string;
  author: NotificationAuthor;
}

export interface StudentNotificationsResponse {
  success: boolean;
  hasUnread: boolean;
  count: number;
  data: NotificationItem[];
}

export const fetchStudentNotifications = async (): Promise<StudentNotificationsResponse> => {
  const response = await apiClient.get("/api/student-notifications");
  return response.data;
};

export const markNotificationsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch("/api/student-notifications/read");
  return response.data;
};
