import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-paper-line px-4 py-6 text-sm text-ink/70 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p>
          ShopFront — a capstone project in progress.{" "}
          <Link href="/health" className="underline hover:text-teal">
            System status
          </Link>
        </p>
        <nav aria-label="More from this build" className="flex gap-4 text-xs">
          <Link href="/3d-preview" className="hover:text-teal">
            3D preview
          </Link>
          <Link href="/shader-hero" className="hover:text-teal">
            Shader hero
          </Link>
          <Link href="/motion-demo" className="hover:text-teal">
            Motion demo
          </Link>
        </nav>
      </div>
    </footer>
  );
}