import ExerciseTracker from "./ExerciseTracker";
import { handleProtectedPageError } from "@/lib/auth/handleProtectedPageError";
import { fetchMyRally } from "@/features/stamp-rally/api/stampRallyQueries";
import {
    getServerApiBaseUrl,
    getSsrUpstreamAuthFromRequest,
} from "@/lib/api/serverBaseUrl";

export const dynamic = "force-dynamic";

export default async function ExercisePage() {
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();
    const rewardLinkUrl = process.env.EXERCISE_REWARD_LINK_URL;

    let initialRally;
    try {
        initialRally = await fetchMyRally(baseUrl, ssrAuth);
    } catch (err) {
        handleProtectedPageError(err, "/exercise");
    }

    return (
        <ExerciseTracker
            initialRally={initialRally}
            rewardLinkUrl={rewardLinkUrl}
        />
    );
}
