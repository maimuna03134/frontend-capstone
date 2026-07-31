import ScreenPlaceholder from "../components/ScreenPlaceholder";

export default function CheckoutPage() {
  return (
    <ScreenPlaceholder
      title="Checkout"
      description="Shipping details, a payment method choice, and an order confirmation."
      plannedFeatures={[
        "Shipping form with validation",
        "Order summary and total",
        "Confirmation screen with a reference number",
      ]}
    />
  );
}
