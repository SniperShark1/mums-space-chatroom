import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUsername: string;
  reporterId: number;
}

export default function ReportUserModal({ isOpen, onClose, reportedUsername, reporterId }: ReportUserModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const maxDescriptionLength = 500;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitReport = useMutation({
    mutationFn: async (reportData: any) => {
      return apiRequest("/api/reports", "POST", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: `Your report about ${reportedUsername} has been submitted to moderators`,
      });
      onClose();
      setReason("");
      setDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for the report",
      });
      return;
    }

    submitReport.mutate({
      reporterId,
      reportedUsername,
      reason,
      description,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border-2 border-pink-200">
        <h3 className="font-bold text-pink-800 text-lg mb-4">
          Report User: {reportedUsername}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pink-700 mb-2">
              Reason for Report *
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="border-pink-200 focus:border-pink-400">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="bullying">Bullying</SelectItem>
                <SelectItem value="threats">Threats or Violence</SelectItem>
                <SelectItem value="fake_profile">Fake Profile</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-700 mb-2">
              Additional Details (Optional)
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= maxDescriptionLength) {
                    setDescription(e.target.value);
                  }
                }}
                placeholder="Please provide more details about the issue..."
                className="w-full p-3 border border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none resize-none"
                rows={3}
                maxLength={maxDescriptionLength}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  Be specific about what happened
                </div>
                <div className={`text-xs ${description.length > maxDescriptionLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                  {description.length}/{maxDescriptionLength}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={submitReport.isPending}
            >
              {submitReport.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}