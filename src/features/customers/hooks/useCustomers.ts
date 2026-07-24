import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer, CustomerSearchField } from "../types";

export function useCustomers(projectId: string | null) {
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(field: CustomerSearchField, query: string) {
    if (!projectId || !query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);

    try {
      if (field === "receipt_number") {
        // Look up the receipt first, then resolve its customer.
        const { data: receipt, error: receiptErr } = await supabase
          .from("receipts")
          .select("customer_id")
          .eq("project_id", projectId)
          .ilike("receipt_number", `%${query.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (receiptErr) throw receiptErr;
        if (!receipt) {
          setResults([]);
          return;
        }

        const { data: customer, error: customerErr } = await supabase
          .from("customers")
          .select("*")
          .eq("id", receipt.customer_id)
          .maybeSingle();

        if (customerErr) throw customerErr;
        setResults(customer ? [customer] : []);
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("project_id", projectId)
        .ilike(field, `%${query.trim()}%`)
        .limit(10);

      if (error) throw error;
      setResults(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function createCustomer(input: {
    name: string;
    nid?: string;
    mobile?: string;
    nominee_name?: string;
    nominee_nid?: string;
  }): Promise<Customer> {
    if (!projectId) throw new Error("No project selected");

    // Atomically reserve the next CUST-### code for this project.
    const { data: code, error: codeErr } = await supabase.rpc("next_customer_code", {
      p_project_id: projectId,
    });
    if (codeErr) throw codeErr;

    const { data, error } = await supabase
      .from("customers")
      .insert({
        project_id: projectId,
        customer_code: code as string,
        name: input.name,
        nid: input.nid ?? null,
        mobile: input.mobile ?? null,
        nominee_name: input.nominee_name ?? null,
        nominee_nid: input.nominee_nid ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  return { results, searching, error, search, createCustomer };
}
