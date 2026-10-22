# 7 Words

The best label is the one the screen does without; the next best is short, plain, and names what happens. A project's copy guide applies first; this file fills the gaps.

## Principles

- Consistency reduces thinking: one concept, one name; one action, one verb; one state, one term, on every screen.
- Scannable: front-load the action or the object. Siblings in a menu, row, or tab bar share structure and length.
- Plain words: the user's words for their work, not the mechanism, the data model, the vendor, or the model behind it.
- Safety through language: consequences are explicit where permissions, data, or reversibility matter.
- Calm: facts and a path forward. Marketing, enthusiasm, apology, and urgency the system cannot back up are noise.
- Let design do its work: a confusing layout gets fixed, not explained with more copy.

## Does it need words?

- The title, the layout, or the value already says it: no label. That covers eyebrows (small text right above a heading that names its category), section labels that repeat the title, counts above the rows they count, and "Status:" before a status chip.
- Delete a helper sentence; if the decision loses nothing, it stays deleted. A helper that says what happens for the user stays.
- A string repeated down a list is said once above it, ideally as the label of the control that changes it.
- A count beside a title stays only when it predicts a click, as on tabs. A meta or provenance line stays only when the user acts on it.

## Labels

- Name the outcome, not the mechanism: "Export report", not "Run export job".
- A field label is the question in three words or fewer; each option answers in one line.
- A button is a verb and its object, and matches the title of what it opens.
- The shortest unambiguous label in place: a menu on an object implies the object ("Rename", "Delete"). Keep the noun when siblings differ by object, in confirmation titles, and on destructive buttons.
- Values describe themselves: "3 open tasks", not "Open: 3".
- The thing first, and its parent after it as a separate, quieter label such as a chip or muted text: "Weekly review" with "Finance" beside it, not one string joined by a dot or an arrow.
- Toggles name the on state. An ellipsis means more input follows ("Export as…").
- Sentence case, no period on a single sentence, no emoji.

## Helpers, tone, and states

- Talk about the user's work, not the screen ("Here you can…") or the product.
- A label that needs a tooltip gets renamed; a tooltip defines a term.
- A placeholder shows an example or the default, never a state or an instruction.
- A new concept gets one explanation, where it is first met, as what happens for the user.
- Error: what happened and the next step, in the user's words, offering only remedies that exist.
- Empty: why it is empty and the next action, in one or two lines.
- A missing value is named ("No date", "Not set"), never left blank.
- Confirmation: the title asks the exact question ("Delete 5 users?"), the body states the consequence and whether it can be undone, the button repeats the action ("Delete users").
- Translations are written as one string per sentence, with variables and plurals; a longer language is shortened by restructuring, never by abbreviating.

## Read as text

Run `text.js` and read `lines` top to bottom without the screen.

- It makes sense as a page: what this is, what it holds, what to do next.
- Each `repeats` entry is a candidate to say once; a column of one button label is a candidate for the row's own click.
- Each `eyebrows` and `restated` entry is a candidate to cut.
- Each `nothing` entry is a section to remove or an empty state to merge.
- `words` goes down with each pass.

## Examples

| Before | After | Why |
| --- | --- | --- |
| Placeholder "No title" | Placeholder "Weekly numbers", the default title | Show the default, not a state |
| "Your rules: internal only" on every row | One header button "Internal only" | Say it once, inside its control |
| Checkbox labeled "On" | Switch row "Email me a weekly summary" | The label says what the on state does |
| "Add a new connection" over an empty list | "Connected" with an empty slot, then "Add" | Headings name what is there |
| "10-22 08:30", "Fri 11:00", "20.10.2026 13:00" | "Thu 22.10. 08:30" everywhere | One format |
| "Older ones are deleted when a new one is saved. Ones you save yourself stay." | "Copies saved by hand stay." | Keep the consequence, drop the mechanics |

## When phrasings compete

1. A clear action and accurate consequences
2. Consistency with existing labels
3. Brevity
4. Tone

## Numbers

| Number | Target |
| --- | --- |
| `text.js` `counts.words` | Fewer after each pass |
| `text.js` `counts.helpers` | Fewer than before; each one says what happens for the user |
| `text.js` `counts.repeats`, `counts.eyebrows`, `counts.restated` | 0, or each one kept on purpose |
