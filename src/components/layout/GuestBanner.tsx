export function GuestBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3">
        <p className="text-sm text-amber-800 flex items-center gap-2">
          当期・前期の決算書データを入力するだけで、間接法によるキャッシュフロー計算書を自動作成するアプリケーションです。
          <br />
          <br />
          -
          アカウント登録すると、入力したデータを保存していつでも見直すことができます。
          <br />-
          アカウント登録せずにご利用の場合は、ブラウザのリロードでデータがクリアされますのでご注意ください。
        </p>
      </div>
    </div>
  );
}
