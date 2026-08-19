# Safian Admin Web

This is a **separate administrative web application** with its own visual shell and future deployment boundary. It is copied into the isolated `multi-client-isolated-development` branch and does not replace the current `/admin` routes in the live customer shop.

The current screen intentionally displays staging-only operational data. Before connecting a backend, introduce separate admin authentication, role checks, audit logging, and a versioned API contract. Do not expose service-role or M-Pesa credentials in Vite client variables.
