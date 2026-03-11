"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  sortOrder: number;
  course?: { title: string; code: string } | null;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const COLUMNS = ["TODO", "IN_PROGRESS", "DONE"];
const COLUMN_TITLES: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(
    COLUMNS.map((id) => ({ id, title: COLUMN_TITLES[id], tasks: [] }))
  );
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((tasks: Task[]) => {
        setColumns(
          COLUMNS.map((id) => ({
            id,
            title: COLUMN_TITLES[id],
            tasks: tasks.filter((t) => t.status === id).sort((a, b) => a.sortOrder - b.sortOrder),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = columns.map((c) => ({ ...c, tasks: [...c.tasks] }));
    const srcCol = newColumns.find((c) => c.id === source.droppableId)!;
    const destCol = newColumns.find((c) => c.id === destination.droppableId)!;

    const [moved] = srcCol.tasks.splice(source.index, 1);
    moved.status = destination.droppableId;
    destCol.tasks.splice(destination.index, 0, moved);

    const updates: { id: string; status: string; sortOrder: number }[] = [];
    for (const col of [srcCol, destCol]) {
      col.tasks.forEach((t, i) => {
        t.sortOrder = i;
        updates.push({ id: t.id, status: col.id, sortOrder: i });
      });
    }

    setColumns(newColumns);

    await fetch("/api/tasks/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: updates }),
    });
  };

  const addTask = async (status: string) => {
    if (!newTaskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle.trim(), status }),
    });
    if (res.ok) {
      const task = await res.json();
      setColumns((prev) =>
        prev.map((col) =>
          col.id === status ? { ...col, tasks: [...col.tasks, task] } : col
        )
      );
      setNewTaskTitle("");
      setAddingTo(null);
    }
  };

  const deleteTask = async (id: string, status: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === status
            ? { ...col, tasks: col.tasks.filter((t) => t.id !== id) }
            : col
        )
      );
    }
  };

  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    LOW: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-5 h-full min-w-full pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-80 flex-shrink-0 flex flex-col bg-gray-100 dark:bg-[#1E1E1E] rounded-lg border border-gray-200 dark:border-gray-800 h-fit max-h-full"
            >
              <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400">
                    {column.tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(addingTo === column.id ? null : column.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {addingTo === column.id && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask(column.id);
                      if (e.key === "Escape") setAddingTo(null);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => addTask(column.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="px-3 py-1 text-gray-500 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-3 space-y-2.5 overflow-y-auto min-h-[80px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={clsx(
                              "bg-white dark:bg-[#2C2C2C] p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow",
                              snapshot.isDragging && "ring-2 ring-blue-500 rotate-1 opacity-90"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex gap-1.5 flex-wrap">
                                <span
                                  className={clsx(
                                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                    priorityColors[task.priority] || priorityColors.MEDIUM
                                  )}
                                >
                                  {task.priority}
                                </span>
                                {task.course && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {task.course.code || task.course.title}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => deleteTask(task.id, column.id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {task.title}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
