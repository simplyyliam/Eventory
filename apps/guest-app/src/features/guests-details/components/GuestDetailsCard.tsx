import type { HTMLAttributes } from "react";


export const GuestDetailsCard: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children, 
    className,
    ...props
}) => {
    return (
        <div className={`flex flex-col w-full h-full p-2.5 gap-2.5 bg-card rounded-b-[40px] font-dmSans ${className}`} {...props}>{children}</div>
    )
}