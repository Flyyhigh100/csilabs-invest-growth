import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive', 'pending']),
  rejection_reason: z.string().optional(),
})

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { isLoading, error, data: users } = useQuery(
    ['admin-users', search, page, pageSize],
    async () => {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .ilike('email', `%${search}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setTotalCount(count || 0);
      return data;
    }
  );

  const { data: kycData, isLoading: isKycLoading, error: kycError } = useQuery(
    ['admin-all-users-kyc'],
    async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  );

  const kycMap = React.useMemo(() => {
    if (!kycData) return {};
    return kycData.reduce((acc: any, kyc: any) => {
      acc[kyc.user_id] = kyc;
      return acc;
    }, {});
  }, [kycData]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: selectedUser?.email || "",
      role: selectedUser?.role || "user",
      status: selectedUser?.status || "pending",
      rejection_reason: selectedUser?.rejection_reason || "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        email: selectedUser.email || "",
        role: selectedUser.role || "user",
        status: selectedUser.status || "pending",
        rejection_reason: selectedUser.rejection_reason || "",
      });
    }
  }, [selectedUser, form]);

  const { mutate: updateUser, isLoading: isUpdateLoading } = useMutation(
    async (values: z.infer<typeof userSchema>) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: values.email,
          role: values.role,
          status: values.status,
          rejection_reason: values.rejection_reason,
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User updated successfully.",
        })
        queryClient.invalidateQueries(['admin-users'])
        setSelectedUser(null)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message,
        })
      },
    }
  )

  const { mutate: deleteUser, isLoading: isDeleteLoading } = useMutation(
    async () => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User deleted successfully.",
        })
        queryClient.invalidateQueries(['admin-users'])
        setSelectedUser(null)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message,
        })
      },
    }
  )

  const onSubmit = (values: z.infer<typeof userSchema>) => {
    updateUser(values)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Users">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Users">
        <div className="flex items-center justify-center h-full text-red-500">
          Error: {error.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users">
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-4">
          <Input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to first page on new search
            }}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    {kycMap[user.id]?.status || 'Not Started'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>
                            Make changes to the user here. Click save when you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="shadcn@example.com" {...field} />
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
                              <Button type="submit" disabled={isUpdateLoading}>
                                {isUpdateLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user
                                and all of their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser()} disabled={isDeleteLoading}>
                                {isDeleteLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil(totalCount / pageSize)}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(totalCount / pageSize)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
