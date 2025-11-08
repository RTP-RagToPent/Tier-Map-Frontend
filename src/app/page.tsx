import { Button } from '@shared/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="neumorphism rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Tier Map
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            地域のスポットをラリー形式で巡り、ティア表で評価するWebアプリ
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-x-6">
            <Button asChild size="lg">
              <a href="/rallies">
                ラリー一覧 <span aria-hidden="true">→</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
