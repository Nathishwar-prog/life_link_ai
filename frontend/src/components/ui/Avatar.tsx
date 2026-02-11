
import * as React from "react"
import { cn } from "../../lib/utils"
// Note: In a real shadcn/ui setup, these would rely on @radix-ui/react-avatar.
// Since we might not have that installed, I'll create a simple pure Tailwind version 
// or I can check package.json if @radix-ui/react-avatar is available.
// Checking package.json... it wasn't there. So I will make a custom one.

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100",
                className
            )}
            {...props}
        >
            {src ? (
                <img className="aspect-square h-full w-full" src={src} alt={alt} />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-gray-500">{fallback}</span>
                </div>
            )}
        </div>
    )
)
Avatar.displayName = "Avatar"

export { Avatar }

// Helper for exporting clean subcomponents if needed by other files, 
// though for this custom implementation, I'm keeping it simple.
export const AvatarImage = ({ src, alt }: { src?: string, alt?: string }) => <img className="aspect-square h-full w-full" src={src} alt={alt} />;
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-500">{children}</span>
    </div>
);
