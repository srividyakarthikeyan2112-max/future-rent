"use client";

import "./globals.css";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>FutureRent - Tokenize Future Income</title>
        <meta
          name="description"
          content="Platform to tokenize and trade future income of real-world assets"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
