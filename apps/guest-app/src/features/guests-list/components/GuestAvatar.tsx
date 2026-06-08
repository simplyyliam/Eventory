import { Avatar, AvatarFallback, AvatarImage } from "@app/shared/components/ui/avatar";

export const GuestAvatar = () => {
  return (
    <Avatar className="w-6">
      <AvatarImage
        src="/favcon.png"
        alt="@shadcn"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
