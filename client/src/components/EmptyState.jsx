function EmptyState({ 
  icon = "📭", 
  title = "No Data Found", 
  message = "There's nothing here yet.", 
  action = null 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
