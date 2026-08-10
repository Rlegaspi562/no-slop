# Scheduling the updater

The goal is install once and stop thinking about it. That means the update has
to happen without the user initiating it.

## The offer

On first substantive use of `no-slop`, and on `/no-slop schedule`, check whether
`.local.json` exists at the skill root with a `schedule` key. If it does, the
question has already been answered. Say nothing.

If it does not, ask once:

> Want me to set up automatic updates for the upstream skills in `no-slop`?
> They currently update only when you run `/no-slop update`.

Then write the answer, including a decline, so it is never asked again:

```json
{ "schedule": { "answered": "2026-08-09", "choice": "github-action" } }
```

Valid choices: `github-action`, `agent-routine`, `os-task`, `declined`, `manual`.

`.local.json` is gitignored. A fork does not inherit anyone else's answer, and a
fresh clone gets asked once on its own terms.

Do not re-ask after a decline. If the user later wants it, they will run
`/no-slop schedule`, which bypasses the check.

## Option 1: GitHub Action, recommended

Best fit for "never worry about it again," because it runs whether or not the
machine is on and whether or not anyone opens an agent session. It opens a pull
request rather than pushing to the default branch, so upstream changes are
reviewed before they land.

A ready workflow is at `reference/update-workflow.yml`. Install it:

```bash
mkdir -p .github/workflows && cp no-slop/reference/update-workflow.yml .github/workflows/no-slop-update.yml
```

The repo needs pull-request write permission for Actions. In the repo settings,
under Actions, General, Workflow permissions, enable "Allow GitHub Actions to
create and approve pull requests."

Cloning someone else's repository does not schedule updates for the local
clone. The workflow must run in a repository the user controls, normally a
fork, and GitHub starts scheduled workflows disabled on public forks. Enable
the workflow in the Actions tab after forking.

## Option 2: A scheduled agent routine

Use when the update should be reviewed conversationally rather than as a diff,
or when the repo is not on GitHub. Invoke the `schedule` skill and create a
weekly routine whose prompt is:

> Run `node scripts/update.mjs` in the `no-slop` skill. If anything changed,
> summarize what moved upstream and whether it conflicts with anything in
> `voice/`, then commit on a branch.

The conflict check is the part a plain cron job cannot do, and it is the reason
to pick this over option 1. An upstream that starts recommending something the
voice layer forbids is worth a sentence of warning.

## Option 3: An OS-level task

Lowest ceremony, no network permissions needed. On Windows:

```powershell
$a = New-ScheduledTaskAction -Execute "node" -Argument "scripts\update.mjs" -WorkingDirectory "$HOME\.claude\skills\no-slop"
Register-ScheduledTask -TaskName "no-slop-update" -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am) -Action $a
```

This writes files but does not commit. Pair it with whatever cross-repo health check you use, so
the update surfaces the next
time you look.

## Cadence

Weekly. These upstreams move in bursts of a few commits and then sit still for
weeks. Daily produces noise with no new information, and monthly means a large
unfamiliar diff whenever it does fire.

## What the schedule must never do

Touch `voice/`. The updater already refuses at the path level, verified by
test, but a scheduled job that reformats or "tidies" the voice layer would
defeat the whole design. The schedule runs the updater and nothing else.
