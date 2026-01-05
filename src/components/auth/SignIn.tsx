import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordReset } from "@/components/auth/PasswordReset";
import { X } from "lucide-react";

interface SignInProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
}

export function SignIn({ open, onOpenChange, onSwitchToSignUp }: SignInProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);

    if (!newOpen) {
      setEmail("");
      setPassword("");
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setEmail("");
      setPassword("");
      onOpenChange(false);
    }
  };

  const handleSwitchToSignUp = () => {
    setEmail("");
    setPassword("");
    setError(null);
    onOpenChange(false);
    onSwitchToSignUp?.();
  };

  const handlePasswordResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange(false);
    setPasswordResetOpen(true);
  };

  const handleBackToSignIn = () => {
    setPasswordResetOpen(false);
    onOpenChange(true);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              ログイン
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-xs text-gray-600 mb-6">
            メールアドレスとパスワードを入力してログインしてください
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  パスワード
                </Label>
                <a
                  href="#"
                  className="text-xs hover:underline"
                  onClick={handlePasswordResetClick}
                >
                  パスワードをお忘れですか?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "ログイン中..." : "ログイン"}
            </Button>

            <p className="text-center text-xs text-gray-600">
              アカウント登録がお済みでない方は{" "}
              <Button
                type="button"
                onClick={handleSwitchToSignUp}
                variant="link"
                className="h-auto p-0 text-xs"
              >
                こちら
              </Button>
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>

      <PasswordReset
        open={passwordResetOpen}
        onOpenChange={setPasswordResetOpen}
        onBackToSignIn={handleBackToSignIn}
      />
    </Dialog.Root>
  );
}
