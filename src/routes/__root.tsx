import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DeskFlow — Smart workspace booking" },
      { name: "description", content: "Book desks, rooms, and resources with ease. The modern workspace management platform." },
      { name: "author", content: "DeskFlow" },
      { property: "og:title", content: "DeskFlow — Smart workspace booking" },
      { property: "og:description", content: "Book desks, rooms, and resources with ease. The modern workspace management platform." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/406d55fa-145d-4c31-8d9e-7d2d23f81dcc/id-preview-ddcb651a--2f84b534-f94d-48d5-bd7c-b547b4f81808.lovable.app-1774042501832.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DeskFlow — Smart workspace booking" },
      { name: "twitter:description", content: "Book desks, rooms, and resources with ease. The modern workspace management platform." },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/406d55fa-145d-4c31-8d9e-7d2d23f81dcc/id-preview-ddcb651a--2f84b534-f94d-48d5-bd7c-b547b4f81808.lovable.app-1774042501832.png" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
