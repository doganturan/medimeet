import { useState } from "react";
import { toast } from "sonner";

type FetchCallback<T> = (...args: any[]) => Promise<T>;

export function useFetch<T>(cb: FetchCallback<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setData(response);
    } catch (err: any) {
      setError(err);
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fn,
    setData,
  };
}
