# A destructive git command, and the gate built to refuse it

## What happened

In an automated pipeline where several AI coding agents run shell commands against a shared git repository, one agent issued a repo-root `git stash` while other work was still in flight on the live branch. A plain `git stash` reverts every tracked file to the last commit at once, with no confirmation. That single command touched 1,252 tracked paths.

## What was lost, and what came back

Before any repair, every affected path was checked against four things: the stash contents, the current commit, the commit the stash was taken against, and the working tree as found. That check came first, with no writes, so recovery could tell a file needing restoring apart from one already recovered on its own, apart from a real conflict needing a human call.

1,094 files were restored and verified content-correct. 22 had already been rewritten by other work and needed nothing. 8 showed up as conflicts but were byte-identical to what they were being restored to, so not real conflicts. Zero files were lost.

A separate, unrelated cleanup task had already deleted 129 files before this incident. Recovering those was not the recovery script's call: deleting files is a decision reserved for a person here, so the 129 stayed untouched, flagged for later.

## Refuse, not warn

The obvious response is a warning: log the command, flag it, tell someone afterwards. That was rejected, because a warning cannot undo a whole-tree revert; by the time anyone reads a log line the files are gone. The only point where the outcome can still change is before the command runs, so the fix is a gate: a program between an agent's request to run a shell command and that command executing. It reads the command text and, if it matches a short list of destructive git operations, says no there, not afterwards.

The list is narrow: `git stash` except its read-only forms, `git reset --hard`, a `git checkout`, `switch` or `restore` with no file path (or a path outside the agent's scope), and `git clean` with a force flag. An unattended agent is refused on any of these. A human operator in the same session is logged, not blocked: that person already owns the repository and is not the failure mode this gate exists to catch.

## Proving it can fail safely, in both directions

A gate is only trustworthy if its failure mode is known, not assumed. This one fails two different ways depending on what broke. For anything unrelated to git, an unreadable input, an internal error on an ordinary command, it lets the command through and says loudly it failed open, rather than freezing every agent's shell access over an unrelated bug. But if the command was already recognised as destructive, and the gate cannot tell whether that instance is safe, it refuses instead of guessing: an unprovably-safe destructive-looking command is grounds to say no, scoped only to that short list.

## The 21 adversarial cases

The gate ships with 21 fixed test cases covering ordinary refusals, near-miss phrasing, and both failure directions above. All 21 currently pass.

| Command tried | Actor | Outcome |
|---|---|---|
| `git stash` | worker | refused |
| `git stash list` | worker | passed, read-only |
| `git checkout -- <path in scope>` | worker | passed |
| `git reset --hard` | worker | refused |
| `git stash` | human operator | passed, logged |
| malformed input to the gate itself | n/a | passed, typed parse failure |
| `git checkout -- <path out of scope>` | worker | refused |
| `git checkout` with no path or branch | worker | refused |
| `git clean -fd` | worker | refused |
| `git reset --soft HEAD~1` | worker | passed |
| an ordinary non-git command | worker | passed |
| `git stash show -p` | worker | passed, read-only |
| checkout to an out-of-scope path, scope check broken | worker | refused, fails closed |
| `git commit -m "notes: stash; reset --hard mentioned"` | worker | passed, quoted text |
| same words as two real, semicolon-separated commands | worker | refused |
| destructive command on line two of a multi-line call | worker | refused |
| no identity, marked as an automated process | n/a | refused, never treated as an operator |
| shell-launcher-style `git stash` invocation | worker | refused |
| shell-launcher-style `git reset --hard` invocation | worker | refused |
| classifier failure on a flagged-destructive command | worker | refused, fails closed |
| same classifier failure on a non-destructive command | worker | passed, still fails open |

## What it deliberately lets through

Read-only stash inspection. Soft resets. Ordinary non-git commands. A checkout or restore to a path the agent is meant to work in. A human operator running any refuse-listed command, since supervision, not this gate, is the safeguard there. A commit message merely mentioning one of these commands as text, not issuing it. None are missed edge cases: each is built to let through on purpose, and proven.

## What it does not solve

The gate splits a shell line into pieces with a defined, best-effort method, not a full shell parser, so a command hidden inside a subshell, a command substitution, or an unusual background invocation sits outside what it can see today, named, not silent. It does not stop a human operator with legitimate authority from making the same mistake, by design: removing that authority was never the goal. It does not undo damage arriving by another route; it only stops the command before it runs. And it is scoped to git: any other way a process could destroy data needs its own gate, built the same way, from a real incident and a fixed set of proving cases, not a rule written from memory.
