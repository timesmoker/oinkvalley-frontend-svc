import type { ReactNode } from "react";

type Credit = {
    id: string;
    content: ReactNode;
};

export const iconCredits: Credit[] = [
    {
        id: "pig-icon",
        content: (
            <>
                <strong>favicon:</strong>{" "}
                <a
                    target="_blank"
                    href="https://icons8.com/icon/vPFwrtJspSQM/%EB%8F%BC%EC%A7%80"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    돼지
                </a>{" "}
                작가:{" "}
                <a
                    target="_blank"
                    href="https://icons8.com"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    Icons8
                </a>
            </>
        ),
    },
];
