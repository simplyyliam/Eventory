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
import useGuest from '@/hooks/useGuests';

export function AddGuestModal() {
  const closeModal  = useModalStore((s) => s.closeModal)
  const isModalOpen = useModalStore((s) => s.isModalOpen)
  const { setName, setEmail, setComment, setDietary, name, email, comment, dietary, handleAddGuest } = useGuest()

  
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
                  <Input id="name" type="text" placeholder="Joe Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joeDoe@gmail.doe"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <DietaryComboBox 
                  value={dietary}
                  onValueChange={setDietary}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Add any additional comments"
                    className="resize-none"
                    value={comment} onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="gap-2.5">
            <IconButton Label="Cancel" Icon={CancelIcon} onClick={closeModal}/>
            <IconButton Label="Save" Icon={SaveIcon} onClick={handleAddGuest}/>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
