import type { HTMLAttributes } from "react";


export const GuestListContainer: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2-5 p-2.5 w-full h-screen ${className}`} {...props}>{children}</div>
    )
}