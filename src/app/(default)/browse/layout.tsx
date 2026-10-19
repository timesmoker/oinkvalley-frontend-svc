import React from "react";
import RecentRailLayout from "@/features/boards/recent/components/RecentRailLayout";

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
    return <RecentRailLayout>{children}</RecentRailLayout>;
}
