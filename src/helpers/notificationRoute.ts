import { INRAppRoutes } from "@/constants/routes.constants";
import type { NotificationType } from "@/types/notification-type";

export function routeForNotification(item: NotificationType) {
  const patientId = item.data?.patientId;
  if (!patientId) return null;

  switch (item.type) {
    case "complicatiions":
      return INRAppRoutes.patientComplications(patientId);
    case "advances":
      return INRAppRoutes.patientAdvice(patientId);
    case "test_give_date":
      return INRAppRoutes.patientDailyNotesCalendar(patientId, "test");
    case "dosage":
      return INRAppRoutes.patientDailyNotesCalendar(patientId, "dose");
    case "inr_result":
      return INRAppRoutes.patientHistory(patientId);
    default:
      return INRAppRoutes.patient(patientId);
  }
}
