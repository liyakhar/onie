import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Landmark,
  LayoutDashboard,
  ListFilter,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

export function AppMobileNav({
  locked = false,
  demo = false,
}: {
  locked?: boolean;
  demo?: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useLocation({ select: (location) => location.pathname });
  const isMoreRoute = pathname.startsWith("/app/accounts") ||
    pathname.startsWith("/app/household") ||
    pathname.startsWith("/settings");

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);

  if (locked) return null;
  if (demo) {
    return (
      <nav className="app-mobile-nav" aria-label="Demo pages">
        <Link
          to="/demo"
          activeOptions={{ exact: true }}
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <LayoutDashboard aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link
          to="/demo/transactions"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <ListFilter aria-hidden="true" />
          <span>Activity</span>
        </Link>
        <Link
          to="/demo/budgets"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <ChartNoAxesCombined aria-hidden="true" />
          <span>Plan</span>
        </Link>
        <Link
          to="/demo/upcoming"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <CalendarDays aria-hidden="true" />
          <span>Bills</span>
        </Link>
        <Link
          to="/demo/accounts"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <Landmark aria-hidden="true" />
          <span>Accounts</span>
        </Link>
      </nav>
    );
  }
  return (
    <>
      {moreOpen ? (
        <>
          <button
            type="button"
            className="app-mobile-more__scrim"
            aria-label="Close more pages"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="app-mobile-more"
            role="dialog"
            aria-label="More workspace pages"
          >
            <div className="app-mobile-more__head">
              <strong>More</strong>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close more pages"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="More workspace pages">
              <Link to="/app/accounts" onClick={() => setMoreOpen(false)}>
                <Landmark aria-hidden="true" />
                <span>Bank accounts</span>
              </Link>
              <Link to="/app/household" onClick={() => setMoreOpen(false)}>
                <Users aria-hidden="true" />
                <span>Household</span>
              </Link>
              <Link to="/settings" onClick={() => setMoreOpen(false)}>
                <Settings aria-hidden="true" />
                <span>Profile &amp; settings</span>
              </Link>
            </nav>
          </div>
        </>
      ) : null}

      <nav className="app-mobile-nav" aria-label="Mobile primary">
        <Link
          to="/app"
          activeOptions={{ exact: true }}
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <LayoutDashboard aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link
          to="/app/transactions"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <ListFilter aria-hidden="true" />
          <span>Activity</span>
        </Link>
        <Link
          to="/app/budgets"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <ChartNoAxesCombined aria-hidden="true" />
          <span>Plan</span>
        </Link>
        <Link
          to="/app/recurring"
          className="app-mobile-nav__item"
          activeProps={{ className: "app-mobile-nav__item is-active" }}
        >
          <CalendarDays aria-hidden="true" />
          <span>Bills</span>
        </Link>
        <button
          type="button"
          className={
            moreOpen || isMoreRoute ? "app-mobile-nav__item is-active" : "app-mobile-nav__item"
          }
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
        >
          <Menu aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
