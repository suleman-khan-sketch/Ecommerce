import { Metadata } from "next";

import AuthFormTemplate from "@/components/shared/auth/AuthFormTemplate";
import PasswordUpdateForm from "./_components/PasswordUpdateForm";

export const metadata: Metadata = {
  title: "Update Password",
};

export default function Page() {
  return (
    <AuthFormTemplate image="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800">
      <PasswordUpdateForm />
    </AuthFormTemplate>
  );
}
