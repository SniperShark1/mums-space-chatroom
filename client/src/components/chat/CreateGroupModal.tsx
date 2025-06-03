import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

export default function CreateGroupModal({ isOpen, onClose, currentUserId }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users for group member selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });

  // Filter out current user from selection
  const availableUsers = users.filter(user => user.id !== currentUserId);

  const createGroup = useMutation({
    mutationFn: async (groupData: { name: string; description?: string; createdBy: number }) => {
      return apiRequest("/api/groups", {
        method: "POST",
        body: JSON.stringify(groupData),
      });
    },
    onSuccess: async (newGroup) => {
      // Add selected members to the group
      for (const userId of selectedUsers) {
        try {
          await apiRequest(`/api/groups/${newGroup.id}/members`, {
            method: "POST",
            body: JSON.stringify({ userId }),
          });
        } catch (error) {
          console.error("Failed to add member:", error);
        }
      }

      toast({
        title: "Group created successfully!",
        description: `"${groupName}" has been created with ${selectedUsers.length + 1} members.`,
      });

      // Reset form and close modal
      setGroupName("");
      setSelectedUsers([]);
      onClose();

      // Refresh chat rooms
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
    },
    onError: () => {
      toast({
        title: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length < 1) {
      toast({
        title: "Select at least one member",
        description: "Private groups need at least 2 members (including you).",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length > 5) {
      toast({
        title: "Too many members",
        description: "Private groups can have a maximum of 6 members.",
        variant: "destructive",
      });
      return;
    }

    createGroup.mutate({
      name: groupName,
      description: `Private group chat for ${selectedUsers.length + 1} members`,
      createdBy: currentUserId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pink-800">
            <Users className="w-5 h-5" />
            Create Private Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="groupName" className="text-pink-700">Group Name</Label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="mt-1"
              maxLength={50}
            />
          </div>

          <div>
            <Label className="text-pink-700">
              Select Members ({selectedUsers.length}/5)
            </Label>
            <p className="text-xs text-pink-600 mb-3">
              Choose 1-5 members to invite (including you: {selectedUsers.length + 1} total)
            </p>
            
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
              {availableUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No other users available</p>
              ) : (
                availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-pink-50 rounded">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                      disabled={!selectedUsers.includes(user.id) && selectedUsers.length >= 5}
                    />
                    <label 
                      htmlFor={`user-${user.id}`}
                      className="flex-1 flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-sm font-medium text-pink-800">
                        {user.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.ageGroup}</p>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-pink-600 border-pink-300 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGroup.isPending || !groupName.trim() || selectedUsers.length === 0}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}