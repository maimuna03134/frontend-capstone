import ScreenPlaceholder from "../../components/ScreenPlaceholder";

export default async function ProductDetailPage({ params }) {
  // Route params are a Promise in this Next.js version — must be awaited.
  const { id } = await params;

  return (
    <ScreenPlaceholder
      title={`Product detail — #${id}`}
      description="Full product information: images, description, price, and an add-to-cart action."
      plannedFeatures={[
        "Product image, title, description, and price",
        "Add to cart and add to favorites",
        "Related products from the same category",
      ]}
    />
  );
}
