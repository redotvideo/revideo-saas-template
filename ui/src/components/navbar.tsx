export default function Navbar() {
  return (
    <>
      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only max-w-[10px]">Your Company</span>
              <img className="h-6 w-auto" src="/revideo.png" alt="" />
            </a>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="https://github.com/redotvideo/revideo-saas-template"
              className="mr-4 lg:mr-6"
            >
              <img
                src={"/github-mark.svg"}
                alt="GitHub"
                className="h-6 w-6 lg:h-6 lg:w-6"
              />
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
