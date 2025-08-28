import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediMeet - Doctors Appointment System",
  description: "A doctors appointment system built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>

          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* header */}
            <Header />

            {/* Main */}
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            {/* footer */}
            <footer className="bg-muted/50">
              <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} MediMeet. All rights reserved.</p>
              </div>
            </footer>
          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}



