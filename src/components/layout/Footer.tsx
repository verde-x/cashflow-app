export function Footer() {
  return (
    <footer className=" mt-auto">
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-gray-500 text-center">
          © 2025 Verdex Inc. |{" "}
          <a
            href="https://www.verdex.co.jp/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 underline"
          >
            Privacy
          </a>{" "}
          |{" "}
          <a
            href="https://www.verdex.co.jp/terms.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 underline"
          >
            Terms
          </a>
        </p>
      </div>
    </footer>
  );
}
