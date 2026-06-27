# Internal Portal — UI Design System Template

> Use this as the **fingerprint input** when building any new internal portal page.
> Copy the relevant snippets, swap in your data, and the page will match the rest of the portal exactly.

---

## 1. Page Shell

```tsx
// Outermost wrapper (no bg — inherits from layout shell)
<div className="space-y-4">
  {/* Header */}
  {/* Tab Nav (if needed) */}
  {/* Content */}
</div>
```

---

## 2. Page Header

```tsx
<div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-[16px] font-bold text-gray-900">Page Title</h1>
    <p className="text-xs text-gray-400 mt-0.5">Short subtitle or description</p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* Secondary button */}
    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
      <Icon size={12} /> Label
    </button>
    {/* Primary button */}
    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-lg">
      <Icon size={12} /> Label
    </button>
  </div>
</div>
```

---

## 3. Tab Navigation (underline style)

```tsx
<div className="flex items-center gap-1 border-b border-gray-200">
  {TABS.map(t => (
    <button key={t.id} onClick={() => setTab(t.id)}
      className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
        tab === t.id
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}>
      {t.label}
    </button>
  ))}
</div>
```

### Tab with badge count

```tsx
<button className="...">
  {t.label}
  {t.count > 0 && (
    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full">{t.count}</span>
  )}
</button>
```

---

## 4. Stat / KPI Cards Row

```tsx
{/* 4-column grid */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-gray-500 font-medium">Total Members</p>
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon size={13} className="text-gray-500" />
      </div>
    </div>
    <p className="text-[22px] font-bold text-gray-900 leading-none">42</p>
    <p className="text-[11px] text-gray-400 mt-1">+3 this month</p>
  </div>
</div>
```

---

## 5. Content Card (with bordered header)

```tsx
<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
  {/* Card header */}
  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-[13px] font-bold text-gray-900">Card Title</p>
      <p className="text-[11.5px] text-gray-400">Subtitle</p>
    </div>
    <button className="text-xs text-gray-500 hover:text-gray-900">View all</button>
  </div>
  {/* Card body */}
  <div className="p-4">
    {/* content */}
  </div>
</div>
```

### Content Card (no header — padding only)

```tsx
<div className="bg-white rounded-xl border border-gray-200 p-4">
  <p className="text-[13px] font-bold text-gray-900 mb-3">Section Title</p>
  {/* content */}
</div>
```

---

## 6. Toolbar (Search + Filters + Export)

```tsx
<div className="flex items-center gap-2 flex-wrap">
  {/* Search */}
  <div className="relative flex-1 min-w-[200px]">
    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      value={search} onChange={e => setSearch(e.target.value)}
      placeholder="Search…"
      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
    />
  </div>
  {/* Filter select */}
  <select className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-300">
    <option>All Statuses</option>
  </select>
  {/* Custom dropdown button */}
  <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-400 whitespace-nowrap transition-colors">
    All Categories <ChevronDown size={12} />
  </button>
  {/* Export */}
  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
    <Download size={12} /> Export
  </button>
</div>
```

---

## 7. Filter Pills (pill group below toolbar)

```tsx
<div className="flex items-center gap-1">
  {FILTERS.map(f => (
    <button key={f.value} onClick={() => setFilter(f.value)}
      className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
        filter === f.value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
      }`}>
      {f.label}
    </button>
  ))}
</div>
```

---

## 8. Data Table

```tsx
<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50">
          {/* Left-anchored column */}
          <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-2">
            Column
          </th>
          {/* Mid column */}
          <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
            Column
          </th>
          {/* Right-aligned column */}
          <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-2">
            Column
          </th>
          {/* Actions column (no label) */}
          <th className="px-5 py-2 w-10" />
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-2">…</td>
            <td className="px-3 py-2">…</td>
            <td className="px-5 py-2 text-right">…</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {/* Footer */}
  <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-gray-50">
    <p className="text-[11px] text-gray-400">Showing {n} of {total}</p>
    {/* Pagination buttons go here */}
  </div>
</div>
```

### Table — Member Cell (name + avatar)

```tsx
<td className="px-5 py-2">
  <div className="flex items-center gap-2">
    {/* Initials avatar */}
    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
      {initials(row.name)}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-900 truncate">{row.name}</p>
      <p className="text-[10px] text-gray-400 truncate">{row.email}</p>
    </div>
  </div>
</td>
```

### Table — Row Actions (`···` button + dropdown)

```tsx
<td className="px-3 py-2 text-right relative">
  <div className="relative inline-block">
    <button onClick={e => { e.stopPropagation(); toggle(); }}
      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
      <MoreHorizontal size={14} />
    </button>
    {open && (
      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
          <Icon size={12} /> Action
        </button>
        <div className="border-t border-gray-100 my-1" />
        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    )}
  </div>
</td>
```

---

## 9. Status Badges / Pills

```tsx
{/* Inline text status (no border) */}
<span className={
  status === 'approved' ? 'text-gray-900 font-semibold' :
  status === 'rejected' ? 'text-red-600' :
  'text-gray-500'
}>{LABEL[status]}</span>

