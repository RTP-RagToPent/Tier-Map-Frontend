export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Tier Map
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
          地域のスポットをラリー形式で巡り、ティア表で評価するWebアプリ
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-x-6">
          <a
            href="/search"
            className="min-h-[44px] w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-700 sm:w-auto sm:text-sm"
          >
            スポットを探す
          </a>
          <a
            href="/rallies"
            className="min-h-[44px] text-base font-semibold leading-6 text-gray-900 hover:text-gray-700 active:text-gray-800 sm:text-sm"
          >
            ラリー一覧 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
