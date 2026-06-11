
import React from "react";

export default function ViewLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return <div className="px-0 sm:px-6">{children}</div>
}

