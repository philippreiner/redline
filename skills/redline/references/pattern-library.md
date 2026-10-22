# Pattern library

Choose by the task, content, frequency, and need to compare. These are defaults, not count thresholds. Follow project vocabulary and platform conventions. Use the pattern names when discussing a design.

## Shells and frames

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| App shell | Persistent navigation and global tools | Mail folders around changing messages | Page actions stay with the page |
| Sidebar, navigation rail | Frequent movement among destinations | Files, Search, Extensions in an editor | Occasional navigation may need less space |
| Top bar | Global tools | Workspace, search, account | Separate from the page header |
| Breadcrumb | Ancestors of the current location | Library / Photography / Portraits | A stepper shows sequence |
| List page | Finding and opening records | Searchable, sortable orders | Sustained work needs detail |
| Detail page | Sustained work on one record | Order, delivery, payment history | Brief inspection can use a panel |
| List and detail | Processing items without losing place | Inbox beside selected message | Narrow screens separate panes and preserve position |
| Settings page | Configuring behavior and defaults | Notifications by delivery channel | Daily tasks belong in the work surface |
| Dashboard | Monitoring related signals | Ticket volume, backlog, oldest wait | Each signal serves the same monitoring job |
| Editor, canvas | Creating or arranging content | Slide, layers, formatting inspector | Independent fields need a form |
| Wizard | Dependencies that justify steps | Connect account, choose data, review | Preserve work when revisiting steps |
| Full-page message | A blocking condition | Document unavailable; request access | Local failures stay in their region |

## Containers and overlays

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| Side panel, sheet, drawer | Supporting work beside current content | File metadata beside its list | More room or independent navigation favors a page; modality is a separate choice |
| Dialog, modal | A bounded, focused task | Rename folder, Save / Cancel | Short forms fit; long work or background comparison favors a page or nonmodal panel |
| Confirmation | An informed decision before consequential action | Delete workspace: name it and explain loss | Reversible, low-cost actions can use Undo |
| Popover | Brief content anchored to a trigger | Date range beside its button | A container, with appropriate controls inside |
| Menu | Choosing an action | Rename, Duplicate, Download | Saved values usually need choice controls |
| Tooltip | Brief, noninteractive help | “Bold” and its shortcut | Name the control independently; essential instructions stay visible |
| Hover card | Optional preview | Role and contact details from a name | Provide an explicit opener for touch access |
| Toast, snackbar | Feedback that can safely disappear | “Link copied”; “Archived” with Undo | Required recovery needs a lasting location |
| Banner | A lasting page or workspace condition | Offline; changes waiting to sync | Local failures belong beside their subject |
| Command palette | Searching destinations and commands together | Find a document or Create folder | Keep ordinary navigation and actions discoverable |

## Navigation and views

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| Tabs | Peer sections sharing a content area | Overview, Activity, Files | Linkable sections need URL state; steps need a stepper |
| Segmented control | A few compact, visible choices | Day / Week / Month | Long explanations need radio rows |
| In-page navigation | Jumping within a long page | Ingredients, Method, Nutrition | Tabs replace sections rather than scroll to them |
| Filter bar | Narrowing by properties | Order status and delivery date | One useful filter still earns a control |
| Filter chip | Toggling or removing a criterion | In stock; remove Status: Open | Distinguish selection, removal, and passive labels |
| Search field | Naming is easier than scanning | Contact name, email, company | Usefulness matters more than collection size |
| Saved view | Reusing filters, sort, and presentation | My overdue tasks | A one-time query needs no named view |
| Pagination | Bounded sets and return points | Search result pages | Preserve filters, sort, and position |
| Load more, infinite scroll | Continuous browsing | Photo stream | Explicit loading protects control and footer access; restore position |
| Tree | Expanding and acting on branches | Folders and files | Shallow hierarchies may need only groups |
| Disclosure, accordion | Optional detail on demand | Advanced export settings | One section is a disclosure; grouped sections form an accordion |
| Stepper | Position in an ordered flow | Address → Delivery → Payment | Shows sequence; does not justify splitting a simple form |

