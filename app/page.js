import ScreenPlaceholder from "./components/ScreenPlaceholder";

export default function HomePage() {
  return (
    <ScreenPlaceholder
      title="Product catalog"
      description="Browse products pulled live from a public catalog API — search by name, filter by category, and sort by price."
      plannedFeatures={[
        "Live product grid from a public API",
        "Search and category filters",
        "Sort by price and name",
        "Add to cart / add to favorites from each card",
      ]}
    />
  );
}
