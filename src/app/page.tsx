export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Tier Map</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          地域のスポットをラリー形式で巡り、ティア表で評価するWebアプリ
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/search"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            スポットを探す
          </a>
          <a href="/rallies" className="text-sm font-semibold leading-6 text-gray-900">
            ラリー一覧 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
