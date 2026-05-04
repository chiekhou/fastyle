export default function Spinner({ fullPage = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div
      className={`${sizes[size]} rounded-full border-2 border-cream-300 border-t-olive animate-spin`}
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
}
