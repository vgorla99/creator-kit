import { brand } from "virtual:brand";
import { ButtonLink, Container, Eyebrow, FaqList } from "../components/ui";
import { article } from "../content";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Long-answer page: the full answer first, then the detail. Built to be quoted by search and AI answers. */
export function Article() {
  return (
    <Container className="max-w-3xl pt-10">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap gap-2 text-dark/75">
          <li><a href="/" className="underline underline-offset-4 hover:text-dark">Home</a> <span aria-hidden="true">/</span></li>
          <li aria-current="page">Guide</li>
        </ol>
      </nav>
      <article className="mt-6">
        <header>
          <Eyebrow>Guide</Eyebrow>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight sm:text-5xl">{article.question}</h1>
          <p className="mt-4 text-sm text-dark/75">
            By {brand.brand.name} · Updated <time dateTime={article.updated}>{dateFormat.format(new Date(article.updated))}</time>
          </p>
        </header>

        <section aria-labelledby="short-answer" className="mt-8 rounded-3xl border-l-8 border-primary bg-white p-6 shadow-sm">
          <h2 id="short-answer" className="font-mono text-xs uppercase tracking-widest text-tertiary">Short answer</h2>
          <p className="mt-3 text-xl leading-relaxed">{article.shortAnswer}</p>
        </section>

        {article.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className="text-3xl font-bold">{s.heading}</h2>
            <div className="mt-4 grid gap-4 text-lg text-dark/85">
              {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            {s.steps && (
              <ol className="mt-6 grid gap-4">
                {s.steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl bg-secondary/15 p-5">
                    <span className="grid size-9 place-items-center rounded-full bg-dark font-mono text-sm font-bold text-light">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="mt-1 text-dark/85">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}

        <section aria-labelledby="faq" className="mt-14">
          <h2 id="faq" className="text-3xl font-bold">Related questions</h2>
          <div className="mt-6">
            <FaqList faqs={article.faqs} />
          </div>
        </section>
      </article>
      <aside className="mt-14 rounded-3xl bg-tertiary p-8 text-light">
        <p className="text-2xl font-bold">Want to learn this with feedback on your own piece?</p>
        <div className="mt-5">
          <ButtonLink href="/#guide">Get the free guide</ButtonLink>
        </div>
      </aside>
    </Container>
  );
}
