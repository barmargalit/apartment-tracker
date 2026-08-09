import type {Metadata} from "next";
import "@/globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
    title: "Apartment Tracker",
    description: "Track apartment finances",
    icons: {icon: "/logo-v2.png"},
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
