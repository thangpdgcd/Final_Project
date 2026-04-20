import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type { CreateUserPayload, UpdateUserPayload } from '@/types';

export const USERS_KEY = ['users'] as const;

export const useUsers = () =>
  useQuery({
    queryKey: USERS_KEY,
    queryFn: usersService.getAll,
  });

export const useUser = (id: number | undefined) =>
  useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id && id > 0,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};
