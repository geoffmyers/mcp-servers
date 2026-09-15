/**
 * Detects whether a failed command result or caught error is actually a
 * successful restart/reboot/shutdown that terminated the SSH connection
 * before the command could return.
 *
 * When HA restarts, the SSH session is killed mid-command, which produces
 * exit code 255 and/or SSH disconnect messages in stderr.
 */
export function isRestartDisconnect(
  result?: { exitCode: number; stderr: string },
  error?: unknown
): boolean {
  const SSH_DISCONNECT_PATTERNS = [
    /connection (reset|closed)/i,
    /broken pipe/i,
    /connection to .* closed/i,
    /remote host closed the connection/i,
    /ssh.*255/i,
    /process exited with code 255/i,
  ];

  if (result) {
    if (result.exitCode === 255) return true;
    if (SSH_DISCONNECT_PATTERNS.some((p) => p.test(result.stderr))) return true;
  }

  if (error instanceof Error) {
    if (SSH_DISCONNECT_PATTERNS.some((p) => p.test(error.message))) return true;
    // execFile throws with code 255 for SSH disconnect
    if (String((error as NodeJS.ErrnoException).code) === "255") return true;
  }

  return false;
}
