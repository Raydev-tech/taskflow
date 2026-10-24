
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Command,
  Filter,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Build responsive landing page",
    description: "Finish the hero section and mobile navigation.",
    priority: "High",
    category: "Development",
    dueDate: "",
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 2,
    title: "Review React hooks",
    description: "Practice useState, useEffect and custom hooks.",
    priority: "Medium",
    category: "Learning",
    dueDate: "",
    completed: true,
    createdAt: Date.now(),
  },
  {
    id: 3,
    title: "Push project to GitHub",
    description: "Write a clean README and publish the repository.",
    priority: "High",
    category: "Development",
    dueDate: "",
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 4,
    title: "Plan weekly goals",
    description: "Choose the most important tasks for this week.",
    priority: "Low",
    category: "Personal",
    dueDate: "",
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 5,
    title: "Learn Tailwind CSS",
    description: "Practice responsive utilities and layouts.",
    priority: "Medium",
    category: "Learning",
    dueDate: "",
    completed: false,
    createdAt: Date.now(),
  },
];

const filters = ["All tasks", "In progress", "Completed"];

const priorityStyles = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

function loadTasks() {
  try {
    const saved = localStorage.getItem("taskflow-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function formatDate(date) {
  if (!date) return "No due date";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task) {
  return (
    task.dueDate &&
    task.dueDate < new Date().toLocaleDateString("en-CA") &&
    !task.completed
  );
}

function StatCard({ icon: Icon, label, value, note, color, progress }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={21} />
        </div>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {progress !== undefined && (
          <span className="text-xs font-semibold text-indigo-600">
            {progress}%
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [activeFilter, setActiveFilter] = useState("All tasks");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "Development",
    dueDate: "",
  });

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query);

        const matchesStatus =
          activeFilter === "All tasks" ||
          (activeFilter === "In progress" && !task.completed) ||
          (activeFilter === "Completed" && task.completed);

        const matchesPriority =
          priorityFilter === "All" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed);
        }
        return b.createdAt - a.createdAt;
      });
  }, [tasks, search, activeFilter, priorityFilter]);

  function openNewTask() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      category: "Development",
      dueDate: "",
    });
    setShowForm(true);
  }

  function openEditTask(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || "",
    });
    setShowForm(true);
  }

  function saveTask(event) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    if (editingId !== null) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId ? { ...task, ...form, title } : task
        )
      );
      setToast("Task updated successfully");
    } else {
      setTasks((previous) => [
        {
          id: Date.now(),
          ...form,
          title,
          completed: false,
          createdAt: Date.now(),
        },
        ...previous,
      ]);
      setToast("New task added successfully");
    }

    setShowForm(false);
    setEditingId(null);
  }

  function toggleTask(id) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
    setToast("Task deleted");
  }

  function clearCompleted() {
    setTasks((previous) => previous.filter((task) => !task.completed));
    setToast("Completed tasks cleared");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-100 bg-white px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a href="#" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Zap size={23} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              TaskFlow<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              YOUR SPACE TO FOCUS
            </p>
          </div>
        </a>

        <div className="mt-10">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <button className="flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700">
            <LayoutDashboard size={19} />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveFilter("All tasks");
              setPriorityFilter("All");
              setSearch("");
              setSidebarOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ListTodo size={19} />
            All tasks
            <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs">
              {tasks.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveFilter("In progress");
              setSidebarOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Clock3 size={19} />
            In progress
            <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs">
              {pending}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveFilter("Completed");
              setSidebarOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <CheckCircle2 size={19} />
            Completed
          </button>
        </div>

        <div className="mt-9">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Categories
          </p>
          {[
            { name: "Development", color: "bg-indigo-500" },
            { name: "Learning", color: "bg-amber-400" },
            { name: "Personal", color: "bg-emerald-500" },
          ].map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setSearch(category.name);
                setActiveFilter("All tasks");
                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={17} />
              <span className="text-sm font-semibold">Stay productive</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-indigo-100">
              Small steps every day lead to big results. Keep going!
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-indigo-100">
              {progress}% of tasks completed
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              D6
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Web Developer
              </p>
              <p className="text-xs text-slate-400">Personal workspace</p>
            </div>
            <Settings2 size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={22} />
              </button>
              <div>
                <p className="text-xs text-slate-400">{today}</p>
                <h2 className="text-lg font-bold text-slate-900">
                  My dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-400 md:flex">
                <Command size={14} />
                <span>My workspace</span>
              </div>
              <button
                onClick={openNewTask}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 sm:px-4"
              >
                <Plus size={18} />
                <span>New task</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-7 sm:px-8 sm:py-9 lg:px-10">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-100 sm:p-9">
            <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
            <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50">
                <Sparkles size={14} />
                YOUR PRODUCTIVITY HUB
              </div>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Make today count.
                <br />
                <span className="text-indigo-200">One task at a time.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100 sm:text-base">
                Organize your work, track your progress, and turn your plans
                into accomplishments.
              </p>
              <button
                onClick={openNewTask}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                <Plus size={18} />
                Create a task
                <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-3 border-t border-white/15 pt-5 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:border-0 sm:pt-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Target size={25} />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress}%</p>
                <p className="text-xs text-indigo-100">Overall completion</p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Your overview
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  A quick look at your productivity.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:flex">
                <Activity size={15} />
                Live task stats
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={ClipboardList}
                label="Total tasks"
                value={tasks.length}
                note="All your tasks in one place"
                color="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                icon={Clock3}
                label="In progress"
                value={pending}
                note="Tasks waiting to be completed"
                color="bg-amber-50 text-amber-600"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={completed}
                note="Tasks you have finished"
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={Target}
                label="Completion rate"
                value={`${progress}%`}
                note="Your overall task progress"
                color="bg-violet-50 text-violet-600"
                progress={progress}
              />
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Manage your tasks
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Stay focused on what matters most.
                </p>
              </div>
              <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                {visibleTasks.length} result
                {visibleTasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-1 rounded-xl bg-slate-50 p-1">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                        activeFilter === filter
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filter}
                      {filter === "All tasks" && (
                        <span className="ml-1.5 text-slate-400">
                          {tasks.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1 sm:min-w-52">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tasks..."
                      aria-label="Search tasks"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                  <div className="relative">
                    <Filter
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                      aria-label="Filter by priority"
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-600 outline-none focus:border-indigo-400 sm:w-auto"
                    >
                      <option value="All">All priorities</option>
                      <option value="High">High priority</option>
                      <option value="Medium">Medium priority</option>
                      <option value="Low">Low priority</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {visibleTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`group rounded-xl border p-4 transition hover:border-indigo-200 hover:shadow-sm sm:p-5 ${
                      task.completed
                        ? "border-slate-100 bg-slate-50/60"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        aria-label={
                          task.completed
                            ? "Mark task as incomplete"
                            : "Mark task as completed"
                        }
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-transparent hover:border-indigo-500"
                        }`}
                      >
                        {task.completed ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <Circle size={12} />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`break-words text-sm font-semibold sm:text-base ${
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${priorityStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          {task.completed && (
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                              Done
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-1.5 break-words text-sm leading-5 text-slate-400">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(task.dueDate)}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-500">
                            {task.category}
                          </span>
                          {isOverdue(task) && (
                            <span className="font-semibold text-rose-500">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {visibleTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 px-5 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                      <ClipboardList size={27} />
                    </div>
                    <h4 className="mt-4 font-bold text-slate-800">
                      No tasks found
                    </h4>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">
                      Try a different search or create a new task to get
                      started.
                    </p>
                    <button
                      onClick={openNewTask}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <Plus size={17} />
                      Add a task
                    </button>
                  </div>
                )}
              </div>

              {completed > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    You have completed {completed} of {tasks.length} tasks.
                  </p>
                  <button
                    onClick={clearCompleted}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                  >
                    Clear completed tasks
                  </button>
                </div>
              )}
            </div>
          </section>

          <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 py-6 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()} TaskFlow. Built with React and
              Tailwind CSS.
            </p>
            <p className="flex items-center gap-1">
              Made for focused work <Sparkles size={13} />
            </p>
          </footer>
        </div>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3
                  id="task-form-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editingId !== null ? "Edit task" : "Create a new task"}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add the details and keep moving forward.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTask} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Task title *
                </label>
                <input
                  id="task-title"
                  required
                  maxLength={120}
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Finish my portfolio"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="What needs to get done?"
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm({ ...form, priority: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="task-category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>
                  <select
                    id="task-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400"
                  >
                    <option>Development</option>
                    <option>Learning</option>
                    <option>Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="task-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Due date
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm({ ...form, dueDate: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
                >
                  <Check size={17} />
                  {editingId !== null ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100%-2.5rem)] items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 size={19} className="shrink-0 text-emerald-400" />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
