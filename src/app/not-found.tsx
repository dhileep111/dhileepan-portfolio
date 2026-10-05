import { Button, Container } from "@/components/ui";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <Container className="py-32">
      <p className="eyebrow">404</p>
      <h1 className="display mt-5">That page doesn&rsquo;t exist.</h1>
      <p className="mt-6 max-w-lg text-lg text-muted">It may have moved. Head back to the homepage or see the work.</p>
      <div className="mt-10 flex gap-3">
        <Button href="/">Home</Button>
        <Button href="/work" variant="secondary">
          Selected Work
        </Button>
      </div>
    </Container>
  );
}
