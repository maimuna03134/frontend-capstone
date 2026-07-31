import ScreenPlaceholder from "../components/ScreenPlaceholder";

export default function CartPage() {
  return (
    <ScreenPlaceholder
      title="Cart"
      description="Items added to the cart, with quantity controls and a running total."
      plannedFeatures={[
        "Quantity controls per item",
        "Running total",
        "Persisted between visits",
      ]}
    />
  );
}
