import { ButtonLink, Container } from "../components/ui";

export function NotFound() {
  return (
    <Container className="max-w-2xl py-16">
      <h1 className="text-4xl font-bold">This page does not exist</h1>
      <p className="mt-4 text-lg text-dark/80">The link may be old or mistyped.</p>
      <div className="mt-8">
        <ButtonLink href="/">Back to the home page</ButtonLink>
      </div>
    </Container>
  );
}
