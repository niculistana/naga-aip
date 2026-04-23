import React from "react";

export function SignUpForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    console.log("SignUpForm submitted", { username, email, password });
  }

  return (
    <form className="flex flex-col gap-4 onSubmit={handleSubmit}">
      <h2 className="text-2xl font-semibold mb-4 text-center text-black">
        Sign Up
      </h2>
      <input
        name="username"
        type="text"
        placeholder="Username"
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium"
      >
        Sign Up
      </button>
    </form>
  );
}
