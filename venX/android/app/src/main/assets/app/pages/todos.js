(function () {
  window.todoPages = window.todoPages || {};

  const filterBtn = (ctx, id, label) =>
    venjs.button(
      {
        style: {
          backgroundColor: ctx.state.filter.get() === id ? ctx.theme.primary : "#EEF2FF",
          color: ctx.state.filter.get() === id ? "#FFFFFF" : ctx.theme.sub,
          borderRadius: "10",
          padding: "8",
          width: "90",
          marginRight: id === "done" ? "0" : "6",
          textAlign: "center"
        },
        onClick: () => ctx.state.filter.set(id)
      },
      label
    );

  const taskRow = (ctx, task) =>
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
        venjs.text(
          {
            style: {
              fontSize: "15",
              color: task.done ? "#16A34A" : "#0F172A",
              marginBottom: "6"
            }
          },
          task.done ? "Done: " + task.text : task.text
        ),
        venjs.div(
          {
            style: {
              flexDirection: "row"
            }
          },
          [
            venjs.button(
              {
                style: {
                  backgroundColor: task.done ? "#DCFCE7" : "#DBEAFE",
                  color: task.done ? "#166534" : "#1D4ED8",
                  borderRadius: "9",
                  padding: "8",
                  width: "90",
                  marginRight: "6",
                  textAlign: "center"
                },
                onClick: () => ctx.actions.toggleTask(task.id)
              },
              task.done ? "Undo" : "Done"
            ),
            venjs.button(
              {
                style: {
                  backgroundColor: "#FEE2E2",
                  color: "#B91C1C",
                  borderRadius: "9",
                  padding: "8",
                  width: "90",
                  textAlign: "center"
                },
                onClick: () => ctx.actions.deleteTask(task.id)
              },
              "Delete"
            )
          ]
        )
      ]
    );

  window.todoPages.todos = function (ctx) {
    const tasks = ctx.visibleTasks();

    return venjs.div({}, [
      venjs.div(
        {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12",
            padding: "10",
            marginBottom: "10"
          }
        },
        [
          venjs.input({
            placeholder: "Add new task",
            value: ctx.state.draft.get(),
            onChange: (e) => ctx.state.draft.set(e.value || ""),
            style: {
              backgroundColor: "#F8FAFC",
              borderRadius: "10",
              padding: "10",
              marginBottom: "8"
            }
          }),
          venjs.button(
            {
              style: {
                backgroundColor: ctx.theme.primary,
                color: "#FFFFFF",
                borderRadius: "10",
                padding: "10",
                textAlign: "center"
              },
              onClick: ctx.actions.addTask
            },
            "Add Task"
          )
        ]
      ),
      venjs.div(
        {
          style: {
            flexDirection: "row",
            marginBottom: "10"
          }
        },
        [filterBtn(ctx, "all", "All"), filterBtn(ctx, "active", "Active"), filterBtn(ctx, "done", "Done")]
      ),
      tasks.length === 0
        ? venjs.div(
            {
              style: {
                backgroundColor: "#FFFFFF",
                borderRadius: "12",
                padding: "12"
              }
            },
            [venjs.text({ style: { fontSize: "13", color: ctx.theme.sub } }, "No task for this filter.")]
          )
        : tasks.map((task) => taskRow(ctx, task)),
      venjs.button(
        {
          style: {
            backgroundColor: "#F1F5F9",
            color: "#0F172A",
            borderRadius: "10",
            padding: "10",
            textAlign: "center"
          },
          onClick: ctx.actions.clearCompleted
        },
        "Clear Completed"
      )
    ]);
  };
})();
