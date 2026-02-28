(function () {
  window.todoPages = window.todoPages || {};

  const item = (title, subtitle) =>
    venjs.div(
      {
        style: {
          backgroundColor: "#FFFFFF",
          borderRadius: "12",
          padding: "10",
          marginBottom: "8"
        }
      },
      [
        venjs.text({ style: { fontSize: "14", color: "#0F172A", marginBottom: "2" } }, title),
        venjs.text({ style: { fontSize: "12", color: "#64748B" } }, subtitle)
      ]
    );

  window.todoPages.settings = function (ctx) {
    const total = ctx.state.tasks.get().length;
    const done = ctx.state.tasks.get().filter((t) => t.done).length;
    const active = total - done;

    return venjs.div({}, [
      item("Total tasks", String(total)),
      item("Active tasks", String(active)),
      item("Completed tasks", String(done)),
      venjs.button(
        {
          style: {
            backgroundColor: "#DBEAFE",
            color: "#1D4ED8",
            borderRadius: "10",
            padding: "10",
            marginBottom: "8",
            textAlign: "center"
          },
          onClick: ctx.actions.seedSample
        },
        "Load Sample Tasks"
      ),
      venjs.button(
        {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            borderRadius: "10",
            padding: "10",
            textAlign: "center"
          },
          onClick: ctx.actions.clearAll
        },
        "Clear All Tasks"
      )
    ]);
  };
})();
