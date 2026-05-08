export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-600">
        🚫 Access Denied – You are not authorized to view this page.
      </h1>
    </div>
  );
}
