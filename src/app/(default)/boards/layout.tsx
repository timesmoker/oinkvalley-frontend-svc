
import React from "react";

export default function ViewLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return <div className="pt-20 px-0 sm:px-6">{children}</div>
}

