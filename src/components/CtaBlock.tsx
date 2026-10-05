import { Arrow, Button, Section } from "./ui";

export function CtaBlock() {
  return (
    <Section tone="dark">
      <div className="max-w-3xl">
        <p className="eyebrow !text-paper/60">Contact</p>
        <h2 className="display mt-5">Have a project in mind?</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
          Tell me what you&rsquo;re trying to build, improve or grow.
        </p>
        <div className="mt-10">
          <Button href="/contact" variant="light">
            Start a Conversation <Arrow />
          </Button>
        </div>
      </div>
    </Section>
  );
}
