import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" data-testid="page-not-found">
      <p className="text-8xl font-extrabold tracking-tighter text-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/app">
        <button className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90" data-testid="not-found-go-dashboard">
          Go to dashboard
        </button>
      </Link>
    </div>
  );
}
