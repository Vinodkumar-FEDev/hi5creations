import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Admin Login — Hi5 Creation Signage",
  description: "Secure login portal for Hi5 Creation gallery and image management.",
};

export default function LoginPage() {
  return <LoginClient />;
}
