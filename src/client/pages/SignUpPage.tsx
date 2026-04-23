import { SignUpForm } from "../components/SignUpForm";
import { SingleItemLayout } from "../components/SingleItemLayout";

export function SignUpPage() {
  return (
    <div>
      <SingleItemLayout>
        <SignUpForm />
      </SingleItemLayout>
    </div>
  );
}
