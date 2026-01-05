import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { validatePassword } from "@/utils/authErrors";

interface SignUpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

export function SignUp({ open, onOpenChange, onSwitchToSignIn }: SignUpProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);

    if (!newOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    const { error } = await signUp(email, password, name);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onSwitchToSignIn?.();
      }, 2000);
    }
  };

  const handleSwitchToSignIn = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
    onSwitchToSignIn?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              アカウント登録
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-xs text-gray-600 mb-6">
            必要な情報を入力して新しいアカウントを作成してください
          </Dialog.Description>

          {success ? (
            <div className="p-4 text-center">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ✓ Account created successfully!
              </div>
              <p className="text-sm text-gray-600">
                Please check your email to verify your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-xs">
                  お名前
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs">
                  メールアドレス
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs">
                  パスワード
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">
                  8文字以上で入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-xs">
                  パスワード（確認）
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">
                  確認のため、もう一度同じパスワードを入力してください
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "アカウント作成中..." : "アカウント作成"}
              </Button>

              <p className="text-center text-xs text-gray-600">
                既にアカウントをお持ちの方は{" "}
                <Button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  variant="link"
                  className="h-auto p-0 text-xs"
                >
                  こちら
                </Button>
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
