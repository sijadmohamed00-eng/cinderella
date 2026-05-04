import { Suspense } from "react";
import ActivateClient from "./ActivateClient";
export const metadata = { title: "تفعيل الاشتراك | IQR" };
export default function ActivatePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#000814" }}><div style={{ fontFamily:"Cairo", fontSize:16, color:"rgba(240,244,255,.3)" }}>جاري التحميل...</div></div>}>
      <ActivateClient />
    </Suspense>
  );
}
