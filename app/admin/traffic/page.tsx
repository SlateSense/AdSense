import { getTrafficSnapshot } from "@/lib/traffic"

export const dynamic = "force-dynamic"

export default function TrafficPage() {
  const stats = getTrafficSnapshot()

  return (
    <section className="page">
      <h1>Traffic Dashboard</h1>
      <p className="muted">Private access. Tracking bots and visitors without blocking.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 12, margin: "16px 0" }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Total Visits</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalVisits}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Human Visits</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.humanVisits}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Bot Visits</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.botVisits}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Bot Rate</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.botRate}%</div>
        </div>
      </div>

      <h2>Top Paths</h2>
      <div className="card" style={{ padding: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Path</th>
              <th style={{ textAlign: "right", padding: "8px 0" }}>Visits</th>
            </tr>
          </thead>
          <tbody>
            {stats.topPaths.map((row) => (
              <tr key={row.path}>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{row.path}</td>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133", textAlign: "right" }}>{row.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 20 }}>Recent Visits</h2>
      <div className="card" style={{ padding: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Time</th>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Path</th>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Type</th>
              <th style={{ textAlign: "left", padding: "8px 0" }}>IP</th>
              <th style={{ textAlign: "left", padding: "8px 0" }}>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((item, index) => (
              <tr key={`${item.at}-${index}`}>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{new Date(item.at).toLocaleString()}</td>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{item.path}</td>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{item.isBot ? "Bot" : "Human"}</td>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{item.ip}</td>
                <td style={{ padding: "8px 0", borderTop: "1px solid #1c2133" }}>{item.userAgent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
