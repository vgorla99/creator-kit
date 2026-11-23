import { brand } from "virtual:brand";
import { HeroArt } from "../components/HeroArt";
import { LeadForm } from "../components/LeadForm";
import { Reveal } from "../components/Reveal";
import { ButtonLink, Container, Eyebrow, FaqList } from "../components/ui";
import { home } from "../content";

const cap = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

export function Home() {
  const magnet = brand.site?.lead_magnet;
  return (
    <>
      <section className="overflow-hidden">
        <Container className="grid items-center gap-10 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
          <div>
            <Eyebrow>{home.eyebrow}</Eyebrow>
            <h1 className="mt-4 text-[2.6rem] font-bold tracking-tight sm:text-6xl">{home.heroLine}</h1>
            <p className="mt-5 max-w-xl text-lg text-dark/80 sm:text-xl">{home.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#guide">{home.primaryCta}</ButtonLink>
              <ButtonLink href="#how" variant="ghost">{home.secondaryCta}</ButtonLink>
            </div>
          </div>
          <div className="rise flex justify-center">
            <HeroArt />
          </div>
        </Container>
      </section>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-6 bg-dark py-20 text-light">
        <Container>
          <h2 id="how-title" className="text-3xl font-bold sm:text-4xl">{home.offerHeading}</h2>
          {brand.site?.offer && <p className="mt-3 max-w-2xl text-lg text-light/80">{cap(brand.site.offer)}.</p>}
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {home.offerSteps.map((step, i) => (
              <Reveal as="li" key={step.title} className="rounded-3xl border border-light/15 p-6">
                <span className="font-mono text-sm text-primary">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-light/80">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="proof-title" className="py-20">
        <Container>
          <h2 id="proof-title" className="text-3xl font-bold sm:text-4xl">{home.proofHeading}</h2>
          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {home.proofStats.map((s) => (
              <Reveal key={s.label} className="rounded-3xl bg-secondary/15 p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-6xl font-bold text-tertiary">{s.value}</span>
                  <span className="mt-2 block text-dark/80">{s.label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {home.proofQuotes.map((q) => (
              <Reveal key={q.quote}>
                <figure className="h-full rounded-3xl border-2 border-dark p-6">
                  <blockquote className="text-xl font-medium">“{q.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm text-dark/70">{q.who}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {magnet && (
        <section id="guide" aria-labelledby="guide-title" className="scroll-mt-6">
          <Container>
            <Reveal className="grid gap-8 rounded-[2rem] bg-tertiary p-8 text-light sm:p-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-light">{home.leadHeading}</p>
                <h2 id="guide-title" className="mt-3 text-3xl font-bold sm:text-4xl">{cap(magnet)}</h2>
                <p className="mt-3 text-light/80">{home.leadText}</p>
              </div>
              <LeadForm source="home" button={home.primaryCta} tone="dark" />
            </Reveal>
          </Container>
        </section>
      )}

      <section aria-labelledby="faq-title" className="pt-20">
        <Container className="max-w-3xl">
          <h2 id="faq-title" className="text-3xl font-bold sm:text-4xl">{home.faqHeading}</h2>
          <div className="mt-8">
            <FaqList faqs={home.faqs} />
          </div>
        </Container>
      </section>
    </>
  );
}
