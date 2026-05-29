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
import { DietaryComboBox } from '../DietaryComboBox';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/shared/components';
import { CancelIcon, SaveIcon } from '@hugeicons/core-free-icons';
import { useModalStore } from '@/store/useModalStore';
import { useGuest } from '@/hooks/useGuests';
import { useFormStore } from '@/store/useFormStore';

export function AddGuestModal() {
  const closeModal = useModalStore((s) => s.closeModal);
  const modalId = useModalStore((s) => s.modalId);
  const name = useFormStore((s) => s.name);
  const email = useFormStore((s) => s.email);
  const comment = useFormStore((s) => s.comment);
  const dietary = useFormStore((s) => s.dietary);
  const setField = useFormStore((s) => s.setField);

  const { handleAddGuest } = useGuest();

  return (
    <>
      {modalId === 'GuestModal' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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
                    <Input
                      id="name"
                      type="text"
                      placeholder="Joe Doe"
                      value={name}
                      onChange={(e) => setField('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joeDoe@gmail.doe"
                      value={email}
                      onChange={(e) => setField('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dietary">Dietary Requirements</Label>
                    <DietaryComboBox
                      value={dietary}
                      onValueChange={(value) => setField('dietary', value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea
                      id="comments"
                      placeholder="Add any additional comments"
                      className="resize-none"
                      value={comment}
                      onChange={(e) => setField('comment', e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="gap-2.5">
              <IconButton
                Label="Cancel"
                Icon={CancelIcon}
                onClick={closeModal}
              />
              <IconButton
                Label="Save"
                Icon={SaveIcon}
                onClick={handleAddGuest}
              />
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
