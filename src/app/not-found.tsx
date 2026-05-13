// app/not-found.tsx

import Image from "next/image";

export default function UnderConstructionPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center">

            <Image
                src="/oinkvalley/oink-construction.png"
                alt="공사중"
                width={512}
                height={512}
                className="mb-6"
            />
            <h1 className="text-xl font-bold text-gray-700">
                🐷 오잉크? 여긴 아직 들어오면 안된다 오잉크~<br />
                얌전히 공사가 끝날때까지 기다려주면 좋겠다 오잉크~
            </h1>
        </div>
    );
}
