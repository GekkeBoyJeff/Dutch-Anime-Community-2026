// Next.js instrumentation (stable since 15). `register()` runs once when the server starts — the place
// for one-time setup like initialising a tracer or warming a cache. It's an empty no-op here so the
// starter stays dependency-free; wire your observability in, or delete this file if you don't need it.
//
// For server-side error reporting, add an `onRequestError` export (pairs with app/global-error.tsx for
// end-to-end capture):
//
//   import type { Instrumentation } from 'next';
//   export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
//     // send `err` to Sentry / OpenTelemetry / your logger
//   };
export const register = () => {
	// Intentionally empty — add startup work here.
};
