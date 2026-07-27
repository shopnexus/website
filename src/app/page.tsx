import HomeSidebar from "./_components/HomeSidebar";
import HomeHero from "./_components/HomeHero";
import HomeFeed from "./_components/HomeFeed";
import HomeAbout from "./_components/HomeAbout";

export default function Home() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* ── 12-Column Layout (Sidebar + Main Content) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar (4 cols) */}
          <HomeSidebar />

          {/* Main Content (8 cols) */}
          <div className="md:col-span-8 space-y-12">
            <HomeHero />
            <HomeFeed />
          </div>
        </div>

        {/* ── Trust / About Section ── */}
        <HomeAbout />
      </main>
    </div>
  );
}
