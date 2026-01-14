/**
 * Reusable optimistic mutation hooks for CRUD operations
 * 
 * These hooks provide optimistic updates with automatic rollback on error,
 * toast notifications, and cache invalidation.
 * 
 * @example Create operation
 * ```tsx
 * const createTodo = useOptimisticCreate<Todo, CreateTodoInput>({
 *   queryKey: ['/api/todos'],
 *   mutationFn: (data) => apiRequest('POST', '/api/todos', data),
 *   successMessage: 'Todo created!',
 *   errorMessage: 'Failed to create todo',
 * });
 * 
 * // Usage
 * createTodo.mutate({ title: 'New task', completed: false });
 * ```
 * 
 * @example Update operation
 * ```tsx
 * const updateTodo = useOptimisticUpdate<Todo, UpdateTodoInput>({
 *   queryKey: ['/api/todos'],
 *   mutationFn: (data) => apiRequest('PATCH', `/api/todos/${data.id}`, data),
 *   successMessage: 'Todo updated!',
 *   errorMessage: 'Failed to update todo',
 * });
 * 
 * // Usage
 * updateTodo.mutate({ id: '123', completed: true });
 * ```
 * 
 * @example Delete operation
 * ```tsx
 * const deleteTodo = useOptimisticDelete<Todo>({
 *   queryKey: ['/api/todos'],
 *   mutationFn: (id) => apiRequest('DELETE', `/api/todos/${id}`),
 *   successMessage: 'Todo deleted!',
 *   errorMessage: 'Failed to delete todo',
 * });
 * 
 * // Usage
 * deleteTodo.mutate('123');
 * ```
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface OptimisticMutationOptions<TData, TVariables> {
  queryKey: string[];
  mutationFn: (variables: TVariables) => Promise<Response>;
  optimisticUpdate?: (old: TData[] | undefined, variables: TVariables) => TData[];
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticCreate<TData extends { id?: string }, TVariables>({
  queryKey,
  mutationFn,
  successMessage = "Created successfully",
  errorMessage = "Failed to create",
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      
      queryClient.setQueryData<TData[]>(queryKey, (old = []) => [
        ...old,
        { ...newData, id: `temp-${Date.now()}` } as unknown as TData,
      ]);
      
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Success", description: successMessage });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useOptimisticUpdate<TData extends { id: string }, TVariables extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = "Updated successfully",
  errorMessage = "Failed to update",
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      
      queryClient.setQueryData<TData[]>(queryKey, (old = []) =>
        old.map((item) =>
          item.id === updatedData.id ? { ...item, ...updatedData } : item
        )
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Success", description: successMessage });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useOptimisticDelete<TData extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = "Deleted successfully",
  errorMessage = "Failed to delete",
}: Omit<OptimisticMutationOptions<TData, string>, 'optimisticUpdate'>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      
      queryClient.setQueryData<TData[]>(queryKey, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Success", description: successMessage });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
