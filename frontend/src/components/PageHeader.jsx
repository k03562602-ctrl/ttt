// Compact page header used on /book.
export default function PageHeader({ section, label, title, intro, children }) {
  return (
    <header data-testid="page-header" className="pt-10 md:pt-14 pb-8 md:pb-10 border-b-2 border-ink">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        <div className="flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#0A0A0A]/65">
          <span className="w-2 h-2 bg-[#E63329] inline-block" />
          {label}
          {section && <span className="opacity-50"> / Section {section}</span>}
        </div>
        <h1 data-testid="page-title" className="title-massive text-5xl md:text-6xl lg:text-7xl mt-3 leading-[0.86]">
          {title}<span className="inline-block w-[0.14em] h-[0.14em] bg-[#E63329] align-baseline ml-2" />
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-sm md:text-base text-[#0A0A0A]/75">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
