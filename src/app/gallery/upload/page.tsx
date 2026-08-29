import type { Metadata } from "next";
import UploadClient from "./UploadClient";

export const metadata: Metadata = {
  title: "Admin Gallery Upload — Hi5 Creation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GalleryUploadPage() {
  return <UploadClient />;
}
