import type {Metadata} from "next";
import "@/globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
    title: "XPensive",
    description: "Track apartment finances",
    icons: {icon: "/xpensive3.png"},
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body style={{margin: 0}}>
        <ThemeProvider>
            <AppShell>{children}</AppShell>
        </ThemeProvider>
        </body>
        </html>
    );
}
