import useSWR from 'swr';
import { getAllUsers } from '@/services/admin/admin-service';

const useClients = (isOnboarding?: boolean) => {
    const { data, error, isLoading } = useSWR(`/admin/users`, getAllUsers);
    

    const userData = data?.data?.data?.map((user: any) => ({
        label: `${user?.fullName}`,
        id: user._id,
        email : user.email,
    })) || []; 

    return {
        userData,
        isLoading: isLoading,
        error: error,
    };
};


export default useClients;