## Input and choice

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| Text field, text area | Supplying text | Title; description | Known valid values may need a choice control |
| Number field | Exact quantities | 24 seats, with increment buttons | Identifiers such as postal codes need text |
| Select | One known value, little explanation | Currency code | Radios expose comparisons; search helps locate options |
| Combobox | Typing to find or suggest a value | Search an existing product catalog | State whether new values are allowed; typing need not mean creation |
| Radio group | Comparing exclusive alternatives | Delivery price and arrival date | Select when visible comparison adds little |
| Checkbox | Inclusion, acknowledgment, independent selection | Attachments; terms; selected rows | Select all may need a mixed state; save timing is separate |
| Switch | On/off settings | Email notifications | Keep the label stable; make deferred Save explicit |
| Multi-select | Several values from a larger set | Search, add, remove recipients | Short sets can use checkboxes |
| Date picker | Calendar dates or intervals | Booking date; reporting range | Allow typing; relative periods need presets |
| Slider | Approximate position on a scale | Preview volume while listening | Pair with a number field for precision |
| Option cards | Previews aid comparison | Page layout thumbnails | Preserve radio or checkbox behavior |
| Sortable list | User-defined order | Playlist tracks | Offer move controls alongside dragging; value-based sorting is different |
| File upload | Supplying files | Choose or drop receipts; progress and retry | Keep a file chooser; uploaded differs from processed |
| Copy field | Copying a value accurately | Read-only webhook URL with Copy | Confirm only after copying succeeds |
| Form | Related fields committed together | Contact details | Usually one column; choose an [editing model](#editing-and-long-work) |

## Display and data

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| List | Recognizing items from summaries | Sender, subject, message preview | Comparing shared attributes favors a table |
| Table | Comparing attributes across records | Plan price, storage, users | Comparison, not column count, decides |
| Data grid | Cell editing and movement | Spreadsheet-style inventory | Read-only comparison usually needs a table |
| Card grid, gallery | Recognition through previews | Template thumbnails | Dense attribute comparison favors a table |
| Board, Kanban | Work grouped or moved by stage | Queued → In progress → Done | Many columns may favor a list; offer alternatives to dragging |
| Activity feed, history | Events in order | Placed, packed, dispatched | Separate past events from current status |
| Timeline, Gantt | Duration, overlap, dependencies | Bookings on a shared time axis | A simple event sequence needs history |
| Calendar | Reasoning by day, week, availability | Appointments against existing bookings | Urgent deadlines may suit a sorted list |
| Property list | Named facts about one record | Owner, size, format, modified date | Compare records in a table; edit with controls |
| Badge, status label | Compact state or attention count | Pending; unread count | Keep meaning legible without color |
| Tag, chip | Categories or selected values | Photography; removable recipient | Distinguish passive labels, removal, and selection |
| Metric, KPI | A number answering a question | 98.7% on-time delivery versus last month | Include unit, period, and comparison when useful |
| Chart | Shape, trend, distribution, comparison | Demand line; regional bars | Exact lookup favors a table |
| Progress meter | Completion against a known total | 37 of 80 files uploaded | Unknown work needs an indeterminate state |

## Feedback and states

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| Empty state | A meaningful destination without content | No playlists yet; Create playlist | Omit optional empty sections |
| No results | A query without matches | No matching orders; Clear filters | Keep the query editable; distinguish from no orders yet |
| Setup card, checklist | Prerequisites and first steps | Connect calendar, choose calendars | Show actual completion and next step |
| Skeleton | Known content structure while loading | Placeholder list rows | Preserve layout, not an invented count; retain useful content during refresh |
| Spinner | Work of unknown extent | Save pending | Longer work needs lasting status and a return point |
| Field error | Correcting a specific input | End date must follow start date | Preserve input; distinguish validation from server failure |
| Error summary | Submission errors spread across fields | Check 3 fields, each linked | Pair with errors at those fields |
| Partial error | One region failed | Tracking unavailable; retry section | Keep successful content; failure is not emptiness |
| Error page | The requested page failed | Document unavailable; Retry or Back | Denied access needs an access path, not repeated Retry |

## Editing and long work

| Pattern | Use for | Example | Boundary |
| --- | --- | --- | --- |
| Inline edit | Small, independent changes in context | Rename a list in its header | Make commit, cancel, and failure clear |
| Explicit save | Reviewing related changes together | Delivery instructions, Save / Cancel | Show unsaved changes and handle leaving |
| Autosave | Frequent, continuous editing | Document: Saving → Saved | Saved means persisted; preserve edits on failure |
| Bulk action toolbar | Acting on an explicit selection | 12 selected; Archive; Clear selection | Distinguish selected rows, current page, and all matches |
| Background task status | Work continuing after departure | Export progress and result in Downloads | Keep recovery reachable; offer cancellation only while effective |
| Undo | Reversing a low-cost change | Restore an archived message | Irreversible effects need a decision beforehand |
| Conflict resolution | Edits against changed state | Compare versions, keep or merge edits | Preserve work; silent overwrite or reload can lose it |

## Semantics

Names vary by system; design patterns do not map directly to accessibility roles. For web keyboard, focus, and roles, use the [WAI-ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/), including [dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [comboboxes](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), and [switches](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).
