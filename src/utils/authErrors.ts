import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
  // パスワード関連
  "New password should be different from the old password.":
    "新しいパスワードは現在のパスワードと異なるものを設定してください。",

  "Password should be at least 6 characters":
    "パスワードは6文字以上で設定してください。",

  // ログイン・認証関連
  "Invalid login credentials":
    "メールアドレスまたはパスワードが正しくありません。",

  "Invalid email or password":
    "メールアドレスまたはパスワードが正しくありません。",

  "Email not confirmed": "メールアドレスが確認されていません。",

  // サインアップ関連
  "User already registered": "このメールアドレスは既に登録されています。",

  "Unable to validate email address: invalid format":
    "メールアドレスの形式が正しくありません。",
};

export function handleAuthError(error: AuthError | null): {
  error: AuthError | null;
} {
  if (!error) {
    return { error };
  }

  const translatedMessage =
    AUTH_ERROR_TRANSLATIONS[error.message] || error.message;

  error.message = translatedMessage;

  return { error };
}

export function validatePassword(
  password: string,
  confirmPassword: string
): string | null {
  if (password.length < 8) {
    return "パスワードは8文字以上で入力してください";
  }

  if (password !== confirmPassword) {
    return "パスワードが一致しません";
  }

  return null;
}
