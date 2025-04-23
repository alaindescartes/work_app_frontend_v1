export interface StaffData {
  staffId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "user" | "supervisor" | "admin";
  hireDate: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}
