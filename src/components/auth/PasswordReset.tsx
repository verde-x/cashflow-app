import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface PasswordResetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToSignIn?: () => void;
}

export function PasswordReset({
  open,
  onOpenChange,
  onBackToSignIn,
}: PasswordResetProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // セキュリティのため、メールアドレスが存在しない場合でも成功メッセージを表示
      setEmail("");
      setSuccess(true);
    }
  };

  const handleBackToSignIn = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
    onBackToSignIn?.();
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              パスワードリセット
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-xs text-gray-600 mb-6">
            パスワードをリセットするためのリンクをメールアドレスに送信します
          </Dialog.Description>

          {success ? (
            <div className="space-y-4">
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                <p className="font-medium mb-1">メール送信完了</p>
                <p className="text-xs">
                  パスワードリセット用のリンクをメールで送信しました。メールボックスをご確認ください。
                </p>
              </div>

              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                閉じる
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-xs">
                  メールアドレス
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "送信中..." : "リセットメールを送信"}
              </Button>

              {onBackToSignIn && (
                <p className="text-center text-xs text-gray-600">
                  <Button
                    type="button"
                    onClick={handleBackToSignIn}
                    variant="link"
                    className="h-auto p-0 text-xs"
                  >
                    ログイン画面に戻る
                  </Button>
                </p>
              )}
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
