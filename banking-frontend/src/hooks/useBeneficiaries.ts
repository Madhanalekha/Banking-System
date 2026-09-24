import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { beneficiaryService } from "@/services/beneficiaryService";
import { CreateBeneficiaryDTO, UpdateBeneficiaryDTO } from "@/types";

export const BENEFICIARY_KEYS = {
  all: ["beneficiaries"] as const,
  detail: (id: number) => ["beneficiaries", id] as const,
};

export function useBeneficiaries() {
  return useQuery({
    queryKey: BENEFICIARY_KEYS.all,
    queryFn: beneficiaryService.getBeneficiaries,
  });
}

export function useBeneficiary(id: number) {
  return useQuery({
    queryKey: BENEFICIARY_KEYS.detail(id),
    queryFn: () => beneficiaryService.getBeneficiaryById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBeneficiaryDTO) => beneficiaryService.createBeneficiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BENEFICIARY_KEYS.all });
    },
  });
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBeneficiaryDTO }) =>
      beneficiaryService.updateBeneficiary(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BENEFICIARY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BENEFICIARY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => beneficiaryService.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BENEFICIARY_KEYS.all });
    },
  });
}
