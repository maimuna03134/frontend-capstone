import ScreenPlaceholder from "../components/ScreenPlaceholder";

export default function AccountPage() {
  return (
    <ScreenPlaceholder
      title="Account settings"
      description="Update your name, phone number, and notification preferences."
      plannedFeatures={[
        "Validated settings form (name, phone, notifications)",
        "Accessible labels and inline error messages",
        "Saved confirmation on submit",
      ]}
    />
  );
}
