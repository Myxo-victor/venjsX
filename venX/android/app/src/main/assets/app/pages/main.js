(function () {
  const STORAGE_KEY = "flaskpay_todo_demo_v1";

  const theme = {
    bg: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    sub: "#64748B",
    primary: "#0B5DFF",
    border: "#E2E8F0",
    done: "#16A34A",
    danger: "#DC2626"
  };

  const safeRead = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const persist = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
    }
  };

  const state = {
    tasks: venjs.state(safeRead()),
    draft: venjs.state(""),
    filter: venjs.state("all"),
    tab: venjs.state("todos"),
    flash: venjs.state("")
  };

  const setFlash = (text) => {
    state.flash.set(text);
    setTimeout(() => {
      if (state.flash.get() === text) state.flash.set("");
    }, 1300);
  };

  const addTask = () => {
    const text = state.draft.get().trim();
    if (!text) {
      setFlash("Type a task first.");
      return;
    }
    const next = [
      {
        id: "t_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        text,
        done: false,
        createdAt: new Date().toISOString()
      }
    ].concat(state.tasks.get());
    state.tasks.set(next);
    persist(next);
    state.draft.set("");
  };

  const toggleTask = (id) => {
    const next = state.tasks.get().map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    state.tasks.set(next);
    persist(next);
  };

  const deleteTask = (id) => {
    const next = state.tasks.get().filter((t) => t.id !== id);
    state.tasks.set(next);
    persist(next);
  };

  const clearCompleted = () => {
    const next = state.tasks.get().filter((t) => !t.done);
    state.tasks.set(next);
    persist(next);
    setFlash("Completed tasks cleared.");
  };

  const seedSample = () => {
    const sample = [
      { id: "s1", text: "Ship venjsX todo demo", done: false, createdAt: new Date().toISOString() },
      { id: "s2", text: "Test 100 clicks without crash", done: true, createdAt: new Date().toISOString() },
      { id: "s3", text: "Build release APK", done: false, createdAt: new Date().toISOString() }
    ];
    state.tasks.set(sample);
    persist(sample);
    setFlash("Sample tasks loaded.");
  };

  const clearAll = () => {
    state.tasks.set([]);
    persist([]);
    setFlash("All tasks removed.");
  };

  const visibleTasks = () => {
    const all = state.tasks.get();
    const f = state.filter.get();
    if (f === "active") return all.filter((t) => !t.done);
    if (f === "done") return all.filter((t) => t.done);
    return all;
  };

  const pageCtx = {
    state,
    theme,
    actions: {
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      seedSample,
      clearAll,
      setFlash
    },
    visibleTasks
  };

  const tabBtn = (id, label) =>
    venjs.div(
      {
        style: {
          backgroundColor: state.tab.get() === id ? theme.primary : "#00000000",
          borderRadius: "12",
          padding: "10",
          width: "120",
          marginRight: id === "settings" ? "0" : "8"
        },
        onClick: () => state.tab.set(id)
      },
      [
        venjs.text(
          {
            style: {
              color: state.tab.get() === id ? "#FFFFFF" : theme.sub,
              fontSize: "14",
              textAlign: "center"
            }
          },
          label
        )
      ]
    );

  const header = () =>
    venjs.div(
      {
        style: {
          backgroundColor: theme.card,
          borderRadius: "14",
          padding: "12",
          marginBottom: "10"
        }
      },
      [
        venjs.text({ style: { fontSize: "22", color: theme.text, marginBottom: "2" } }, "Flaskpay Tasks"),
        venjs.text({ style: { fontSize: "13", color: theme.sub } }, "Official venjsX mini demo")
      ]
    );

  const currentPage = () => {
    if (state.tab.get() === "settings") {
      return window.todoPages && window.todoPages.settings
        ? window.todoPages.settings(pageCtx)
        : venjs.text({}, "Settings page missing.");
    }
    return window.todoPages && window.todoPages.todos
      ? window.todoPages.todos(pageCtx)
      : venjs.text({}, "Todos page missing.");
  };

  const App = () =>
    venjs.div(
      {
        style: {
          backgroundColor: theme.bg,
          padding: "12",
          width: "100%"
        }
      },
      [
        header(),
        state.flash.get()
          ? venjs.div(
              {
                style: {
                  backgroundColor: "#DBEAFE",
                  borderRadius: "10",
                  padding: "8",
                  marginBottom: "10"
                }
              },
              [venjs.text({ style: { color: theme.primary, fontSize: "12" } }, state.flash.get())]
            )
          : null,
        currentPage(),
        venjs.div(
          {
            style: {
              marginTop: "10",
              flexDirection: "row"
            }
          },
          [tabBtn("todos", "To‑Do"), tabBtn("settings", "Settings")]
        )
      ]
    );

  venjs.mount(App);
})();
