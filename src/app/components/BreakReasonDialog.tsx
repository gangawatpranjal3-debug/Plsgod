import { useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface BreakReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}

export function BreakReasonDialog({ open, onOpenChange, onSubmit }: BreakReasonDialogProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(reason.trim() || 'No reason provided');
    setReason('');
  };

  const quickReasons = [
    'Quick break',
    'Lunch/Snack',
    'Restroom',
    'Phone call',
    'Tired/Rest',
    'Other task',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            Taking a Break?
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Let us know why you're stopping. This helps track your study patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Quick Reasons */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Quick Select</label>
            <div className="grid grid-cols-2 gap-2">
              {quickReasons.map((quickReason) => (
                <button
                  key={quickReason}
                  onClick={() => setReason(quickReason)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    reason === quickReason
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  {quickReason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Or write your own
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type your reason here..."
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setReason('');
                handleSubmit();
              }}
              variant="outline"
              className="flex-1 border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
