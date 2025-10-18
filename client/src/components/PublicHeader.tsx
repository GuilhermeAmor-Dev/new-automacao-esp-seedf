export function PublicHeader() {
  return (
    <header className="w-full" role="banner">
      <div className="bg-institutional-blue py-6">
        <div className="container mx-auto flex justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-bold" aria-label="Logo GDF">
              GDF
            </div>
          </div>
        </div>
      </div>
      <div className="bg-institutional-yellow h-1" aria-hidden="true" />
    </header>
  );
}
