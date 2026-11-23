import { Layout } from "./components/Layout";
import { LeadPopup } from "./components/LeadPopup";
import { About } from "./pages/About";
import { Article } from "./pages/Article";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { findRoute, type PageKind } from "./site";

const PAGES: Record<PageKind, () => React.JSX.Element> = { home: Home, about: About, contact: Contact, article: Article };

/** Each page is its own static HTML file; links are plain <a href>, so no client router is needed. */
export function App({ path }: { path: string }) {
  const route = findRoute(path);
  const Page = route ? PAGES[route.kind] : NotFound;
  return (
    <Layout current={route?.path ?? ""}>
      <Page />
      {route && <LeadPopup />}
    </Layout>
  );
}