{/* Pill with border */}
<span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-[11px] font-medium text-gray-700">
  Draft
</span>

{/* Colored dot + label */}
<span className="inline-flex items-center gap-1.5 text-[11px] text-gray-700">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
  Active
</span>
```

### Standard status color map

| Status | Classes |
|--------|---------|
| Active / Approved | `text-gray-900 font-semibold` |
| Draft / Pending | `text-gray-500` |
| Closed / Rejected | `text-red-600` |
| Published | `bg-gray-900 text-white` pill |
| Warning | `text-amber-600` |

---

## 10. Progress Bar

```tsx
{/* Standard 1.5px bar */}
<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
</div>

{/* With label */}
<div className="flex items-center gap-2">
  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
  </div>
  <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{pct}%</span>
</div>
```

---

## 11. Charts (Recharts)

### Line Chart

```tsx
<ResponsiveContainer width="100%" height={160}>
  <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
    <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
  </LineChart>
</ResponsiveContainer>
```

### Bar Chart

```tsx
<ResponsiveContainer width="100%" height={160}>
  <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
    <Bar dataKey="value" fill="#111827" radius={[3, 3, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Pie / Donut Chart

```tsx
<PieChart width={110} height={110}>
  <Pie data={data} cx={50} cy={50} innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2}>
    {data.map((_, i) => <Cell key={i} fill={GRAY[i % GRAY.length]} />)}
  </Pie>
</PieChart>
// Legend sits in a sibling div with space-y-2
```

### Chart legend (alongside pie)

```tsx
<div className="space-y-2 flex-1">
  {data.map((d, i) => (
    <div key={d.name} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: GRAY[i] }} />
        <span className="text-[11.5px] text-gray-600">{d.name}</span>
      </div>
      <span className="text-[11.5px] font-semibold text-gray-900">{d.value}</span>
    </div>
  ))}
</div>
```

### Color palette (gray scale for charts)

```ts
const GRAY = ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];
```

---

## 12. Two-Column Layout (main + sidebar)

```tsx
<div className="flex gap-4 items-start">
  {/* Main column */}
  <div className="flex-1 min-w-0 space-y-4">
    {/* content */}
  </div>
  {/* Right sidebar */}
  <div className="w-64 shrink-0 space-y-3">
    {/* sidebar cards */}
  </div>
</div>
```

---

## 13. Sidebar Card

```tsx
<div className="bg-white rounded-xl border border-gray-200 p-3">
  <div className="flex items-center justify-between mb-2">
    <p className="text-xs font-bold text-gray-900">Card Title</p>
    <button className="text-[11px] text-gray-400 hover:text-gray-700">View all</button>
  </div>
  <div className="space-y-2">
    {items.map(item => (
      <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
          {initials(item.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{item.sub}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## 14. Modal / Dialog

### Large (80% screen — detail view)

```tsx
{/* Backdrop */}
<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={onClose}>
  <div
    className="bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
    style={{ width: '80vw', height: '80vh' }}
    onClick={e => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
      <div>
        <h2 className="text-[14px] font-bold text-gray-900">Title</h2>
        <p className="text-[11px] text-gray-400">Subtitle</p>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
        <X size={16} />
      </button>
    </div>
    {/* Tabs (if needed — same underline style) */}
    {/* Body — scrollable */}
    <div className="flex-1 overflow-y-auto p-5">
      {/* content */}
    </div>
  </div>
</div>
```

### Small / Form (fixed width)

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[480px] max-h-[90vh] flex flex-col overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
      <h2 className="text-[14px] font-bold text-gray-900">Modal Title</h2>
      <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={15} /></button>
    </div>
    <div className="overflow-y-auto p-5 space-y-4">
      {/* form fields */}
    </div>
    <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
      <button onClick={onClose} className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
      <button onClick={onSave} className="px-4 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 font-semibold">Save</button>
    </div>
  </div>
</div>
```

---

## 15. Form Fields (inside modals)

```tsx
{/* Label + input */}
<div>
  <label className="block text-[11.5px] font-semibold text-gray-700 mb-1">Field Label</label>
  <input
    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
    placeholder="Placeholder…"
  />
</div>

{/* Textarea */}
<div>
  <label className="block text-[11.5px] font-semibold text-gray-700 mb-1">Description</label>
  <textarea
    rows={3}
    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white resize-none"
  />
</div>

{/* Select */}
<div>
  <label className="block text-[11.5px] font-semibold text-gray-700 mb-1">Status</label>
  <select className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-300">
    <option>Option A</option>
  </select>
</div>
```

---

## 16. Empty State

```tsx
{/* Inline (inside card/table) */}
<div className="flex flex-col items-center justify-center py-14 text-center">
  <Icon size={22} className="text-gray-200 mb-3" />
  <p className="text-[13px] font-semibold text-gray-600">Nothing here yet</p>
  <p className="text-[11.5px] text-gray-400 mt-1">Descriptive sub-line</p>
  {/* Optional CTA */}
  <button className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700">
    <Plus size={12} /> Add First Item
  </button>
</div>

{/* Full page (access denied / error) */}
<div className="flex flex-col items-center justify-center py-24 text-center">
  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
    <Icon size={24} className="text-gray-300" />
  </div>
  <p className="text-[14px] font-semibold text-gray-700">Access Denied</p>
  <p className="text-xs text-gray-400 mt-1">Supporting detail.</p>
</div>
```

---

## 17. Action Buttons Reference

| Variant | Classes |
|---------|---------|
| Primary | `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-lg` |
| Secondary | `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white` |
| Ghost | `p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors` |
| Inline small (approve) | `flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50` |
| Inline small (reject) | `flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg disabled:opacity-50` |
| Danger | `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50` |

---

## 18. Loading Skeletons

```tsx
{/* Full-page skeleton */}
<div className="space-y-4">
  <div className="h-8 bg-gray-100 rounded-xl w-48 animate-pulse" />
  <div className="grid grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
  </div>
  <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
</div>

{/* Table rows skeleton */}
<div className="space-y-2">
  {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
</div>
```

---

## 19. Toast / Feedback

```tsx
{/* Positioned in parent relative container */}
{toast && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg">
    {toast}
  </div>
)}
```

---

## 20. Pagination (client-side)

```tsx
const PAGE_SIZE = 10;
const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
const page = ...; // useState

{/* Footer with pagination */}
<div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-gray-50">
  <p className="text-[11px] text-gray-400">
    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
  </p>
  <div className="flex items-center gap-1">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
      <button key={p} onClick={() => setPage(p)}
        className={`w-6 h-6 text-[11px] font-semibold rounded transition-colors ${
          p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
        }`}>
        {p}
      </button>
    ))}
  </div>
</div>
```

---

## 21. Expanded Row (accordion inside table)

```tsx
{expanded && (
  <tr className="border-b border-gray-100 bg-gray-50">
    <td colSpan={N} className="px-5 py-3">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Section Label</p>
        <p className="text-[12px] text-gray-700 leading-relaxed">{detail}</p>
      </div>
    </td>
  </tr>
)}
```

---

## 22. Section Divider

```tsx
{/* Within a card body */}
<div className="border-t border-gray-100 my-3" />

{/* With label */}
<div className="flex items-center gap-3 my-3">
  <div className="flex-1 border-t border-gray-100" />
  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Label</span>
  <div className="flex-1 border-t border-gray-100" />
</div>
```

---

## Fingerprint Input Format

When you give me a new page description, use this structure:

```
PAGE: <name>
ROUTE: /org/<path>

HEADER:
  Title: "<text>"
  Subtitle: "<text>"
  Actions: [Import, Create, Export, ...]

LAYOUT: [single-column | two-column | tabbed | grid]

TABS (if tabbed):
  - Tab1: <what it shows>
  - Tab2: ...

STAT CARDS (if any):
  - Label, value source, icon

MAIN CONTENT:
  - [table | card-list | kanban | chart | form]
  - Columns (if table): name, type, source field
  - Filters: search by X, filter by Y
  - Row actions: view, edit, delete, ...

SIDEBAR (if two-column):
  - Card 1: title, content type
  - Card 2: ...

MODALS:
  - CreateModal: fields list
  - DetailModal: tabs + content

EMPTY STATE:
  Icon: <icon name>
  Text: "<message>"
```

---

## Typography Quick Reference

| Use | Class |
|-----|-------|
| Page title | `text-[16px] font-bold text-gray-900` |
| Section / card title | `text-[13px] font-bold text-gray-900` |
| Table header cell | `text-[11px] font-semibold text-gray-400 uppercase tracking-wide` |
| Table body text (primary) | `text-xs text-gray-900 font-medium` |
| Table body text (secondary) | `text-[11.5px] text-gray-500` |
| Page subtitle | `text-xs text-gray-400` |
| Card subtitle | `text-[11.5px] text-gray-400` |
| Small label (uppercase) | `text-[11px] font-semibold text-gray-400 uppercase tracking-wide` |
| Tiny sub-label | `text-[10px] text-gray-400` |
| Footer / count | `text-[11px] text-gray-400` |

---

## Spacing Quick Reference

| Context | Value |
|---------|-------|
| Page outer gap | `space-y-4` |
| Card inner gap | `space-y-3` or `space-y-4` |
| Sidebar card inner | `space-y-2` |
| Grid cards | `gap-4` |
| Two-column gap | `gap-4` |
| Toolbar items | `gap-2` or `gap-3` |
| Table padding (first/last col) | `px-5 py-2` |
| Table padding (mid col) | `px-3 py-2` |
| Card header | `px-5 py-3` |
| Card body | `p-4` |
| Sidebar card | `p-3` |
| Button (standard) | `px-3 py-1.5` |
| Button (inline small) | `px-2.5 py-1` |
