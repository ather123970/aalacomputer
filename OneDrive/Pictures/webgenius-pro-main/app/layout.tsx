import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AtherWeb | Web Apps & Shopify Stores That Convert",
    description: "Professional web development agency specializing in React/Next.js apps, custom Shopify stores, and conversion-focused design. From MVP to full-stack SaaS.",
    keywords: ["web development", "shopify store", "web app development", "saas development", "ecommerce", "pakistan", "lahore"],
    authors: [{ name: "AtherWeb" }],
    openGraph: {
        title: "AtherWeb | Web Apps & Shopify Stores That Convert",
        description: "Build web products that stop the scroll and start the cart. Crazy-smooth animations, conversion-first builds.",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "AtherWeb | Web Apps & Shopify Stores That Convert",
        description: "Professional web development with focus on conversion and performance.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
