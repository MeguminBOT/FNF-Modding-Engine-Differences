import subprocess
import datetime


def on_env(env, config, files):
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cI"],
            capture_output=True, text=True, check=True
        )
        commit_date = datetime.datetime.fromisoformat(result.stdout.strip())
        utc_date = commit_date.astimezone(datetime.timezone.utc)
        config["extra"]["last_updated"] = utc_date.strftime("%B %d, %Y at %I:%M %p UTC")
        config["extra"]["last_updated_iso"] = utc_date.isoformat()
    except Exception:
        config["extra"]["last_updated"] = "Unknown"
        config["extra"]["last_updated_iso"] = ""
    return env
