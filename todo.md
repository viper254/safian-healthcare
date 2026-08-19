# Corrective alignment checklist

- [ ] Inventory the current live shop’s brand tokens, typography, components, copy, routes, and customer workflows.
- [ ] Identify the existing admin routes and reuse boundaries instead of inventing a new admin visual language.
- [ ] Replace the copied admin staging screen’s invented identity and placeholder operational records with source-compatible structures.
- [ ] Remove customer-client placeholder/demonstration states and map each screen to the real shop API and domain model.
- [ ] Keep all changes on the isolated branch and verify that `main`, production configuration, and the active deployment are unchanged.
- [ ] Provide a visual and technical comparison for review before any deployment or merge decision.
- [ ] Remove the Flutter customer demo and use the unchanged current PWA as the single customer interface in every native package.
- [ ] Create Android, iPhone, Linux, and Windows wrappers that load the same approved PWA release and therefore retain all current routes, copy, branding, cart, authentication, and backend behavior.
- [ ] Keep package configuration separate from the PWA source so updates to the existing PWA propagate consistently to every client after review.
