import { useActionData, useSubmit } from "react-router";

export function SignInForm() {
  const submit = useSubmit();
  const data = useActionData();

  return (
    <form
      className="flex flex-col gap-4"
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
    >
      <input
        name="email"
        type="text"
        placeholder="Email"
        value={"niculistana@gmail.com"}
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={"burritto"}
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {data?.error && (
        <p className="text-xs text-red-600 text-center">Unable to login</p>
      )}
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium"
      >
        Log In
      </button>
    </form>
  );
}
