import { SignInPage } from "../pages/SignInPage";
import { API_HOST } from "./config";
import { authClient } from "../lib/auth";

// Action for sign in form
export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  console.log({ email, password });
  if (!email || !password) {
    return { error: "Email or password cannot be blank!" };
  }
  const data = await authClient.signIn.email({
    email,
    password,
    rememberMe: true,
    callbackURL: `${API_HOST}/`,
  });

  if (data?.data) {
    const _data = data.data;
    const { redirect: _redirect, token, url } = _data;

    if (token) {
      localStorage.setItem("bearer_token", token);
    }
  }

  return data;
}

export default () => {
  return <SignInPage />;
};
