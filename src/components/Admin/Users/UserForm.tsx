
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { User } from '@/types/admin/users';

export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive', 'pending']),
  rejection_reason: z.string().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

interface UserFormProps {
  user: User | null;
  onSubmit: (values: UserSchemaType) => void;
  isSubmitting: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isSubmitting }) => {
  const form = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || "",
      role: user?.role as "user" | "admin" || "user",
      status: user?.status as "active" | "inactive" | "pending" || "pending",
      rejection_reason: user?.rejection_reason || "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        role: user.role as "user" | "admin" || "user",
        status: user.status as "active" | "inactive" | "pending" || "pending",
        rejection_reason: user.rejection_reason || "",
      });
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rejection_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rejection Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter rejection reason" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
