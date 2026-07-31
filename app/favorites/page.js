import ScreenPlaceholder from "../components/ScreenPlaceholder";

export default function FavoritesPage() {
  return (
    <ScreenPlaceholder
      title="Favorites"
      description="Products saved for later, tied to your account."
      plannedFeatures={[
        "Saved products list, synced per account",
        "Remove from favorites",
        "Empty state when nothing's saved yet",
      ]}
    />
  );
}
