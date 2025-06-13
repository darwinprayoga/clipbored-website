import { Home, Search, Settings } from "lucide-react";
import Link from "next/link";
import { DarkModeToggle } from "./dark-mode-toggle";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground px-4 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3">
        <Link href="/" className="flex items-center col-span-2 md:col-span-1">
          <Image
            src="/logo.svg"
            width={200}
            height={200}
            alt="Clipbored Text Logo"
          />
        </Link>

        <nav
          className="flex md:justify-center items-center gap-6"
          aria-label="Social navigation"
        >
          <Link
            href="https://discord.com/invite/nRzwh5vQTf"
            aria-label="Discord"
          >
            <svg
              className="h-7 stroke-current"
              viewBox="0 0 192 192"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="12"
                d="m68 138-8 16c-10.19-4.246-20.742-8.492-31.96-15.8-3.912-2.549-6.284-6.88-6.378-11.548-.488-23.964 5.134-48.056 19.369-73.528 1.863-3.334 4.967-5.778 8.567-7.056C58.186 43.02 64.016 40.664 74 39l6 11s6-2 16-2 16 2 16 2l6-11c9.984 1.664 15.814 4.02 24.402 7.068 3.6 1.278 6.704 3.722 8.567 7.056 14.235 25.472 19.857 49.564 19.37 73.528-.095 4.668-2.467 8.999-6.379 11.548-11.218 7.308-21.769 11.554-31.96 15.8l-8-16m-68-8s20 10 40 10 40-10 40-10"
              />
              <ellipse
                cx="71"
                cy="101"
                className="fill-current"
                rx="13"
                ry="15"
              />
              <ellipse
                cx="121"
                cy="101"
                className="fill-current"
                rx="13"
                ry="15"
              />
            </svg>
          </Link>

          <Link
            href="https://api.whatsapp.com/send?phone=628978600340&text=Hello%20PRAYOGA.io%20team%2C%20I%27m%20interested%20in%20the%20Clipbored%20project%20and%20would%20like%20to%20discuss%20investment%20opportunities.%20Here%20are%20my%20details%3AName%3A%20Company%3A%20Email%3A%20Investment%20Interest%3A%20Looking%20forward%20to%20your%20response!"
            aria-label="Whatsapp"
          >
            <svg
              className="h-6"
              viewBox="0 0 192 192"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                className="fill-current"
                fillRule="evenodd"
                d="M96 16c-44.183 0-80 35.817-80 80 0 13.12 3.163 25.517 8.771 36.455l-8.608 36.155a6.002 6.002 0 0 0 7.227 7.227l36.155-8.608C70.483 172.837 82.88 176 96 176c44.183 0 80-35.817 80-80s-35.817-80-80-80ZM28 96c0-37.555 30.445-68 68-68s68 30.445 68 68-30.445 68-68 68c-11.884 0-23.04-3.043-32.747-8.389a6.003 6.003 0 0 0-4.284-.581l-28.874 6.875 6.875-28.874a6.001 6.001 0 0 0-.581-4.284C31.043 119.039 28 107.884 28 96Zm46.023 21.977c11.975 11.974 27.942 20.007 45.753 21.919 11.776 1.263 20.224-8.439 20.224-18.517v-6.996a18.956 18.956 0 0 0-13.509-18.157l-.557-.167-.57-.112-8.022-1.58a18.958 18.958 0 0 0-15.25 2.568 42.144 42.144 0 0 1-7.027-7.027 18.958 18.958 0 0 0 2.569-15.252l-1.582-8.021-.112-.57-.167-.557A18.955 18.955 0 0 0 77.618 52H70.62c-10.077 0-19.78 8.446-18.517 20.223 1.912 17.81 9.944 33.779 21.92 45.754Zm33.652-10.179a6.955 6.955 0 0 1 6.916-1.743l8.453 1.665a6.957 6.957 0 0 1 4.956 6.663v6.996c0 3.841-3.124 6.995-6.943 6.585a63.903 63.903 0 0 1-26.887-9.232 64.594 64.594 0 0 1-11.661-9.241 64.592 64.592 0 0 1-9.241-11.661 63.917 63.917 0 0 1-9.232-26.888C63.626 67.123 66.78 64 70.62 64h6.997a6.955 6.955 0 0 1 6.66 4.957l1.667 8.451a6.956 6.956 0 0 1-1.743 6.917l-1.12 1.12a5.935 5.935 0 0 0-1.545 2.669c-.372 1.403-.204 2.921.603 4.223a54.119 54.119 0 0 0 7.745 9.777 54.102 54.102 0 0 0 9.778 7.746c1.302.806 2.819.975 4.223.603a5.94 5.94 0 0 0 2.669-1.545l1.12-1.12Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <Link href="/https://www.instagram.com/prayoga.io/" aria-label="Home">
            <svg
              className="h-6 stroke-current"
              viewBox="0 0 192 192"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                strokeWidth="12"
                d="M96 162c-14.152 0-24.336-.007-32.276-.777-7.849-.761-12.87-2.223-16.877-4.741a36 36 0 0 1-11.33-11.329c-2.517-4.007-3.98-9.028-4.74-16.877C30.007 120.336 30 110.152 30 96c0-14.152.007-24.336.777-32.276.76-7.849 2.223-12.87 4.74-16.877a36 36 0 0 1 11.33-11.33c4.007-2.517 9.028-3.98 16.877-4.74C71.663 30.007 81.847 30 96 30c14.152 0 24.336.007 32.276.777 7.849.76 12.87 2.223 16.877 4.74a36 36 0 0 1 11.329 11.33c2.518 4.007 3.98 9.028 4.741 16.877.77 7.94.777 18.124.777 32.276 0 14.152-.007 24.336-.777 32.276-.761 7.849-2.223 12.87-4.741 16.877a36 36 0 0 1-11.329 11.329c-4.007 2.518-9.028 3.98-16.877 4.741-7.94.77-18.124.777-32.276.777Z"
              />
              <circle cx="96" cy="96" r="30" strokeWidth="12" />
              <circle cx="135" cy="57" r="9" className="fill-current" />
            </svg>
          </Link>
        </nav>

        <div className="flex justify-end items-center">
          <DarkModeToggle variant="ghost" size="icon" />

          <Link href="https://clipbo.red">
            <Button variant="secondary" size="sm" className="ml-2">
              Enter App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
