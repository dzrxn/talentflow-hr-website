export const SIDEBAR_WIDTH = 300;

const LOGO_URL = "/nambiar-logo.jpg";

export default function Sidebar({ page, setPage }) {
  const navItems = [
    {
      id: "dashboard",
      icon: "▦",
      label: "NB Dashboard",
    },

    {
      id: "reports",
      icon: "◫",
      label: "NB Reports",
    },


    {
      id: "offers-data",
      icon: "▨",
      label: "NB Offer Data",
    },

    {
      id: "internship-data",
      icon: "▧",
      label: "NB Internship Data",
    },

    {
      id: "submission-data",
      icon: "▥",
      label: "NB Submission Data",
    },

    {
      id: "hospitality",
      icon: "▣",
      label: "Hospitality Dashboard",
    },

    {
      id: "hospitality-reports",
      icon: "▤",
      label: "Hospitality Reports",
    },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandSection}>
        <div style={styles.logoBox}>
          <img
            src={LOGO_URL}
            alt="Nambiar Builders"
            style={styles.logo}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />

          <div style={styles.fallbackLogo}>
            <div style={styles.greenBox}>N</div>

            <div>
              <div style={styles.logoText}>Nambiar</div>
              <div style={styles.logoSubText}>BUILDERS</div>
            </div>
          </div>
        </div>

        <p style={styles.subtitle}>Talent Acquisition Portal</p>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = page === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              style={{
                ...styles.navItem,
                ...(active ? styles.activeNavItem : {}),
              }}
            >
              <span
                style={{
                  ...styles.iconBox,
                  ...(active ? styles.activeIconBox : {}),
                }}
              >
                {item.icon}
              </span>

              <span style={styles.navText}>{item.label}</span>

              {active && <span style={styles.activeDot}></span>}
            </button>
          );
        })}
      </nav>

      <div style={styles.footerCard}>
        <p style={styles.footerTitle}>Nambiar Builders</p>
        <p style={styles.footerText}>Dashboard v1.0</p>
      </div>
    </aside>
  );
}

export const pageStyles = {
  appLayout: {
    width: "100%",
    minHeight: "100vh",
    background: "#f0fdf4",
    overflowX: "hidden",
  },

  pageContent: {
    marginLeft: `${SIDEBAR_WIDTH}px`,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
    minHeight: "100vh",
    padding: "30px",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
};

const styles = {
  sidebar: {
    width: `${SIDEBAR_WIDTH}px`,
    minWidth: `${SIDEBAR_WIDTH}px`,
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
    background:
      "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 55%, #bbf7d0 100%)",
    borderRight: "1px solid #bbf7d0",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    boxShadow: "8px 0 30px rgba(34,197,94,0.10)",
  },

  brandSection: {
    padding: "20px 14px",
    borderBottom: "1px solid #bbf7d0",
    textAlign: "center",
  },

  logoBox: {
    width: "100%",
    height: "125px",
    background: "#ffffff",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "1px solid #d1fae5",
    boxShadow: "0 10px 28px rgba(34,197,94,0.10)",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  fallbackLogo: {
    display: "none",
    alignItems: "center",
    gap: "12px",
  },

  greenBox: {
    width: "58px",
    height: "58px",
    background: "linear-gradient(180deg, #22c55e, #86efac)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "900",
    borderRadius: "14px",
  },

  logoText: {
    fontSize: "34px",
    fontWeight: "900",
    color: "#166534",
    lineHeight: 1,
  },

  logoSubText: {
    marginTop: "8px",
    letterSpacing: "8px",
    fontSize: "13px",
    color: "#14532d",
  },

  subtitle: {
    margin: "16px 0 0",
    fontSize: "15px",
    fontWeight: "700",
    color: "#15803d",
  },

  nav: {
    padding: "22px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  navItem: {
    width: "100%",
    minHeight: "62px",
    border: "none",
    borderRadius: "22px",
    background: "transparent",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  activeNavItem: {
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#ffffff",
    boxShadow: "0 10px 25px rgba(34,197,94,0.25)",
  },

  iconBox: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "14px",
    background: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  activeIconBox: {
    background: "rgba(255,255,255,0.18)",
    color: "#ffffff",
  },

  navText: {
    flex: 1,
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  activeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#dcfce7",
  },

  footerCard: {
    margin: "auto 16px 20px",
    padding: "20px",
    borderRadius: "24px",
    background: "#ffffff",
    border: "1px solid #bbf7d0",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(34,197,94,0.08)",
  },

  footerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800",
    color: "#166534",
  },

  footerText: {
    margin: "8px 0 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#15803d",
  },
};