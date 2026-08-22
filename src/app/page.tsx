import HomeSidebar from "./_components/HomeSidebar";
import HomeHero from "./_components/HomeHero";
import HomeShelves from "./_components/HomeShelves";
import HomeFeed from "./_components/HomeFeed";
import HomeAbout from "./_components/HomeAbout";

/**
 * The home page, in two movements.
 *
 * First the shelves: short scrollable rows, each carrying the reason it is there — one per taste
 * the account's behaviour points at, the neighbourhood of whatever they looked at last, then what
 * the marketplace as a whole is doing. Full width, because a row you scroll sideways in a
 * two-thirds column is a row with two cards in it.
 *
 * Then the grid, which is the other question a marketplace home page has to answer: not "what
 * might I like" but "what is here". It keeps its sort tabs and its category sidebar, and it now
 * pages as the reader scrolls instead of a click every twelve cards.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 md:px-8 md:py-12">
        <HomeHero />

        <div className="mt-12">
          <HomeShelves />
        </div>

        <div className="mt-16 grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <HomeSidebar />
          <div className="md:col-span-8">
            <HomeFeed />
          </div>
        </div>

        <HomeAbout />
      </div>
    </div>
  );
}
