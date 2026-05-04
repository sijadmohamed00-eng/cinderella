export const metadata = {
  title: "IQR — لوحة التحكم",
  description: "داشبورد إدارة المطاعم — IQR",
};

export default function DashboardLayout({ children }) {
  return (
    <div style={{ background: "#000814", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
