import { Reveal } from "../components/Reveal";
import { ButtonLink, Container, Eyebrow } from "../components/ui";
import { about } from "../content";

export function About() {
  return (
    <Container className="max-w-3xl pt-10">
      <Eyebrow>{about.title}</Eyebrow>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{about.heading}</h1>
      <div className="mt-8 grid gap-5 text-lg text-dark/85">
        {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
      </div>
      <h2 className="mt-16 text-3xl font-bold">{about.valuesHeading}</h2>
      <ul className="mt-8 grid gap-4">
        {about.values.map((v) => (
          <Reveal as="li" key={v.title} className="rounded-3xl bg-secondary/15 p-6">
            <h3 className="text-xl font-bold">{v.title}</h3>
            <p className="mt-2 text-dark/80">{v.text}</p>
          </Reveal>
        ))}
      </ul>
      <div className="mt-12">
        <ButtonLink href="/#guide">Get the free guide</ButtonLink>
      </div>
    </Container>
  );
}
