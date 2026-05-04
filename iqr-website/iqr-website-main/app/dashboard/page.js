"use client";
import dynamic from "next/dynamic";
import { DashboardGate } from "../../subscription/SubscriptionGate";

const IQRDashboard = dynamic(() => import("../../components/IQRDashboard"), {
  ssr: false,
  loading: () => (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#000814" }}>
      <div style={{ fontFamily:"Cairo", fontSize:16, color:"rgba(240,244,255,.4)" }}>جاري التحميل...</div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <DashboardGate>
      <IQRDashboard />
    </DashboardGate>
  );
}
