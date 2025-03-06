export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 