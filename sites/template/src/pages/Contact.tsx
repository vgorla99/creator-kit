import { LeadForm } from "../components/LeadForm";
import { Container, Eyebrow } from "../components/ui";
import { contact } from "../content";

export function Contact() {
  return (
    <Container className="max-w-2xl pt-10">
      <Eyebrow>{contact.title}</Eyebrow>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{contact.heading}</h1>
      <p className="mt-5 text-lg text-dark/80">{contact.text}</p>
      <div className="mt-10 rounded-3xl border-2 border-dark p-6 sm:p-8">
        <LeadForm source="contact" button="Send message" withMessage />
      </div>
    </Container>
  );
}
