import { useState, useEffect, useRef } from "react";

export function useNavbarScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const lastScrollY = useRef(0);
  const ignoreScrollUntil = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      
      setIsScrolledPastHero(scrollY > 250);
      
      if (Date.now() < ignoreScrollUntil.current) {
        lastScrollY.current = scrollY > 0 ? scrollY : 0;
        ticking = false;
        return;
      }

      if (Math.abs(scrollY - lastScrollY.current) < 20) {
        ticking = false;
        return;
      }

      if (scrollY > lastScrollY.current && scrollY > 120) {
        setIsScrolled((prev) => {
          if (!prev) ignoreScrollUntil.current = Date.now() + 500;
          return true;
        });
      } else if (scrollY < lastScrollY.current) {
        setIsScrolled((prev) => {
          if (prev) ignoreScrollUntil.current = Date.now() + 500;
          return false;
        });
      }
      
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    updateScrollDir();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showCategories = !isScrolled || isHovered;

  return {
    showCategories,
    isScrolledPastHero,
    setIsHovered,
  };
}
