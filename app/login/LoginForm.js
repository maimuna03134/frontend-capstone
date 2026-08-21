"use client";

import { useId, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function LoginForm({ onSubmit = () => { } }) {
  const emailId = useId();
  const passwordId = useId();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  function handleChange(field) {
    return (event) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = loginSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setJustSubmitted(false);
      return;
    }

    setErrors({});
    setJustSubmitted(true);
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          value={values.email}
          onChange={handleChange("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className="mt-1 w-full rounded-lg border border-paper-line px-3 py-2 text-sm outline-none focus-visible:border-teal"
        />
        {errors.email && (
          <p id={`${emailId}-error`} role="alert" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id={passwordId}
          type="password"
          value={values.password}
          onChange={handleChange("password")}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          className="mt-1 w-full rounded-lg border border-paper-line px-3 py-2 text-sm outline-none focus-visible:border-teal"
        />
        {errors.password && (
          <p id={`${passwordId}-error`} role="alert" className="mt-1 text-xs text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-dark"
      >
        Log in
      </button>

      {justSubmitted && (
        <p role="status" className="text-sm text-teal-dark">
          Looks good — real sign-in wiring (Firebase Auth) lands in a later
          assignment.
        </p>
      )}
    </form>
  );
}