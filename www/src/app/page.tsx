export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-sans text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-border bg-card/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-card lg:p-4">
          KodeDock Next.js 15
          <code className="font-mono font-bold ml-2 text-primary">v1.1.0</code>
        </p>
      </div>

      <div className="relative flex place-items-center mt-20">
        <h1 className="text-5xl font-heading font-bold tracking-tight text-center">
          The <span className="text-primary">Zero-Mock</span> Escrow Marketplace
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-20 gap-8">
        <a
          href="/shop"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-border hover:bg-card"
        >
          <h2 className="mb-3 text-2xl font-semibold font-heading">
            Storefront{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Explore and test the AI Semantic Vector search and catalog APIs.
          </p>
        </a>

        <a
          href="/auth"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-border hover:bg-card"
        >
          <h2 className="mb-3 text-2xl font-semibold font-heading">
            Auth Flow{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Test the Rust JWT auth extractors and user context injection.
          </p>
        </a>

        <a
          href="/checkout"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-border hover:bg-card"
        >
          <h2 className="mb-3 text-2xl font-semibold font-heading">
            Fintech Ledger{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Trigger a simulated webhook to verify double-entry row-level locking.
          </p>
        </a>
      </div>
    </main>
  );
}
