export const INRAppRoutes = {
  signIn: () => "/sign-in" as const,
  forgotPassword: () => "/forgot-password" as const,
  checkEmail: () => "/check-email" as const,
  resetPassword: () => "/reset-password" as const,
  passwordResetSuccess: () => "/password-reset-success" as const,
  patients: () => "/(app)/patients" as const,
  investigations: () => "/(app)/investigations" as const,
  profile: () => "/(app)/profile" as const,
  patient: (patientId: string | number) => `/patient/${patientId}` as const,
  patientHistory: (patientId: string | number) =>
    `/patient/${patientId}/history` as const,
  patientNewInr: (patientId: string | number) =>
    `/patient/${patientId}/new-inr` as const,
  patientCalendar: (patientId: string | number) =>
    `/patient/${patientId}/calendar` as const,
  patientAdvice: (patientId: string | number) =>
    `/patient/${patientId}/advice` as const,
  patientAdviceForm: (patientId: string | number) =>
    `/patient/${patientId}/advice-form` as const,
  patientComplications: (patientId: string | number) =>
    `/patient/${patientId}/complications` as const,
  patientComplicationForm: (patientId: string | number) =>
    `/patient/${patientId}/complication-form` as const,
  patientEditNorm: (patientId: string | number) =>
    `/patient/${patientId}/edit-norm` as const,
};
