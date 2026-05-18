import Image from "next/image";

export default function TimesmokerPage() {
    return (
        <div className="pt-32">
            <main className="flex flex-col gap-8 row-start-2 items-center justify-center">
                <h1 className="text-6xl font-bold">
                    {`Welcome to Time Smoker's website`}
                </h1>
                <p className="text-xl">
                    {`Dplus KIA is the best team's ever!`}
                </p>
                <Image
                    src="/timesmoker/logo_dpluskia.png"
                    alt="dpluskia"
                    width={500}
                    height={500}
                />
            </main>
        </div>
    );
}
