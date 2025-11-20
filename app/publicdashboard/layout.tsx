export default function PublicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      {children}
    </div>
  );
}