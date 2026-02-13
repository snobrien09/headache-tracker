import { useMemo, useState } from "react";

function App() {
  const [intensity, setIntensity] = useState(5);

  // Unified event log:
  // - intervention: { type:"intervention", interventionId, name, delta, amountAfter, intensityAtLog, time, dayKey }
  // - intensity:    { type:"intensity", intensityValue, time, dayKey }
  const [logs, setLogs] = useState([]);

  const [interventions, setInterventions] = useState([
    { id: "water", name: "Drink Water", unit: "cups", amount: 0, max: 8 },
  ]);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    max: 8,
  });

  // per-intervention quantity input: { [interventionId]: "2" }
  const [logAmounts, setLogAmounts] = useState({});

  // Helpers: local day key + display time
  function dayKeyFromDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatStamp(ms) {
    const d = new Date(ms);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Log a quantity in a single event
  function logInterventionQuantity(id) {
    const target = interventions.find((it) => it.id === id);
    if (!target) return;

    const raw = Number(logAmounts[id]);
    if (!Number.isFinite(raw) || raw <= 0) return;

    const remaining = target.max - target.amount;
    const applied = Math.min(raw, remaining);
    if (applied <= 0) return;

    const now = Date.now();
    const dayKey = dayKeyFromDate(new Date(now));
    const amountAfter = target.amount + applied;

    // 1) Update intervention totals
    setInterventions((prev) =>
      prev.map((it) => (it.id === id ? { ...it, amount: amountAfter } : it))
    );

    // 2) Append unified event log entry (no nesting => no StrictMode double logs)
    setLogs((prev) => [
      ...prev,
      {
        id: `${id}-${now}`,
        type: "intervention",
        time: now,
        dayKey,
        interventionId: id,
        name: target.name,
        delta: applied,
        amountAfter,
        intensityAtLog: intensity,
      },
    ]);

    // 3) Clear input
    setLogAmounts((prev) => ({ ...prev, [id]: "" }));
  }

  // Log intensity as its own timeline event
  function recordIntensity() {
    const now = Date.now();
    const dayKey = dayKeyFromDate(new Date(now));

    setLogs((prev) => [
      ...prev,
      {
        id: `intensity-${now}`,
        type: "intensity",
        time: now,
        dayKey,
        intensityValue: intensity,
      },
    ]);
  }

  function handleCreateIntervention(e) {
    e.preventDefault();

    const name = form.name.trim();
    const unit = form.unit.trim();
    const maxNum = Number(form.max);

    if (!name || !unit) return;
    if (!Number.isFinite(maxNum) || maxNum <= 0) return;

    // Avoid duplicate names
    const nameKey = name.toLowerCase();
    const exists = interventions.some((it) => it.name.toLowerCase() === nameKey);
    if (exists) return;

    const id = `${nameKey.replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    setInterventions((prev) => [
      ...prev,
      { id, name, unit, amount: 0, max: Math.floor(maxNum) },
    ]);

    setForm({ name: "", unit: "", max: 8 });
  }

  const styles = useMemo(
    () => ({
      page: {
        padding: 20,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        maxWidth: 820,
        margin: "0 auto",
      },
      title: { margin: "0 0 6px 0" },
      sub: { margin: "0 0 18px 0", opacity: 0.75, fontSize: 13 },

      panel: {
        border: "2px solid #2b241f",
        borderRadius: 14,
        background: "#fff3e3",
        boxShadow: "5px 5px 0 #2b241f",
        padding: 14,
        marginBottom: 14,
      },

      row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

      label: { fontSize: 12, opacity: 0.85 },

      range: { marginLeft: 10 },

      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      },

      card: {
        border: "2px solid #2b241f",
        borderRadius: 14,
        background: "#fff7ee",
        boxShadow: "4px 4px 0 #2b241f",
        padding: 12,
      },

      cardTitle: { margin: 0, fontSize: 15 },
      meta: { marginTop: 4, fontSize: 12, opacity: 0.75 },

      pill: {
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        border: "2px solid #2b241f",
        background: "rgba(174,232,209,0.35)",
        fontSize: 12,
      },

      btn: {
        border: "2px solid #2b241f",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "3px 3px 0 #2b241f",
        padding: "8px 10px",
        cursor: "pointer",
        fontWeight: 600,
      },

      btnSmall: {
        border: "2px solid #2b241f",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "3px 3px 0 #2b241f",
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
      },

      btnDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
      },

      input: {
        border: "2px solid #2b241f",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "3px 3px 0 #2b241f",
        padding: "10px 10px",
        fontSize: 13,
        outline: "none",
        width: "100%",
      },

      qtyInput: {
        border: "2px solid #2b241f",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "3px 3px 0 #2b241f",
        padding: "8px 10px",
        fontSize: 13,
        outline: "none",
        width: 90,
      },

      formGrid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.7fr auto",
        gap: 10,
        alignItems: "center",
      },

      formHint: { margin: "8px 0 0 0", fontSize: 12, opacity: 0.7 },

      logItem: {
        border: "2px solid #2b241f",
        borderRadius: 14,
        background: "#fff7ee",
        boxShadow: "4px 4px 0 #2b241f",
        padding: 10,
        display: "grid",
        gridTemplateColumns: "170px 1fr auto",
        gap: 10,
        alignItems: "center",
      },

      logTime: { fontSize: 12, opacity: 0.8, fontWeight: 700 },
      logMain: { fontSize: 13, fontWeight: 800 },
      logSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },

      intensityTag: {
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        border: "2px solid #2b241f",
        background: "rgba(255,159,187,0.25)",
        fontSize: 12,
        fontWeight: 800,
      },
    }),
    []
  );

  // Chronological (oldest -> newest)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => a.time - b.time);
  }, [logs]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Headache Tracker</h1>
      <p style={styles.sub}>Manual intensity + measurable intervention logs.</p>

      {/* Intensity panel */}
      <div style={styles.panel}>
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Current Intensity</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{intensity} / 10</div>
          </div>

          <label style={{ marginLeft: "auto" }}>
            <span style={styles.label}>Adjust</span>
            <input
              type="range"
              min="0"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={styles.range}
            />
          </label>

          <button style={styles.btn} onClick={recordIntensity} title="Save intensity to history">
            Record Intensity
          </button>
        </div>

        <p style={{ margin: "8px 0 0 0", fontSize: 12, opacity: 0.7 }}>
          Tip: adjust the slider anytime, then tap <b>Record Intensity</b> when you want a timeline point.
        </p>
      </div>

      {/* Create intervention panel (kept!) */}
      <div style={styles.panel}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Add an intervention</div>

        <form onSubmit={handleCreateIntervention} style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Name (e.g., Ginger tea)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <input
            style={styles.input}
            placeholder="Unit (cups, pills, mins)"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />

          <input
            style={styles.input}
            type="number"
            min="1"
            placeholder="Max/day"
            value={form.max}
            onChange={(e) => setForm((f) => ({ ...f, max: e.target.value }))}
          />

          <button style={styles.btn} type="submit">
            + Add
          </button>
        </form>

        <p style={styles.formHint}>
          Tip: “max/day” sets the cap for logging (helps avoid accidental over-logging).
        </p>
      </div>

      {/* Intervention cards */}
      <div style={styles.grid}>
        {interventions.map((it) => {
          const atMax = it.amount >= it.max;

          // Most recent intervention-type log for this intervention
          const lastInterventionLog = [...logs]
            .filter((l) => l.type === "intervention" && l.interventionId === it.id)
            .sort((a, b) => b.time - a.time)[0];

          return (
            <div key={it.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <h3 style={styles.cardTitle}>{it.name}</h3>
                  <div style={styles.meta}>
                    Unit: <b>{it.unit}</b> · Max/day: <b>{it.max}</b>
                  </div>
                </div>
                <div style={styles.pill}>
                  {it.amount}/{it.max}
                </div>
              </div>

              {/* Quantity input + single Log button */}
              <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={logAmounts[it.id] ?? ""}
                  onChange={(e) =>
                    setLogAmounts((prev) => ({ ...prev, [it.id]: e.target.value }))
                  }
                  style={styles.qtyInput}
                />

                <button
                  style={{
                    ...styles.btn,
                    ...(atMax ? styles.btnDisabled : null),
                  }}
                  disabled={atMax}
                  onClick={() => logInterventionQuantity(it.id)}
                  title={atMax ? "Reached max/day" : "Log this amount"}
                >
                  Log
                </button>
              </div>

              {lastInterventionLog && (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                  Last logged <b>+{lastInterventionLog.delta}</b> at intensity{" "}
                  <b>{lastInterventionLog.intensityAtLog}</b> ·{" "}
                  <span style={{ opacity: 0.85 }}>{formatStamp(lastInterventionLog.time)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* History / Timeline panel */}
      <div style={{ ...styles.panel, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>History (Chronological)</div>
          <button
            style={{ ...styles.btnSmall, ...(logs.length === 0 ? styles.btnDisabled : null) }}
            disabled={logs.length === 0}
            onClick={() => setLogs([])}
            title="Clear all history"
          >
            Clear
          </button>
        </div>

        {sortedLogs.length === 0 ? (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            No events logged yet. Log an intervention or press “Record Intensity” to create a timeline.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {sortedLogs.slice(-200).map((l) => (
              <div key={l.id} style={styles.logItem}>
                <div>
                  <div style={styles.logTime}>{formatStamp(l.time)}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{l.dayKey}</div>
                </div>

                <div>
                  {l.type === "intervention" ? (
                    <>
                      <div style={styles.logMain}>
                        {l.name}{" "}
                        <span style={{ fontWeight: 900 }}>+{l.delta}</span>
                      </div>
                      <div style={styles.logSub}>
                        Intensity at time: <b>{l.intensityAtLog}</b> · Total now:{" "}
                        <b>{l.amountAfter}</b>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.logMain}>
                        Intensity recorded{" "}
                        <span style={{ fontWeight: 900 }}>→ {l.intensityValue}</span>
                      </div>
                      <div style={styles.logSub}>
                        A checkpoint you can compare to interventions before/after.
                      </div>
                    </>
                  )}
                </div>

                {l.type === "intervention" ? (
                  <div style={styles.pill}>{l.interventionId}</div>
                ) : (
                  <div style={styles.intensityTag}>INTENSITY</div>
                )}
              </div>
            ))}
          </div>
        )}

        {sortedLogs.length > 200 && (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
            Showing the most recent 200 events (still kept in memory).
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
