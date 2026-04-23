import { SignInForm } from "../components/SignInForm";
import { SingleItemLayout } from "../components/SingleItemLayout";
import { Navigate } from "react-router";
import { authClient } from "../lib/auth";

export function SignInPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  if (session) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div>
      <SingleItemLayout>
        <SignInForm />
      </SingleItemLayout>
    </div>
  );
}
