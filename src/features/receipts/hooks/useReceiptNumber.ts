import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Reserves the next receipt number for a project (e.g. REC-000001).
 * Numbers are assigned atomically server-side (see next_receipt_number in
 * schema.sql) so two staff members saving at the same time never collide.
 *
 * NOTE: Calling this reserves/increments the counter immediately. In phase 2
 * we may want to defer the actual reservation until "Save" is pressed (not
 * "Print Preview"), to avoid burning numbers on abandoned drafts.
 */
export function useReceiptNumber() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reserveNext = useCallback(async (projectId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("next_receipt_number", {
        p_project_id: projectId,
      });
      if (error) throw error;
      return data as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate receipt number");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reserveNext, loading, error };
}
