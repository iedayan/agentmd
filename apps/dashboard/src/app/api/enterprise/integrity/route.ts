import { NextRequest } from "next/server";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req);

    try {
        // In a production environment, this might be fetched from a remote bucket or a DB.
        // For now, we read from the root RELEASES.json
        const manifestPath = path.resolve(process.cwd(), "../../RELEASES.json");

        if (!fs.existsSync(manifestPath)) {
            // Fallback or development mock if file doesn't exist at the expected path
            return apiOk({
                integrity: [
                    {
                        id: "dev-cli",
                        packageName: "@agentmd/cli",
                        version: "v1.4.2-dev",
                        sha256: "ea33c94a565d7890b1d1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1",
                        lastHardened: new Date().toISOString(),
                        platform: "npm / multi-arch"
                    }
                ]
            }, { requestId });
        }

        const content = fs.readFileSync(manifestPath, "utf-8");
        const manifest = JSON.parse(content);

        return apiOk({
            version: manifest.version,
            lastHardened: manifest.lastHardened,
            integrity: manifest.artifacts
        }, { requestId });
    } catch (error) {
        console.error("Integrity API Error:", error);
        return apiOk({ integrity: [] }, { requestId });
    }
}
