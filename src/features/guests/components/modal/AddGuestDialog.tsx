import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DietaryComboBox } from '../DietaryComboBox';
import { IconButton } from '@/shared/components';
import { CancelIcon, SaveIcon } from '@hugeicons/core-free-icons';

import { useGuest } from '@/hooks/useGuests';
import { useFormStore } from '@/store/useFormStore';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGuestDialog({ open, onOpenChange }: Props) {
  const name = useFormStore((s) => s.name);
  const email = useFormStore((s) => s.email);
  const comment = useFormStore((s) => s.comment);
  const dietary = useFormStore((s) => s.dietary);
  const setField = useFormStore((s) => s.setField);
  const resetForm = useFormStore((s) => s.reset);

  const { handleAddGuest } = useGuest();

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = () => {
    handleAddGuest();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }

    onOpenChange(newOpen);
  };
  

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
       className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Guest</DialogTitle>
          <DialogDescription>
            Enter guest details to add them to the event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
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

        <DialogFooter className="gap-2.5">
          <IconButton
            Label="Cancel"
            Icon={CancelIcon}
            onClick={handleClose}
          />

          <IconButton
            Label="Save"
            Icon={SaveIcon}
            onClick={handleSave}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}