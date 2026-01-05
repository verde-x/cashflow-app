import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/utils/authErrors";

interface UpdatePasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePassword({ open, onOpenChange }: UpdatePasswordProps) {
  const { updatePassword, session } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!session) {
      setError(
        "セッションが見つかりません。メールのリンクをもう一度クリックしてください。"
      );
      return;
    }

    // Validation
    const validationError = validatePassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    const { error } = await updatePassword(newPassword);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open && success) {
          onOpenChange(open);
        }
      }}
      modal={true}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 border border-gray-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          onEscapeKeyDown={(e) => {
            // Escキーでの閉じるを無効化（セキュリティのため）
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            // 外側クリックでの閉じるを無効化（セキュリティのため）
            e.preventDefault();
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              パスワード再設定（必須）
            </Dialog.Title>
          </div>

          <Dialog.Description className="text-xs text-gray-600 mb-6">
            新しいパスワードを入力してください
          </Dialog.Description>

          {success ? (
            <div className="space-y-4">
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                <p className="font-medium mb-1">パスワードを更新しました</p>
                <p className="text-xs">
                  パスワードが正常に更新されました。引き続きアプリをご利用いただけます。
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
                <Label htmlFor="new-password" className="text-xs">
                  新しいパスワード
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                  placeholder="8文字以上"
                />
                <p className="text-xs text-gray-500">
                  8文字以上で入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs">
                  新しいパスワード（確認）
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="もう一度入力してください"
                />
                <p className="text-xs text-gray-500">
                  確認のため、もう一度同じパスワードを入力してください
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "更新中..." : "パスワードを更新"}
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
