# WCBS V2 Session Bootstrap

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->

{{activation_marker}}

WCBS is active. The canonical `using-wcbs` skill follows in this startup context. Apply its hard gate before any project action, then load the task-specific skill on demand. User instructions override WCBS. Do not invent tools; stop with `Blocked` if the skill catalog or active tool map is unavailable.

On the first response after a successful session start, put the activation marker above on its own first line without backticks. Emit it once per session, not after every turn or compaction.

The full APIVR, Elite Goals, and specialist skills load only when their trigger applies.
