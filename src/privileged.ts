// Standalone replacement for ctx.executePrivileged(...) (Google Sheets/Drive).
//
// The original handlers shell out to the Muse host CLI (`hatch_gws_cli`), which
// does not exist outside Muse. Behavior here:
//
// - The sync-queue tables (google_sync_queue / google_integrations) keep
//   working: actions already insert queue rows and mark them synced/failed
//   based on the result below, and `retryGoogleSheetsSync` replays them.
// - When Google is not configured, we return the same "not connected" shapes
//   the real handlers return, so work is queued/reported as pending instead
//   of crashing the action.
// - Pluggable: set GOLA_PRIVILEGED_MODULE to a file exporting
//   `handlePrivileged(contractName, args)`. If it returns a value (not
//   undefined), that value is used as the privileged result — this is where a
//   real Google Sheets/Drive implementation (e.g. service-account based) can
//   be wired in later. See DEPLOY.md.

type Handler = (contractName: string, args: unknown) => Promise<unknown> | unknown;

let customHandler: Handler | null | undefined;

async function loadCustom(): Promise<Handler | null> {
  if (customHandler !== undefined) return customHandler;
  const modPath = process.env.GOLA_PRIVILEGED_MODULE;
  if (!modPath) {
    customHandler = null;
    return null;
  }
  try {
    const mod = (await import(modPath)) as { handlePrivileged?: Handler };
    customHandler =
      typeof mod.handlePrivileged === "function" ? mod.handlePrivileged : null;
  } catch (e) {
    console.warn(`[gola][privileged] custom module failed to load: ${e}`);
    customHandler = null;
  }
  return customHandler;
}

const NOT_CONFIGURED_SHEETS =
  "Google Sheets is not configured on this server. The update has been queued and can be retried later from Settings → Google Sheets sync.";
const NOT_CONFIGURED_DRIVE =
  "Google Drive is not configured on this server.";

export async function executePrivilegedShim(
  contractName: string,
  args: unknown
): Promise<unknown> {
  const custom = await loadCustom();
  if (custom) {
    const result = await custom(contractName, args);
    if (result !== undefined) return result;
  }
  switch (contractName) {
    case "googleConnectionStatus": {
      const service =
        (args as { service?: string } | null)?.service === "drive"
          ? "Google Drive"
          : "Google Sheets";
      return {
        connected: false,
        message: `${service} is not configured on this server.`,
      };
    }
    case "initializeGoogleSheets":
      return {
        ok: false,
        spreadsheetId: null,
        spreadsheetUrl: null,
        error: NOT_CONFIGURED_SHEETS,
      };
    case "appendGoogleSheetRow":
      return { ok: false, error: NOT_CONFIGURED_SHEETS };
    case "uploadSourceToDrive":
      return { ok: false, fileUrl: null, error: NOT_CONFIGURED_DRIVE };
    default:
      throw new Error(`Unknown privileged contract: ${contractName}`);
  }
}
