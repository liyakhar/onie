import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Landmark,
  LayoutDashboard,
  ListFilter,
  Settings,
  Users,
} from "lucide-react";
import BetterAuthHeader from "#/integrations/better-auth/header-user";
import { authClient } from "#/lib/auth-client";

export default function AppNav({
  locked = false,
  demo = false,
}: {
  locked?: boolean;
  demo?: boolean;
}) {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  return (
    <aside className="app-nav">
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__brand" aria-label="Wollie home">
          <strong>Wollie</strong>
          <span>{demo ? "Interactive demo" : "Shared money"}</span>
        </Link>

        {!locked && demo ? (
          <nav className="app-nav__tabs" aria-label="Demo pages">
            <p className="app-nav__section-label">Example household</p>
            <Link
              to="/demo"
              activeOptions={{ exact: true }}
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <LayoutDashboard aria-hidden="true" />
              <span>Home</span>
            </Link>
            <Link
              to="/demo/transactions"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <ListFilter aria-hidden="true" />
              <span>Transactions</span>
            </Link>
            <Link
              to="/demo/budgets"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <ChartNoAxesCombined aria-hidden="true" />
              <span>Money plan</span>
            </Link>
            <Link
              to="/demo/upcoming"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <CalendarDays aria-hidden="true" />
              <span>Upcoming</span>
            </Link>
            <Link
              to="/demo/accounts"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <Landmark aria-hidden="true" />
              <span>Accounts</span>
            </Link>
          </nav>
        ) : !locked ? (
          <nav className="app-nav__tabs" aria-label="Primary">
            <p className="app-nav__section-label">Your money</p>
            <Link
              to="/app"
              activeOptions={{ exact: true }}
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <LayoutDashboard aria-hidden="true" />
              <span>Home</span>
            </Link>
            <Link
              to="/app/transactions"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <ListFilter aria-hidden="true" />
              <span>Transactions</span>
            </Link>
            <Link
              to="/app/budgets"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <ChartNoAxesCombined aria-hidden="true" />
              <span>Money plan</span>
            </Link>
            <Link
              to="/app/recurring"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <CalendarDays aria-hidden="true" />
              <span>Upcoming</span>
            </Link>
            <Link
              to="/app/accounts"
              className="app-nav__tab"
              activeProps={{ className: "app-nav__tab is-active" }}
            >
              <Landmark aria-hidden="true" />
              <span>Accounts</span>
            </Link>
          </nav>
        ) : null}

        {!demo ? (
          <div className="app-nav__actions">
            {!locked && (
              <Link
                to="/app/household"
                className="app-nav__account-link"
                activeProps={{ className: "app-nav__account-link is-active" }}
              >
                <Users aria-hidden="true" />
                <span>Household</span>
              </Link>
            )}
            {isSignedIn && (
              <Link
                to="/settings"
                className="app-nav__account-link"
                activeProps={{ className: "app-nav__account-link is-active" }}
              >
                <Settings aria-hidden="true" />
                <span>Profile &amp; settings</span>
              </Link>
            )}
            <BetterAuthHeader />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
