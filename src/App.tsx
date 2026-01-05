import { useState, useEffect } from "react";
import { CashFlowInput } from "@/components/cashflow/CashFlow";
import { Header } from "@/components/layout/Header";
import { GuestBanner } from "@/components/layout/GuestBanner";
import { Footer } from "@/components/layout/Footer";
import { SignIn } from "@/components/auth/SignIn";
import { SignUp } from "@/components/auth/SignUp";
import { UpdatePassword } from "@/components/auth/UpdatePassword";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { user, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [updatePasswordOpen, setUpdatePasswordOpen] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => {
    const hash = window.location.hash;
    return hash.includes("type=recovery") && !hash.includes("error=");
  });

  const handleLogin = () => {
    setSignInOpen(true);
  };

  const handleSignUp = () => {
    setSignUpOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleSwitchToSignUp = () => {
    setSignInOpen(false);
    setSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setSignUpOpen(false);
    setSignInOpen(true);
  };

  // パスワードリセットフロー処理
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("error=")) {
      if (hash.includes("otp_expired")) {
        alert(
          "パスワードリセットリンクの有効期限が切れています。\n新しいリセットメールを送信してください。"
        );
      }
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (hash.includes("type=recovery")) {
      setTimeout(() => setUpdatePasswordOpen(true), 500);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isRecoveryMode && (
        <>
          <Header
            user={user}
            onLoginClick={handleLogin}
            onSignUpClick={handleSignUp}
            onLogoutClick={handleLogout}
          />

          {!user && <GuestBanner />}

          <main className="flex-1 container mx-auto px-4 py-6">
            <CashFlowInput />
          </main>

          <Footer />
        </>
      )}

      <SignIn
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUp
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToSignIn={handleSwitchToSignIn}
      />

      <UpdatePassword
        open={updatePasswordOpen}
        onOpenChange={(open) => {
          setUpdatePasswordOpen(open);

          if (!open) {
            window.history.replaceState(null, "", window.location.pathname);
            setIsRecoveryMode(false);
          }
        }}
      />
    </div>
  );
}

export default App;
