import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DietaryComboBox } from './DietaryComboBox';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/shared/components';
import { CancelIcon, SaveIcon } from '@hugeicons/core-free-icons';
import { useModalStore } from '@/store/useModalStore';

export function AddGuestModal() {
  const { isModalOpen, closeModal } = useModalStore();
  return (
    <>
      {isModalOpen && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Add Guest</CardTitle>
            <CardDescription>
              Enter guest details to add them to the event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="Joe Doe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joeDoe@gmail.doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <DietaryComboBox />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="checkout-7j9-optional-comments"
                    placeholder="Add any additional comments"
                    className="resize-none"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="gap-2.5">
            <IconButton label="Cancel" Icon={CancelIcon} onClick={closeModal}/>
            <IconButton label="Save" Icon={SaveIcon} />
          </CardFooter>
        </Card>
      )}
    </>
  );
}
