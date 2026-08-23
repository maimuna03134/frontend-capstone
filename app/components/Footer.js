import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-paper-line px-4 py-6 text-center text-sm text-ink/70 sm:px-6">
      ShopFront — a capstone project in progress.{" "}
      <Link href="/health" className="underline hover:text-teal">
        System status
      </Link>
    </footer>
  );
}
