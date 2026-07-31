import ScreenPlaceholder from "../components/ScreenPlaceholder";

export default function LoginPage() {
  return (
    <ScreenPlaceholder
      title="Log in"
      description="Email and password sign-in and account creation."
      plannedFeatures={[
        "Email/password login and signup",
        "Readable error messages on failed sign-in",
        "Redirect back to where the user came from",
      ]}
    />
  );
}
