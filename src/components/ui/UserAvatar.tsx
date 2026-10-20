import { cn } from "@/lib/utils";

type UserAvatarProps = {
    /** 닉네임 — 첫 글자를 원 안에 표시, 전체는 툴팁 */
    name: string;
    className?: string;
};

/** 사용자 아바타. 프로필 사진이 생기면 이 컴포넌트에서 이미지로 바꾼다. */
export default function UserAvatar({ name, className }: UserAvatarProps) {
    const initial = Array.from(name.trim())[0] ?? "?";
    return (
        <span
            className={cn(
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground",
                className,
            )}
            title={name}
            aria-label={name}
        >
            {initial}
        </span>
    );
}
