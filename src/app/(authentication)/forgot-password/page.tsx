import { Metadata } from "next";

import AuthFormTemplate from "@/components/shared/auth/AuthFormTemplate";
import PasswordResetForm from "./_components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function Page() {
  return (
    <AuthFormTemplate image="https://images.pexels.com/photos/3760809/pexels-photo-3760809.jpeg?auto=compress&cs=tinysrgb&w=800">
      <PasswordResetForm />
    </AuthFormTemplate>
  );
}
